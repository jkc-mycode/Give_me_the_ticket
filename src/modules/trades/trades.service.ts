//others
//Dto
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { GetTradeListDto } from './dto/get-trade-list.dto';
import { TestDto } from './dto/test-dto';

//error Type
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

//DIP
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository, In } from 'typeorm';

//constants
import { MESSAGES } from 'src/commons/constants/trades/messages';

//transaction
import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import Redlock from 'redlock';
import { DataSource } from 'typeorm';

//Service
import { SearchService } from './search/search.service';

//types
import { QUEUES } from 'src/commons/constants/queue.constant';
import { Role } from 'src/commons/types/users/user-role.type';
import { TicketStatus } from 'src/commons/types/shows/ticket.type';
import { FLAG } from 'src/commons/types/flag/flag-type';
import { PointType } from 'src/commons/types/users/point.type';

//entities
import { Trade } from 'src/entities/trades/trade.entity';
import { TradeLog } from 'src/entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { User } from 'src/entities/users/user.entity';
import { Image } from 'src/entities/images/image.entity';
import { PointLog } from 'src/entities/users/point-log.entity';

import { orderBy } from 'lodash';

@Injectable()
export class TradesService {
  constructor(
    //Repository
    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>,
    @InjectRepository(TradeLog)
    private tradeLogRepository: Repository<TradeLog>,
    @InjectRepository(Show)
    private showRepository: Repository<Show>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(PointLog)
    private pointLogRepository: Repository<PointLog>,

    //Queue
    @InjectQueue(QUEUES.TRADE_QUEUE) private ticketQueue: Queue,

    //Service
    private readonly searchService: SearchService,

    //Redis
    private dataSource: DataSource,
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    @Inject('REDLOCK') private readonly redlock: Redlock
  ) {}

  combineDateAndTime(dateStr: string, timeStr: string) {
    const date = new Date(dateStr);
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    return date;
  }

  //티켓 정보를 레디스에 저장하는 함수
  async addRedisTicket(createTicketId: string, expired: Date) {
    const value = 'TRUE'; //해당 키에 저장되는 값
    const key = createTicketId;
    const unixTimeStamp = Math.floor(expired.getTime() / 1000);

    await this.redisClient.set(createTicketId, value, (err, result) => {
      if (err) {
        throw new Error(
          `${MESSAGES.TRADES.CAN_NOT_CREATE.TICKET} ${MESSAGES.TRADES.ERROR_OCCUR.REDIS}`
        );
      } else {
        this.redisClient.expireat(key, unixTimeStamp, (err, result) => {
          if (err) {
            throw new Error(
              `${MESSAGES.TRADES.CAN_NOT_CREATE.TICKET} ${MESSAGES.TRADES.ERROR_OCCUR.REDIS}`
            );
          } else {
            return { message: `${MESSAGES.TRADES.SUCCESSFULLY_CREATE.TICKET} ${'-Redis에서'}` };
          }
        });
      }
    });
  }

  //티켓 정보를 레디스에서 제거하는 함수
  async deleteRedisTicket(deleteTicketId: string) {
    await this.redisClient.del(deleteTicketId, (err, result) => {
      if (err) {
        throw new Error(
          `${MESSAGES.TRADES.CAN_NOT_CREATE.TICKET} ${MESSAGES.TRADES.ERROR_OCCUR.REDIS}`
        );
      } else {
        return { message: MESSAGES.TRADES.SUCCESSFULLY_DELETE.REDIS_TICKET };
      }
    });
  }

  //티켓 만료시간을 반환하는 함수
  async returnCloseTime(ticketId: number) {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });

    const { date, time } = ticket;

    const combinedString = `${String(date)}T${String(time)}`;

    const minMinutes = 60 * 1000 * 60;

    const showTime = new Date(combinedString);

    const closeTime = new Date(showTime.getTime() - minMinutes);

    return closeTime;
  }

  //티켓이 활성 상태임을 알려주는 함수
  async checkRedisTicket(getTicketId: number) {
    const ticket = await this.redisClient.get(String(getTicketId));
    if (ticket) return true;
    else return false;
  }

  //=========ConvenienceFunction======================
  //<1> 중고 거래 검색
  async searchTradeList(testDto: TestDto) {
    const { search } = testDto;
    try {
      const searchData = await this.searchService.searchTrades(search);
      return searchData;
    } catch (err) {
      console.error(`테스트 오류:`, err);
    }

    return { message: `코드 실행 성공` };
  }

  //<2> 중고 거래 목록 보기//완료 (검증 대부분 완료)
  async getTradeList(getTradeListDto: GetTradeListDto) {
    const { search, page, limit } = getTradeListDto;
    const total_count = await this.tradeRepository.count({
      where: { flag: FLAG.ACTIVATION },
    });

    //검색 데이터를 받아옴
    let ids = [];
    if (search) {
      const searchData = await this.searchService.searchTrades(search);
      ids = searchData.results.map((result) => result.id);
    }

    //페이지네이션 계산
    const skip: number = (page - 1) * limit;

    let trade_list;

    if (search) {
      const searchData = await this.searchService.searchTrades(search);
      const ids = searchData.results.map((result) => result.id);

      trade_list = await this.tradeRepository.find({
        where: {
          flag: FLAG.ACTIVATION,
          id: In(ids), // 검색된 id들만 포함
        },
        select: { id: true, ticketId: true, createdAt: true, closedAt: true },
        skip: skip,
        take: limit,
        order: { id: 'DESC' },
      });
    } else {
      trade_list = await this.tradeRepository.find({
        where: { flag: FLAG.ACTIVATION },
        select: { id: true, ticketId: true, createdAt: true, closedAt: true },
        skip: skip,
        take: limit,
        order: { id: 'DESC' },
      });
    }

    //중고 거래 목록 조회 //테스트 완료
    //trade_list에 공연에서 가져온 주소값을 병합
    trade_list = await Promise.all(
      trade_list.map(async (trade) => {
        //스케쥴을 조회
        try {
          const ticket = await this.ticketRepository.findOne({
            where: { id: trade.ticketId },
          });

          const image = await this.imageRepository.findOne({
            where: { showId: ticket.showId },
          });

          if (!ticket || !image) {
            return null;
          }

          //시간이 맞지 않는 티켓이 있다면 삭제
          if (
            new Date().getTime() >=
            this.combineDateAndTime(String(ticket.date), ticket.time).getTime() - 60 * 1000 * 60 * 2
          ) {
            await this.tradeRepository.update({ id: trade.id }, { flag: FLAG.EXPIRED });
            return null;
          }

          if (ticket) {
            //show에서 장소와 이름을 추가,schedule에서 날짜와 시간을 추가
            if (image) trade['imageUrl'] = image.imageUrl;
            if (ticket) {
              trade['title'] = ticket.title;
              trade['price'] = ticket.price;
              trade['date'] = ticket.date;
              trade['time'] = ticket.time;
            }
            delete trade.ticketId;
          }
          return trade;
        } catch (err) {
          console.error('일부 에러가 발생한 거래 정보가 있습니다', err);
          return null;
        }
      })
    );

    trade_list = trade_list.filter((trade) => trade !== null);

    if (!trade_list.length) {
      return { message: MESSAGES.TRADES.NOT_EXISTS.TRADE_LIST };
    }

    return {
      page,
      limit,
      total_count,
      trade_list,
    };
  }

  //<3> 중고 거래 상세 보기 //수정 필요 리스트가 아님 (검증 대부분 완료) //테스트 완료
  async getTradeDetail(tradeId: number) {
    const trade = await this.tradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TRADE);
    const show = await this.showRepository.findOne({ where: { id: trade.showId } });
    if (!show) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.SHOW);
    const ticket = await this.ticketRepository.findOne({ where: { id: trade.ticketId } });
    if (!ticket) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TICKET);
    const image = await this.imageRepository.findOne({ where: { showId: show.id } });
    if (!image) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.IMAGES);

    trade['content'] = show.content;
    trade['imageUrl'] = image.imageUrl;
    trade['title'] = show.title;
    trade['runtime'] = show.runtime;
    trade['origin_price'] = show.price;
    trade['location'] = ticket.location;
    trade['date'] = ticket.date;
    trade['time'] = ticket.time;
    delete trade.ticketId;
    delete trade.flag;
    delete trade.showId;

    return trade;
  }

  //<4> 중고거래 생성 함수 //완료(검증 대부분 완료) 테스트 완료
  async createTrade(createTradeDto: CreateTradeDto, sellerId: number) {
    const { ticketId, price } = createTradeDto;

    //1.데이터 베이스 검증

    //1-1 티켓이 존재하는지 검증
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TICKET);

    const { date, time } = ticket;
    const showId = ticket.showId;

    //1-2 해당 공연이 존재하는지 검증
    const show = await this.showRepository.findOne({ where: { id: showId } });
    if (!show) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.SHOW);

    //1-3 해당 일정이 존재하는지 검증
    const schedule = await this.scheduleRepository.findOne({
      where: { showId: showId, time: ticket.time },
    });

    if (!schedule) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.SCHEDULE);

    //1-4 이미 이 티켓이 중고거래에 올라와있는지 검증
    const trade = await this.tradeRepository.find({ where: { ticketId: ticketId } });

    if (trade[0]) return { message: MESSAGES.TRADES.ALREADY_EXISTS.IN_TRADE_TICKET };

    //해당 티켓이 사용 가능한지 검증 (레디스 검증과 티켓의 날짜와 시간에 따른 검증)
    if (
      !(await this.redisClient.get(String(ticketId))) &&
      new Date().getTime() >=
        this.combineDateAndTime(String(date), time).getTime() - 60 * 1000 * 60 * 2
    )
      throw new BadRequestException(MESSAGES.TRADES.IS_EXPIRED.TICKET);

    //가격이 기존의 티켓 가격보다 같거나 낮은지 검증
    if (ticket.price < price) {
      throw new BadRequestException(
        `${MESSAGES.TRADES.CAN_NOT_UPDATE.TICKET_PRICE} 원래가격: ${show.price}, 현재가격 ${ticket.price}`
      );
    }

    //본인의 티켓인지 검증
    if (ticket.userId !== sellerId) {
      throw new BadRequestException(MESSAGES.TRADES.NOT_HAVE.TICKET);
    }

    //티켓이 사용 가능한지 검증
    if (ticket.status !== TicketStatus.USEABLE) {
      throw new BadRequestException(MESSAGES.TRADES.UNABLE.TICKET);
    }

    //검증 타일 END==================================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    //Redlock생성==================//
    let lock = await this.redlock.acquire(['TradeLockKey'], 1000);

    try {
      //정책에 따라 티켓의 가격을 중고거래 게시된 시점의 가격으로 고정
      await queryRunner.manager.save(Ticket, {
        id: ticketId,
        price: price,
        status: TicketStatus.TRADING,
      });

      const closedAt = await this.returnCloseTime(ticket.id);
      const trade = await queryRunner.manager.save(Trade, {
        sellerId,
        ticketId,
        showId,
        price,
        closedAt,
      });

      //Elasticsearch 인덱싱 생성 (가장 최근에 추가한 로직)
      await this.searchService.createTradeIndex(trade);

      //트레이드 로그에 기록
      const log = { tradeId: trade.id, sellerId };
      await queryRunner.manager.save(TradeLog, log);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: MESSAGES.TRADES.CAN_NOT_CREATE.TRADE };
    } finally {
      await queryRunner.release();
      await lock.release();
    }

    //=======Redlock End===========//
    return { message: MESSAGES.TRADES.SUCCESSFULLY_CREATE.TRADE };
  }

  //<5> 중고 거래 수정 메서드 //완료(검증 대부분 완료)  //테스트 완료
  async updateTrade(tradeId, updateTradeDto: UpdateTradeDto, userId: number) {
    const { price } = updateTradeDto;

    const trade = await this.tradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TRADE);

    //가격이 기존의 티켓 가격보다 같거나 낮은지 검증
    if (trade.price < price) {
      throw new BadRequestException(
        `${MESSAGES.TRADES.CAN_NOT_UPDATE.TICKET_PRICE} 현재가격: ${trade.price}`
      );
    }

    if (trade.sellerId !== userId)
      throw new BadRequestException(MESSAGES.TRADES.NOT_EXISTS.AUTHORITY);

    //티켓과 중고거래의 가격 둘다 변경(어차피 참고하는 것은 티켓의 가격뿐이기에, 추후 수정 예정, 엔티티에서 중고거래의 가격은 사라져도 될것으로 보임)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Trade, { id: tradeId }, { price: price });
      await queryRunner.manager.update(Ticket, { id: trade.ticketId }, { price: price });
      const afterTrade = await queryRunner.manager.findOne(Trade, { where: { id: tradeId } });
      await queryRunner.commitTransaction();

      // Elasticsearch 인덱스 업데이트
      if (afterTrade) {
        await this.searchService.indexTradeData(afterTrade);
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`트랙잭션 실패,중고거래가 수정되지 않았습니다.`);
    } finally {
      await queryRunner.release();
    }

    const afterTrade = await this.tradeRepository.findOne({ where: { id: tradeId } });

    return afterTrade;
  }

  //<6> 중고 거래 삭제 메서드  //완료(검증 대부분 완료)
  async deleteTrade(tradeId: number, userId: number) {
    const trade = await this.tradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TRADE);

    if (trade.sellerId !== userId) {
      throw new BadRequestException(MESSAGES.TRADES.NOT_EXISTS.AUTHORITY);
    }
    await this.ticketRepository.update({ id: trade.ticketId }, { status: TicketStatus.USEABLE });

    //모든 검증이 끝난 뒤 삭제 로직

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Trade, { id: tradeId }, { flag: FLAG.DELETED });
      await queryRunner.commitTransaction();

      //Elasticsearch 인덱스 삭제 (삭제)
      await this.searchService.deleteTradeIndex(tradeId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('중고거래 삭제에 실패했습니다.', err);
      throw new InternalServerErrorException('중고거래 삭제에 실패했습니다.');
    } finally {
      queryRunner.release();
    }

    return { message: `삭제 완료` };
  }

  //<7> 티켓 구매 메서드 (buyerId는 기존의 userId와 같다)
  async createTicket(tradeId: number, buyerId: number) {
    //해당 거래 존재 확인

    const trade = await this.tradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TRADE);

    //해당 티켓 존재 확인
    const ticket = await this.ticketRepository.findOne({ where: { id: trade.ticketId } });
    if (!ticket) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TICKET);

    //해당 티켓의 공연이름 가져오기
    const show = await this.showRepository.findOne({
      where: { id: ticket.showId },
      select: { title: true },
    });
    const title = show.title;

    //해당 티켓의 소유 갯수 확인
    const haveTicket = await this.ticketRepository.find({
      where: { showId: ticket.showId, userId: ticket.userId },
    });
    if (haveTicket.length > 5) {
      console.log(haveTicket.length);
      throw new BadRequestException('동일시간의 동일공연은 5장만 소지할 수 있습니다!');
    }

    //구매자와 판매자의 유저 정보 가져오기
    const seller = await this.userRepository.findOne({ where: { id: ticket.userId } });
    if (!seller) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.SELLER);
    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.BUYER);

    //구매자와 판매자가 동일한 경우
    if (seller.id === buyer.id)
      throw new BadRequestException(MESSAGES.TRADES.EQUAL.BUYER_AND_SELLER);

    //현재 가장 높은 ticketId보다 1 높은 값 (새로 재발급 하기 위해서)
    let query = await this.ticketRepository.query('SELECT MAX(id) AS maxId FROM tickets');
    const newId = query[0].maxId + 1;

    //해당 거래의 로그 가져오기
    const tradeLog = await this.tradeLogRepository.findOne({ where: { tradeId: trade.id } });
    const tradeLogId = tradeLog.id;

    //<6-1>쿼리 러너문 만들기=========트랜잭션 시작=========가져온 변수:trade,ticket,seller,buyer,===============================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let testCon = 0;
      //검증 타일===================
      //구매자의 보유 포인트가 적다면 구매 불가 (현재 회사에 돈이 들어가는 로직은 구현되어 있지 않음!)
      if (buyer.point < ticket.price)
        throw new BadRequestException(MESSAGES.TRADES.NOT_ENOUGH.MONEY);
      buyer.point -= ticket.price;
      seller.point += ticket.price - Math.floor(ticket.price * 0.05);

      //결제 로직
      await queryRunner.manager.save(User, buyer);
      await queryRunner.manager.save(User, seller);

      //포인트 로그 생성,기록 로직
      const buyerPointLog = {
        userId: buyer.id,
        price: ticket.price,
        description: `중고거래 <${title}>의 티켓 결제`,
        type: PointType.WITHDRAW,
      };

      const sellerPointLog = {
        userId: seller.id,
        price: ticket.price - Math.floor(ticket.price * 0.05),
        description: `중고거래 <${title}>의 티켓 판매`,
        type: PointType.DEPOSIT,
      };
      console.log(`buyerPointLog:`, buyerPointLog);
      console.log(`sellerPointLog:`, sellerPointLog);

      await queryRunner.manager.save(PointLog, buyerPointLog);
      await queryRunner.manager.save(PointLog, sellerPointLog);

      //tradeLog데이타베이스에도 저장
      const log = { id: tradeLogId, tradeId: tradeId, buyerId };
      await queryRunner.manager.save(TradeLog, log);

      //티켓 변경 로직 START========================

      //구매자에게 전할 새로운 티켓을 생성하고 새로운 티켓을 데이터베이스에 저장
      const newTicket = { ...ticket };

      //티켓의 상태를 바꾼 뒤에 저장
      await queryRunner.manager.update(
        Ticket,
        { id: trade.ticketId },
        { status: TicketStatus.SOLD }
      );

      //티켓의 상태를 바꾼 뒤에 구매자에게 저장
      delete newTicket.id;
      newTicket.userId = buyer.id;
      newTicket.status = TicketStatus.USEABLE;
      newTicket.nickname = buyer.nickname;
      newTicket.updatedAt = new Date();

      await queryRunner.manager.save(Ticket, newTicket);

      //새로운 티켓 id를 레디스에 저장
      this.addRedisTicket(String(newId), trade.closedAt);

      //티켓 변경 로직 END========================

      //거래 삭제
      console.log(tradeId);
      await queryRunner.manager.update(Trade, { id: tradeId }, { flag: FLAG.COMPLETED });
      await queryRunner.manager.update(TradeLog, { tradeId: tradeId }, { buyerId: buyer.id });

      await queryRunner.commitTransaction();

      //Elasticsearch 인덱스 삭제
      await this.searchService.deleteTradeIndex(tradeId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`${MESSAGES.TRADES.FAILED.PURCHASE} 사유:${err}`);
    } finally {
      await queryRunner.release();
    }

    //티켓 재발급 로직==================

    // //기존에 존재하는 id를 레디스에서 제거
    this.deleteRedisTicket(String(trade.ticketId));

    return { message: '성공적으로 티켓을 구매하였습니다.' };
  }

  //<8>중고 거래 로그 조회
  async getLogs(userId: number) {
    const buyLogs = await this.tradeLogRepository.find({
      where: { buyerId: userId },
    });
    const sellLogs = await this.tradeLogRepository.find({
      where: { sellerId: userId },
    });

    // buyLogs와 sellLogs 병합
    const logs = [...buyLogs, ...sellLogs];

    // 병합된 배열을 id 기준으로 정렬
    logs.sort((a, b) => a.id - b.id);

    if (!logs[0]) return { message: MESSAGES.TRADES.NOT_EXISTS.TRADE_LOG };
    else return logs;
  }

  //=======================테스트 함수 START====================
  async hello(userId: number) {
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  async test(testDto: TestDto) {
    const { search } = testDto;
    const tradeData = 0;
    try {
      const result = await this.searchService.searchTrades(search);
      return result;
    } catch (err) {
      console.error(`테스트 오류:`, err);
    }

    return { message: `코드 실행 성공` };
  }

  async changeRole(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user.role === Role.USER) {
      await this.userRepository.update({ id: userId }, { role: Role.ADMIN });
      return { message: MESSAGES.TRADES.SUCCESSFULLY_UPDATE.CHANGE_ROLE_ADMIN };
    } else if (user.role === Role.ADMIN) {
      await this.userRepository.update({ id: userId }, { role: Role.USER });
      return { message: MESSAGES.TRADES.SUCCESSFULLY_UPDATE.CHANGE_ROLE_USER };
    }
  }

  async changRemainSeat(scheduleId) {
    const seat: number = 45;
    await this.scheduleRepository.update({ id: scheduleId }, { remainSeat: seat });
    return { message: `좌석이 ${seat}로 수정되었습니다.` };
  }
  //=======================테스트 함수 END====================
}

import { Injectable, Inject } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Redis } from 'ioredis';

//entities
import { Trade } from 'src/entities/trades/trade.entity';
import { TradeLog } from 'src/entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private TradeRepository: Repository<Trade>,
    @InjectRepository(TradeLog)
    private TradeLogRepository: Repository<TradeLog>,
    @InjectRepository(Show)
    private ShowRepository: Repository<Show>,
    @InjectRepository(Schedule)
    private ScheduleRepository: Repository<Schedule>,
    @InjectRepository(Ticket)
    private TicketRepository: Repository<Ticket>,
    @Inject('REDIS_CLIENT') private redisClient: Redis
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
    const value = '1';
    const key = createTicketId;
    const unixTimeStamp = Math.floor(expired.getTime() / 1000);

    await this.redisClient.set(createTicketId, value, (err, result) => {
      if (err) {
        throw new Error('티켓을 생성할 수 없습니다 Redis에 에러 발생');
      } else {
        this.redisClient.expireat(key, unixTimeStamp, (err, result) => {
          if (err) {
            throw new Error('티켓을 생성할 수 없습니다 Redis에 에러 발생');
          } else {
            return { message: '성공적으로 티켓이 발급되었습니다.' };
          }
        });
      }
    });
  }
  //티켓 정보를 레디스에서 제거하는 함수
  async deleteRedisTicket(deleteTicketId: string) {
    await this.redisClient.del(deleteTicketId, (err, result) => {
      if (err) {
        throw new Error('티켓을 생성할 수 없습니다 Redis에 에러 발생');
      } else {
        return { message: '레디스에서 성공적으로 티켓이 제거 되었습니다.' };
      }
    });
  }

  //=========ConvenienceFunction======================
  // async
  // async
  // async
  // async
  async getList() {
    let trade_list = await this.TradeRepository.find({
      select: { id: true, showId: true, price: true },
    });

    //중고 거래 목록 조회
    //trade_list에 공연에서 가져온 주소값을 병합
    trade_list = await Promise.all(
      trade_list.map(async (trade) => {
        //show를 조회
        const show = await this.ShowRepository.findOne({
          where: { id: trade.showId },
        });
        //스케쥴을 조회
        const schedule = await this.ScheduleRepository.findOne({
          where: { id: trade.showId },
        });

        //show에서 장소와 이름을 추가,schedule에서 날짜와 시간을 추가
        if (show) {
          trade['location'] = show.location;
          trade['title'] = show.title;
          trade['date'] = schedule.date;
          trade['time'] = schedule.time;
        }
        return trade;
      })
    );
    if (!trade_list[0]) {
      return { message: '중고거래 목록이 존재하지 않습니다' };
    }

    return trade_list;
  }

  //중고 거래 상세 보기
  async getTradeDetail(tradeId: number) {
    let trade_list = await this.TradeRepository.find({
      select: { id: true, showId: true, price: true, sellerId: true },
    });

    //trade_list에 공연에서 가져온 주소값을 병합
    trade_list = await Promise.all(
      trade_list.map(async (trade) => {
        //show를 조회
        const show = await this.ShowRepository.findOne({
          where: { id: trade.showId },
        });
        //스케쥴을 조회
        const schedule = await this.ScheduleRepository.findOne({
          where: { id: trade.showId },
        });

        //show에서 장소와 이름, 가격을 추가,schedule에서 날짜와 시간을 추가
        if (show) {
          trade['location'] = show.location;
          trade['title'] = show.title;
          trade['origin_price'] = show.price;
          trade['date'] = schedule.date;
          trade['time'] = schedule.time;
        }
        return trade;
      })
    );

    return trade_list;
  }

  //중고거래 생성 함수
  //sellerId는 인증을 통해 받게 될 예정 //sellerId,ticket_id,showId,price 까지 구함, closedAt만 구하면 됨
  async createTrade(createTradeDto: CreateTradeDto, sellerId) {
    const { ticketId, price } = createTradeDto;

    const ticket = await this.TicketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('해당 티켓이 존재하지 않습니다');

    const showId = ticket.showId;

    const show = await this.ShowRepository.findOne({ where: { id: showId } });
    if (!show) throw new NotFoundException('해당 공연이 존재하지 않습니다');

    const schedule = await this.ScheduleRepository.findOne({ where: { showId: showId } });
    if (!schedule) throw new NotFoundException('해당 일정이 존재하지 않습니다');

    console.log(schedule.date, schedule.date);
  }

  //중고 거래 수정 메서드
  async updateTrade(updateTradeDto: UpdateTradeDto) {
    const { price, tradeId } = updateTradeDto;

    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(`해당 거래가 존재하지 않습니다`);

    return await this.TradeRepository.update(tradeId, { price });
  }

  //중고 거래 삭제 메서드
  async deleteTrade(tradeId: number, id) {
    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(`해당 거래가 존재하지 않습니다`);
    return await this.TradeRepository.delete(tradeId);
  }
  //티켓 구매 메서드
  async createTicket(tradeId: number) {
    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(`해당 거래가 존재하지 않습니다`);

    //기존에 존재하는 id제거
  }
}

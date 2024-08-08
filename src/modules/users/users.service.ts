import bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/entities/users/user.entity';
import { UserUpdateDto } from './dto/user-update.dto';
import { PointLog } from 'src/entities/users/point-log.entity';
import { PointType } from 'src/commons/types/users/point.type';
import { ChargePointDto } from './dto/charge-point.dto';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { Trade } from 'src/entities/trades/trade.entity';
import { TradeLog } from 'src/entities/trades/trade-log.entity';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';
import { USER_BOOKMARK_MESSAGES } from 'src/commons/constants/users/user-bookmark-messages.constant';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { format } from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    // transaction 사용
    private readonly dataSource: DataSource,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PointLog)
    private readonly pointLogRepository: Repository<PointLog>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @InjectRepository(TradeLog)
    private readonly tradeLogRepository: Repository<TradeLog>
  ) {}

  // 포인트 내역 조회
  async getPointLog(id: number) {
    try {
      const pointLog = await this.pointLogRepository.find({
        where: { userId: id },
        order: { createdAt: 'DESC' },
      });

      // 날짜 형식 변환
      const dateFormatPointLog = pointLog.map((point) => {
        // KST로 변환 (+9시간)
        const kstDate = new Date(point.createdAt);
        kstDate.setHours(kstDate.getHours() + 9);

        const dateFormat = format(kstDate, 'yyyy-MM-dd HH:mm:ss');

        return {
          ...point,
          createdAt: dateFormat,
        };
      });

      return dateFormatPointLog;
    } catch (err) {
      throw new InternalServerErrorException(USER_MESSAGES.USER.POINT.GET_LOG.FAILURE);
    }
  }

  // 예매 목록 조회
  async getTicketList(id: number) {
    try {
      const ticket = await this.ticketRepository.find({ where: { userId: id } });

      if (ticket.length === 0) {
        throw new NotFoundException(USER_MESSAGES.USER.TICKET.GET_LIST.FAILURE.NOT_FOUND);
      }

      // 날짜 형식 변환
      const dateFormatTicket = ticket.map((ticket) => {
        // KST로 변환 (+9시간)
        const kstDate = new Date(ticket.createdAt);
        kstDate.setHours(kstDate.getHours() + 9);

        const dateFormat = format(kstDate, 'yyyy-MM-dd HH:mm:ss');

        return {
          ...ticket,
          createdAt: dateFormat,
        };
      });

      return dateFormatTicket;
    } catch (err) {
      throw new InternalServerErrorException(USER_MESSAGES.USER.TICKET.GET_LIST.FAILURE.FAIL);
    }
  }

  // 북마크 목록 조회
  async getBookmarkList(id: number) {
    try {
      const bookmark = await this.bookmarkRepository.find({
        where: { userId: id },
        relations: ['show'],
      });

      if (bookmark.length === 0) {
        throw new NotFoundException(
          USER_BOOKMARK_MESSAGES.COMMON.BOOKMARK.GET_LIST.FAILURE.NOT_FOUND
        );
      }

      // 날짜 형식 변환
      const dateFormatBookmark = bookmark.map((bookmark) => {
        // KST로 변환 (+9시간)
        const kstDate = new Date(bookmark.createdAt);
        kstDate.setHours(kstDate.getHours() + 9);

        const dateFormat = format(kstDate, 'yyyy-MM-dd HH:mm:ss');

        return {
          id: bookmark.id,
          userId: bookmark.userId,
          showId: bookmark.showId,
          showTitle: bookmark.show.title,
          showContent: bookmark.show.content,
          createdAt: dateFormat,
        };
      });

      return dateFormatBookmark;
    } catch (err) {
      throw new InternalServerErrorException(
        USER_BOOKMARK_MESSAGES.COMMON.BOOKMARK.GET_LIST.FAILURE.FAIL
      );
    }
  }

  // 거래 내역 조회
  async getTradeLog(id: number) {
    try {
      const tradeLog = await this.tradeLogRepository.find({
        where: [{ sellerId: id }, { buyerId: id }],
        relations: ['trade', 'trade.ticket', 'trade.ticket.show'],
      });

      if (tradeLog.length === 0) {
        throw new NotFoundException(USER_MESSAGES.USER.TRADE.GET_LOG.FAILURE.NOT_FOUND);
      }

      // 날짜 형식 변환
      const dateFormat = (date: Date) => {
        // KST로 변환 (+9시간)
        const kstDate = new Date(date);
        kstDate.setHours(kstDate.getHours() + 9);

        return format(kstDate, 'yyyy-MM-dd HH:mm:ss');
      };

      // Nickname 가져오기
      const getUserName = async (userId: number) => {
        if (userId === 0) {
          return '';
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });

        return user ? user.nickname : null;
      };

      const formatTradeLog = await Promise.all(
        tradeLog.map(async (log) => {
          const {
            trade,
            trade: {
              ticket,
              ticket: { show },
            },
          } = log;

          const buyerNickname = await getUserName(log.buyerId);
          const sellerNickname = await getUserName(log.sellerId);

          return {
            showId: show.id,
            ticketId: ticket.id,
            showTitle: ticket.title, // 공연 제목
            ticketPrice: ticket.price, // 티켓 원래 가격
            tradeId: trade.id,
            tradePrice: trade.price, // 중고 거래 가격
            tradeCreatedAt: dateFormat(trade.createdAt), // 거래 생성 시간
            tradeStatus: trade.flag, // 거래 상태
            tradeLogId: log.id,
            buyerId: log.buyerId,
            sellerId: log.sellerId,
            buyerNickname, // 구매자 닉네임
            sellerNickname, // 판매자 닉네임
            tradeLogCreatedAt: dateFormat(log.createdAt), // 거래 내역 생성 일자
          };
        })
      );

      return formatTradeLog;
    } catch (err) {
      throw new InternalServerErrorException(USER_MESSAGES.USER.TRADE.GET_LOG.FAILURE.FAIL);
    }
  }

  // 사용자 프로필 조회
  async getUserProfile(user: User) {
    try {
      const { email, nickname, profileImg, point, role } = user;
      const profile = { email, nickname, profileImg, point, role };

      return profile;
    } catch (err) {
      throw new InternalServerErrorException(USER_MESSAGES.USER.USERINFO.GET_PROFILE.FAILURE);
    }
  }

  // 사용자 정보 수정
  async updateUser(id: number, userUpdateDto: UserUpdateDto) {
    const { nickname, profileImg, currentPassword } = userUpdateDto;

    // 사용자 조회
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'nickname', 'password', 'profileImg'],
    });

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER.COMMON.FAILURE.NOT_FOUND);
    }

    // 현재 비밀번호 확인
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordMatch) {
      throw new ConflictException(USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PASSWORD.MISMATCH);
    }

    /** 닉네임 수정 **/
    if (nickname) {
      const isExistingNickname = await this.userRepository.findOneBy({ nickname });

      // 다른 유저와 닉네임 중복 시
      if (isExistingNickname && isExistingNickname.id !== id) {
        throw new ConflictException(USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.NICKNAME.CONFLICT);
      }

      // 닉네임 업데이트
      user.nickname = nickname;
    }

    /** 프로필 이미지 수정 **/
    if (profileImg) {
      // 프로필 이미지 업데이트
      user.profileImg = profileImg;
    }

    const updateUser = await this.userRepository.save(user);

    return updateUser;
  }

  // 사용자 포인트 충전
  async chargePoint(id: number, chargePointDto: ChargePointDto) {
    const { amount } = chargePointDto;

    // transaction 시작
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 사용자 조회
      const user = await queryRunner.manager.findOne(User, { where: { id } });

      if (!user) {
        throw new NotFoundException(USER_MESSAGES.USER.COMMON.FAILURE.NOT_FOUND);
      }

      // 포인트 충전
      user.point += amount;

      // 포인트 충전 로그 기록
      const pointLog = new PointLog();

      pointLog.user = user;
      pointLog.userId = user.id;
      pointLog.price = amount;
      pointLog.description = USER_MESSAGES.USER.POINT.CHARGE.DESCRIPTION;
      pointLog.type = PointType.DEPOSIT;

      // 포인트 로그 업데이트
      await queryRunner.manager.save(PointLog, pointLog);
      // 유저 업데이트
      await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return user;
    } catch (err) {
      // 실패 시 rollback
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException(USER_MESSAGES.USER.POINT.CHARGE.FAILURE.FAIL);
    }
  }

  // 회원 탈퇴
  async deleteUser(id: number) {
    try {
      const deleteUser = await this.userRepository.softDelete({ id });

      if (deleteUser.affected === 0) {
        throw new NotFoundException(USER_MESSAGES.USER.COMMON.FAILURE.NOT_FOUND);
      }

      return deleteUser;
    } catch (err) {
      throw new InternalServerErrorException(USER_MESSAGES.USER.COMMON.FAILURE.FAIL);
    }
  }
}

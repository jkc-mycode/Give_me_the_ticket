import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';

import { User } from 'src/entities/users/user.entity';
import { PointLog } from 'src/entities/users/point-log.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { TicketStatus } from 'src/commons/types/shows/ticket.type';
import { PointType } from 'src/commons/types/users/point.type';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly httpService: HttpService, // portone API와 통신. HTTP 요청 보내기 위함
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PointLog)
    private readonly pointLogRepository: Repository<PointLog>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>
  ) {}

  // portone API access_token 발급
  async getToken() {
    const impKey = this.configService.get('IMP_KEY');
    const impSecret = this.configService.get('IMP_SECRET');

    // portone 서버에 토큰 요청
    const { data } = await lastValueFrom(
      this.httpService.post('https://api.iamport.kr/users/getToken', {
        imp_key: impKey,
        imp_secret: impSecret,
      })
    );

    // 토큰 발급 실패 시 예외 처리 - 옵셔널 체이닝
    if (!data?.response?.access_token) {
      throw new InternalServerErrorException('토큰 발급 실패');
    }

    return data.response.access_token;
  }

  // portone 결제 내역 검증
  async verifyPayment(imp_uid: string, merchant_uid: string) {
    try {
      const token = await this.getToken();
      console.log(token);

      // portone 서버에서 결제 정보 가져오기
      const response = await lastValueFrom(
        this.httpService.get(`https://api.iamport.kr/payments/${imp_uid}`, {
          headers: { Authorization: token },
        })
      );

      const payment = response.data.response;

      if (!payment) {
        throw new NotFoundException('결제 내역을 찾을 수 없습니다.');
      }

      const [type, id] = merchant_uid.split(':');

      if (type !== 'ticket') {
        throw new BadRequestException('유효하지 않은 merchant_uid');
      }

      // 티켓 & 결제 금액 검증
      const ticket = await this.ticketRepository.findOne({ where: { id: +id } });

      if (!ticket) {
        throw new NotFoundException('티켓 내역을 찾을 수 없습니다.');
      }

      const user = await this.userRepository.findOne({ where: { id: ticket.userId } });

      if (!user) {
        throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
      }

      console.log(`결제 검증 - imp_uid: ${imp_uid}, merchant_uid: ${merchant_uid}`);
      console.log('결제 데이터 : ', payment);
      console.log('티켓 : ', ticket);

      if (ticket.price !== payment.amount) {
        throw new InternalServerErrorException('결제 금액 불일치');
      }

      switch (payment.status) {
        case 'paid':
          // 결제 완료 처리
          // // 티켓 상태 업데이트
          // ticket.status = TicketStatus.USEABLE; // 티켓 상태 - 판매(거래) 완료 로 바꾸기 !!
          // await this.ticketRepository.save(ticket);

          // 포인트 로그 기록
          const pointLog = this.pointLogRepository.create({
            userId: user.id,
            price: payment.amount,
            description: `${ticket.title} 티켓 결제`,
            type: PointType.WITHDRAW,
          });
          await this.pointLogRepository.save(pointLog);

          // // 사용자 포인트 업데이트
          // user.point -= payment.amount;
          // await this.userRepository.save(user);

          break;
        default:
          throw new InternalServerErrorException('결제 상태 불일치');
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('결제 결과 검증 실패');
    }
  }

  // 웹훅 요청 검증
  async webhook(imp_uid: string, merchant_uid: string) {
    try {
      const token = await this.getToken();

      const response = await lastValueFrom(
        this.httpService.get(`https://api.iamport.kr/payments/${imp_uid}`, {
          headers: { Authorization: token },
        })
      );

      const paymentData = response.data.response;

      if (!paymentData) {
        throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
      }

      // DB에서 결제되어야 하는 금액 조회
      const ticket = await this.ticketRepository.findOne({ where: { id: +merchant_uid } });

      if (!ticket) {
        throw new NotFoundException('티켓 정보를 찾을 수 없습니다.');
      }

      const user = await this.userRepository.findOne({ where: { id: ticket.userId } });

      if (!user) {
        throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
      }

      console.log(`웹훅 처리 - imp_uid: ${imp_uid}, merchant_uid: ${merchant_uid}`);
      console.log('결제 데이터 : ', paymentData);

      const amountToBePaid = ticket.price;
      const { amount, status } = paymentData;

      // 결제 금액 불일치 시 예외 처리
      if (amount !== amountToBePaid) {
        throw new InternalServerErrorException('위조된 결제 시도');
      }

      switch (status) {
        case 'paid':
          // 결제 완료
          // 포인트 로그 기록
          const pointLog = this.pointLogRepository.create({
            userId: user.id,
            price: amount,
            description: `${ticket.title} 티켓 결제`,
            type: PointType.WITHDRAW,
          });
          await this.pointLogRepository.save(pointLog);

          break;
        default:
          throw new InternalServerErrorException('결제 상태 불일치');
      }
    } catch (err) {
      throw new InternalServerErrorException('웹훅 처리 중 오류 발생');
    }
  }
}

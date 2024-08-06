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
import { PointType } from 'src/commons/types/users/point.type';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly httpService: HttpService, // portone API와 통신. HTTP 요청 보내기 위함
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PointLog)
    private readonly pointLogRepository: Repository<PointLog>
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
  async verifyPayment(user: User, imp_uid: string, merchant_uid: string, amount: number) {
    try {
      const token = await this.getToken();
      console.log('portone token: ', token);

      // portone 서버에서 결제 정보 가져오기
      const response = await lastValueFrom(
        this.httpService.get(`https://api.iamport.kr/payments/${imp_uid}`, {
          headers: { Authorization: token },
        })
      );

      const payment = response.data.response;
      console.log('portone 결제 정보: ', payment);

      if (!payment) {
        throw new NotFoundException('결제 내역을 찾을 수 없습니다.');
      }

      const [type, id] = merchant_uid.split('-');

      if (type !== 'charge') {
        throw new BadRequestException('유효하지 않은 merchant_uid');
      }

      console.log(`결제 검증 - imp_uid: ${imp_uid}, merchant_uid: ${merchant_uid}`);

      if (payment.amount !== amount) {
        throw new InternalServerErrorException('결제 금액 불일치');
      }

      if (payment.amount <= 0) {
        throw new InternalServerErrorException('유효하지 않은 결제 금액');
      }

      switch (payment.status) {
        case 'paid':
          // 포인트 로그 기록
          const pointLog = this.pointLogRepository.create({
            userId: user.id,
            price: payment.amount,
            description: '포인트 충전',
            type: PointType.DEPOSIT,
          });
          await this.pointLogRepository.save(pointLog);

          // 사용자 포인트 업데이트
          user.point += payment.amount;
          await this.userRepository.save(user);

          break;
        default:
          throw new InternalServerErrorException('결제 상태 불일치');
      }
    } catch (err) {
      console.log('결제 검증 실패 에러: ', err);
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

      const [type, id] = merchant_uid.split('-');

      if (type !== 'charge') {
        throw new BadRequestException('유효하지 않은 merchant_uid');
      }

      const user = await this.userRepository.findOne({ where: { id: +id } });

      if (!user) {
        throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
      }

      console.log(`웹훅 처리 - imp_uid: ${imp_uid}, merchant_uid: ${merchant_uid}`);
      console.log('결제 데이터 : ', paymentData);

      const amountToBePaid = paymentData.amount;

      if (amountToBePaid <= 0) {
        throw new InternalServerErrorException('유효하지 않은 결제 금액');
      }

      switch (paymentData.status) {
        case 'paid':
          // 포인트 로그 기록
          const pointLog = this.pointLogRepository.create({
            userId: user.id,
            price: amountToBePaid,
            description: '포인트 충전',
            type: PointType.DEPOSIT,
          });
          await this.pointLogRepository.save(pointLog);

          // 사용자 포인트 업데이트
          user.point += amountToBePaid;
          await this.userRepository.save(user);

          break;
        default:
          throw new InternalServerErrorException('결제 상태 불일치');
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('웹훅 처리 중 오류 발생');
    }
  }
}

import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/modules/auth/utils/roles.guard';
import { Roles } from 'src/modules/auth/utils/roles.decorator';
import { Role } from 'src/commons/types/users/user-role.type';

import { PaymentsService } from './payments.service';
import { CompletePaymentDto } from './dto/complete-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * 결제 결과 검증
   * @param completePaymentDto
   * @returns
   */
  @UseGuards(RolesGuard)
  @Roles(Role.USER)
  @Post('/complete')
  async completePayment(@Req() req: any, @Body() completePaymentDto: CompletePaymentDto) {
    console.log('결제 결과 검증 : ', completePaymentDto);
    const completePayment = await this.paymentsService.verifyPayment(
      req.user,
      completePaymentDto.imp_uid,
      completePaymentDto.merchant_uid,
      completePaymentDto.amount
    );

    return {
      statusCode: HttpStatus.OK,
      message: '결제 결과 검증 완료',
      completePayment,
    };
  }

  /**
   * 웹훅 요청 검증
   * @param req
   * @param res
   */
  @Post('/webhook')
  async webhook(@Req() req: any, @Res() res: any) {
    try {
      const { imp_uid, merchant_uid } = req.body;
      console.log('웹훅 요청 : ', req.body);

      await this.paymentsService.webhook(imp_uid, merchant_uid);

      res.status(HttpStatus.OK).send({ message: '웹훅 처리 완료' });
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).send(err);
    }
  }
}

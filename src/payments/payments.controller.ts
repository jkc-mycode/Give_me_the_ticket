import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
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
  @Post('/complete')
  async completePayment(@Body() completePaymentDto: CompletePaymentDto) {
    console.log('결제 결과 검증 : ', completePaymentDto);
    const completePayment = await this.paymentsService.verifyPayment(
      completePaymentDto.imp_uid,
      completePaymentDto.merchant_uid
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

import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CompletePaymentDto } from './dto/complete-payment.dto';

@Controller('payment')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * 결제 결과 검증
   * @param completePaymentDto
   * @returns
   */
  @Post('/complete')
  async completePayment(@Body() completePaymentDto: CompletePaymentDto) {
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
}

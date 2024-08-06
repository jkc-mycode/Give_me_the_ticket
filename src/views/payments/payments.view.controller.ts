import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/payments')
export class PaymentsViewsController {
  // 결제 검증 페이지
  @Get()
  @Render('payments/payments.view.ejs')
  verifyPayment() {}
}

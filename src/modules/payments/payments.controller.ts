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
}

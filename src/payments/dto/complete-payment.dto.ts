import { IsString } from 'class-validator';

export class CompletePaymentDto {
  // portone 결제 id
  @IsString()
  imp_uid: string;

  // 고객사 주문 '고유' 번호
  @IsString()
  merchant_uid: string;
}

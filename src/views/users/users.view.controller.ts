import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/users')
export class UsersViewsController {
  // 사용자 프로필 (내 정보) 조회 페이지
  @Get('/me')
  @Render('users/users.view.ejs')
  getUserProfile() {}

  // 사용자 정보 수정 페이지
  @Get('/me/update')
  @Render('users/users-update.view.ejs')
  updateUserProfile() {}

  // 포인트 충전 페이지 (결제 검증)
  @Get('/me/payments')
  @Render('users/payments.view.ejs')
  verifyPayment() {}
}

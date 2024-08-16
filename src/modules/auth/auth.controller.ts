import { Body, Controller, Get, Inject, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KakaoAuthGuard } from './utils/kakao.guard';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입
   * @param signUpDto
   * @returns
   */
  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  /**
   * 로그인
   * @param signInDto
   * @returns
   */
  @UseGuards(AuthGuard('local'))
  @Post('/sign-in')
  async signIn(@Req() req: any, @Body() signInDto: SignInDto) {
    return await this.authService.signIn(req.user.id);
  }

  /**
   * 카카오 로그인 코드 생성
   * @param req
   * @returns
   */
  @UseGuards(KakaoAuthGuard)
  @Get('/kakao')
  async kakaoSignIn(@Req() req: any, @Res() res: any) {
    // 탈퇴한 소셜 로그인 유저라면
    if (req.user.deletedAt !== null) {
      res.redirect(`${process.env.HOST_NAME}/views/auth/sign?error=이미 탈퇴한 사용자입니다.`);
    } else {
      const code = await this.authService.createCode(req.user.id);
      res.redirect(`${process.env.HOST_NAME}/views/auth/kakao/process?code=${code}`);
    }
  }

  /**
   * 카카오 로그인 토큰 발급
   * @param req
   * @returns
   */
  @Get('/kakao/token')
  async getKakaoToken(@Query('code') code: string) {
    // code를 통해 레디스에서 사용자 ID 가져오기
    const userId = await this.authService.getRedisUserId(code);
    const { accessToken, refreshToken } = await this.authService.signIn(+userId);
    return { accessToken, refreshToken };
  }

  /**
   * 로그아웃
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('refreshToken'))
  @Post('/sign-out')
  async signOut(@Req() req: any) {
    return await this.authService.signOut(req.user.id);
  }

  /**
   * 토큰 재발급
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('refreshToken'))
  @Post('/reissue')
  async reissue(@Req() req: any) {
    return await this.authService.reissue(req.user.id);
  }
}

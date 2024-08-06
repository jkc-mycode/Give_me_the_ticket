import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AUTH_STRATEGY } from 'src/commons/constants/auth/auth.constant';
import { AUTH_MESSAGE } from 'src/commons/constants/auth/auth-message.constant';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: AUTH_STRATEGY.LOCAL.USER_NAME_FIELD,
      passwordField: AUTH_STRATEGY.LOCAL.PASSWORD_FIELD,
    });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser({ email, password });

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGE.VALIDATE_USER.UNAUTHORIZED);
    }

    return user;
  }
}

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_MESSAGE } from 'src/commons/constants/auth/auth-message.constant';
import { AUTH_ENV } from 'src/commons/constants/auth/auth.constant';
import { User } from 'src/entities/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refreshToken') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get(AUTH_ENV.REFRESH_SECRET_KEY),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const user = await this.usersRepository.findOne({
      where: { id: payload.id },
    });

    if (!user) {
      throw new NotFoundException(AUTH_MESSAGE.VALIDATE_USER.NOT_FOUND);
    }

    const [type, token] = req.headers.authorization.split(' ');

    if (token !== user.refreshToken) {
      throw new UnauthorizedException(AUTH_MESSAGE.COMMON.TOKEN.UNAUTHORIZED);
    }

    return user;
  }
}

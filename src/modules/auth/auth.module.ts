import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users/user.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { ACCESS_TOKEN, AUTH_ENV, AUTH_STRATEGY } from 'src/commons/constants/auth/auth.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      defaultStrategy: AUTH_STRATEGY.DEFAULT_STRATEGY,
      session: false,
    }),

    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(AUTH_ENV.JWT_SECRET_KEY),
        signOptions: { expiresIn: ACCESS_TOKEN.EXPIRES_IN },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy, KakaoStrategy],
  exports: [AuthService],
})
export class AuthModule {}

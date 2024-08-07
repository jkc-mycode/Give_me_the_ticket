import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users/user.entity';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import _ from 'lodash';
import { AUTH_MESSAGE } from 'src/commons/constants/auth/auth-message.constant';
import { HASH_SALT, REFRESH_TOKEN } from 'src/commons/constants/auth/auth.constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  // 회원가입
  async signUp(signUpDto: SignUpDto) {
    const { email, password, passwordCheck, nickname } = signUpDto;

    // 비밀번호와 비밀번호 확인 일치 체크
    if (password !== passwordCheck) {
      throw new BadRequestException(AUTH_MESSAGE.SIGN_UP.PASSWORD_CHECK.NOT_MATCH);
    }

    // 이메일 중복 체크
    let existedUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existedUser) {
      throw new ConflictException(AUTH_MESSAGE.SIGN_UP.EMAIL.CONFLICT);
    }

    // 닉네임 중복 체크
    existedUser = await this.usersRepository.findOne({
      where: { nickname },
    });
    if (existedUser) {
      throw new ConflictException(AUTH_MESSAGE.SIGN_UP.NICKNAME.CONFLICT);
    }

    // 비밀번호 암호화
    const hashedPassword = await hash(password, HASH_SALT);

    const user = await this.usersRepository.save({
      email,
      password: hashedPassword,
      nickname,
    });

    user.password = undefined;
    return user;
  }

  // 사용자 유효성 검사
  async validateUser({ email, password }) {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        nickname: true,
        password: true,
        refreshToken: true,
        point: true,
        profileImg: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException(AUTH_MESSAGE.VALIDATE_USER.NOT_FOUND);
    }

    // 암호화된 비밀번호 검사
    const isComparePassword = await compare(password, user.password);
    if (!isComparePassword) {
      throw new UnauthorizedException(AUTH_MESSAGE.VALIDATE_USER.UNAUTHORIZED);
    }

    return user;
  }

  // 토큰 발급
  async generateTokens(user: User) {
    // 토큰 발급
    const accessToken = this.jwtService.sign({ id: user.id });
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { secret: process.env.REFRESH_SECRET_KEY, expiresIn: REFRESH_TOKEN.EXPIRES_IN }
    );

    // 리프레시 토큰 저장
    await this.usersRepository.update({ id: user.id }, { refreshToken });

    return { accessToken, refreshToken };
  }

  // 로그인
  async signIn(user: User) {
    return await this.generateTokens(user);
  }

  // 로그아웃
  async signOut(userId: number) {
    // 이미 로그아웃 상태인지 확인
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (user.refreshToken === '') {
      throw new BadRequestException(AUTH_MESSAGE.SIGN_OUT.NO_TOKEN);
    }

    // 로그아웃 (토큰 삭제)
    user.refreshToken = null;
    await this.usersRepository.save(user);

    return { status: HttpStatus.CREATED, message: AUTH_MESSAGE.SIGN_OUT.SUCCEED };
  }

  // 토큰 재발급
  async reissue(user: User) {
    return await this.generateTokens(user);
  }
}

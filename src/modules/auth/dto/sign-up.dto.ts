import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AUTH_MESSAGE } from 'src/commons/constants/auth/auth-message.constant';
import { User } from 'src/entities/users/user.entity';

export class SignUpDto extends PickType(User, ['email', 'password', 'nickname']) {
  /**
   * 비밀번호 확인
   * @example "Test1234!"
   */
  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGE.DTO.PASSWORD_CHECK.IS_NOT_EMPTY })
  passwordCheck: string;
}

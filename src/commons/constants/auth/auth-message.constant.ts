export const AUTH_MESSAGE = {
  COMMON: {
    FORBIDDEN: '접근할 권한이 없습니다.',
    TOKEN: {
      UNAUTHORIZED: '이미 만료된 토큰입니다.',
    },
  },
  DTO: {
    PASSWORD_CHECK: {
      IS_NOT_EMPTY: '비밀번호 확인을 입력해 주세요.',
    },
  },
  SIGN_UP: {
    PASSWORD_CHECK: {
      NOT_MATCH: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
    },
    EMAIL: {
      CONFLICT: '중복된 이메일입니다.',
    },
    NICKNAME: {
      CONFLICT: '중복된 닉네임입니다.',
    },
  },
  VALIDATE_USER: {
    NOT_FOUND: '일치하는 사용자가 없습니다.',
    UNAUTHORIZED: '인증된 사용자가 아닙니다.',
  },
  SIGN_OUT: {
    NO_TOKEN: '이미 로그아웃 되었습니다.',
    SUCCEED: '로그아웃에 성공했습니다.',
  },
};

export const HOST_NAME = 'http://localhost:3000';
export const HASH_SALT = 10;

export const ACCESS_TOKEN = {
  EXPIRES_IN: '12h',
};

export const REFRESH_TOKEN = {
  EXPIRES_IN: '7d',
};

export const AUTH_ENV = {
  JWT_SECRET_KEY: 'JWT_SECRET_KEY',
  REFRESH_SECRET_KEY: 'REFRESH_SECRET_KEY',
  KAKAO_CLIENT_ID: 'KAKAO_CLIENT_ID',
  KAKAO_CLIENT_SECRET: 'KAKAO_CLIENT_SECRET',
  KAKAO_CALLBACK_URL: 'KAKAO_CALLBACK_URL',
};

export const AUTH_STRATEGY = {
  DEFAULT_STRATEGY: 'jwt',
  KAKAO: {
    RANDOM_NICKNAME: {
      NUMBER: 36,
    },
  },
  LOCAL: {
    USER_NAME_FIELD: 'email',
    PASSWORD_FIELD: 'password',
  },
};

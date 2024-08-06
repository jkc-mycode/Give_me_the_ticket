export const IMAGE_COMMON = {
  IMAGE: 'image',
  MAX_IMAGE_LENGTH: 'maxImageLength',
};

export const AWS_ENV = {
  AWS_S3_REGION: 'AWS_S3_REGION',
  AWS_S3_ACCESS_KEY: 'AWS_S3_ACCESS_KEY',
  AWS_S3_SECRET_KEY: 'AWS_S3_SECRET_KEY',
  AWS_BUCKET: 'AWS_BUCKET',
};

export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];

export const API_IMAGE = {
  DATA_FORM: 'multipart/form-data',
  SCHEMA: {
    TYPE: 'object',
    PROPERTIES: {
      FIELD: {
        TYPE: 'array',
        ITEM: {
          TYPE: 'string',
          FORMAT: 'binary',
        },
      },
      MAX_IMAGE_LENGTH: {
        TYPE: 'integer',
        DESCRIPTION: '최대 업로드 가능 이미지 수',
        EXAMPLE: 5,
      },
    },
  },
};

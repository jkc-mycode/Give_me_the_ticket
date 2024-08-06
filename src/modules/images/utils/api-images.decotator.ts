import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { API_IMAGE, IMAGE_COMMON } from 'src/commons/constants/images/images.constant';

// 업로드할 이미지 형식을 설정하기 위한 커스텀 데코레이터
export const ApiImages = (fieldName: string = IMAGE_COMMON.IMAGE) => {
  return applyDecorators(
    ApiConsumes(API_IMAGE.DATA_FORM),
    ApiBody({
      required: true,
      schema: {
        type: API_IMAGE.SCHEMA.TYPE,
        properties: {
          [fieldName]: {
            type: API_IMAGE.SCHEMA.PROPERTIES.FIELD.TYPE,
            items: {
              type: API_IMAGE.SCHEMA.PROPERTIES.FIELD.ITEM.TYPE,
              format: API_IMAGE.SCHEMA.PROPERTIES.FIELD.ITEM.FORMAT,
            },
          },
          maxImageLength: {
            type: API_IMAGE.SCHEMA.PROPERTIES.MAX_IMAGE_LENGTH.TYPE,
            description: API_IMAGE.SCHEMA.PROPERTIES.MAX_IMAGE_LENGTH.DESCRIPTION,
            example: API_IMAGE.SCHEMA.PROPERTIES.MAX_IMAGE_LENGTH.EXAMPLE,
          },
        },
      },
    })
  );
};

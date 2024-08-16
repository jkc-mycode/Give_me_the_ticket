export const SHOW_REVIEWS_MESSAGES = {
  COMMON: {
    SHOW: {
      NOT_FOUND: {
        UPDATE: '수정할 리뷰가 존재하지 않습니다',
        DELETE: '삭제할 리뷰가 존재하지 않습니다',
      },
      TICKET: {
        NOT_FOUND: '티켓 인증에 실패하였습니다.',
        NOT_OWNER: '해당 티켓의 소유자가 아닙니다',
      },
      FINSHED: '공연이 끝난 후에 리뷰 작성이 가능합니다.',
    },
    FORBIDDEN: {
      UPDATE: '이 리뷰를 수정할 권한이 없습니다.',
      DELETE: '이 리뷰를 삭제할 권한이 없습니다.',
    },
    ALREADY_DELETED: '이미 삭제된 리뷰입니다',
  },
  CREATED: '리뷰 작성에 성공했습니다',
  UPDATED: '리뷰 수정이 완료되었습니다.',
  DELETED: '리뷰 삭제가 완료되었습니다.',
};

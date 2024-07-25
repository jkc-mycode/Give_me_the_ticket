export const USER_MESSAGES = {
  USER: {
    COMMON: {
      NOT_FOUND: '사용자를 찾을 수 없습니다.',
      IS_DELETED: '회원 탈퇴에 성공했습니다.',
    },
    USERINFO: {
      UPDATE: {
        SUCCESS: '사용자 정보 수정에 성공했습니다.',
        FAILURE: {
          EMAIL: {
            EMPTY: '이메일을 입력해 주세요.',
            CONFLICT: '이미 다른 회원이 사용 중인 이메일 입니다.',
          },
          NICKNAME: {
            EMPTY: '닉네임을 입력해 주세요.',
            CONFLICT: '이미 다른 회원이 사용 중인 닉네임 입니다.',
          },
          PASSWORD: {
            EMPTY: '비밀번호를 입력해 주세요.',
            NOW: '현재 비밀번호를 입력해 주세요.',
            WEAK: '비밀번호는 최소 8자리 이상, 특수 문자 1개 이상의 영문 조합으로 입력해 주세요.',
            MISMATCH: '현재 비밀번호가 일치하지 않습니다.',
          },
          PROFILEIMG: {
            EMPTY: '프로필 이미지를 등록해 주세요.',
          },
        },
      },
    },
    POINT_CHARGE: {
      DESCRIPTION: '포인트 충전',
      SUCCESS: '포인트 충전이 완료되었습니다.',
      FAILURE: {
        FAIL: '포인트 충전에 실패했습니다.',
        EMPTY: '충전 금액을 입력해 주세요.',
        POSITIVE: '충전 금액은 양수여야 합니다.',
      },
    },
  },
};

document.addEventListener('DOMContentLoaded', function () {
  // 고객사 식별 (SDK 초기화)
  const IMP = window.IMP;
  IMP.init('imp72580830');

  async function getUser() {
    try {
      // 백엔드 사용자 정보 조회 API 호출
      const token = window.localStorage.getItem('accessToken');
      console.log('accessToken: ', token);

      const response = await axios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('User data: ', response.data.getUserProfile);

      if (response.status === 200) {
        return response.data.getUserProfile;
      } else {
        throw new Error('user 정보 fetch 실패');
      }
    } catch (err) {
      console.log(err);
      alert('사용자 정보를 가져오는 데 실패했습니다.');
    }
  }

  async function doPayment() {
    try {
      // 사용자 정보 가져오기
      const user = await getUser();

      if (!user) {
        alert('사용자 정보를 가져오는 데 실패했습니다.');
        return;
      }

      console.log('User: ', user);

      const chargeAmount = Number(document.getElementById('chargeAmount').value);

      if (!chargeAmount || chargeAmount <= 0) {
        alert('충전할 금액을 입력해 주세요.');
        return;
      }

      // 포인트 충전 설정
      const merchantUid = `charge-${new Date().getTime()}`; // 주문 '고유' 번호 (충전)
      console.log('merchant_uid: ', merchantUid);

      const userEmail = user.email;
      const userName = user.nickname;

      // 결제창 호출
      IMP.request_pay(
        {
          pg: 'uplus',
          pay_method: 'card',
          merchant_uid: merchantUid,
          name: 'Point Charge',
          amount: chargeAmount,
          buyer_email: userEmail,
          buyer_name: userName,
          // notice_url: "http://localhost:3000/payments/webhook" // Webhook 수신 URL 설정
        },
        async function (response) {
          // 결제 후 호출되는 callback 로직
          console.log('결제 응답: ', response);
          if (response.success) {
            // 결제 성공
            alert('결제 성공 : ' + response.paid_amount);

            // 결제 결과 처리
            try {
              const token = window.localStorage.getItem('accessToken');

              if (!token) {
                throw new Error('토큰을 가져올 수 없습니다.');
              }

              // 결제 검증
              // 고객사 서버에서 /payment/complete 엔드포인트를 구현해야 함
              const notified = await axios.post(
                '/payments/complete',
                {
                  imp_uid: response.imp_uid, // portone 결제 id
                  merchant_uid: response.merchant_uid, // 고객사 주문 '고유' 번호
                  amount: response.paid_amount,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              console.log('결제 검증 response: ', notified.data);

              if (notified.data.statusCode === 200) {
                alert('결제 결과 검증 완료');
              } else {
                throw new Error(notified.data.message || '결제 검증 중 오류 발생');
              }
            } catch (err) {
              console.log('오류 발생: ', err);
              alert('오류 발생 : ' + err.message);
            }
          } else {
            // 결제 실패
            alert('결제 실패 : ' + response.error_msg);
          }
        }
      );
    } catch (err) {
      console.log('사용자 정보를 가져오는 데 실패했습니다: ', err);
      alert('사용자 정보를 가져오는 데 실패했습니다 : ' + err.message);
    }
  }

  document.querySelector('button').addEventListener('click', doPayment);
});

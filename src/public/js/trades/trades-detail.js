document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');
  const tradeContainer = document.querySelector('#tradeBox');
  const PurchaseBtn = document.querySelector('#createTrade');

  if (!token) {
    window.location.href = '/views/auth/sign';
    alert('로그인이 필요합니다.');
    return;
  }

  function getTradeIdFromParam() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }

  //돌아가기 버튼
  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `/views/trades/list`;
  });

  function getTradeIdFromParam() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }

  //중고거래 상세 정보 가져오기
  async function getDetailTrade(tradeId) {
    try {
      const { data } = await axios.get(`/trades/${tradeId}`);
      console.log(data);
      if (data) return data;
    } catch (err) {
      console.error('failed to fetch DetailTrade', err);
      return;
    }
  }

  const tradeId = getTradeIdFromParam();
  const result = await getDetailTrade(tradeId);
  let discount = 100 - (result.price / result.origin_price) * 100;
  discount = discount - (discount % 0.001);
  if (result.price === 0) discount = 100;
  tradeContainer.innerHTML = '';
  tradeContainer.innerHTML += `<div class="tradeImage">
          <img
            src="${result.imageUrl}"
            alt="이미지 파일 존재하지 않습니다"
          />
        </div>
        <h2 class="title">공연명: ${result.title}</h2>
        <p>
        <div class="description">공연 내용: <br>${result.content}</div>
        </p>
        <p>
        <div class="price"><b>판매 가격: ${result.price.toLocaleString()}</b></div>
        </p>
        <p>
        <div class="location">위치: ${result.location}</div>
        </p>
        <p>
        <div class="closedAt">공연 날짜 및 시간: ${result.closedAt}</div>
        </p>
        <p>
        <div class="createdAt">거래 생성 날짜 및 시간:${result.createdAt}</div>
        </p>
        <p>
        <div class="updatedAt">게시글 수정 날짜 및 시간:${result.updatedAt}</div>
        </p>
        <p>
        <div class="discount">
        <b style="font-size: 200%; color: blue;">
        기존 티켓 ${result.origin_price.toLocaleString()}원의 ${discount}% 할인된 가격입니다!
        </b>
        </p>
        </div>`;

  PurchaseBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      if (confirm('본 공연을 구매하시겠습니까?')) {
        const data = await axios.post(
          `/trades/${tradeId}`,
          {}, // 서버로 보낼 데이터 (없다면 빈 객체)
          {
            headers: {
              Authorization: `Bearer ${token}`, // 인증 헤더에 토큰 추가
            },
          }
        );
        alert('거래에 성공했습니다!');
        window.location.href = '/views/users/me#trade';
      } else {
        window.history.back();
      }
    } catch (err) {
      console.error('중고 거래 구매에 실패했습니다.', err);
      if (err.response.data.message) {
        alert(err.response.data.message);
        console.log(err.response);
      }
      alert('중고 거래 구매에 실패했습니다.');
    }
  });
});

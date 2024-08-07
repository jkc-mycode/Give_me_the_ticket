document.addEventListener('DOMContentLoaded', async () => {
  let trade; // 중고 거래 데이터
  let ticket; // 중고 거래 티켓 데이터
  const updateTradeBtn = document.getElementById('updateTrade');

  const token = window.localStorage.getItem('accessToken');

  // URL에서 tradeId 추출 함수
  function getTradeIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 2];
  }

  try {
    // 실제 중고 거래 상세 정보 가져오기
    trade = await axios.get(`/trades/${getTradeIdFromPath()}`);
    ticket = trade.data.ticket;
    console.log(trade.data);
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
    window.location.href = '/views';
  }

  if (trade) {
    // 티켓 정보를 표시할 요소 생성
    const ticketContainer = document.getElementById('ticket-info');

    // 티켓 정보를 HTML로 구성
    ticketContainer.innerHTML = `
      <h3>티켓 정보</h3>
      <p>제목: ${ticket.title}</p>
      <p>공연일자: ${ticket.date}</p>
      <p>공연시간: ${ticket.time}</p>
      <p>상영시간(분): ${ticket.runtime}</p>
      <p>공연장소: ${ticket.location}</p>
      <p>원래가격: ${ticket.price}</p>
      <p>티켓상태: ${ticket.status}</p>
    `;
  }

  // 중고 거래 수정 버튼 이벤트 추가
  updateTradeBtn.addEventListener('click', async () => {
    const tradePrice = document.getElementById('price').value;

    // 가격 입력 체크
    if (tradePrice === '') {
      alert('가격을 입력해 주세요.');
    }

    // 가격 정수 체크
    if (isNaN(tradePrice) || !Number.isInteger(Number(tradePrice))) {
      alert('정수를 입력해 주세요.');
    }

    try {
      // 중고 거래 수정 DTO
      const updateTradeDto = {
        price: Number(tradePrice),
      };

      // 중고 거래 수정 백엔드 API 호출
      await axios.patch(`/trades/${trade.data.id}`, updateTradeDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('중고 거래 수정에 성공했습니다.');
      window.location.href = '/views/users/me';
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const ticket = JSON.parse(window.sessionStorage.getItem('ticket'));
  const createTradeBtn = document.getElementById('createTrade');

  const token = window.localStorage.getItem('accessToken');

  if (ticket) {
    // 티켓 정보를 표시할 요소 생성
    const ticketContainer = document.getElementById('ticket-info');

    let ticketStatusText = '';

    // 상태에 따라 텍스트 변경
    if (ticket.status === 'USEABLE') {
      ticketStatusText = '유효함';
    } else if (ticket.status === 'TRADING') {
      ticketStatusText = '거래 중';
    } else if (ticket.status === 'REFUNDED') {
      ticketStatusText = '티켓 환불 완료';
    } else if (ticket.status === 'EXPIRED') {
      ticketStatusText = '공연 일자 만료';
    } else if (ticket.status === 'SOLD') {
      ticketStatusText = '중고 거래 완료';
    }

    if (ticket.status === 'TRADING') {
      alert('이미 중고 거래중인 티켓입니다.');
      window.location.href = '/views/users/me';
    } else if (ticket.status === 'REFUNDED') {
      alert('환불 처리가 완료된 티켓입니다.');
      window.location.href = '/views/users/me';
    } else if (ticket.status === 'EXPIRED') {
      alert('공연 일자가 만료된 티켓입니다.');
      window.location.href = '/views/users/me';
    } else if (ticket.status === 'SOLD') {
      alert('이미 중고 거래가 완료된 티켓입니다.');
      window.location.href = '/views/users/me';
    }

    // 티켓 정보를 HTML로 구성
    ticketContainer.innerHTML = `
      <p>공연명: ${ticket.title}</p>
      <p>공연 날짜: ${ticket.date}</p>
      <p>공연 시간: ${ticket.time}</p>
      <p>상영 시간(분): ${ticket.runtime}</p>
      <p>위치: ${ticket.location}</p>
      <p>티켓 예매 가격: ${ticket.price.toLocaleString()}</p>
      <p>티켓 상태: ${ticketStatusText}</p>
    `;
  }
  createTradeBtn.addEventListener('click', async () => {
    const tradePrice = document.getElementById('price').value;

    // 가격 입력 체크
    if (tradePrice === '') {
      alert('가격을 입력해 주세요.');
      return;
    }

    // 가격 정수&음수 체크
    if (isNaN(tradePrice) || !Number.isInteger(Number(tradePrice))) {
      alert('올바른 가격을 입력해 주세요.');
      return;
    }
    if (tradePrice < 0) {
      alert('올바른 가격을 입력해 주세요.');
      return;
    }

    try {
      const createTradeDto = {
        ticketId: ticket.id,
        price: Number(tradePrice),
      };
      const response = await axios.post('/trades', createTradeDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data.message);
      window.sessionStorage.removeItem('ticket');
      window.location.href = '/views/trades/list';
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
      window.sessionStorage.removeItem('ticket');
      window.location.href = '/views/users/me';
    }
  });
});

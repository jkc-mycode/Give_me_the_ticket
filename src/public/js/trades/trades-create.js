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

    if (ticket.status !== 'USEABLE') {
      alert('중고 거래가능한 상태가 아닙니다.');
      window.location.href = '/views/users/me';
    }

    // 티켓 정보를 HTML로 구성
    ticketContainer.innerHTML = `
      <p>공연명: ${ticket.title}</p>
      <p>공연 날짜: ${ticket.date}</p>
      <p>공연 시간: ${ticket.time}</p>
      <p>상영 시간(분): ${ticket.runtime}</p>
      <p>위치: ${ticket.location}</p>
      <p>티켓 예매 가격: ${ticket.price}</p>
      <p>티켓 상태: ${ticketStatusText}</p>
    `;
  }
  createTradeBtn.addEventListener('click', async () => {
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

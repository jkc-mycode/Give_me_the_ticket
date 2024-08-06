document.addEventListener('DOMContentLoaded', () => {
  const ticket = JSON.parse(window.sessionStorage.getItem('ticket'));
  const createTradeBtn = document.getElementById('createTrade');

  const token = window.localStorage.getItem('accessToken');

  if (ticket) {
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
      window.location.href = '/views/users/me';
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    }
  });
});

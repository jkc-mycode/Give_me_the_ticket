document.addEventListener('DOMContentLoaded', function () {
  const refundBtn = document.querySelector('.refund__btn');
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');

  function getShowIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 3];
  }

  function getTicketIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }

  //전역변수 설정
  const showId = getShowIdFromPath();
  const ticketId = getTicketIdFromPath();

  //토큰이 없으면 로그인 페이지로 돌아가게 합니다.
  if (!token) {
    alert('로그인이 필요합니다');
    window.location.href = '/views/auth/sign';
    return;
  }

  // 나의 티켓조회 및 공연 상세정보 api와 통신
  async function getShowDetail(showId) {
    try {
      const [showResponse, ticketResponse] = await Promise.all([
        axios.get(`/shows/${showId}`),
        axios.get('/users/me/ticket', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const data = showResponse.data.data;

      const ticketData = ticketResponse.data.getTicketList.find((ticket) => ticket.id == ticketId);
      console.log(ticketData);
      if (showResponse.status === 200 && data && ticketData) {
        const showsContainer = document.querySelector('#shows');

        const imageHtml = data.imageUrl
          .map(
            (imageUrl) =>
              `<p><img src="${imageUrl}" alt="${data.title}" style="max-width: 100%; height: auto;" /></p>`
          )
          .join('');

        showsContainer.innerHTML = `
          ${imageHtml}
          <h2>${data.title}</h2>
          <p>가격: ${data.price}원</p>
          <p>날짜: ${ticketData.date}<p>
          <p>시간: ${ticketData.time}</p>
        `;
      } else {
        console.error('서버에서 데이터를 가져오지 못했습니다.');
      }
    } catch (error) {
      console.error('공연 정보 가져오기 오류:', error);
    }
  }

  getShowDetail(showId);

  refundBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const response = await axios.delete(`/shows/${showId}/ticket/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert('환불이 완료되었습니다');
        window.location.href = '/views';
      }
    } catch (err) {
      const errorMessage =
        (err.response && err.response.data && err.response.data.message) ||
        '서버와의 통신 중 오류가 발생하였습니다.';
      alert(errorMessage);
      console.error('Error:', err);
    }
  });

  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/views';
  });
});

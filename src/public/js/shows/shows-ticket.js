document.addEventListener('DOMContentLoaded', function () {
  const bookingBtn = document.querySelector('.booking__btn');
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');

  function getShowIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 2]; // parameter에서 showId를 받는 위치
  }

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const showId = getShowIdFromPath();
  const selectedScheduleId = getQueryParam('selectedScheduleId');

  if (!token) {
    window.location.href = '/views/auth/sign';
    alert('로그인이 필요합니다');
    return;
  }

  async function getShowDetail(showId) {
    try {
      const [showResponse, pointResponse] = await Promise.all([
        axios.get(`/shows/${showId}`),
        axios.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const data = showResponse.data.data;
      const pointData = pointResponse.data.getUserProfile;

      // 공연 정보가져오기
      if (showResponse.status === 200 && data && pointData) {
        // 스케줄 정보 가져오기
        const schedule = showResponse.data.data.schedules.find(
          (schedule) => schedule.id === Number(selectedScheduleId)
        );

        if (!schedule) {
          alert('선택한 스케줄을 찾을 수 없습니다.');
          return;
        }

        const showsContainer = document.querySelector('#shows');

        showsContainer.innerHTML = `
        
          <h2>${data.title}</h2>
          <p>가격: ${data.price}원</p>
          <p>위치: ${data.location}</p>
           <p>공연일: ${schedule.date}</p>
        <p>시간: ${schedule.time}</p>
          <p>현재 포인트: ${pointData.point}</p>
          <p>예매 후 포인트: ${pointData.point - data.price} </p>
     
        `;
      } else {
        console.error('서버에서 데이터를 가져오지 못했습니다.');
      }
    } catch (error) {
      console.error('공연 정보 가져오기 오류:', error);
    }
  }

  getShowDetail(showId);

  bookingBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!selectedScheduleId) {
      alert('선택한 스케줄이 없습니다.');
      return;
    }

    const createTicketDto = {
      scheduleId: Number(selectedScheduleId),
    };

    try {
      const response = await axios.post(`/shows/${showId}/ticket`, createTicketDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        alert('예매가 완료되었습니다');
        window.location.href = '/views';
      } else {
        alert('예매에 실패하였습니다. 응답 상태 코드: ' + response.status);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.message);
        window.location.href = `/views/me`;
      } else {
        console.error('Error:', err);
        alert('서버와의 통신 중 오류가 발생하였습니다.');
      }
    }
  });

  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `/views/shows/${showId}`;
  });
});

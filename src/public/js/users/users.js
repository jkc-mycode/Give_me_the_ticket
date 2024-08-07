document.addEventListener('DOMContentLoaded', function () {
  const myProfile = document.querySelector('#myProfile');
  const myPoint = document.querySelector('#myPoint');
  const myTicket = document.querySelector('#myTicket');
  const myBookmark = document.querySelector('#myBookmark');
  const myTrade = document.querySelector('#myTrade');

  const profileContent = document.querySelector('#profileContent');
  const pointLogContent = document.querySelector('#pointLogContent');
  const pointLogContainer = document.getElementById('pointLogContainer');
  const ticketListContent = document.querySelector('#ticketListContent');
  const ticketListContainer = document.getElementById('ticketListContainer');
  const bookmarkListContent = document.querySelector('#bookmarkListContent');
  const bookmarkListContainer = document.getElementById('bookmarkListContainer');
  const tradeLogContent = document.querySelector('#tradeLogContent');
  const tradeLogContainer = document.getElementById('tradeLogContainer');

  const chargeBtn = document.querySelector('#chargeBtn');
  const updateBtn = document.querySelector('#updateBtn');
  const deleteBtn = document.querySelector('#deleteBtn');

  const token = window.localStorage.getItem('accessToken');

  // 내 정보 (profile)를 기본으로 가져옴
  getUserProfile();

  function showContent(content) {
    profileContent.style.display = 'none';
    pointLogContent.style.display = 'none';
    ticketListContent.style.display = 'none';
    bookmarkListContent.style.display = 'none';
    tradeLogContent.style.display = 'none';

    content.style.display = 'block';
  }

  //----------- my profile ---------------------
  myProfile.addEventListener('click', function (e) {
    e.preventDefault();

    myProfile.parentElement.style.opacity = '1';
    Array.from(myProfile.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== myProfile.parentElement) sibling.style.opacity = '.6';
    });

    showContent(profileContent);
    getUserProfile();
  });

  async function getUserProfile() {
    try {
      // 백엔드 사용자 프로필 조회 API 호출
      const response = await axios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data.getUserProfile;

      document.getElementById('nickname').textContent = user.nickname;
      document.getElementById('email').textContent = user.email;
      document.getElementById('point').textContent = user.point;

      if (user && user.profileImg) {
        document.getElementById('profileImg').src = user.profileImg;
      } else {
        console.error('Profile image is undefined.');
        document.getElementById('profileImg').src =
          'https://e7.pngegg.com/pngimages/1000/665/png-clipart-computer-icons-profile-s-free-angle-sphere.png'; // 기본 이미지 URL
      }
    } catch (err) {
      // 사용자 프로필 조회 실패 시 에러 처리
      console.log(err.response.data);
      const errorMessage = err.response.data.message;
      alert(errorMessage);
    }
  }

  //----------- my point ---------------------
  myPoint.addEventListener('click', function (e) {
    e.preventDefault();

    myPoint.parentElement.style.opacity = '1';
    Array.from(myPoint.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== myPoint.parentElement) sibling.style.opacity = '.6';
    });

    showContent(pointLogContent);
    getPointLog();
  });

  async function getPointLog() {
    try {
      // 보유 포인트 조회를 위한 백엔드 사용자 프로필 조회 API 호출
      const response = await axios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data.getUserProfile;

      document.getElementById('userPoint').textContent = user.point;
    } catch (err) {
      console.log(err.response.data);
    }

    try {
      // 백엔드 사용자 포인트 내역 조회 API 호출
      const response = await axios.get('/users/me/point', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const pointLog = response.data.getPointLog;

      // 포인트 내역이 존재하지 않을 때
      if (pointLog.length === 0) {
        pointLogContainer.innerHTML = '';
        return;
      }

      pointLogContainer.innerHTML = '';

      pointLog.forEach((log, index) => {
        const logElement = document.createElement('div');
        logElement.classList.add('point-log');

        const createdAtElement = document.createElement('p');
        createdAtElement.textContent = `포인트 충전 및 사용 일자 : ${log.createdAt}`;
        logElement.appendChild(createdAtElement);

        const priceElement = document.createElement('p');
        priceElement.textContent = `포인트 금액 : ${log.price}`;
        logElement.appendChild(priceElement);

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = `설명 : ${log.description}`;
        logElement.appendChild(descriptionElement);

        const typeElement = document.createElement('p');
        let typeText = log.type;

        // 타입에 따라 텍스트 변경
        if (log.type === 'DEPOSIT') {
          typeText = '입금';
        } else if (log.type === 'WITHDRAW') {
          typeText = '출금';
        }

        typeElement.textContent = `유형 : ${typeText}`;
        logElement.appendChild(typeElement);

        pointLogContainer.appendChild(logElement);

        if (index < pointLog.length - 1) {
          const separator = document.createElement('hr');
          separator.classList.add('separator');
          pointLogContainer.appendChild(separator);
        }
      });
    } catch (err) {
      // 사용자 포인트 내역 조회 실패 시 에러 처리
      console.log(err.response.data);
    }
  }

  chargeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/views/users/me/payments'; // 포인트 충전 페이지로 이동
  });

  //----------- my ticket ---------------------
  myTicket.addEventListener('click', function (e) {
    e.preventDefault();

    myTicket.parentElement.style.opacity = '1';
    Array.from(myTicket.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== myTicket.parentElement) sibling.style.opacity = '.6';
    });

    showContent(ticketListContent);
    getTicketList();
  });

  async function getTicketList() {
    try {
      // 백엔드 사용자 예매 목록 조회 API 호출
      const response = await axios.get('/users/me/ticket', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ticketList = response.data.getTicketList;

      // 예매 목록이 존재하지 않을 때
      if (ticketList.length === 0) {
        ticketListContainer.innerHTML = '';
        return;
      }

      ticketListContainer.innerHTML = '';

      ticketList.forEach((log, index) => {
        const logElement = document.createElement('div');
        logElement.classList.add('ticket-list');

        const titleElement = document.createElement('p');
        titleElement.textContent = `공연 제목 : ${log.title}`;
        logElement.appendChild(titleElement);

        const timeElement = document.createElement('p');
        timeElement.textContent = `공연 시간 : ${log.time}`;
        logElement.appendChild(timeElement);

        const runtimeElement = document.createElement('p');
        runtimeElement.textContent = `공연 러닝타임 : ${log.runtime}`;
        logElement.appendChild(runtimeElement);

        const dateElement = document.createElement('p');
        dateElement.textContent = `공연 일자 : ${log.date}`;
        logElement.appendChild(dateElement);

        const locationElement = document.createElement('p');
        locationElement.textContent = `공연 장소 : ${log.location}`;
        logElement.appendChild(locationElement);

        const priceElement = document.createElement('p');
        priceElement.textContent = `티켓 가격 : ${log.price}`;
        logElement.appendChild(priceElement);

        const statusElement = document.createElement('p');
        statusElement.textContent = `티켓 상태 : ${log.status}`;
        logElement.appendChild(statusElement);

        const createdAtElement = document.createElement('p');
        createdAtElement.textContent = `티켓 구매 일자 : ${log.createdAt}`;
        logElement.appendChild(createdAtElement);

        // 환불
        const refundButton = document.createElement('button');
        refundButton.textContent = '환불';
        // 환불 버튼에 이벤트 추가
        refundButton.addEventListener('click', () => {
          window.location.href = `/views/shows/${log.showId}/ticket/${log.id}`;
        });
        logElement.appendChild(refundButton);

        // 중고 판매
        const resaleButton = document.createElement('button');
        resaleButton.textContent = '중고 판매';
        // 중고 판매 버튼 이벤트 추가
        resaleButton.addEventListener('click', () => {
          window.sessionStorage.setItem('ticket', JSON.stringify(log));
          window.location.href = '/views/trades';
        });
        logElement.appendChild(resaleButton);

        ticketListContainer.appendChild(logElement);

        if (index < ticketList.length - 1) {
          const separator = document.createElement('hr');
          separator.classList.add('separator');
          ticketListContainer.appendChild(separator);
        }
      });
    } catch (err) {
      // 사용자 예매 목록 조회 실패 시 에러 처리
      console.log(err.response.data);
    }
  }

  //----------- my bookmark ---------------------
  myBookmark.addEventListener('click', function (e) {
    e.preventDefault();

    myBookmark.parentElement.style.opacity = '1';
    Array.from(myBookmark.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== myBookmark.parentElement) sibling.style.opacity = '.6';
    });

    showContent(bookmarkListContent);
    getBookmarkList();
  });

  async function getBookmarkList() {
    try {
      // 백엔드 사용자 북마크 목록 조회 API 호출
      const response = await axios.get('/users/me/bookmark', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bookmarkList = response.data.getBookmarkList;

      // 북마크 목록이 존재하지 않을 때
      if (bookmarkList.length === 0) {
        bookmarkListContainer.innerHTML = '';
        return;
      }

      bookmarkListContainer.innerHTML = '';

      bookmarkList.forEach((log, index) => {
        const logElement = document.createElement('div');
        logElement.classList.add('bookmark-list');

        const showTitleElement = document.createElement('p');
        showTitleElement.textContent = `공연 제목 : ${log.showTitle}`;
        logElement.appendChild(showTitleElement);

        const showContentElement = document.createElement('p');
        showContentElement.textContent = `공연 설명 : ${log.showContent}`;
        logElement.appendChild(showContentElement);

        const createdAtElement = document.createElement('p');
        createdAtElement.textContent = `찜 한 날짜 : ${log.createdAt}`;
        logElement.appendChild(createdAtElement);

        bookmarkListContainer.appendChild(logElement);

        if (index < bookmarkList.length - 1) {
          const separator = document.createElement('hr');
          separator.classList.add('separator');
          bookmarkListContainer.appendChild(separator);
        }
      });
    } catch (err) {
      // 사용자 북마크 목록 조회 실패 시 에러 처리
      console.log(err.response.data);
    }
  }

  //----------- my trade ---------------------
  myTrade.addEventListener('click', function (e) {
    e.preventDefault();

    myTrade.parentElement.style.opacity = '1';
    Array.from(myTrade.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== myTrade.parentElement) sibling.style.opacity = '.6';
    });

    showContent(tradeLogContent);
    getTradeLog();
  });

  async function getTradeLog() {
    try {
      // 백엔드 사용자 거래 내역 조회 API 호출
      const response = await axios.get('/users/me/trade', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tradeLog = response.data.getTradeLog;

      // 거래 내역이 존재하지 않을 때
      if (tradeLog.length === 0) {
        tradeLogContainer.innerHTML = '';
        return;
      }

      tradeLogContainer.innerHTML = '';

      tradeLog.forEach((log, index) => {
        const logElement = document.createElement('div');
        logElement.classList.add('trade-log');

        const showTitleElement = document.createElement('p');
        showTitleElement.textContent = `공연 제목 : ${log.showTitle}`;
        logElement.appendChild(showTitleElement);

        const ticketPriceElement = document.createElement('p');
        ticketPriceElement.textContent = `티켓 원가 : ${log.ticketPrice}`;
        logElement.appendChild(ticketPriceElement);

        const tradePriceElement = document.createElement('p');
        tradePriceElement.textContent = `중고 거래 가격 : ${log.tradePrice}`;
        logElement.appendChild(tradePriceElement);

        const tradeCreatedAtElement = document.createElement('p');
        tradeCreatedAtElement.textContent = `거래 생성 시간 : ${log.tradeCreatedAt}`;
        logElement.appendChild(tradeCreatedAtElement);

        const tradeStatusElement = document.createElement('p');
        tradeStatusElement.textContent = `거래 상태 : ${log.tradeStatus}`;
        logElement.appendChild(tradeStatusElement);

        const buyerIdElement = document.createElement('p');
        buyerIdElement.textContent = `구매자 닉네임 : ${log.buyerNickname}`;
        logElement.appendChild(buyerIdElement);

        const sellerIdElement = document.createElement('p');
        sellerIdElement.textContent = `판매자 닉네임 : ${log.sellerNickname}`;
        logElement.appendChild(sellerIdElement);

        const tradeLogCreatedAtElement = document.createElement('p');
        tradeLogCreatedAtElement.textContent = `거래 내역 생성 일자 : ${log.tradeLogCreatedAt}`;
        logElement.appendChild(tradeLogCreatedAtElement);

        // 수정
        const updateTradeBtn = document.createElement('button');
        updateTradeBtn.textContent = '수정';
        // 수정 버튼에 이벤트 추가
        console.log(log);
        updateTradeBtn.addEventListener('click', () => {
          window.sessionStorage.setItem('trade', JSON.stringify(log));
          window.location.href = `/views/trades/${log.id}/edit`;
        });
        logElement.appendChild(updateTradeBtn);

        // 삭제
        const deleteTradeBtn = document.createElement('button');
        deleteTradeBtn.textContent = '삭제';
        // 삭제 버튼 이벤트 추가
        deleteTradeBtn.addEventListener('click', () => {
          alert('삭제 버튼');
        });
        logElement.appendChild(deleteTradeBtn);

        tradeLogContainer.appendChild(logElement);

        if (index < tradeLog.length - 1) {
          const separator = document.createElement('hr');
          separator.classList.add('separator');
          tradeLogContainer.appendChild(separator);
        }
      });
    } catch (err) {
      // 사용자 거래 내역 조회 실패 시 에러 처리
      console.log(err.response.data);
    }
  }

  //----------- update user ---------------------
  updateBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/views/users/me/update'; // 회원 정보 수정 페이지로 이동
  });

  //----------- delete user ---------------------
  deleteBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    try {
      // 회원 탈퇴 확인 창
      if (confirm('회원 탈퇴하시겠습니까?')) {
        if (confirm('정말로 탈퇴하시겠습니까?')) {
          // 백엔드 회원 탈퇴 API 호출
          const response = await axios.delete('/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // 탈퇴했기 때문에 localStorage에 있는 토큰들 삭제
          window.localStorage.clear();

          // 회원 탈퇴 성공 문구 출력
          alert(response.data.message);

          // 탈퇴 후 홈으로 이동
          window.location.href = '/views';
        }
      }
      return;
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    }
  });
});

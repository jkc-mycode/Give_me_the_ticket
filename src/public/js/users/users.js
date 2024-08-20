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

  const pointLogDropdownItems = document.querySelectorAll('.dropdown-item');
  const chargeBtn = document.querySelector('#chargeBtn');
  const updateBtn = document.querySelector('#updateBtn');
  const deleteBtn = document.querySelector('#deleteBtn');

  const token = window.localStorage.getItem('accessToken');

  function showContent(content) {
    profileContent.style.display = 'none';
    pointLogContent.style.display = 'none';
    ticketListContent.style.display = 'none';
    bookmarkListContent.style.display = 'none';
    tradeLogContent.style.display = 'none';

    content.style.display = 'block';
  }

  function showTab() {
    const hash = window.location.hash;

    if (hash === '#point') {
      showContent(pointLogContent);
      activeTab(myPoint);
      getPointLog();
    } else if (hash === '#ticket') {
      showContent(ticketListContent);
      activeTab(myTicket);
      getTicketList();
    } else if (hash === '#bookmark') {
      showContent(bookmarkListContent);
      activeTab(myBookmark);
      getBookmarkList();
    } else if (hash === '#trade') {
      showContent(tradeLogContent);
      activeTab(myTrade);
      getTradeLog();
    } else {
      showContent(profileContent);
      activeTab(myProfile);
      getUserProfile();
    }
  }

  function activeTab(activeTab) {
    [myProfile, myPoint, myTicket, myBookmark, myTrade].forEach((tab) => {
      tab.parentElement.style.opacity = tab === activeTab ? '1' : '.6';
    });
  }

  // profile로 닉네임 가져오기
  getUserProfile();

  window.addEventListener('hashchange', showTab);
  showTab();

  //----------- my profile ---------------------
  myProfile.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.hash = '#profile';
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

      // 페이지 제목 설정
      const pageHeader = document.querySelector('#pageHeader .nickname');
      if (pageHeader && user.nickname) {
        pageHeader.textContent = user.nickname;
      }

      document.getElementById('nickname').textContent = user.nickname;
      document.getElementById('email').textContent = user.email;
      document.getElementById('point').textContent = user.point.toLocaleString();

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
      window.location.href = '/views';
    }
  }

  //----------- my point ---------------------
  myPoint.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.hash = '#point';
  });

  pointLogDropdownItems.forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();

      const description = this.textContent.trim();
      filterPointLog(description);
    });
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

      document.getElementById('userPoint').textContent = user.point.toLocaleString();
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
        createdAtElement.textContent = `포인트 변경 일자 : ${log.createdAt}`;
        logElement.appendChild(createdAtElement);

        const priceElement = document.createElement('p');
        priceElement.textContent = `포인트 금액 : ${log.price.toLocaleString()}`;
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

  async function filterPointLog(description) {
    try {
      const queryString = new URLSearchParams({ description }).toString();
      const response = await axios.get(`/users/me/point?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const pointLog = response.data.getPointLog;

      if (pointLog.length === 0) {
        pointLogContainer.innerHTML = '';
        return;
      }

      pointLogContainer.innerHTML = '';

      pointLog.forEach((log) => {
        const logElement = document.createElement('div');
        logElement.classList.add('point-log');

        const createdAtElement = document.createElement('p');
        createdAtElement.textContent = `포인트 변경 일자 : ${log.createdAt}`;
        logElement.appendChild(createdAtElement);

        const priceElement = document.createElement('p');
        priceElement.textContent = `포인트 금액 : ${log.price}`;
        logElement.appendChild(priceElement);

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = `설명 : ${log.description}`;
        logElement.appendChild(descriptionElement);

        const typeElement = document.createElement('p');
        let typeText = log.type;

        if (log.type === 'DEPOSIT') {
          typeText = '입금';
        } else if (log.type === 'WITHDRAW') {
          typeText = '출금';
        }

        typeElement.textContent = `유형 : ${typeText}`;
        logElement.appendChild(typeElement);

        pointLogContainer.appendChild(logElement);
      });
    } catch (err) {
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
    window.location.hash = '#ticket';
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
        titleElement.textContent = `공연명 : ${log.title}`;
        logElement.appendChild(titleElement);

        const timeElement = document.createElement('p');
        timeElement.textContent = `공연 시간 : ${log.time}`;
        logElement.appendChild(timeElement);

        const runtimeElement = document.createElement('p');
        runtimeElement.textContent = `상영시간(분) : ${log.runtime}`;
        logElement.appendChild(runtimeElement);

        const dateElement = document.createElement('p');
        dateElement.textContent = `공연 날짜 : ${log.date}`;
        logElement.appendChild(dateElement);

        const locationElement = document.createElement('p');
        locationElement.textContent = `공연 장소 : ${log.location}`;
        logElement.appendChild(locationElement);

        const priceElement = document.createElement('p');
        priceElement.textContent = `티켓 가격 : ${log.price.toLocaleString()}`;
        logElement.appendChild(priceElement);

        const statusElement = document.createElement('p');
        let statusText = log.status;

        // 상태에 따라 텍스트 변경
        if (log.status === 'USEABLE') {
          statusText = '사용 가능';
        } else if (log.status === 'TRADING') {
          statusText = '거래 중';
        } else if (log.status === 'REFUNDED') {
          statusText = '환불 완료';
        } else if (log.status === 'EXPIRED') {
          statusText = '티켓 만료';
        } else if (log.status === 'SOLD') {
          statusText = '판매됨';
        }

        statusElement.textContent = `티켓 상태 : ${statusText}`;
        logElement.appendChild(statusElement);

        const createdAtElement = document.createElement('p');
        createdAtElement.textContent = `티켓 구매 일자 : ${log.createdAt}`;
        logElement.appendChild(createdAtElement);

        // '사용 가능' 상태인 경우, 버튼 생성
        if (log.status === 'USEABLE') {
          // 환불
          const refundButton = document.createElement('button');
          refundButton.textContent = '환불';
          refundButton.classList.add('btn-custom', 'btn-refund');
          // 환불 버튼에 이벤트 추가
          refundButton.addEventListener('click', () => {
            window.location.href = `/views/shows/${log.showId}/ticket/${log.id}`;
          });
          logElement.appendChild(refundButton);

          // 중고 판매
          const resaleButton = document.createElement('button');
          resaleButton.textContent = '중고 판매';
          resaleButton.classList.add('btn-custom', 'btn-resale');
          // 중고 판매 버튼 이벤트 추가
          resaleButton.addEventListener('click', () => {
            window.sessionStorage.setItem('ticket', JSON.stringify(log));
            window.location.href = '/views/trades';
          });
          logElement.appendChild(resaleButton);

          // 리뷰 작성
          const reviewButton = document.createElement('button');
          reviewButton.textContent = '리뷰 작성';
          reviewButton.classList.add('btn-custom', 'btn-review');
          // 리뷰 작성 버튼에 이벤트 추가
          reviewButton.addEventListener('click', () => {
            window.location.href = `/views/reviews/${log.id}`;
          });
          logElement.appendChild(reviewButton);
        }

        // '티켓 만료' 상태인 경우, '리뷰 작성' 버튼만 생성
        if (log.status === 'EXPIRED') {
          // 리뷰 작성
          const reviewButton = document.createElement('button');
          reviewButton.textContent = '리뷰 작성';
          reviewButton.classList.add('btn-custom', 'btn-review');
          // 리뷰 작성 버튼에 이벤트 추가
          reviewButton.addEventListener('click', () => {
            window.location.href = `/views/reviews/${log.id}`;
          });
          logElement.appendChild(reviewButton);
        }

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
    window.location.hash = '#bookmark';
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
        logElement.dataset.showId = log.showId;

        const showTitleElement = document.createElement('p');
        showTitleElement.textContent = `공연명 : ${log.showTitle}`;
        logElement.appendChild(showTitleElement);

        const showContentElement = document.createElement('p');
        showContentElement.textContent = `공연 내용 : ${log.showContent}`;
        logElement.appendChild(showContentElement);

        const createdAtElement = document.createElement('p');
        createdAtElement.textContent = `찜 한 날짜 : ${log.createdAt}`;
        logElement.appendChild(createdAtElement);

        const deleteBookmarkButton = document.createElement('button');
        deleteBookmarkButton.textContent = '찜하기 취소';
        deleteBookmarkButton.classList.add('btn-custom', 'btn-review');

        deleteBookmarkButton.addEventListener('click', async (event) => {
          const showId = log.showId;
          const bookmarkId = log.id;
          event.stopPropagation();
          const confirmDelete = window.confirm('찜하기를 취소하시겠습니까?');
          if (confirmDelete) {
            const response = await axios.delete(
              // await로 요청 대기
              `/shows/${showId}/bookmark/${bookmarkId}`, // 요청 URL
              {
                headers: {
                  Authorization: `Bearer ${token}`, // 인증 헤더
                },
              }
            );

            if (response.status === 200) {
              alert('찜하기가 성공적으로 취소되었습니다.'); // 요청 성공 시 알림 표시
              logElement.remove();
            }
          }
        });

        logElement.appendChild(deleteBookmarkButton);

        bookmarkListContainer.appendChild(logElement);

        logElement.addEventListener('click', () => {
          window.location.href = `/views/shows/${log.showId}`;
        });

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
    window.location.hash = '#trade';
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
        showTitleElement.textContent = `공연명 : ${log.showTitle}`;
        logElement.appendChild(showTitleElement);

        const showDateTimeElement = document.createElement('p');
        showDateTimeElement.textContent = `공연 날짜 및 시간 : ${log.showDate} ${log.showTime}`;
        logElement.appendChild(showDateTimeElement);

        const ticketPriceElement = document.createElement('p');
        ticketPriceElement.textContent = `티켓 원가 : ${log.ticketPrice.toLocaleString()}`;
        logElement.appendChild(ticketPriceElement);

        const tradePriceElement = document.createElement('p');
        tradePriceElement.textContent = `중고 거래 가격 : ${log.tradePrice.toLocaleString()}`;
        logElement.appendChild(tradePriceElement);

        const tradeStatusElement = document.createElement('p');
        let tradeStatusText = log.tradeStatus;

        // 상태에 따라 텍스트 변경
        if (log.tradeStatus === 'ACTIVATION') {
          tradeStatusText = '거래 진행 중';
        } else if (log.tradeStatus === 'INACTIVE') {
          tradeStatusText = '거래 비활성화';
        } else if (log.tradeStatus === 'COMPLETED') {
          tradeStatusText = `거래 완료`;
        } else if (log.tradeStatus === 'DELETED') {
          tradeStatusText = `거래 삭제됨`;
        } else if (log.tradeStatus === `EXPIRED`) {
          tradeStatusText = `거래 만료됨`;
        } else if (log.tradeStatus === 'CANCELED') {
          tradeStatusText = `거래 취소됨`;
        }

        tradeStatusElement.textContent = `거래 상태 : ${tradeStatusText}`;
        logElement.appendChild(tradeStatusElement);

        const buyerIdElement = document.createElement('p');
        buyerIdElement.textContent = `구매자 닉네임 : ${log.buyerNickname}`;
        logElement.appendChild(buyerIdElement);

        const sellerIdElement = document.createElement('p');
        sellerIdElement.textContent = `판매자 닉네임 : ${log.sellerNickname}`;
        logElement.appendChild(sellerIdElement);

        const tradeCreatedAtElement = document.createElement('p');
        tradeCreatedAtElement.textContent = `중고 거래 게시물 생성 일자 : ${log.tradeCreatedAt}`;
        logElement.appendChild(tradeCreatedAtElement);

        const tradeLogCreatedAtElement = document.createElement('p');
        tradeLogCreatedAtElement.textContent = `거래 내역 일자 : ${log.tradeLogCreatedAt}`;
        logElement.appendChild(tradeLogCreatedAtElement);

        if (log.tradeStatus === 'ACTIVATION') {
          // 수정
          const updateTradeBtn = document.createElement('button');
          updateTradeBtn.textContent = '수정';
          updateTradeBtn.classList.add('btn-custom', 'btn-update');

          // 수정 버튼에 이벤트 추가
          updateTradeBtn.addEventListener('click', () => {
            window.sessionStorage.setItem('trade', JSON.stringify(log));
            window.location.href = `/views/trades/${log.tradeId}/edit`;
          });
          logElement.appendChild(updateTradeBtn);
        }

        // 삭제
        const deleteTradeBtn = document.createElement('button');
        deleteTradeBtn.textContent = '삭제';
        deleteTradeBtn.classList.add('btn-custom', 'btn-delete');

        // 삭제 버튼 이벤트 추가
        deleteTradeBtn.addEventListener('click', async () => {
          try {
            if (confirm('삭제하시겠습니까?')) {
              await axios.delete(`/trades/${log.tradeId}`, {
                headers: {
                  Authorization: `Bearer ${token}`, // 인증 헤더에 토큰 추가
                },
              });
              alert('삭제에 성공했습니다!');
              location.href = location.href;
            }
          } catch (err) {
            alert('삭제에 실패했습니다.');
            console.error('삭제에 실패했습니다.', err);
          }
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
      console.log(err.response?.data || err.message);
    }
  }
  //----------- update user ---------------------
  updateBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    // 백엔드 사용자 프로필 조회 API 호출
    const response = await axios.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 로컬 사용자가 아니면 알람 출력
    if (response.data.getUserProfile.provider !== 'LOCAL') {
      alert('로컬 사용자만 수정 가능합니다.');
      return null;
    }

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

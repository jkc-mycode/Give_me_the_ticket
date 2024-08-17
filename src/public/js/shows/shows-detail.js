document.addEventListener('DOMContentLoaded', function () {
  const bookingBtn = document.querySelector('.booking__btn');
  const updateBtn = document.querySelector('.update__btn');
  const deleteBtn = document.querySelector('.delete__btn');
  const token = window.localStorage.getItem('accessToken');
  const scheduleDropdownMenu = document.querySelector('#scheduleDropdownMenu');
  const scheduleDropdown = document.querySelector('#scheduleDropdown');
  const bookmarkBtn = document.getElementById('bookmarkBtn');
  const separator = document.querySelector('.separator');
  const reviewContainer = document.querySelector('.text-bg-warning');
  // 전역 변수 설정
  window.selectedScheduleId = null;
  let isBookmarked = false;
  let bookmarkId;
  //내가 찜한 목록을 가져오기 그리고 url상의 showId와 일치하는지 판단을 한다.
  //찜목록에 있으면 취소 없으면 찜하기 버튼

  async function getBookmarkedShows() {
    try {
      const response = await axios.get('/users/me/bookmark', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        return response.data.getBookmarkList || [];

        // bookmarks가 없는 경우 빈 배열을 반환
      } else {
        console.error('찜 목록을 가져오는 데 실패했습니다.');
        return [];
      }
    } catch (error) {
      console.error('찜 목록 가져오기 오류:', error);
      return [];
    }
  }

  //----------- getShowDetail 함수 ---------------------
  async function getShowDetail(showId) {
    try {
      const response = await axios.get(`/shows/${showId}`);

      if (response.status === 200 && response.data && response.data.data) {
        const data = response.data.data;

        const showsContainer = document.querySelector('#shows');

        const imageHtml = data.imageUrl
          .map(
            (imageUrl) => `
  <p><img src="${imageUrl}" alt="${data.title}" style="max-width: 100%; height: auto;" /></p>
`
          )
          .join('');

        showsContainer.innerHTML = `
          ${imageHtml}
          <h2>${data.title}</h2>
          <p>카테고리: ${data.category}</p>
          <p>가격: ${data.price}원</p>
          <p>상영 시간: ${data.runtime}분</p>
          <p>내용:</p>
     <div>${data.content
       .split('\n')
       .map((paragraph) => `<p>${paragraph}</p>`)
       .join('')}</div>
          <p>위치: ${data.location}</p>
          <p>총 좌석: ${data.totalSeat}석</p>
        `;

        if (data.schedules && data.schedules.length > 0) {
          const now = new Date();

          // 잔여좌석이 0이 아니고, 현재 시간 이후의 스케줄만 필터링
          const filteredSchedules = data.schedules.filter((schedule) => {
            const scheduleDateTime = new Date(`${schedule.date} ${schedule.time}`);
            return schedule.remainSeat > 0 && scheduleDateTime > now;
          });

          if (filteredSchedules.length > 0) {
            scheduleDropdownMenu.innerHTML = filteredSchedules
              .map(
                (schedule) => `
            <li>
              <a class="dropdown-item" href="#" data-schedule-id="${schedule.id}">
                날짜 : ${schedule.date} | 시간 : ${schedule.time} | 잔여좌석 : ${schedule.remainSeat}
              </a>
            </li>
          `
              )
              .join('');
          } else {
            scheduleDropdownMenu.innerHTML =
              '<li><a class="dropdown-item">공연 일정이 지났거나 유효한 일정 정보가 없습니다.</a></li>';
          }

          // 저장된 스케줄 ID가 있는 경우 버튼 텍스트 업데이트
          if (window.selectedScheduleId) {
            const selectedSchedule = filteredSchedules.find(
              (schedule) => schedule.id === window.selectedScheduleId
            );
            if (selectedSchedule) {
              scheduleDropdown.textContent = `${selectedSchedule.date} ${selectedSchedule.time}`;
            }
          }
        } else {
          scheduleDropdownMenu.innerHTML =
            '<li><a class="dropdown-item">일정 정보가 없습니다.</a></li>';
        }

        // 초기 상태 설정
        const bookmarks = await getBookmarkedShows();
        const isBookmarkedShow = bookmarks.some((bookmark) => bookmark.showId === +showId);
        isBookmarked = isBookmarkedShow;
        bookmarkId = isBookmarkedShow
          ? bookmarks.find((bookmark) => bookmark.showId === +showId).id
          : null;

        updateBookmarkButton();
      } else {
        console.error('서버에서 데이터를 가져오지 못했습니다.');
      }
    } catch (error) {
      console.error('공연 정보 가져오기 오류:', error);
    }
  }

  function getShowIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }

  const showId = getShowIdFromPath();
  if (showId) {
    getShowDetail(showId);
  } else {
    console.error('공연 ID가 URL에 포함되어 있지 않습니다.');
  }

  // 예매 버튼 클릭 이벤트
  bookingBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!window.selectedScheduleId) {
      alert('스케줄을 선택해주세요.');
      return;
    }
    window.location.href = `/views/shows/${showId}/ticket?selectedScheduleId=${window.selectedScheduleId}`;
  });

  updateBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    window.location.href = `/views/shows/${showId}/edit`;
  });

  scheduleDropdownMenu.addEventListener('click', function (e) {
    if (e.target && e.target.matches('a.dropdown-item')) {
      e.preventDefault(); //스크롤링 제거
      const scheduleId = e.target.getAttribute('data-schedule-id');
      if (scheduleId) {
        window.selectedScheduleId = scheduleId; // 전역 변수에 저장
        scheduleDropdown.textContent = e.target.textContent;
        scheduleDropdown.classList.add('selected');
      } else {
        console.error('스케줄 ID가 없습니다.');
      }
    }
  });

  function updateBookmarkButton() {
    if (isBookmarked) {
      bookmarkBtn.classList.add('bookmarked');
      bookmarkBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"></path>
      </svg>
      찜하기 취소
    `;
      bookmarkBtn.setAttribute('data-bookmarked', 'true');
    } else {
      bookmarkBtn.classList.remove('bookmarked');
      bookmarkBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
        <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"></path>
      </svg>
      찜하기
    `;
      bookmarkBtn.setAttribute('data-bookmarked', 'false');
    }
  }
  document.getElementById('bookmarkBtn').addEventListener('click', async function () {
    try {
      const method = isBookmarked ? 'delete' : 'post';
      const url = isBookmarked
        ? `/shows/${showId}/bookmark/${bookmarkId}`
        : `/shows/${showId}/bookmark`;

      if (!token) {
        alert('로그인이 필요합니다');
        window.location.href = '/views/auth/sign';
        return;
      }

      const response = await axios({
        method: method,
        url: url,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        isBookmarked = !isBookmarked;
        bookmarkId = isBookmarked ? response.data.bookmarkId : null; // 찜하기 성공 시 서버에서 bookmarkId를 반환한다고 가정합니다.
        updateBookmarkButton();
        alert(isBookmarked ? '찜하기가 완료되었습니다.' : '찜하기가 취소되었습니다.');
      }
    } catch (error) {
      alert('요청에 실패하였습니다.');
    }
  });

  async function checkUserRoleAndDisplayDeleteButton() {
    try {
      if (token) {
        const userResponse = await axios.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userRole = userResponse.data.getUserProfile.role; // 사용자 역할 정보

        if (userRole === 'ADMIN') {
          // 관리자일 경우 버튼 표시

          bookmarkBtn.style.display = 'none';
          bookingBtn.style.display = 'none';
          deleteBtn.style.display = 'block';
          updateBtn.style.display = 'block';
          separator.style.display = 'block';
        } else {
          // 관리자 아닐 경우 버튼 숨기기

          deleteBtn.style.display = 'none';
          updateBtn.style.display = 'none';
          separator.style.display = 'none';
        }
      } else {
        // 토큰이 없는 경우 버튼 숨기기

        deleteBtn.style.display = 'none';
        updateBtn.style.display = 'none';
      }
    } catch (err) {
      console.error('사용자 권한 확인 오류:', err);
      // 권한 확인 오류 발생 시 버튼 숨기기
      deleteBtn.style.display = 'none';
      updateBtn.style.display = 'none';
    }
  }

  checkUserRoleAndDisplayDeleteButton();
  // 삭제 버튼 클릭 이벤트 핸들러
  deleteBtn.addEventListener('click', async function () {
    try {
      const response = await axios({
        method: 'delete',
        url: `/shows/${showId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert('삭제에 성공했습니다.');
        window.location.href = '/views';
      } else {
        alert('삭제에 실패하였습니다. 응답 상태 코드: ' + response.status);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.message);
      } else {
        console.error('Error:', err);
        alert('서버와의 통신 중 오류가 발생하였습니다.');
      }
    }
  });
  async function fetchAndRenderReview(showId, page = 1, limit = 5) {
    if (!showId) {
      console.error('Show ID가 없습니다.');
      return;
    }

    try {
      const response = await axios.get(`/reviews?showId=${showId}&page=${page}&limit=${limit}`);
      if (response.status === 200 && response.data) {
        const reviewData = response.data;
        console.log('서버에서 받은 데이터:', reviewData);

        // 리뷰 리스트 렌더링
        if (reviewData.data) {
          renderReviews(reviewData.data);
        }

        // 페이지네이션 버튼 렌더링
        if (reviewData.totalShowReviews !== undefined) {
          renderPagination(reviewData.totalShowReviews, page, limit);

          // Update review count
          if (reviewContainer) {
            reviewContainer.textContent = `총 리뷰 수: ${reviewData.totalShowReviews}`;
            console.log(reviewData.totalShowReviews); // Log the correct variable
          } else {
            console.error('Review count element not found.');
          }
        }
      }
    } catch (error) {
      console.error('리뷰 정보를 가져오는 중 오류 발생:', error);
    }
  }

  function renderReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = ''; // 기존 내용을 비웁니다.

    reviews.forEach((review) => {
      const card = document.createElement('div');
      card.className = 'card mb-3';

      card.innerHTML = `
  <div class="card-header">${review.nickname}</div>
  <div class="card-body">
    <blockquote class="blockquote mb-0">
      <p>${review.postscript}</p>
      <footer class="blockquote-footer">
        ${review.rate !== undefined ? renderStars(review.rate) : '별점 없음'}
      </footer>
    </blockquote>
    <div class="badge-container mt-3">
    </div>
  </div>
`;

      reviewsContainer.appendChild(card);
    });
  }

  function renderPagination(totalReviews, currentPage, limit) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // 기존 페이지네이션 초기화

    const totalPages = Math.ceil(totalReviews / limit);

    // "Previous" 버튼
    const prevButton = document.createElement('li');
    prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<a class="page-link" href="#">Previous</a>';
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        fetchAndRenderReview(showId, currentPage - 1, limit);
      }
    });
    paginationContainer.appendChild(prevButton);

    // 페이지 번호 버튼
    for (let page = 1; page <= totalPages; page++) {
      const pageItem = document.createElement('li');
      pageItem.className = `page-item ${page === currentPage ? 'active' : ''}`;

      const pageLink = document.createElement('a');
      pageLink.className = 'page-link';
      pageLink.href = '#';
      pageLink.textContent = page;
      pageLink.addEventListener('click', (e) => {
        e.preventDefault();
        fetchAndRenderReview(showId, page, limit);
      });

      pageItem.appendChild(pageLink);
      paginationContainer.appendChild(pageItem);
    }

    // "Next" 버튼
    const nextButton = document.createElement('li');
    nextButton.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = '<a class="page-link" href="#">Next</a>';
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        fetchAndRenderReview(showId, currentPage + 1, limit);
      }
    });
    paginationContainer.appendChild(nextButton);
  }

  fetchAndRenderReview(showId, 1, 5); // 첫 페이지와 페이지당 리뷰 수로 초기 호출

  function renderStars(rate) {
    const fullStar = '<span class="star"></span>';
    const emptyStar = '<span class="star empty"></span>';

    let stars = '';

    for (let i = 0; i < 5; i++) {
      if (i < Math.floor(rate)) {
        stars += fullStar;
      } else if (i < rate) {
        stars += fullStar; // 반별 구현은 복잡할 수 있으므로 단순히 전체 별로 대체
      } else {
        stars += emptyStar;
      }
    }

    return stars;
  }
});

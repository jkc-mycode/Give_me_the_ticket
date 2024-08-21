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
      }
    } catch (error) {
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
          <p>가격: ${data.price.toLocaleString()}원</p>
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
          const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

          // 잔여좌석이 0이 아니고, 현재 시간 이후의 스케줄 중 2시간 이후 스케줄만 필터링
          const filteredSchedules = data.schedules.filter((schedule) => {
            const scheduleDateTime = new Date(`${schedule.date} ${schedule.time}`);
            return schedule.remainSeat > 0 && scheduleDateTime > twoHoursLater;
          });

          if (filteredSchedules.length > 0) {
            scheduleDropdownMenu.innerHTML = filteredSchedules
              .map(
                (schedule) => `
      <li>
        <a class="dropdown-item" href="#" data-schedule-id="${schedule.id}">
          날짜 : ${schedule.date} | 시간 : ${schedule.time} | 잔여 좌석 : ${schedule.remainSeat}
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
        window.selectedScheduleId = scheduleId;
        scheduleDropdown.textContent = e.target.textContent;
        scheduleDropdown.classList.add('selected');
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
        const userId = userResponse.data.getUserProfile.id;

        // 버튼 표시 로직
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

        // 반환값
        return { userId, userRole };
      } else {
        // 토큰이 없는 경우 버튼 숨기기
        deleteBtn.style.display = 'none';
        updateBtn.style.display = 'none';

        // 반환값
        return { userId: null, userRole: null };
      }
    } catch (err) {
      console.error('사용자 권한 확인 오류:', err);
      // 권한 확인 오류 발생 시 버튼 숨기기
      deleteBtn.style.display = 'none';
      updateBtn.style.display = 'none';

      // 반환값
      return { userId: null, userRole: null };
    }
  }

  checkUserRoleAndDisplayDeleteButton();

  // 삭제 버튼 클릭 이벤트 핸들러
  deleteBtn.addEventListener('click', async function () {
    try {
      // 공연 삭제 요청
      const response = await axios.delete(
        `/shows/${showId}`, // 요청 URL
        {
          headers: {
            Authorization: `Bearer ${token}`, // 인증 헤더
          },
        }
      );
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
        alert('서버와의 통신 중 오류가 발생하였습니다.');
      }
    }
  });

  async function fetchAndRenderReview(showId, page = 1, limit = 5) {
    try {
      const response = await axios.get(`/reviews?showId=${showId}&page=${page}&limit=${limit}`);
      if (response.status === 200 && response.data) {
        const reviewData = response.data;

        // 리뷰 리스트 렌더링
        if (reviewData.data) {
          renderReviews(reviewData.data);
        }

        // 페이지네이션 버튼 렌더링
        if (reviewData.totalShowReviews !== undefined && reviewData.totalShowReviews > 0) {
          renderPagination(reviewData.totalShowReviews, page, limit);
        } else {
          // 리뷰 없는 경우, 페이지네이션 버튼 숨기기
          const paginationContainer = document.getElementById('pagination');

          if (paginationContainer) {
            paginationContainer.style.display = 'none';
          }
        }

        // 총 리뷰수 업로드
        if (reviewContainer) {
          reviewContainer.textContent = `총 리뷰 수: ${reviewData.totalShowReviews}`;
        }
      }
    } catch (error) {
      console.error('리뷰 정보를 가져오는 중 오류 발생:', error);
    }
  }

  // 전역 리뷰 배열
  let reviews = [];

  //리뷰 수정, 삭제버튼 본인것만 보이게
  async function renderReviews(reviewsData) {
    reviews = reviewsData; // 리뷰 배열 업데이트
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = ''; // 기존 내용을 비웁니다.

    const userInfo = await checkUserRoleAndDisplayDeleteButton(); // 사용자 정보 가져오기

    const loggedInUserId = userInfo.userId; // 올바른 키로 접근

    reviewsData.forEach((review) => {
      const card = document.createElement('div');
      card.className = 'card mb-3';
      card.setAttribute('data-review-id', review.id); // 데이터 리뷰 ID 추가

      // 현재 리뷰 작성자의 userId와 로그인한 사용자의 userId 비교
      const isUserAuthorized = review.userId === loggedInUserId;

      card.innerHTML = `
      <div class="card-header">${review.nickname}</div>
      <div class="card-body">
        <blockquote class="blockquote mb-0">
          <p>${review.postscript}</p>
          <footer class="blockquote-footer">
            ${review.rate !== undefined ? renderStars(review.rate) : '별점 없음'}
          </footer>
        </blockquote>
        ${
          isUserAuthorized
            ? `
          <span class="badge text-bg-success edit-btn" data-review-id="${review.id}">수정</span>
          <span class="badge text-bg-danger delete-btn" data-review-id="${review.id}">삭제</span>
        `
            : ''
        }
        <div class="badge-container mt-3"></div>
      </div>
    `;

      // 카드 추가
      reviewsContainer.appendChild(card);
    });
  }

  // "수정" 버튼 클릭 시 모달 열기
  document.body.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-btn')) {
      const reviewId = parseInt(event.target.getAttribute('data-review-id'));
      openEditModal(reviewId);
    }
  });

  function renderPagination(totalReviews, currentPage, limit) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // 기존 페이지네이션 초기화

    const totalPages = Math.ceil(totalReviews / limit);

    // "Previous" 버튼
    const prevButton = document.createElement('li');
    prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<a class="page-link" href="#">이전</a>';
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
    nextButton.innerHTML = '<a class="page-link" href="#">다음</a>';
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

  // 모달을 HTML에 추가
  document.body.insertAdjacentHTML(
    'beforeend',
    `
<!-- 모달 HTML 구조 예시 -->
<div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="editModalLabel">평점 수정</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label for="postscript" class="form-label">후기</label>
          <textarea class="form-control" id="postscript"></textarea>
        </div>
        <div class="mb-3">
          <label for="rate" class="form-label">평점</label>
          <div class="btn-group">
            <button type="button" class="btn btn-warning dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              Select Rating
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" data-rate="1">⭐</a></li>
              <li><a class="dropdown-item" href="#" data-rate="2">⭐⭐</a></li>
              <li><a class="dropdown-item" href="#" data-rate="3">⭐⭐⭐</a></li>
              <li><a class="dropdown-item" href="#" data-rate="4">⭐⭐⭐⭐</a></li>
              <li><a class="dropdown-item" href="#" data-rate="5">⭐⭐⭐⭐⭐</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
        <button type="button" class="btn btn-primary save-changes-btn">저장</button>
      </div>
    </div>
  </div>
</div>
  `
  );

  // 리뷰 수정 모달 열기
  function openEditModal(reviewId) {
    // 리뷰 ID를 기반으로 리뷰를 찾습니다
    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      document.getElementById('postscript').value = review.postscript;

      // 드롭다운 버튼 및 선택된 평점 설정
      const dropdownButton = document.querySelector('.btn-group .btn');
      dropdownButton.textContent = `${review.rate}점`;

      // 모달에 리뷰 ID를 저장
      const editModal = document.getElementById('editModal');
      editModal.setAttribute('data-review-id', reviewId);

      const bootstrapModal = new bootstrap.Modal(editModal);
      bootstrapModal.show();
    }
  }

  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const dropdownButton = document.querySelector('.btn-group .btn');

  // 선택된 평점 처리
  dropdownItems.forEach((item) => {
    item.addEventListener('click', function () {
      const selectedRating = this.getAttribute('data-rate');
      dropdownButton.textContent = `${selectedRating}점`;
      dropdownButton.setAttribute('data-rate', selectedRating); // 선택된 평점을 버튼에 저장
    });
  });

  // "저장" 버튼 클릭 시 수정된 데이터를 처리
  document.body.addEventListener('click', async function (event) {
    if (event.target.classList.contains('save-changes-btn')) {
      const editModal = document.getElementById('editModal');
      const reviewId = editModal.getAttribute('data-review-id');
      const postscript = document.getElementById('postscript').value;
      const rate = Number(dropdownButton.getAttribute('data-rate')); // 선택된 평점 가져오기

      // 수정된 데이터
      const updatedReviewDto = {
        postscript: postscript,
        rate: rate,
      };

      try {
        const response = await axios.patch(
          `/reviews/${reviewId}`, // 요청 URL
          updatedReviewDto, // 요청 본문
          {
            headers: {
              Authorization: `Bearer ${token}`, // 인증 헤더
            },
          }
        );

        if (response.status === 200) {
          alert('리뷰가 성공적으로 수정되었습니다.');
          fetchAndRenderReview(showId); // 리뷰 데이터를 다시 가져옴. 곧바로 수정된 데이터를 볼 수 있습니다.
        }
      } catch (error) {
        alert(error.response.data.message);
      }

      // 모달 숨기기
      const bootstrapModal = bootstrap.Modal.getInstance(editModal);
      bootstrapModal.hide();
    }
  });

  //삭제
  document.body.addEventListener('click', async function (event) {
    if (event.target.classList.contains('delete-btn')) {
      const reviewId = Number(event.target.getAttribute('data-review-id')); // 리뷰 ID를 추출합니다.

      // 예매 확인창 추가
      const isConfirmed = confirm('리뷰를 삭제하시겠습니까?');

      if (!isConfirmed) {
        return;
      }

      try {
        // 리뷰를 삭제합니다.
        const response = await axios.delete(
          `/reviews/${reviewId}`, // 요청 URL
          {
            headers: {
              Authorization: `Bearer ${token}`, // 인증 헤더
            },
          }
        );

        if (response.status === 200) {
          alert('리뷰가 성공적으로 삭제되었습니다.');
          fetchAndRenderReview(showId); // 리뷰 데이터를 가져와서 실시간 갱신
        }
      } catch (error) {
        alert(error.response.data.message);
      }
    }
  });
});

// 페이지 이동 함수 전역 선언
function goToPage(pageNumber, category, search, date, sortBy) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', pageNumber);
  url.searchParams.set('category', category);
  url.searchParams.set('search', search);
  url.searchParams.set('date', date);
  url.searchParams.set('sortBy', sortBy);
  window.location.href = url.toString();
}

document.addEventListener('DOMContentLoaded', async () => {
  const showListContainer = document.querySelector('#showList');
  const paginationContainer = document.querySelector('#pagination');
  const headerSearchInput = document.querySelector('#searchInput');
  const sortByButton = document.getElementById('sortDropdown');
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  const resetFiltersButton = document.getElementById('resetFilters');
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('search') || '';
  const categoryQuery = params.get('category') || '';
  const selectedDate = params.get('date') || '';
  const sortByQuery = params.get('sortBy') || '';
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '6');

  let currentCategory = categoryQuery;
  let currentDate = selectedDate;
  let currentSortBy = sortByQuery;
  let currentPage = page;

  // 검색어를 검색창에 설정
  if (headerSearchInput) {
    headerSearchInput.value = searchQuery;
  }

  // 서버에서 데이터 가져오기
  async function fetchShows(page, limit, search = '', category = '', date = '', sortBy = '') {
    try {
      const { data } = await axios.get('/shows', {
        params: {
          page,
          limit,
          search: search || undefined,
          category: category || undefined,
          date: date || undefined,
          sortBy: sortBy || undefined,
        },
      });
      return data;
    } catch (error) {
      console.error('공연 데이터 가져오기 실패 : ', error);

      // 에러가 발생한 경우 얼럿으로 에러 메시지를 표시합니다.
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message;

        alert(errorMessage);
        // 공연 검색 실패 시 메인페이지로 이동
        window.location.href = `/views`;
      }
      return null;
    }
  }

  // 실시간 인기 공연 가져오기
  async function fetchRankedShows(limit = 5, sortBy = 'views') {
    try {
      const { data } = await axios.get('/shows/ranked', {
        params: {
          limit,
          sortBy,
        },
      });
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('실시간 인기 공연 데이터 가져오기 실패 : ', error);
      return [];
    }
  }

  // 공연 목록 렌더링
  function renderShows(shows) {
    if (!shows || shows.length === 0) {
      showListContainer.innerHTML = '<p>공연 목록 없음</p>';
      return;
    }

    showListContainer.innerHTML = shows
      .map((show) => {
        const imageUrl = show.imageUrl.length > 0 ? show.imageUrl[0] : 'default-image-url.jpg';
        const showDates =
          show.showDate.length > 0 ? show.showDate.join(' , ') : '공연 일정이 없습니다.';
        return `
        <div class="col-md-4 mb-3">
          <div class="card" data-show-id="${show.id}">
            <img src="${imageUrl}" class="card-img-top" alt="${show.title}">
            <div class="card-body">
              <h5 class="card-title">${show.title}</h5>
              <div class="card-text">
                <p>위치: ${show.location}</p>
                <p>공연날짜 : ${showDates}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    // 카드 클릭 시 상세 페이지로 이동
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', function () {
        const showId = this.dataset.showId;
        window.location.href = `/views/shows/${showId}`;
      });
    });
  }

  // 실시간 인기 공연 렌더링
  function renderRankedShows(shows) {
    const rankedShowListContainer = document.querySelector('#rankedShowList');

    if (!Array.isArray(shows) || shows.length === 0) {
      rankedShowListContainer.innerHTML = '<p>인기 공연 없음</p>';
      return;
    }

    rankedShowListContainer.innerHTML = shows
      .map((show, index) => {
        const imageUrl =
          show.images && show.images.length > 0 ? show.images[0].imageUrl : 'default-image-url.jpg';
        const rank = index + 1;
        return `
      <div class="col-md-2">
        <div class="card" data-show-id="${show.id}">
        <span class="ranking-badge">${rank}</span>
          <img src="${imageUrl}" class="card-img-top" alt="${show.title}">
          <div class="card-body">
            <h5 class="card-title">${show.title}</h5>
          </div>
        </div>
      </div>
    `;
      })
      .join('');

    // 실시간 인기 공연 카드 클릭 시 상세 페이지로 이동
    document.querySelectorAll('#rankedShowList .card').forEach((card) => {
      card.addEventListener('click', function () {
        const showId = this.dataset.showId;
        window.location.href = `/views/shows/${showId}`;
      });
    });
  }

  //공연 날짜별 검색 이벤트 리스너
  document.getElementById('filterDate').addEventListener('change', async function () {
    currentDate = this.value;
    currentPage = 1;
    const result = await fetchShows(
      currentPage,
      limit,
      searchQuery,
      currentCategory,
      currentDate,
      currentSortBy
    );
    if (result && result.data) {
      renderShows(result.data);
      renderPagination(result.totalPages, currentPage);
    }
  });

  // 인기별 조회 이벤트 리스너
  dropdownItems.forEach((item) => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      currentSortBy = item.getAttribute('data-value');
      currentPage = 1;
      sortByButton.textContent = item.textContent;

      const result = await fetchShows(
        currentPage,
        limit,
        searchQuery,
        currentCategory,
        currentDate,
        currentSortBy
      );
      if (result && result.data) {
        renderShows(result.data);
        renderPagination(result.totalPages, currentPage);
      }
    });
  });

  // 페이지네이션 렌더링
  function renderPagination(totalPages, currentPage) {
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    let paginationHTML = '';

    // 첫 페이지로 버튼
    if (currentPage > 1) {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" aria-label="First" data-page="1">
            &laquo; 첫 페이지
          </a>
        </li>
      `;
    }

    // 이전 페이지 버튼
    if (currentPage > 1) {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
            &laquo; 이전
          </a>
        </li>
      `;
    }

    // 페이지 번호
    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === currentPage ? 'active' : '';
      paginationHTML += `
        <li class="page-item ${activeClass}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
            다음 &raquo;
          </a>
        </li>
      `;
    }

    // 마지막 페이지로 버튼
    if (currentPage < totalPages) {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Last" data-page="${totalPages}">
            마지막 페이지 &raquo;
          </a>
        </li>
      `;
    }

    paginationContainer.innerHTML = paginationHTML;

    // 페이지 버튼 클릭 이벤트 리스너 추가
    paginationContainer.querySelectorAll('.page-link').forEach((link) => {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        const pageNumber = parseInt(this.dataset.page);
        goToPage(pageNumber, currentCategory, searchQuery, currentDate, currentSortBy);
      });
    });
  }

  // 카테고리 버튼 클릭 이벤트 핸들러
  document.querySelectorAll('.category-btn').forEach((button) => {
    button.addEventListener('click', async function () {
      document.querySelectorAll('.category-btn').forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');
      currentCategory = button.dataset.category;
      currentPage = 1;

      const result = await fetchShows(
        currentPage,
        limit,
        searchQuery,
        currentCategory,
        currentDate,
        currentSortBy
      );
      if (result && result.data) {
        renderShows(result.data);
        renderPagination(result.totalPages, 1);
      }
    });
  });

  // 필터 해제 버튼 클릭 이벤트 리스너
  resetFiltersButton.addEventListener('click', async () => {
    currentCategory = '';
    currentSortBy = '';
    currentDate = '';
    document.getElementById('filterDate').value = '';

    // 모든 카테고리 버튼의 활성화 상태 제거
    document.querySelectorAll('.category-btn').forEach((btn) => btn.classList.remove('active'));

    const result = await fetchShows(currentPage, limit);
    if (result && result.data) {
      renderShows(result.data);
      renderPagination(result.totalPages, currentPage);
    }
  });

  // 초기 데이터 로딩
  const result = await fetchShows(
    currentPage,
    limit,
    searchQuery,
    currentCategory,
    currentDate,
    currentSortBy
  );
  if (result && result.data) {
    renderShows(result.data);
    renderPagination(result.totalPages, currentPage);
  }

  // 페이지 로드 시 모달 표시
  window.onload = function () {
    var contentModal = new bootstrap.Modal(document.getElementById('contentModal'));
    if (window.name !== 'modalHidden') {
      contentModal.show();
    }
  };

  // "다시 보지 않기" 버튼 클릭 시 모달 숨김 및 상태 저장
  document.getElementById('dontShowAgainBtn').addEventListener('click', function () {
    var contentModal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
    contentModal.hide();
    window.name = 'modalHidden'; // 상태 저장
  });

  // 실시간 인기 공연 데이터 로딩 및 렌더링
  const rankedShows = await fetchRankedShows(5);
  renderRankedShows(rankedShows);
});

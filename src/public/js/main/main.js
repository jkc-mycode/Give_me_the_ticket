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

  // 데이터 표준화 함수
  function ShowData(shows) {
    return shows.map((show) => {
      // 이미지 URL 추출
      const imageUrl =
        show.imageUrl && show.imageUrl.length > 0
          ? show.imageUrl
          : show.images && show.images.length > 0
            ? show.images.map((image) => image.imageUrl)
            : ['default-image-url.jpg'];

      // 공연 날짜 추출
      const showDate =
        show.showDate && show.showDate.length > 0
          ? show.showDate
          : show.schedules && show.schedules.length > 0
            ? show.schedules.map((schedule) => schedule.date)
            : ['날짜 정보 없음'];

      return {
        id: show.id,
        title: show.title,
        category: show.category || '기타',
        location: show.location || '위치 정보 없음',
        imageUrl,
        showDate,
      };
    });
  }

  // 서버에서 데이터 가져오기
  async function fetchShows(page, limit, search = '', category = '', date = '', sortBy = '') {
    try {
      const url = sortBy ? '/shows/ranked' : '/shows';
      const { data } = await axios.get(url, {
        params: {
          page,
          limit,
          search: search || undefined,
          category: category || undefined,
          date: date || undefined,
          sortBy: sortBy || undefined,
        },
      });
      const standardData = ShowData(data.data);
      return {
        data: standardData,
        totalPages: data.totalPages,
      };
    } catch (error) {
      console.error('공연 데이터 가져오기 실패 : ', error);

      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message;

        alert(errorMessage);
        window.location.href = `/views`;
      }
      return null;
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
        const imageUrl = show.imageUrl[0];
        const showDates = show.showDate.join(', ');
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

  //공연 날짜별 검색 이벤트 리스너
  document.getElementById('filterDate').addEventListener('change', async function () {
    currentDate = this.value;
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

      const currentDate = document.getElementById('filterDate').value;

      const result = await fetchShows(
        1,
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

  // 전체 조회 버튼 클릭 이벤트 리스너
  resetFiltersButton.addEventListener('click', async () => {
    currentCategory = '';
    currentDate = '';
    currentSortBy = '';
    document.getElementById('filterDate').value = '';

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
});

// 페이지 이동 함수 전역 선언
function goToPage(pageNumber, category, search) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', pageNumber);
  url.searchParams.set('category', category);
  url.searchParams.set('search', search);
  window.location.href = url.toString();
}

document.addEventListener('DOMContentLoaded', async () => {
  const showListContainer = document.querySelector('#showList');
  const paginationContainer = document.querySelector('#pagination');
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('search') || ''; // 검색어 쿼리 가져오기
  const categoryQuery = params.get('category') || ''; // 카테고리 쿼리 가져오기
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '6');

  let currentCategory = categoryQuery;
  let currentPage = page;

  // 검색어를 검색창에 설정
  headerSearchInput.value = searchQuery;

  // 서버에서 데이터 가져오기
  async function fetchShows(page, limit, search = '', category = '') {
    try {
      const { data } = await axios.get('/shows', {
        params: { page, limit, search: search || undefined, category: category || undefined },
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

  // 공연 목록 렌더링
  function renderShows(shows) {
    if (!shows || shows.length === 0) {
      showListContainer.innerHTML = '<p>공연 목록 없음</p>';
      return;
    }

    showListContainer.innerHTML = shows
      .map((show) => {
        const imageUrl = show.imageUrl.length > 0 ? show.imageUrl[0] : 'default-image-url.jpg';
        return `
        <div class="col-md-4 mb-3">
          <div class="card">
            <img src="${imageUrl}" class="card-img-top" alt="${show.title}">
            <div class="card-body">
              <h5 class="card-title">${show.title}</h5>
              <p class="card-text">위치: ${show.location}</p>
              <a href="/views/shows/${show.id}" class="btn btn-primary">상세보기</a>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  // 페이지네이션 렌더링
  function renderPagination(totalPages, currentPage) {
    const maxPagesToShow = 3;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    let paginationHTML = '';

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

    paginationContainer.innerHTML = paginationHTML;

    // 페이지 버튼 클릭 이벤트 리스너 추가
    paginationContainer.querySelectorAll('.page-link').forEach((link) => {
      link.addEventListener('click', function (event) {
        event.preventDefault(); // 기본 동작 방지
        const pageNumber = parseInt(this.dataset.page);
        goToPage(pageNumber, currentCategory, searchQuery);
      });
    });
  }

  // 카테고리 버튼 클릭 이벤트 핸들러
  document.querySelectorAll('.category-btn').forEach((button) => {
    button.addEventListener('click', async function () {
      document.querySelectorAll('.category-btn').forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');
      currentCategory = button.dataset.category;

      const result = await fetchShows(1, limit, searchQuery, currentCategory);
      if (result && result.data) {
        renderShows(result.data);
        renderPagination(result.totalPages, 1);
      }
    });
  });

  // 초기 데이터 로딩
  const result = await fetchShows(currentPage, limit, searchQuery, currentCategory);
  if (result && result.data) {
    renderShows(result.data);
    renderPagination(result.totalPages, currentPage);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const showListContainer = document.querySelector('#showList');
  const searchInput = document.querySelector('#searchInput');
  const searchButton = document.querySelector('#searchButton');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '6');
  let currentCategory = '';

  // 서버에서 데이터 가져오기
  async function fetchShows(page, limit, search = '', category = '') {
    try {
      const { data } = await axios.get(`/shows`, {
        params: { page, limit, search: search || undefined, category: category || undefined },
      });
      return data;
    } catch (error) {
      console.error(error);
      alert('공연 data 가져오기 실패');
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
        //show배열에서 이미지 가져오기
        const imageUrl =
          show.images && show.images.length > 0 ? show.images[0].imageUrl : 'default-image-url.jpg';
        return `
        <div class="col-md-4 mb-3">
          <div class="card">
            <img src="${imageUrl}" class="card-img-top" alt="${show.title}">
            <div class="card-body">
              <h5 class="card-title">${show.title}</h5>
              <p class="card-text">위치: ${show.location}</p>
              <a href="/views/shows/${show.id}" class="btn btn-primary">View Details</a>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  // 페이지네이션 렌더링
  function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector('#pagination');
    paginationContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => {
      const pageIndex = i + 1;
      const activeClass = pageIndex === currentPage ? 'active' : '';
      return `
        <li class="page-item ${activeClass}">
          <a class="page-link" href="?page=${pageIndex}&limit=${limit}&category=${currentCategory}&search=${searchInput.value}">${pageIndex}</a>
        </li>
      `;
    }).join('');
  }

  // 검색 버튼 클릭 이벤트 핸들러
  searchButton.addEventListener('click', async () => {
    const search = searchInput.value;
    const result = await fetchShows(page, limit, search, currentCategory);
    if (result && result.data) {
      renderShows(result.data);
      renderPagination(result.totalPages, page);
    }
  });

  // 엔터 키 이벤트 핸들러
  searchInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const search = searchInput.value;
      const result = await fetchShows(page, limit, search, currentCategory);
      if (result && result.data) {
        renderShows(result.data);
        renderPagination(result.totalPages, page);
      }
    }
  });

  // 카테고리 버튼 클릭 이벤트 핸들러
  categoryButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      currentCategory = button.dataset.category;
      const result = await fetchShows(page, limit, searchInput.value, currentCategory);
      if (result && result.data) {
        renderShows(result.data);
        renderPagination(result.totalPages, page);
      }
    });
  });

  // 공연 목록 렌더링
  const result = await fetchShows(page, limit);
  if (result && result.data) {
    renderShows(result.data);
    renderPagination(result.totalPages, page);
  }
});

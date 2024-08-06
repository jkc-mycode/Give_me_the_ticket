document.addEventListener('DOMContentLoaded', async () => {
  const showListContainer = document.querySelector('#showList');
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '12');

  async function fetchShows(page, limit) {
    try {
      const { data } = await axios.get(`/shows?page=${page}&limit=${limit}`);
      return data;
    } catch (error) {
      console.error('공연 data 가져오기 오류:', error);
      alert('공연 data 가져오기 실패');
      return null;
    }
  }

  function renderShows(shows) {
    if (!shows || shows.length === 0) {
      showListContainer.innerHTML = '<p>공연 목록 없음</p>';
      return;
    }

    showListContainer.innerHTML = shows
      .map((show) => {
        const imageUrl =
          show.imageUrl && show.imageUrl.length > 0 ? show.imageUrl[0] : 'default-image-url.jpg';
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

  function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector('#pagination');
    paginationContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => {
      const pageIndex = i + 1;
      const activeClass = pageIndex === currentPage ? 'active' : '';
      return `
        <li class="page-item ${activeClass}">
          <a class="page-link" href="?page=${pageIndex}&limit=${limit}">${pageIndex}</a>
        </li>
      `;
    }).join('');
  }

  const result = await fetchShows(page, limit);
  if (result) {
    renderShows(result.data);
    renderPagination(result.totalPages, page);
  }
});

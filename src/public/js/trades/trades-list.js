// 페이지 이동 함수 전역 선언
function goToPage(pageNumber) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', pageNumber);
  window.location.href = url.toString();
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = window.localStorage.getItem('accessToken');
  const tradeListContainer = document.querySelector('#tradeList');
  const paginationContainer = document.querySelector('#pagination');
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '6');

  let currentPage = page;

  if (!token) {
    alert('로그인이 필요합니다.');
    window.location.href = '/views/auth/sign';
    return;
  }

  // 데이터 가져오기
  async function fetchTradesList(page, limit) {
    try {
      const { data } = await axios.get(`/trades/list`, {
        params: { page, limit },
      });

      return data;
    } catch (err) {
      console.error('중고 거래 내역 가져오기 실패:', err);
      alert('중고 거래 내역이 없습니다.');
      // 중고 거래 목록 조회 실패 시 메인페이지로 이동
      window.location.href = `/views`;
      return null;
    }
  }

  // 데이터 보여주기
  function showTradeList(trades) {
    tradeListContainer.innerHTML = '';
    trades.forEach((trade) => {
      const tradItemHTML = `
      <div class="col-md-4 mb-3">
        <div class="card" data-trades-id="${trade.id}">
          <img src=${trade.imageurl} class="card-img-top" alt="이미지 존재하지 않음" />
          <div class="card-body">
            <h5 class="card-title">${trade.title}</h5>
            <p class="card-text">
              판매 가격: ${trade.price}<br>
              공연 날짜: ${trade.date}<br>
              공연 시간: ${trade.time}<br>
            </p>
          </div>
          <div class="card-footer">
            <small class="text-body-secondary">만료기한: ${trade.closedAt}</small>
          </div>
        </div>
      </div>`;
      tradeListContainer.innerHTML += tradItemHTML;
    });
    // 카드 클릭 시 상세 페이지로 이동
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', function () {
        const tradesId = this.dataset.tradesId;
        window.location.href = `/views/trades/${tradesId}`;
      });
    });
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
        goToPage(pageNumber);
      });
    });
  }

  const result = await fetchTradesList(currentPage, limit);
  if (result) {
    showTradeList(result.trade_list); // 거래 목록 표시
    renderPagination(Math.ceil(result.total_count / limit), currentPage); // 페이지네이션 렌더링
  }
});

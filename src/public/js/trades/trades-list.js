document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');
  const numberbtns = document.querySelectorAll('.numberbtn');
  const tradeListContainer = document.querySelector('#tradeList');
  const previousPage = document.querySelector(`#previousPage`);
  const nextPage = document.querySelector(`#nextPage`);

  //page값을 알아내는 함수
  function getParamsFromQuery() {
    return new URLSearchParams(window.location.search);
  }

  const params = getParamsFromQuery();
  const page = params.get('page');
  const limit = params.get('limit');

  if (!token) {
    window.location.href = '/views/auth/sign';
    alert('로그인이 필요합니다.');
    return;
  }

  //돌아가기 버튼
  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `/views`;
  });

  //페이지네이션 기능
  //현재 위치의 버튼을 밝게 표현

  async function activeBtn(page) {
    numberbtns.forEach((btn) => {
      if (btn.textContent === page) {
        btn.classList.add('active-page');
      }
    });
  }

  async function pagination(page, limit) {
    const pluspage = Math.floor((page - 1) / 5) * 5;
    // 각 링크에 클릭 이벤트 추가
    numberbtns.forEach((btn) => {
      btn.textContent = `${Number(btn.textContent) + pluspage}`;
      btn.addEventListener('click', function (e) {
        window.location.href = `/views/trades/page?page=${e.target.textContent}&limit=${limit}`;
      });
    });
  }

  function MovePreviewNext(page, limit) {
    previousPage.addEventListener('click', function (e) {
      const previousPageNumber = parseInt(page, 10) - 1;
      console.log(previousPageNumber);
      //페이지 이동
      if (previousPageNumber > 0) {
        window.location.href = `/views/trades/page?page=${previousPageNumber}&limit=${limit}`;
      }
    });
    nextPage.addEventListener('click', function (e) {
      const nextPageNumber = parseInt(page, 10) + 1;

      //페이지 이동
      window.location.href = `/views/trades/page?page=${nextPageNumber}&limit=${limit}`;
    });
  }

  //데이터 가져오기
  async function fetchTradesList(page) {
    try {
      const { data } = await axios.get(`/trades/page?page=${page}&limit=${limit}`);

      return data;
    } catch (err) {
      console.error('Failed to fetch to trades show Error:', err);
      alert('Failed To fetch Trades');
      return null;
    }
  }

  // 데이터 보여주기
  async function showTradeList(trades) {
    const tradeListContainer = document.getElementById('tradeList');
    tradeListContainer.innerHTML = '';
    trades.forEach((trade) => {
      const tradItemHTML = `<a href="/views/trades/${trade.id}"><div class="col">
          <div class="card h-100">
            <img src=${trade.imageurl} class="card-img-top" alt="이미지 존재하지 않음" />
            <div class="card-body">
              <h5 class="card-title">${trade.title}</h5>
              <p class="card-text">
                가격:${trade.price}<br>
                날짜:${trade.date}<br>
                시간:${trade.time}<br>
              </p>
            </div>
            <div class="card-footer">
              <small class="text-body-secondary">만료기한:${trade.closedAt}</small>
            </div>
          </div>
        </div></a>`;
      tradeListContainer.innerHTML += tradItemHTML;
    });
  }

  const result = await fetchTradesList(page);

  if (result) {
    MovePreviewNext(page, limit);
    showTradeList(result);
    pagination(page, limit);
    activeBtn(page);
  }
});

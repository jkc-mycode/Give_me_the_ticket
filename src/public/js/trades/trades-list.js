document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');
  const numberbtns = document.querySelectorAll('.numberbtn');
  const tradeListContainer = document.querySelector('#tradeList');

  //page값을 알아내는 함수
  function getPageFromParam() {
    const pathSegments = window.location.pathname.split('/');
    const page = pathSegments[pathSegments.length - 1];
    return page;
  }

  const page = getPageFromParam();

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

  async function pagination() {
    const pluspage = Math.floor((page - 1) / 5) * 5;
    console.log(pluspage);
    // 각 링크에 클릭 이벤트 추가
    numberbtns.forEach((btn) => {
      btn.textContent = `${Number(btn.textContent) + pluspage}`;
      btn.addEventListener('click', function (e) {
        window.location.href = `/views/trades/page/${e.target.textContent}`;
      });
    });
  }

  const previousPage = document.querySelector(`#previousPage`);
  const nextPage = document.querySelector(`#nextPage`);

  previousPage.addEventListener('click', function (e) {
    const previousPageNumber = parseInt(page, 10) - 1;
    if (previousPageNumber > 0) {
      window.location.href = `/views/trades/page/${previousPageNumber}`;
    }
  });

  nextPage.addEventListener('click', function (e) {
    const nextPageNumber = parseInt(page, 10) + 1;
    window.location.href = `/views/trades/page/${nextPageNumber}`;
  });

  //데이터 가져오기
  async function fetchTradesList(page) {
    try {
      const { data } = await axios.get(`/trades/page/${page}`);

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
    showTradeList(result);
    pagination();
    activeBtn(page);
  }
});

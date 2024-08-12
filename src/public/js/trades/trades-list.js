document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');
  const numberbtns = document.querySelectorAll('.numberbtn');
  const tradeListContainer = document.querySelector('#tradeList');

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

  //page값을 알아내는 함수
  function getPageFromParam() {
    const pathSegments = window.location.pathname.split('/');
    const page = pathSegments[pathSegments.length - 1];
    return page;
  }

  //페이지네이션 기능
  //현재 위치의 버튼을 밝게 표현

  async function activeBtn(page) {
    numberbtns.forEach((btn) => {
      if (btn.textContent === page) {
        btn.classList.add('active-page');
      }
    });
  }

  const previousPage = document.querySelector(`#previousPage`);
  const nextPage = document.querySelector(`#nextPage`);

  async function pagination() {
    // 각 링크에 클릭 이벤트 추가
    numberbtns.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        // 다른 링크들에서 active 클래스 제거
        numberbtns.forEach((btn) => btn.classList.remove('active-page'));

        // 클릭한 링크에 active 클래스 추가
        e.target.classList.add('active-page');
        window.location.href = `/views/trades/page/${e.target.textContent}`;
      });
    });
  }

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
  const page = getPageFromParam();
  const result = await fetchTradesList(page);

  if (result) {
    activeBtn(page);
    showTradeList(result);
    pagination();
  }
});

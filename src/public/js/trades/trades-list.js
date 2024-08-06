document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');
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

  //데이터 가져오기
  async function fetchTradesList() {
    try {
      const { data } = await axios.get('/trades');
      // console.log(data);

      return data;
    } catch (err) {
      console.err('Failed to fetch to trades show Error:', err);
      alert('Failed To fetch Trades');
      return null;
    }
  }

  // 데이터 보여주기
  async function showTradeList(trades) {
    const tradeListContainer = document.getElementById('tradeList');
    tradeListContainer.innerHTML = '';
    trades.forEach((trade) => {
      const tradItemHTML = `<div class="col">
          <div class="card h-100">
            <img src="..." class="card-img-top" alt="..." />
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
        </div>`;
      tradeListContainer.innerHTML += tradItemHTML;
    });
  }

  const result = await fetchTradesList();
  if (result) {
    showTradeList(result);
  }
});

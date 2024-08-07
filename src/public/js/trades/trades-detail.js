document.addEventListener('DOMContentLoaded', async () => {
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');
  const tradeContainer = document.querySelector('#tradeBox');
  const PurchaseBtn = document.querySelector('#createTrade');
  // const title = document.querySelector('.title');
  // const price = document.querySelector('.price');
  // const location = document.querySelector('.location');
  // const description = document.querySelector('.description');
  // const closedAt = document.querySelector('.createdAt');
  // const createdAt = document.querySelector('.createdAt');
  // const updatedAt = document.querySelector('.updateAt');

  if (!token) {
    window.location.href = '/views/auth/sign';
    alert('로그인이 필요합니다.');
    return;
  }

  function getTradeIdFromParam() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }

  //돌아가기 버튼
  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `/views`;
  });

  function getTradeIdFromParam() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }

  //중고거래 상세 정보 가져오기
  async function getDetailTrade(tradeId) {
    try {
      const { data } = await axios.get(`/trades/${tradeId}`);
      console.log(data);
      if (data) return data;
    } catch (err) {
      console.error('failed to fetch DetailTrade', err);
      return;
    }
  }
  const tradeId = getTradeIdFromParam();
  const result = await getDetailTrade(tradeId);
  tradeContainer.innerHTML = '';
  tradeContainer.innerHTML += `<div class="tradeImage">
          <img
            src="${result.imageUrl}"
            alt="이미지 파일 존재하지 않습니다"
          />
        </div>
        <div class="title">제목: ${result.title}</div>
        <div class="price">가격: ${result.price}</div>
        <div class="location">장소: ${result.location}</div>
        <div class="description">설명: ${result.content}</div>
        <div class="closedAt">만료 시한: ${result.closedAt}</div>
        <div class="createdAt">생성 시간:${result.createdAt}</div>
        <div class="updatedAt">마지막으로 수정한 시간:${result.updatedAt}</div>`;
  PurchaseBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const end = await axios.post(`/trades/${tradeId}`);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const tradeBtn = document.querySelector();
  const backBtn = documet.querySelector();
  const token = window.localStorage.getItem('accessToken');

  if (!token) {
    window.location.href = '/views/auth/sign';
    alert('로그인이 필요합니다.');
    return;
  }

  tradeBtn.addEventListener();
});

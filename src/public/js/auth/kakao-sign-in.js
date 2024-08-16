window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  const response = await axios.get(`/auth/kakao/token?code=${code}`);

  window.localStorage.setItem('accessToken', response.data.accessToken);
  window.localStorage.setItem('refreshToken', response.data.refreshToken);

  window.location.href = '/views';
};

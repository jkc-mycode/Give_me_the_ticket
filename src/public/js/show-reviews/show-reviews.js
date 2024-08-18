document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('accessToken');
  const ticketId = getIdFromPath();
  const submitButton = document.getElementById('submitReviewButton');
  const reviewTextElement = document.getElementById('postscript');
  const ratingElement = document.getElementById('rate');

  submitButton.addEventListener('click', async () => {
    const reviewText = reviewTextElement.value.trim();
    // Convert the rating value to a number
    const rating = parseInt(ratingElement.value, 10);

    if (!reviewText || isNaN(rating)) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const createReviewDto = {
      postscript: reviewText,
      rate: rating,
    };

    try {
      const response = await axios.post(`/reviews/${ticketId}`, createReviewDto, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        alert(response.data.message);
      } else {
        alert('작성에 실패하였습니다. 응답 상태 코드: ' + response.status);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.message);
        window.history.back();
      } else {
        console.error('Error:', err);
        alert('서버와의 통신 중 오류가 발생하였습니다.');
      }
    }
  });
});

function getIdFromPath() {
  return window.location.pathname.split('/').pop();
}

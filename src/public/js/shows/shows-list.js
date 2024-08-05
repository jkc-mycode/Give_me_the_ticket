document.addEventListener('DOMContentLoaded', async () => {
  const showListContainer = document.querySelector('#showList');
  const page = 1;
  const limit = 10;

  try {
    const response = await axios.get(`/shows?page=${page}&limit=${limit}`);
    const shows = response.data.data;

    if (!shows || shows.length === 0) {
      console.log('쇼 목록 없음');
      showListContainer.innerHTML = '<p>No shows available.</p>';
      return;
    }

    shows.forEach((show) => {
      const showCard = document.createElement('div');
      showCard.classList.add('col-md-4', 'mb-3');
      showCard.innerHTML = `
          <div class="card">
            <class="card-img-top" alt="${show.title}">
            <div class="card-body">
              <h5 class="card-title">${show.title}</h5>
              <p class="card-text">${show.content}</p>
              <a href="/views/shows/${show.id}" class="btn btn-primary">상세보기</a>
            </div>
          </div>
        `;
      showListContainer.appendChild(showCard);
    });
  } catch (error) {
    console.error('공연 목록 조회 실패:', error);
    alert('공연 목록 조회에 실패했습니다.');
  }
});

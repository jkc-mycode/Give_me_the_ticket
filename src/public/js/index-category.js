document.addEventListener('DOMContentLoaded', async () => {
  const categoryButtons = document.querySelectorAll('.category-btn');
  const showListContainer = document.getElementById('showList');
  let shows; // 최신 등록된 공연 데이터들

  // 카테고리 버튼 클릭 이벤트 핸들러
  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      window.location.href = `/views/shows/list?category=${category}`;
    });
  });

  // 최신 등록된 공연 5개 데이터 가져오기
  try {
    const { data } = await axios.get(`/shows`, {
      params: { page: 1, limit: 5, search: undefined, category: undefined },
    });
    console.log(data);
    shows = data.data;
    showListContainer.innerHTML = shows
      .map((show) => {
        const images = Array.isArray(show.images) ? show.images : [];
        const imageUrl = images.length > 0 ? images[0].imageUrl : 'default-image-url.jpg';
        return `
        <div class="col-2">
          <div class="card">
            <img src="${imageUrl}" class="card-img-top" alt="${show.title}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${show.title}</h5>
              <p class="card-text">위치: ${show.location}</p>
              <div class="mt-auto"> 
                <a href="/views/shows/${show.id}" class="btn btn-primary view-details">View Details</a>
              </div>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  } catch (error) {
    console.error(error);
    alert('공연 data 가져오기 실패');
    return null;
  }
});

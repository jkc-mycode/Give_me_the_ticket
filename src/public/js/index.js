document.addEventListener('DOMContentLoaded', async () => {
  const showListContainer = document.getElementById('showList');
  let shows; // 최신 등록된 공연 데이터들

  // 최신 등록된 공연 5개 데이터 가져오기
  try {
    const { data } = await axios.get(`/shows`, {
      params: { page: 1, limit: 5, search: undefined, category: undefined },
    });
    console.log(data);
    shows = data.data;
    showListContainer.innerHTML = shows
      .map((show) => {
        const imageUrl = show.imageUrl.length > 0 ? show.imageUrl[0] : 'default-image-url.jpg';
        return `
        <div class="col-2">
          <div class="card">
            <img src="${imageUrl}" class="card-img-top" alt="${show.title}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${show.title}</h5>
              <p class="card-text">위치: ${show.location}</p>
              <div class="mt-auto"> 
                <a href="/views/shows/${show.id}" class="btn btn-primary view-details">상세보기</a>
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

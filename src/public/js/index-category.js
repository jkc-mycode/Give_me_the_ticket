document.addEventListener('DOMContentLoaded', () => {
  const categoryButtons = document.querySelectorAll('.category-btn');

  // 카테고리 버튼 클릭 이벤트 핸들러
  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      window.location.href = `/views/shows/list?category=${category}`;
    });
  });
});

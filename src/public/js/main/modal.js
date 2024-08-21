document.addEventListener('DOMContentLoaded', function () {
  const contentModal = new bootstrap.Modal(document.getElementById('contentModal'));

  // 로컬 스토리지에서 모달 표시 여부 확인
  const showModal = localStorage.getItem('showModal') !== 'false';

  if (showModal) {
    contentModal.show();
  }

  // '이용 안내' 링크 클릭 시 모달 표시
  document.getElementById('modal-btn').addEventListener('click', function (event) {
    event.preventDefault();
    contentModal.show();
  });

  // '다시 보지 않기' 버튼 클릭 시 로컬 스토리지에 값 저장하고 모달 숨기기
  document.getElementById('dontShowAgainBtn').addEventListener('click', function () {
    localStorage.setItem('showModal', 'false');
    contentModal.hide();
  });
});

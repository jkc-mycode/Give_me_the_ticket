document.addEventListener('DOMContentLoaded', function () {
  const createShowForm = document.querySelector('#createShowForm');
  const imagePreview = document.querySelector('#imagePreview');
  const schedulesContainer = document.querySelector('#schedulesContainer');
  const addScheduleBtn = document.querySelector('#addScheduleBtn');
  const removeScheduleBtn = document.querySelector('#removeScheduleBtn');
  const token = window.localStorage.getItem('accessToken');

  // 로그인하지 않은 사용자는 로그인 페이지로 이동
  if (!token) {
    alert('로그인이 필요합니다');
    window.location.href = '/views/auth/sign';
    return;
  }

  //사용자 정보 가져오기
  async function getUserInfo() {
    try {
      const response = await axios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      return null;
    }
  }

  (async function () {
    console.log('Token:', token);

    try {
      const userInfo = await getUserInfo();
      if (!userInfo) {
        alert('접근 권한이 없습니다.');
        window.location.href = '/views'; // 메인 페이지로 이동
        return;
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      alert('사용자 정보를 가져오는 중 오류가 발생했습니다.');
      window.location.href = '/views'; // 메인 페이지로 이동
      return;
    }

    // 이미지 미리보기 생성
    const createImagePreview = (url) => {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'position-relative me-2';

      const img = document.createElement('img');
      img.src = url;
      img.className = 'preview-img';
      img.style.width = '120px';

      // 삭제 버튼
      const deleteImageBtn = document.createElement('button');
      deleteImageBtn.className = 'btn btn-danger position-absolute top-0 end-0';
      deleteImageBtn.innerText = 'X';
      deleteImageBtn.onclick = () => {
        // 미리보기 삭제
        imagePreview.removeChild(imageDiv);
      };

      // 미리보기 이미지와 삭제 버튼 imageDiv에 추가
      imageDiv.appendChild(img);
      imageDiv.appendChild(deleteImageBtn);
      return imageDiv;
    };

    // 파일 업로더에 변화가 있으면 이벤트 추가
    document.getElementById('formFileMultiple').addEventListener('change', (e) => {
      const images = e.target.files;
      imagePreview.innerHTML = ''; // 기존 미리보기를 초기화

      Array.from(images).forEach((image) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.appendChild(createImagePreview(e.target.result));
        };

        // 파일을 Data URL로 읽기
        reader.readAsDataURL(image);
      });
    });

    // 스케줄 추가 버튼 클릭 이벤트
    addScheduleBtn.addEventListener('click', function () {
      const scheduleInput = document.createElement('div');
      scheduleInput.classList.add('schedule-input', 'mb-3');
      scheduleInput.innerHTML = `
        <input type="date" class="form-control mb-2" name="scheduleDate" required>
        <input type="time" class="form-control mb-2" name="scheduleTime" required>
      `;
      schedulesContainer.appendChild(scheduleInput);
    });

    // 스케줄 삭제 버튼 클릭 이벤트
    removeScheduleBtn.addEventListener('click', function () {
      const scheduleInputs = schedulesContainer.querySelectorAll('.schedule-input');
      if (scheduleInputs.length > 1) {
        schedulesContainer.removeChild(scheduleInputs[scheduleInputs.length - 1]);
      } else {
        alert('최소 하나의 스케줄은 필요합니다.');
      }
    });

    // 공연 생성 폼 제출 이벤트
    createShowForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(createShowForm);
      const schedules = [];
      schedulesContainer.querySelectorAll('.schedule-input').forEach((scheduleInput) => {
        const date = scheduleInput.querySelector('input[name="scheduleDate"]').value;
        const time = scheduleInput.querySelector('input[name="scheduleTime"]').value;
        schedules.push({ date, time });
      });

      const images = document.getElementById('formFileMultiple').files;

      // FormData에 이미지 파일 추가
      const imageFormData = new FormData();
      for (let i = 0; i < images.length; i++) {
        imageFormData.append('image', images[i]);
      }
      imageFormData.append('maxImageLength', 5);

      try {
        // 이미지 업로드 API 호출
        const imageResponse = await axios.post('/images', imageFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        const imageUrls = imageResponse.data.map((item) => item.imageUrl);

        // 공연 생성 DTO
        const createShowDto = {
          title: formData.get('title'),
          content: formData.get('content'),
          category: formData.get('category'),
          runtime: Number(formData.get('runtime')),
          location: formData.get('location'),
          price: Number(formData.get('price')),
          totalSeat: Number(formData.get('totalSeat')),
          imageUrl: imageUrls,
          schedules: schedules,
        };

        // 공연 생성 API 호출
        const response = await axios.post('/shows', createShowDto, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 201) {
          alert('공연이 성공적으로 생성되었습니다.');
          createShowForm.reset();
          imagePreview.innerHTML = '';
          schedulesContainer.innerHTML = `
            <div class="schedule-input mb-3">
              <input type="date" class="form-control mb-2" name="scheduleDate" required>
              <input type="time" class="form-control mb-2" name="scheduleTime" required>
            </div>
          `;
        } else {
          alert('공연 생성에 실패했습니다.');
        }
      } catch (error) {
        console.error('공연 생성 오류:', error);
        alert('공연 생성 중 오류가 발생했습니다.');
      }
    });
  })();
});

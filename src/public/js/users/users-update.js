document.addEventListener('DOMContentLoaded', function () {
  const updateForm = document.getElementById('updateForm');
  const token = window.localStorage.getItem('accessToken');

  //----------- update user ---------------------
  updateForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const nickname = document.getElementById('nickname').value;
    const profileImg = document.getElementById('profileImg').files[0];

    // 현재 비밀번호 확인
    if (!currentPassword) {
      alert('현재 비밀번호를 입력해 주세요.');
      return;
    }

    // 이미지 업로드
    let profileImgUrl = '';

    if (profileImg) {
      const formData = new FormData();
      formData.append('image', profileImg);

      // 최대 이미지 수를 추가 (필요에 따라 수정)
      formData.append('maxImageLength', 1);

      try {
        // S3로 이미지 업로드해서 URL 받아오기
        const response = await axios.post('/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        profileImgUrl = response.data[0].imageUrl;
      } catch (err) {
        console.log('이미지 업로드 실패: ', err.response.data);
        alert('이미지 업로드에 실패했습니다.');
        return;
      }
    }

    // 사용자 정보 수정 DTO
    const updateUserDto = {
      currentPassword: currentPassword,
      nickname: nickname || undefined,
      profileImg: profileImgUrl || undefined,
    };

    try {
      // 백엔드 사용자 정보 수정 API 호출
      const response = await axios.patch('/users/me', updateUserDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('회원 정보 수정이 완료되었습니다.');

      // 수정 후 마이 페이지로 이동
      window.location.href = '/views/users/me';
    } catch (err) {
      console.log(err.response.data);
      alert(err.response.data.message);
    }
  });

  // 프로필 이미지 미리보기
  const profileImg = document.getElementById('profileImg');
  const profileImgPreview = document.getElementById('profileImgPreview'); // 이미지 미리보기

  profileImg.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        profileImgPreview.innerHTML = '';

        const img = document.createElement('img');
        img.src = event.target.result;
        img.className = 'preview-img';
        img.style.width = '120px';
        profileImgPreview.appendChild(img);
      };

      reader.readAsDataURL(file);
    } else {
      profileImgPreview.innerHTML = '';
    }
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  // 공연 ID 추출
  const urlArray = window.location.href.split('/');
  const showId = urlArray[urlArray.length - 2];

  let show; // 전역으로 사용할 공연 데이터 변수
  const token = window.localStorage.getItem('accessToken');

  try {
    // 공연 ID로 공연 데이터 가져오기
    const response = await axios.get(`/shows/${showId}`);
    show = response.data.data;
    console.log(show);
  } catch (err) {
    console.log(err);
    alert(err.response.data.message);
    window.location.href = '/views';
  }

  // session storage에서 공연 정보 가져오기
  const { title, content, category, runtime, location, price, imageUrl } = show;

  const titleInput = document.getElementById('title');
  const contentInput = document.getElementById('content');
  const categoryInput = document.getElementById('category');
  const runtimeInput = document.getElementById('runtime');
  const locationInput = document.getElementById('location');
  const priceInput = document.getElementById('price');
  const dropdownItems = document.querySelectorAll('.dropdown-item');

  // 기존의 공연 정보 각 Input에 넣기
  titleInput.value = title;
  contentInput.value = content;
  categoryInput.innerHTML = category;
  runtimeInput.value = runtime;
  locationInput.value = location;
  priceInput.value = price;

  // 드롭다운 항목 클릭하면 해당 항목으로 텍스트 변경 이벤트
  dropdownItems.forEach((item) => {
    item.addEventListener('click', () => {
      categoryInput.innerHTML = item.innerText;
    });
  });

  // 수정된 이미지 URL 배열
  let modifiedImageUrls = [...imageUrl];

  // 미리보기 이미지 생성
  const createImagePreview = (url) => {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'position-relative me-2';

    const img = document.createElement('img');
    img.src = url; //기존 이미지 URL 또는 새 이미지 URL
    img.className = 'preview-img';
    img.style.width = '120px';

    // 삭제 버튼
    const deleteImageBtn = document.createElement('button');
    deleteImageBtn.className = 'btn btn-danger position-absolute top-0 end-0';
    deleteImageBtn.innerText = 'X';
    deleteImageBtn.onclick = () => {
      // 미리보기 삭제
      imagePreview.removeChild(imageDiv);
      // 삭제된 이미지 URL을 modifiedImageUrls에서 제거
      modifiedImageUrls = modifiedImageUrls.filter((imageUrl) => imageUrl !== url);
    };

    // 미리보기 이미지와 삭제 버튼 imageDiv에 추가
    imageDiv.appendChild(img);
    imageDiv.appendChild(deleteImageBtn);
    return imageDiv;
  };

  // 기존 이미지 미리보기 생성
  const imagePreview = document.getElementById('imagePreview');
  imageUrl.forEach((url) => {
    imagePreview.appendChild(createImagePreview(url));
  });

  // 파일 업로더에 변화가 있으면 이벤트 추가
  document.getElementById('formFileMultiple').addEventListener('change', (e) => {
    const images = e.target.files;
    imagePreview.innerHTML = ''; // 기존 미리보기를 초기화
    // modifiedImageUrls = [...imageUrl]; // 수정된 이미지 배열 초기화

    // 기존 이미지 미리보기 생성
    modifiedImageUrls.forEach((url) => {
      imagePreview.appendChild(createImagePreview(url));
    });

    Array.from(images).forEach((image) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        imagePreview.appendChild(createImagePreview(e.target.result));
        // modifiedImageUrls.push(e.target.result);
      };

      // 파일을 Data URL로 읽기
      reader.readAsDataURL(image);
    });
  });

  // 업데이트 버튼에 이벤트 추가
  document.getElementById('updateShow').addEventListener('click', async () => {
    const formData = new FormData();

    // 선택한 이미지 파일을 formData에 추가
    const fileInput = document.getElementById('formFileMultiple');
    const files = fileInput.files;

    for (let i = 0; i < files.length; i++) {
      formData.append('image', files[i]); // 'image'는 백엔드에서 기대하는 필드 이름입니다.
    }

    // 최대 이미지 수를 추가 (필요에 따라 수정)
    formData.append('maxImageLength', 5);

    try {
      if (files.length > 0) {
        // S3로 이미지 업로드해서 URL 받아오기
        const newImageUrls = await axios.post('/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        // 새로운 URL 추가
        newImageUrls.data.forEach((item) => {
          modifiedImageUrls.push(item.imageUrl);
        });
      }

      console.log(modifiedImageUrls);

      console.log();

      // 공연 수정 DTO
      const updateShowDto = {
        title: titleInput.value,
        content: contentInput.value,
        category: categoryInput.innerHTML,
        runtime: runtimeInput.value,
        location: locationInput.value,
        price: priceInput.value,
        imageUrl: modifiedImageUrls,
      };

      console.log(updateShowDto);

      // 공연 수정 API 호출
      const response = await axios.patch(`/shows/${showId}`, updateShowDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response);
      alert(response.data.message);
    } catch (err) {
      console.log(err);
      // alert(err.response.data.message);
      // window.location.href = '/views';
    }
  });
});

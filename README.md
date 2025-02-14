# 🖥️ No Pain No Code 조의 Give_me_the_ticket 프로젝트

## 프로젝트 소개

- 서비스명: Give_me_the_ticket
- 프로젝트 한 줄 설명: 공연 예매와 예매한 티켓의 중고 거래를 한 곳에서 지원하는 서비스
- 서비스 기획 의도:

  - 일반적인 중고 거래 티켓은 암표 형태로 진행되며, 가격의 상한선이 존재하지 않고 사기 당할 위험도 사용자가 부담해야 함
  - 해당 서비스를 통해 티켓을 예매한 곳에서 중고 거래 함으로써 안전하고 알맞은 가격에 거래가 가능하게 지원할 수 있음
  - 기존의 환불 정책은 회사가 지는 취소표에 대한 리스크에 대한 올바른 방향성을 제시하고, 고객의 선택의 폭을 넓히기 위해서 이러한 서비스를 기획하게 됨.
  - 이는 단순히 고객의 니즈를 위해서만 존재하는 것이 아니라, 서비스를 제공하는 업체에서도 취소표에 대한 리스크를 고려할 요소를 줄여준다는 이점이 있음.
  - 기존의 상품가치에 대해 환불 시 발생하는 수수료가 불만족스러운 고객은, 본인의 선택에 따라 중고 티켓 거래를 할 수 있고 더 나은 가격을 받을 수 있기 때문에, 불법적으로 벌어지는 암표 행위를 일부 억제할 수 있음.

- [서비스 바로 가기](https://www.givemetheticket.shop/views)
- [팀 노션](https://west-territory-778.notion.site/No-Pain-No-Code-19a53f4fb6b5803b96c3c16952831781?pvs=4)
- [브로셔](https://west-territory-778.notion.site/Give-me-the-ticket-cbb1d5e4cd0e4cffb7e72220bd3a373e?pvs=4)

<br>

## 팀원 구성 및 역할 분배

- 팀장 : 안지윤 [@komiharuu](https://github.com/komiharuu)
  - 공연 티켓 구매, 환불 구현
  - 공연 리뷰 작성 구현
  - 공연 찜하기, 취소 구현
  - README 작성
- 부팀장 : 김정찬 [@jkc-mycode](https://github.com/jkc-mycode)
  - 회원가입, 로그인/로그아웃, 토큰 재발급 구현
  - 카카오 소셜 로그인 구현
  - AWS S3를 이용한 이미지 업로드 구현
  - 초기 세팅 및 CI/CD 설정
  - 서비스 배포 및 프로젝트 총괄
  - 최종 프로젝트 발표
- 팀원 : 이윤형 [@clearghost3](https://github.com/clearghost3)
  - 중고 거래 게시물 CRUD 구현
  - 중고 티켓 구매, 중고거래 검색 구현
  - 시연 영상 제작
- 팀원 : 이수빈 [@soobeen0301](https://github.com/soobeen0301)
  - 공연 CRUD 구현
  - Elasticsearch를 이용한 공연 검색 기능 구현
  - PPT 제작
- 팀원 : 방채은 [@xszvvfm](https://github.com/xszvvfm)
  - 사용자 정보 조회, 수정, 회원 탈퇴 구현
  - portone을 이용한 사용자 포인트 충전 기능 구현
  - PPT 제작
    <br>

## 1. MVP 개발 기간

- 2024.07.22 ~ 2024.08.08 (총 18일)

## 2. 배포 및 피드백 반영 기간

- 2024.08.12 ~ 2024.08.22 (총 10일)
  <br>

## 3. 개발 환경

- 운영체제 : Window/Mac

  - Back-End

    <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
    <img src="https://img.shields.io/badge/node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white">
    <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">

  - Front-End

    <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white">  
    <img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white">
    <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
    <img src="https://img.shields.io/badge/ejs-B4CA65?style=for-the-badge&logo=ejs&logoColor=black">
    <img src="https://img.shields.io/badge/axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white">

  - DataBase

    <img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
    <img src="https://img.shields.io/badge/typeorm-FE0803?style=for-the-badge&logo=typeorm&logoColor=white">
    <img src="https://img.shields.io/badge/redis-FF4438?style=for-the-badge&logo=redis&logoColor=white">
    <img src="https://img.shields.io/badge/amazon rds-527FFF?style=for-the-badge&logo=amazon rds&logoColor=white">
     <img src="https://img.shields.io/badge/amazon s3-569A31?style=for-the-badge&logo=amazon s3&logoColor=white">

  - Devops / Infra

    <img src="https://img.shields.io/badge/github actions-2088FF?style=for-the-badge&logo=github actions&logoColor=white">
    <img src="https://img.shields.io/badge/amazon ec2-FF9900?style=for-the-badge&logo=amazon ec2&logoColor=white">
    <img src="https://img.shields.io/badge/aws elastic load balancing-8C4FFF?style=for-the-badge&logo=awselasticloadbalancing&logoColor=white">
    <img src="https://img.shields.io/badge/amazon route 53-527FFF?style=for-the-badge&logo=amazonroute53&logoColor=white">
    <img src="https://img.shields.io/badge/amazon cloud front-527FFF?style=for-the-badge">
    <img src="https://img.shields.io/badge/apache jmeter-D22128?style=for-the-badge&logo=apachejmeter&logoColor=white">

- 서비스 아키텍쳐

![SOA](./docs/readme-images//SOA.png)

<br>

## 3. 프로젝트 이용

## 패키지 설치

```bash
$ npm install
```

## 환경변수 설정

.env.example을 복사하여 .env 파일 생성

## 서버 실행

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API 호출 테스트

 <img src="https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">

http://localhost:3000/

<br>

## 4. 기획 관련

- [일정 계획 (간트차트)](https://docs.google.com/spreadsheets/d/1_2s0liNMu8FX_m3TipS1r_ZdDQyDjgLJToEeR5Tb-Mo/edit?gid=446658082#gid=446658082)

- [API 명세서](https://www.notion.so/teamsparta/a3adab1478264779b4be45c417490229?v=271c930fb8ac4db8a5c3e5662bb39287)

- [ERD](https://www.erdcloud.com/d/pgD4S7yRJLJ2nfFBg)

- [와이어프레임](https://www.figma.com/file/FhXzCnzAKXrQAvpXVqRdNV?embed_host=notion&kind=file&node-id=0-1&t=5SS3F7d713NJ63yQ-1&viewer=1)

- [전체, 핵심 로직 흐름도](https://miro.com/app/board/uXjVKw91G9Q=/)

  ![Flow Chat](./docs/readme-images//flowchart.png)

<br>

## 5. 주요 기능 및 설명

### 5-1. 사용자 포인트 충전 API

![user point](./docs/readme-images/point.flowchart.png)

#### 5-1-1. /src/modules/users/users.service.ts

- 포인트를 충전한 후, 충전한 포인트에 해당하는 금액이 사용자의 계좌에서 인출되며, 이 과정을 로그로 기록하여 DB에 저장합니다.

- https://github.com/jkc-mycode/Give_me_the_ticket/blob/3fa41ab72531a177aff08c53434bf55cb5dcffd1/src/modules/users/users.service.ts#L277-L319

#### 5-1-2. /src/modules/payments/payments.service.ts

- 포트원을 이용해 결제 결과를 검증하고 포인트 충전 금액을 DB에 저장합니다.

- https://github.com/jkc-mycode/Give_me_the_ticket/blob/3fa41ab72531a177aff08c53434bf55cb5dcffd1/src/modules/payments/payments.service.ts#L50-L105

### 5-2. 공연 목록 조회 및 검색 API

![show search chart](./docs/readme-images//show-search-flowchart.png)

#### 5-2-1. /src/modules/shows/search/search.service.ts

- updatedAt을 기준으로 5분 단위로 스케줄링하며 수정된 데이터만 인덱싱합니다.

- https://github.com/jkc-mycode/Give_me_the_ticket/blob/3fa41ab72531a177aff08c53434bf55cb5dcffd1/src/modules/shows/search/search.service.ts#L127-L148

- Elasticsearch를 이용해 오타를 보정하여 유사 검색을 합니다.

- https://github.com/jkc-mycode/Give_me_the_ticket/blob/3fa41ab72531a177aff08c53434bf55cb5dcffd1/src/modules/shows/search/search.service.ts#L155-L180

#### 5-2-2. /src/modules/shows/shows.service.ts

- 목록 조회 시 인덱싱한 데이터를 가져와 반환합니다.

- https://github.com/jkc-mycode/Give_me_the_ticket/blob/3fa41ab72531a177aff08c53434bf55cb5dcffd1/src/modules/shows/shows.service.ts#L132-L143

- 오타 검색 결과 : '시하고'라고 오타로 검색했을 경우 원하는 결과인 '시카고'를 조회할 수 있습니다.
  ![show search](./docs/readme-images//show-search.png)

<br>

### 5-3. 공연 티켓 예매 API

![ticket booking](./docs/readme-images/booking-flowchart.png)

#### 5-3-1. /src/modules/shows/shows.service.ts

- 사용자가 사이트에 있는 공연을 예매합니다.
- 공연 티켓 예매 시 공연 시작 2시간 전에는 예매를 할 수 없습니다.
- 매크로 방지를 위해 한 사람당 한 공연의 티켓을 최대 5장 구매하게 합니다.
- 공연 예매에 성공하면 사용자의 포인트를 공연 금액만큼 감소시키고, 잔여 좌석수를 감소시킵니다.

- https://github.com/jkc-mycode/Give_me_the_ticket/blob/736ee3774119f5ab316976273c498515e52e48c1/src/modules/shows/shows.service.ts#L653-L755

#### 5-3-2. 동시성 처리

![ticket booking](./docs/readme-images/ticket-flowchart.jpg)

- 한 좌석이 남은 공연이 있다고 가정할 경우에, 먼저 락을 획득한 사람이 공연을 예매할 수 있게 합니다.

```
const lock = await this.redisService.acquireLock();
```

- 이 코드를 통해서 티켓 생성 메서드에 락을 걸어 한 유저가 락을 점유하고 있으면 다른 유저가 데이터베이스 리소스에 접근하지 못하게 합니다.

- 실제로 1000명의 사용자가 총 좌석이 20개인 공연을 예매하기 위해서 몰렸을 때 정확히 20개의 티켓만 생성되는지 테스트를 진행하였습니다.

![ticket booking](./docs/readme-images/ticket-booking1.png)

- 정확히 20개의 티켓이 예매 되었고 해당 스케줄의 공연의 잔여 좌석은 0이 된 것을 볼 수 있습니다.

![ticket booking](./docs/readme-images/ticket-booking2.png)

### 5-4. 공연 티켓 환불 API

![ticket deposit](./docs/readme-images/refund-flowchart.png)

#### 5-4-1. /src/modules/shows/shows.service.ts

- 공연 티켓 환불 시 위 차트의 정책을 기반으로 에러 처리를 합니다.
- 환불된 금액을 사용자 포인트에 입금하고, 해당 공연의 잔여 좌석을 증가시킵니다.

- https://github.com/jkc-mycode/Give_me_the_ticket/blob/736ee3774119f5ab316976273c498515e52e48c1/src/modules/shows/shows.service.ts#L772-L897

### 5-5. 중고 거래 티켓 구매 API

![ticket trades](./docs/readme-images//trades.flowchart.png)

#### 5-5-1. /src/modules/trades/trades.service.ts

- 사용자가 중고 티켓을 구매 시 해당 티켓을 구매자에게 재발급합니다.
  (이 때 판매자의 티켓은 로그만 남고 사용하지 못하게 됩니다.)

- 중고 거래 게시물의 상태를 판매 완료로 변경합니다.

- https://github.com/jkc-mycode/Give_me_the_ticket/blob/736ee3774119f5ab316976273c498515e52e48c1/src/modules/trades/trades.service.ts#L463-L598

## 6. 사이트 이용 안내

### 6-1. 포인트 충전 안내

- 내 정보 페이지 -> MY POINT 탭 -> 포인트 충전 버튼 클릭

  ![user point](./docs/readme-images//my-page-point.png)

- 이동한 포인트 충전 페이지에서 충전할 포인트 금액 선택 후 결제하기 버튼 클릭.

  ![user point](./docs/readme-images/point-payments1.png)

- 사용자가 원하는 결제 방법을 선택 가능.

  ![user point](./docs/readme-images/point-payments2.png)

- 결제 완료 시 결제 성공 창이 뜨며 내정보 페이지로 이동하여 변동된 포인트 금액과 내역을 확인 가능

  ![user point](./docs/readme-images/point-payments3.png)

  <br>

### 6-2. 공연 예매 안내

- 공연 티켓 예매 페이지
- 메인페이지 -> 원하는 공연을 클릭합니다.

  ![ticket booking](./docs/readme-images/show-booking1.png)

- 공연을 예매하기 전에 날짜 및 시간 선택 드롭다운 버튼을 눌러 날짜 및 스케줄을 선택합니다.

  ![ticket booking](./docs/readme-images/show-booking2.png)

- 예매하기 버튼을 클릭합니다.
  ![ticket booking](./docs/readme-images/show-booking3.png)

- 예매 한 공연의 정보와 포인트 정보를 다시 한번 확인 해 예매를 진행합니다.
  ![ticket booking](./docs/readme-images/show-booking4.png)
  <br>

### 6-3 공연 환불 안내

- 공연 티켓 환불 페이지
- 내 정보 페이지 -> MY TICKET -> 환불을 원하는 티켓의 환불 버튼을 클릭합니다.
  ![ticket deposit](./docs/readme-images/show-refund1.png)

- 티켓 환불 페이지로 이동되며, Refund 버튼을 클릭합니다.
  ![ticket deposit](./docs/readme-images/show-refund2.png)

- 환불이 완료되었다는 창이 뜨며, 티켓 내역 조회 시 티켓의 상태가 변경된 것을 확인 할 수 있습니다.

  ![ticket deposit](./docs/readme-images/show-refund3.png)

    <br>

### 6-4 공연 중고거래 등록 안내

- 중고 거래 등록 페이지
- 마이페이지 -> 예매 목록 조회 페이지에서 예매한 티켓을 확인한 후 중고 판매 버튼을 누릅니다.

  ![create trades](./docs/readme-images//create-trade1.png)

- 원하는 중고거래 가격 금액을 입력하여 등록을 합니다.

  ![create trades](./docs/readme-images//create-trade2.png)

- 거래에 성공했다는 창이 뜨며, 내 정보 조회 -> MY TICKET 확인 시 구매한 티켓이 있는 것을 확인 할 수 있습니다.
  ![create trades](./docs/readme-images//create-trade3.png)

  <br>

### 6-5 공연 중고거래 구매 안내

1. **중고 거래 구매 페이지로 이동**

   - **설명**: 중고 거래 목록 조회 페이지에서 원하는 중고거래 게시글을 클릭하여 중고 거래 상세 페이지로 이동합니다.
   - ![ticket trades](./docs/readme-images/trades-1.png)

2. **중고 거래 구매 버튼 클릭**

   - **설명**: 중고 거래 상세 페이지에서 '구매' 버튼을 클릭합니다.
   - ![ticket trades](./docs/readme-images/trades-2.png)

3. **구매 확인창 확인 및 확인 버튼 클릭**

   - **설명**: '구매' 버튼을 클릭하면 구매 확인창이 뜨고, 확인을 눌러서 구매를 완료합니다.
   - ![ticket trades](./docs/readme-images/trades-3.png)

4. **마이페이지에서 중고 거래 내역 확인**
   - **설명**: 마이페이지에서 '중고거래 내역'을 확인하면 구매한 중고 티켓의 정보와 함께 판매자의 이름도 조회할 수 있습니다.
   - ![ticket trades](./docs/readme-images/trades-4.png)

## 7. 트러블슈팅

### 7-1. Red Lock 동시성 테스트

- **문제** : 10명의 사용자가 5개의 공연 좌석을 예매하는 상황으로 동시성 테스트를 진행. 좌석 5개가 예매 완료 되어야 하는데, 6개가 예매 완료되는 상황이 발생

- **추정 원인** : 락 획득 재시도 지연시간 문제라고 추정

- **시도한 내용** : 락 획득 재시도 지연시간을 짧게 설정

- **해결 방안** : 티켓 예매 로직이 트랜잭션 시작 - 락 획득 - 트랜잭션 종료 - 락 반납 순서대로 되어있었고, 티켓 예매 로직을 락 획득 - 트랜잭션 시작 - 트랜잭션 종료 - 락 반납으로 수정

<br>

### 7-2. CI/CD 설정

- **문제** : CD workflow 멈춤 현상
  ![CI/CD](./docs/readme-images//ci-cd-1.png)
  ![CI/CD](./docs/readme-images//ci-cd-2.png)

- **추정 원인**

  - npm ci 에서 aws-sdk 패키지를 설치할 때 메모리를 너무 많이 잡아먹어서 메모리 누수로 인해 서버에서 다음 동작을 하지 못해 Timeout이 발생하는 것으로 추정

  - EC2 인스턴스 서버에서 CPU 점유율이 거의 100%까지 치솟아서 이로 인해 서버가 느려지거나 멈추는 것이라고 추정함

  - AWS EC2 인스턴스에서 실행하지 않고 일반 로컬 서버에서 실행하면 정상 동작함

  - 완벽하진 않지만 CD 과정에서 `appleboy/ssh-action` 를 다운로드 하는 과정에서 타임 아웃이 발생하고 그로 인해 CPU 점유율이 100%로 치솟는 다고 추정함

- **시도한 내용**

  - 혹시나 `cd.yml` 파일의 오타가 있는지 확인하고 실제로 오타가 있어서 수정함
  - Github Actions Secret에 들어갈 키의 값들을 다시 설정함
  - 사용하지 않는 패키지들 `package.json` 파일에서 삭제함

  - t2.micro에서 t3로 EC2 인스턴스의 유형을 변경함
  - `npm ci` 명령어에 별도의 옵션을 추가해서 빠르게 진행되도록 수정함
  - 직접 사용하지 않는 패키지들을 삭제함
  - `npm ci` 전에 최대한 리소스를 줄이기 위해 EC2 인스턴스에서 실행 중인 pm2 서버를 종료 먼저하고 `npm ci` 를 진행함

- **해결 방안**

  - 이미지를 S3에 업로드 할 때 aws-sdk 패키지를 실제로 사용하지 않기 때문에 `package.json`에서 해당 패키지를 삭제
  - 결과적으로 `appleboy/ssh-action` 으로 인한 문제가 맞는 것 같음
  - 해당 action을 사용하지 않고 직접 SSH를 통해서 명령을 실행하는 방법을 사용
  - Github Actions VM에서 직접 SSH에 접속하는 명령을 통해서 EC2 인스턴스에 접근함

### 7-3. 소셜 로그인 보안 강화

- **문제** : 소셜 로그인을 진행할 때 URL 상에 토큰 정보를 담아서 보내서 보안적으로 취약하다는 문제가 있었음

- **추정 원인** : 카카오 로그인 백엔드 API에서 생성한 토큰을 직접 URL에 담아서 전송하고 있음

- **시도한 내용** : 프론트엔드로 리다이렉트 할 때, 랜덤한 code값을 전송

- **해결 방안**

  - 랜덤한 code를 만들어서 해당 코드를 키로 하는 사용자 ID를 레디스에 저장했음
  - 이 방법을 사용하면 클라이언트는 URL 상에서 해당 코드만 확인이 가능하기 때문에 정확한 사용자 정보를 확인할 수 없음
  - 그리고 클라이언트가 필요로 하는 토큰은 직접적으로 노출된 형태가 아니라 Body에 담겨서 클라이언트에게 전달되기 때문에 보안적으로 다소 향상되었다고 볼 수 있음
  - 또한 Redis에 저장된 사용자 ID는 짧은 TTL를 통해서 노출이 최소화 되도록 구현함

- 적용 전

![kakao login](./docs/readme-images//kakao-login1.png)

- 적용 후

![kakao login](./docs/readme-images//kakao-login2.png)

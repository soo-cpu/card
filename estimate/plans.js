/* 우리 집 찾기 — 평면도 목록 + (선택) 카카오 주소 검색 설정
   ■ 단지·평면도 추가하는 법
     1) 평면도 이미지를 estimate/plans/ 폴더에 넣기 (가로 1200px 이하 jpg, 회사가 직접 그린 도면이나 사용 허락 받은 도면)
     2) 아래 PLANS 에 단지를 한 줄 추가하고, types 에 평형 타입을 넣기
        { name:"34평 A", py:34, bath:2, img:"plans/파일이름.jpg" }   ← img 가 없으면 "평면도는 실장이 찾아서 보내드려요"로 보임
   ■ 카카오 주소 검색 켜는 법 (목록에 없는 단지도 주소로 찾게 됨)
     developers.kakao.com → 내 애플리케이션 → 앱 추가 → [플랫폼 > Web] 에 https://soo-cpu.github.io 등록
     → [앱 키] 의 JavaScript 키를 아래 KAKAO_JS_KEY 에 넣기. 비워 두면 아래 목록에서만 찾습니다. */
var EST_PLAN_CFG = { KAKAO_JS_KEY: "" };

var EST_PLANS = [
  { apt: "인창 현대홈타운", area: "경기도 구리시 인창동", types: [ { name: "33평", py: 33, bath: 2, img: "" } ] },
  { apt: "인창동 동양아파트", area: "경기도 구리시 인창동", types: [ { name: "34평", py: 34, bath: 2, img: "" } ] },
  { apt: "인창5단지 삼환신일", area: "경기도 구리시 인창동", types: [ { name: "37평", py: 37, bath: 2, img: "" } ] },
  { apt: "인창공원 우림필유", area: "경기도 구리시 인창동", types: [ { name: "46평", py: 46, bath: 2, img: "" } ] },
  { apt: "진접 한신아파트", area: "경기도 남양주시 진접읍", types: [ { name: "31평", py: 31, bath: 2, img: "" } ] },
  { apt: "진접 신안인스빌", area: "경기도 남양주시 진접읍", types: [ { name: "34평", py: 34, bath: 2, img: "" } ] },
  { apt: "화도 풍림아이원", area: "경기도 남양주시 화도읍", types: [ { name: "40평", py: 40, bath: 2, img: "" } ] }
];

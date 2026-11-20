/* 시공 전·후 사진 목록 (QR 안내 페이지의 '밀어서 보는 전·후' 칸)
   사진 넣는 법:
   1) 같은 자리에서 찍은 전·후 사진 2장을 가로 사진(4:3, 가로 1200px 이하)으로 이 폴더(go/ba/)에 넣기
      예) guui-living-before.jpg / guui-living-after.jpg
   2) 아래 목록에 한 줄 추가. name=단지 이름, room=공간, before/after=파일 이름
   목록이 비어 있으면 이 칸은 화면에 안 나옵니다. 고객 동의 받은 사진만 올려 주세요. */
window.BA = [
  // { name: "구의현대 2단지", room: "거실", before: "guui-living-before.jpg", after: "guui-living-after.jpg" },
];
/* 주소 끝에 &demo=1 (또는 ?demo=1)을 붙이면 예시 한 쌍으로 모양을 미리 볼 수 있어요 */
window.BA_DEMO = [{ name: "예시", room: "모양 미리 보기", before: "demo-before.jpg", after: "demo-after.jpg", demo: true }];

# 홈페이지 사진·영상 폴더 (v7 기준)

| 파일 | 쓰는 곳 | 상태 |
|---|---|---|
| hero.jpg | 맨 위 첫 화면 사진 (세로 1200×1600) | 있음 (구리역 롯데캐슬 복도) |
| hero-vertical.mp4 | 첫 화면 영상 (휴대폰) | **아직 없음** — 넣으면 사진 대신 소리 없이 자동 반복 |
| hero-wide.mp4 | 첫 화면 영상 (PC) | **아직 없음** — 없으면 세로 영상, 그것도 없으면 사진 |
| work-1.jpg ~ work-3.jpg | 시공 사례 3칸 (세로 4:5, 1000×1250) | 있음 (롯데캐슬 · 구의 현대 · 갈매 루샵) |
| ceo.jpg | 대표 인사말 | 있음 |
| og.jpg | 카톡·문자로 링크 보낼 때 미리보기 (1200×630) | 있음 |
| hero-poster.jpg, hero-poster-mono.jpg, record.jpg | v6 이전에 쓰던 사진 | v7에서는 안 씀 |

- 사진은 가로 1200px 이하, 영상은 5MB 이하(720p, 소리 없음) 권장.
- 영상 압축 예: `ffmpeg -i 원본.mp4 -an -vf "scale=-2:1280" -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-vertical.mp4`

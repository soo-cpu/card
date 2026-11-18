# 홈페이지 사진·영상 폴더

| 파일 | 쓰는 곳 | 비고 |
|---|---|---|
| hero-poster.jpg | 맨 위 대표 화면 정지 사진 | 영상이 없거나 재생 안 될 때 |
| hero-vertical.mp4 | 맨 위 대표 영상 (휴대폰) | **아직 없음** — '오늘의집_회사소개_세로.mp4'를 압축해 이 이름으로 넣기 |
| hero-wide.mp4 | 맨 위 대표 영상 (PC) | **아직 없음** — '오늘의집_회사소개_가로.mp4'를 압축해 이 이름으로 넣기 |
| record.jpg | 관공서·학교 실적 칸 | |
| ceo.jpg | 대표 인사말 칸 | |
| work-1.jpg ~ work-6.jpg | 시공 사례 6칸 | 없으면 "사진 준비중" 표시 |

- 사진은 가로 1200px 이하, 영상은 5MB 이하(720p, 소리 없음) 권장.
- 영상 압축 예: `ffmpeg -i 원본.mp4 -an -vf "scale=-2:1280" -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-vertical.mp4`

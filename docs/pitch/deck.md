# Deck — muselook (2 slides)

갱신 2026-10-24 14:10 KST. 원본 `deck.html` → `muselook-deck.pdf` (2쪽, 1920×1080, Chromium 렌더). 공식 키트 GUIDE 형식: 왼쪽 위 팀 이름, 하단 `footer-for-light-slides.png` 폭 90%·아래 32px.

## 미정

- 팀 이름: 재드래곤 (사용자 확인 2026-10-24)
- 배포본(muselook.fly.dev, 12:30 v2)은 스크린샷 화면(피드 4장 그룹·제품 핀·Muse/My tone)보다 이전 버전이다. 제출 전 재배포 필요.

## 숫자·주장 출처

| 덱 문구 | 종류 | 출처·조건 |
|---|---|---|
| "Brown skin foundations: Tirtir is the only option" (r/koreanskincare, 2025) | 외부 출처, 포럼 글 1건 | `research.md` §1 — 스레드 제목 의역(원문: "Brown skin foundations", 본문에서 Tirtir 외 선택지 없음) |
| US = K-뷰티 수출 1위, $2.19B, +15.1% (2025) | 외부 출처 | 식약처 via 연합 2026-01-09, `research.md` §2. 시장 규모이지 이 문제의 수요가 아님 |
| Muse vs My tone 제품 교체(베이스 CLIO Kill Cover Mesh Glow 02 Lingerie → TIRTIR Mask Fit Red 35N Walnut, 립 rom&nd Zero Velvet 07 Fizz → 21 Villain Vest, 아이 dasique #19 → rom&nd 02 Mahogany Garden) | 실측(제품 출력) | 로컬 포스트 `Ut7_dOpqZF`(Scarlet Edge, medium · warm olive), 세션 `74c66d91…` — 합성 인물, 샘플 룩, 14:1x 시드 |
| Claude 역할: Haiku 5.5 분석·태깅, Sonnet 5.5 톤 번역, Sonnet 5.5 pi 에이전트 웹검색 | 구현 사실 | `spec.md` 제품 AI·제품 추천, `src/lib/reco-agent.ts` |
| 이미지 모델 | 구현 사실 | OpenAI `gpt-image-2.5-sunburst`, 운영진 허용(`hackathon.md`) |

## 공개(R5)

Live: Claude 분석·톤 번역·제품 검색. Sample: 데모 얼굴은 AI 생성 인물, 샘플 룩은 사전 계산 결과. 얼굴 위 색은 시뮬레이션이며 실제 스와치가 아님. 고객 사용·매출 없음 — 트랙션으로 부르지 않는다.

## 스크린샷

실행 중이던 로컬 서버 :3100(빌드 커밋 미확인, HEAD aba9df2) 430×932 @2x, Playwright: `assets/feed.png`(`/`, Scarlet Edge 포스트 영역 잘라냄), `assets/product.png`·`assets/product-mytone.png`(`/p/Ut7_dOpqZF`, Muse·My tone 탭). 1장 사진은 같은 세션의 `look.jpg`·`apply_translated.png`.

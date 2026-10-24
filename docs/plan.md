# Plan

| 항목 | 값 |
|---|---|
| 현재 시각 | 12:0x KST |
| 남은 시간 | 목표 제출 13:30까지 1h40m (마감 17:00) |
| 마지막 검증 후보 | 셋업 완료 커밋 (lint·tsc·build·docker run 통과, AI 실호출 미검증) |
| 가장 큰 위험 | 브라우저에서 On Me·공유 시트 클릭 경로 미검증 / 실기기 모바일 미검증 |
| 다음 작업 | 브라우저 클릭 경로 QA(데스크톱·폰) → 덱 2장 → 제출 패킷 |

## 작업

| # | 목표 | 담당 | 소유 파일 | 의존 | 완료 조건 | 증거 |
|---|---|---|---|---|---|---|
| T0 | Next.js 생성, 공유 타입·API 골격, Railway 빈 앱 배포+볼륨 | 메인 | `package.json`, 설정, `src/lib/types.ts`, `src/lib/storage.ts`, `.gitignore` | 배포 계정 | `pnpm build` 통과, 공개 URL 200, 볼륨 쓰기 확인 | |
| T1 | 이미지 edit 위험 실험(셀카+룩 → 톤 보존) | 메인 | `scripts/spike-image.ts` | OpenAI 키, 샘플 이미지 | 결과 이미지 2장 눈 확인·볼 평균색 비교 | |
| T2 | Claude 분석·톤 번역 + 카탈로그 매칭 | builder A | `src/lib/claude.ts`, `src/lib/catalog.ts`, `src/app/api/session/**` | T0 | 샘플 룩으로 스키마 통과 JSON | |
| T3 | 이미지 생성 모듈 | builder A | `src/lib/imagegen.ts` | T0, T1 | ②③ 파일 저장 | |
| T4 | UI ①→②→③, 배지, 실패 상태 | builder B | `src/app/page.tsx`, `src/app/(ui)/**`, `src/components/**` | T0 계약 | mock 데이터로 전 흐름 렌더 | |
| T5 | 샘플 카탈로그 25~30개(K-뷰티, hex·톤 적합·링크, sample) | writer | `src/data/catalog.json` | 계약 | 스키마 일치, 출처 표기 | |
| T6 | 덱 초안 2장 | writer | `docs/pitch/deck.md` | spec | 고객·주제·결과·근거 종류 | |
| T7 | 통합·배포·시나리오 검증 | 메인 | — | T2~T5 | 공개 URL에서 ①②③ 실제 호출 | |

## 실행 기록

| 시각 | 커밋 | 명령·시나리오 | 결과 |
|---|---|---|---|
| ~11:50 | 4b70a40 | scaffold: create-next-app 16.4.2, `pnpm lint`·`pnpm build` | 통과 |
| ~12:05 | 6cd119d | T2·T3·T5 통합 후 `pnpm lint`, `npx tsc --noEmit`, `pnpm build` (repo root) | 통과, API 5개 dynamic. 키 없음 → AI 실호출 미검증 |
| ~12:15 | (셋업) | `pnpm lint`, `npx tsc --noEmit`, `rm -rf .next && pnpm build`, `PORT=3100 pnpm start` + Edge 헤드리스 스크린샷(1280x960) | 통과, 디자인 A 토큰·폰트·앱 셸 렌더 확인. 390px 스크린샷은 헤드리스 최소 창 폭 때문에 우측 오프셋 — 실기기 미확인 |
| ~12:18 | (셋업) | `docker build -t muselook:local .` → run → `/`·manifest 200, `pi --version` 1.4.0, pi-web-access 설치, `/data` 쓰기, `POST /api/session` 빈 파일 415 | 통과 (libatomic1 추가로 pnpm 실행 오류 수정) |
| ~12:25 | (spike) | 로컬 `pnpm start` + 합성 샘플(`public/samples/`, gpt-image-2.5-flare 생성 가상 인물)으로 ①→②→③ 실호출 | ① Claude 분석 200, 17s (forced tool_choice 미지원 → structured outputs로 수정) · ② 이미지 28s, 얼굴·딥 톤 보존 확인(`docs/evidence/spike-apply-original.png`) · ③ 번역 8s + 이미지·pi 웹검색 제품 25s, 실제 제품 5개(Olive Young 등 URL), fallback 없음. ②③ 차이는 립·블러셔에서 보이나 미묘함 |
| ~12:27 | 0557dc2 | 로컬 `rm -rf .next && pnpm build`(경고 0) → `pnpm start` → API E2E: sample→selfie(②32s)→translate(7s)→③+제품(35s, 실제 제품 5개)→POST /api/posts 200→feed 1건→try 200→/p og:image→DELETE 오답 403 | 통과. Edge 스크린샷 /, /s/[id](My Tone), /feed, /p/[id] 디자인 A 일치 |
| ~12:30 | 0557dc2 | `fly deploy`(clean worktree) → https://muselook.fly.dev API E2E: sample brick-sunset→②30s→translate 7.6s→③+제품 39s(pi 웹검색, fallback 없음)→post 200, og:image https 200, /feed 200 | 통과. 피드에 시드 포스트 1건(합성 인물) |

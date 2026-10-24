# Plan

| 항목 | 값 |
|---|---|
| 현재 시각 | 11:50 KST |
| 남은 시간 | 목표 제출 13:30까지 1h40m (마감 17:00) |
| 마지막 검증 후보 | 없음 (제품 코드 미시작) |
| 가장 큰 위험 | 이미지 모델의 얼굴·톤 보존 / Railway 계정·볼륨 / OpenAI 키 미수령 |
| 다음 작업 | 배포 계정 확정 → /scaffold |

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

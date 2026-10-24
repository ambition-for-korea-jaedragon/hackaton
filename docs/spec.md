# Spec — Shade-true Look Copy (가칭)

갱신 2026-10-24 11:50 KST. 요구가 바뀌면 이 문서부터 갱신한다. 근거: `ideas.md`, `research.md`, `evidence.md`.

## 문제와 선택

- 선택 주제: "K-뷰티·K-의료를 찾는 전 세계 소비자를 위한 서비스" (`mission.md`) — K-뷰티 축
- 고객·국가·실제 작업: 미국 Gen Z(13+) K-뷰티 팬, 특히 미디엄~딥 톤. 아이돌·원하는 메이크업 룩을 따라 하려고 제품을 고르는 작업
- 가장 큰 불편: 아이돌 제품 정보는 톤과 무관하고, 해외라 스와치할 수 없으며, 딥 톤 쉐이드가 부족하다 (외부 출처 `research.md` §1)
- 한 줄 가치 제안: 아이돌 룩을 내 피부톤으로 번역해 — 내 얼굴에서의 모습과 내게 맞는 K-뷰티 제품·루틴을 보여준다
- 첫 고객 경로: r/kbeauty·r/AsianBeauty 쉐이드 스레드, TikTok 딥 톤 K-뷰티 크리에이터, Olive Young US 제휴
- 공개 레포·주제 선언: 완료 (`context.md`)

## 보여줄 결과

한 사용자 · 한 작업 · 바뀐 상태 하나: **② "그대로 적용한 내 얼굴" vs ③ "내 톤으로 번역한 내 얼굴" 비교 + 번역된 제품.** 이 결과가 피드에 공유되고 다른 사용자가 같은 룩을 자기 톤으로 시도하는 루프가 확산 경로다.

| 사용자 행동·입력 | 기대 산출물·상태 변화 | 성공을 판정할 관찰 |
|---|---|---|
| ① 룩 사진 업로드(또는 샘플 룩 선택) → "Analyze This Look" | 무드 한 줄 + 부위별(기초·베이스·아이·블러셔·립) 색 계열·hex·제형·기법·주의 포인트 | 실제 사진에 대해 5개 부위가 채워진 분석 카드가 뜬다. 정확 브랜드 단정 없음 |
| ② 셀카 업로드(13+ 체크·전송 고지 동의) → "See It On Me" | 원본 룩을 그대로 입힌 내 얼굴 이미지(외부 이미지 모델) | 같은 사람·같은 피부톤으로 보이는 이미지가 뜬다 |
| ③ "Translate To My Tone" | Claude 톤 판정 + 부위별 원본→번역 색·이유 + 샘플 카탈로그 제품 카드 + 번역 색으로 다시 입힌 이미지 + 기초→립 루틴 | ②와 ③ 이미지가 나란히 보이고, 각 변경에 이유 한 줄과 제품 카드가 있다 |

| ④ "Share My Strip" → 캡션(선택)·원본 룩 공개 여부 선택 → "Post to Feed" | 공개 피드에 포스트(원본 룩·As-is·My tone·톤 태그·제품) + 공유 링크 `/p/{id}`(링크 미리보기 이미지) | 피드 최상단에 내 포스트가 보이고, 다른 브라우저에서 링크가 열린다 |
| ⑤ 피드에서 다른 사람 포스트 → "Try This Look" | 그 룩으로 새 세션 시작(① 분석 재사용) → 내 셀카로 ②③ | 분석 대기 없이 셀카 단계로 바로 이동 |

- 소셜 범위(사용자 결정 2026-10-24): 공개 피드 + 포스트 페이지·공유 링크 + "Try This Look" 재사용 루프. 좋아요·댓글·팔로우·계정은 이번 범위 밖. 게시는 명시적 opt-in, 13+, 브라우저에 저장한 삭제 토큰으로 내 포스트 삭제.
- 시작 조건: 공개 URL, 로그인 없음. 데스크톱·모바일 브라우저. 13+ 체크.
- 반복 실행·초기화: 세션 ID별 폴더. "Start Over"로 새 세션. 같은 세션에서 ③만 재실행 가능.
- 실패 안내: 얼굴 미검출·AI 실패·타임아웃 시 이유와 "Try Again" / 샘플 룩·샘플 셀카로 진행 경로. 실패를 성공으로 꾸미지 않는다.
- 반드시 되는 범위: 샘플 룩 1개 + 셀카 1장으로 ①→②→③ 끝까지(실제 호출).
- 줄일 순서: 임의 룩 업로드 → ③ 이미지 재생성(텍스트·제품만) → 구매 링크 → 루틴 상세. ①분석과 ②③ 비교는 유지.
- 표시 배지: Live AI / Sample catalog / Simulation (R5).

## 가치의 근거

| 주장 | 비교 대상·같은 입력 조건 | 확인할 결과 | 근거 종류·한계 |
|---|---|---|---|
| 딥 톤 해외 팬은 K-뷰티 쉐이드가 내 톤에 맞을지 알기 어렵다 | — | Reddit 3건, Dazed | 외부 출처. 파운데이션 중심, 자기선택 |
| ②vs③ 비교가 구매 판단에 도움 | 같은 룩·같은 셀카 | 현장 3~5명 예/아니오·한마디 | 측정(소표본) |
| 생성 이미지가 피부톤을 보존 | 셀카 vs ②③ 볼 영역 평균색 | ΔE·눈 확인 | 측정. 조명·모델 의존 |

상세: `evidence.md`.

## 기술 선택

| 결정 항목 | 요구에서 나온 필요 | 선택·이유 |
|---|---|---|
| 제품 형태 | 심사자가 링크로 바로 사용 + 디자인·UI/UX 최우선(사용자 결정) | **앱 레이아웃 웹앱**: 모바일 퍼스트 앱 셸(데스크톱에선 중앙 폰 폭 ~430px), 단계별 전체 화면(Look → On Me → My Tone), 하단 고정 액션 바, 결과는 시트·비교 슬라이더. PWA manifest(홈 화면 추가·standalone). 영어 UI |
| 디자인 시스템 | 템플릿처럼 보이지 않는 고유 비주얼 | `frontend-design` 스킬로 토큰(색 4~6·타입·레이아웃·원칙) 먼저 확정 → UI 구현. Tailwind 테마 토큰, `next/font`, Motion(화면 전환·비교 슬라이더 등 사용자 동작 응답 모션만). 스크린샷으로 자체 리뷰 |
| 언어·프레임워크 | 화면 + 비밀 키를 숨기는 서버 + 파일 저장을 한 프로세스로 | **Next.js(App Router) + TypeScript**, 단일 서비스. Route Handler가 Claude·OpenAI 호출·파일 저장 |
| 데이터·저장 | 이미지 파일시스템 저장(사용자 결정), 세션별 결과 재표시, 공개 포스트 | 포스트는 `DATA_DIR/posts/{postId}.json`(이미지는 세션 파일 참조). `DATA_DIR`(로컬 `./data`, 배포 볼륨 `/data`) 아래 `sessions/{id}/look.*, selfie.*, analysis.json, translated.json, apply_original.png, apply_translated.png`. 카탈로그는 레포 `catalog.json`(샘플) |
| 인증·민감 정보 | 접근 장벽 최소, 얼굴 사진 | 로그인 없음, 추측 불가 UUID 세션. 13+ 체크, "Anthropic·OpenAI로 전송, 데모 서버에 저장" 고지. 아이돌 사진은 사용자 업로드만, 샘플 룩은 권리 확보 이미지 |
| 제품 AI | 룩 분석·톤 번역, 무드 있는 얼굴 이미지 | Claude `claude-sonnet-5-5`(vision, JSON) = ①③ 판단. OpenAI Images edit `gpt-image-2.5-sunburst`(다중 입력 이미지, 얼굴 `input_fidelity` 확인) = ②③ 이미지. 운영진 허용(`hackathon.md`) |
| 제품 추천 | 실제 판매 중인 K-뷰티 제품을 번역된 색·톤·제형에 맞춰 추천(사용자 결정) | ③ 번역 후 백엔드가 **pi를 헤드리스로 실행**(`pi -p --no-session --model anthropic/claude-sonnet-5-5 --tools web_search,fetch_content,get_search_content`, pi-web-access 확장의 Exa 검색). 결과 JSON을 `Product` 스키마로 검증해 세션에 저장. 검색 실패 시 샘플 카탈로그로 표시(`fallback` 배지) |
| 배포 | 공개 URL, 영속 디스크, 21:00 유지, 컨테이너에 pi 포함 | **Railway** 서비스 1개 + Volume `/data`, **Dockerfile** 빌드(node 24 + `@earendil-works/pi-coding-agent` + `pi-web-access`). `railway up`으로 로컬 디렉터리 배포. 비밀은 Railway Variables |
| 검증 | 실제 시나리오 | `pnpm lint`·`pnpm build` + 공개 URL에서 ①→②→③ 확인 |

## 위험과 계약

- 가장 위험한 가정: 이미지 모델이 셀카의 얼굴·피부톤을 보존하면서 룩을 입힌다. **실험:** 키 수령 즉시 셀카+룩 2장으로 edit 1회, 15분 제한. 보정: 프롬프트에 톤 hex 명시, `input_fidelity` high.
- 두 번째: 이미지 생성 지연(수십 초 추정). ②는 업로드 직후 백그라운드 시작, ③은 Claude 번역 후 생성. 클라이언트는 상태 폴링 또는 긴 요청 + 진행 표시. 샘플 룩·샘플 셀카는 미리 생성한 결과를 "Sample" 배지로 즉시 표시.
- 공유 계약 (`src/lib/types.ts`, 메인 소유):
  - `LookAnalysis { mood: string; steps: Step[] }`, `Step { area: 'skincare'|'base'|'eye'|'blush'|'lip'; colors: {name, hex}[]; finish: string; technique: string; tips: string[]; productHints: string[] }`
  - `ToneTranslation { skinTone: {depth, undertone, hex}; changes: {area, fromHex, toHex, reason}[]; productIds: string[]; routine: {area, step}[] }`
  - `CatalogItem { id, brand, name, area, shadeName, hex, finish, toneFit: string[], url, sample: true }`
  - API: `POST /api/session`(look) → `{id, analysis}` · `POST /api/session/{id}/selfie` → `{applyOriginal: url}` · `POST /api/session/{id}/translate` → `{translation, applyTranslated: url}` · `GET /api/files/{id}/{name}`
- AI 사용 조건: 입력 이미지 최대 10MB, 서버에서 긴 변 1536px로 축소(라이브러리 결정은 scaffold). Claude 타임아웃 60s·1회 재시도, 이미지 120s·재시도 없음. 응답 JSON 스키마 검증 실패 시 1회 재요청 후 에러 표시. 실제 호출과 sample 결과를 UI·로그에서 구분.
- 비밀: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DATA_DIR`. 로컬 `.env.local`(gitignore), 배포 Railway Variables. 키 값은 문서·로그·클라이언트에 기록하지 않는다. OpenAI 키는 사용자가 개발 시 제공 예정.

## 실행 계약 — scaffold 후 실제 명령으로 갱신

- 소스 루트: 레포 루트(`/Users/choam2426/workspace/hackaton`), Next.js 앱
- 런타임: Node v24.19.0(mise, 로컬 실측), pnpm(mise). Next.js 버전은 생성 후 기록
- 빌드: `pnpm build` 필요

| 목적 | 작업 폴더(cwd) | 명령·절차 | 기대 결과 |
|---|---|---|---|
| 초기 설정·의존성 | 레포 루트 | `pnpm create next-app@latest`(TS, App Router, Tailwind, src/) → `pnpm install` | 의존성 설치, `.env.local` 무시 |
| 로컬 실행 | 레포 루트 | `pnpm dev` | http://localhost:3000 |
| 검사·빌드 | 레포 루트 | `pnpm lint && pnpm build` | 오류 0 |
| 배포 | 레포 루트 | `railway link` → Volume `/data` 연결 → Variables 등록 → `railway up` | 공개 `*.up.railway.app` |
| 시나리오 | 외부 브라우저 | 샘플 룩 → 셀카 → ①②③ | 비교 이미지·제품 카드·배지 |

## 제출 후보

- 데모 URL·사용법: `docs/submission.md`
- 검증 커밋·시각·실행 결과: `docs/plan.md`
- PDF·숫자의 근거: `docs/pitch/`
- 유지 담당·기한: 미확인 / 21:00

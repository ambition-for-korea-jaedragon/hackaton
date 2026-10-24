# Ambition for Korea 공통 SOP

주제·고객·핵심 결과를 선택한 뒤 기술을 정한다. 프레임워크, 앱 형태, 폴더, 데이터 저장, 인증, 제품 AI, 배포 서비스는 요구에서 출발해 고른다.

## 기준 문서

- 행사 규칙·마감·제출물: `docs/hackathon.md`. 수정 공지는 이 문서부터 갱신한다.
- 공통 절차·시간 관리·복구: `docs/runbook.md`.
- 팀·계정·선택 주제·선언 상태: `docs/context.md` — 바뀌면 직접 갱신한다.
- 제품 요구와 주제별 기술 결정: `docs/spec.md` — 주제 선택 후 채운다.
- 현재 작업·소유권·실행 증거: `docs/plan.md` — `/spec`부터 생성한다.

## 실행 순서

`/ideate`(아이디어 고도화) → `/spec` → `/scaffold` → `/dispatch`(반복) → `/ship` → `/submit-check`. 주제 선언이 남아 있으면 `/spec` 전에 `/declare`.

`/spec`은 먼저 고객의 행동과 결과를 정의하고, 그 결과에 필요한 기술만 선택한다. `/pitch` 초안은 이때 병행하며 최종 화면·증거는 배포 후 반영한다. 주제 선언은 상세 기술 설계 때문에 늦추지 않는다.

제품 기획·코드 작성은 공지된 시각·새 공개 레포 규칙을 따른다. 새 레포는 별도 Git 이력으로 시작하고 `main`에 push한다. 제품 작업 전에 실제 작업 폴더·remote·브랜치·시각을 확인한다.

## 협업

- 메인(Opus): 결정·분할·통합·최종 검증. builder/writer(Sonnet): 구현/문서. scout/qa(Haiku): 조사/검증.
- 모든 dispatch에 **goal / owned files / done 조건**을 준다. 독립된 파일·상태만 병렬화한다.
- 의존성·공유 계약·설정 변경, 전체 검증·실행 프로세스·배포·Git은 메인이 직렬 관리한다. 공유 소스 작업을 위임하면 한 명에게 독점 배정한다.
- 결과를 합치고 공유 변경을 반영한 뒤 검증한다. builder의 완료 보고는 통합 검증의 입력이지 성공 증거가 아니다.
- 요구가 바뀌면 spec을 먼저 갱신한다. 다음 단계에 필요한 사용자 결정만 묻고 이미 정한 사항은 반복 승인받지 않는다.

## 완료와 안전

완료는 선택한 기술의 검증 명령과 실제 사용자 시나리오로 판정한다. 명령의 cwd·버전·예상 결과는 spec의 실행 계약에 기록하고, 실행 시각·커밋·결과는 plan에 남긴다. 해당 기술에 빌드 단계가 없으면 이유와 대체 검증을 기록한다.

개발과 제품 AI는 지급 Claude 크레딧을 사용한다. 비밀 값은 공개 레포·문서·로그·배포한 클라이언트에 노출하지 않고 선택한 환경의 비밀 저장 기능을 사용한다. 실측·외부 사실·추정·샘플을 구분한다.

고객 가치·덱 판단이 필요하면 `docs/design-refs/judge-perspective.md`를 읽는다.

## Next.js (앱 소스: 레포 루트)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

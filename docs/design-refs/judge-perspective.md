# VC 심사자 관점 — 원데이 해커톤 데모 승리 조건

`/ideate` `/spec` `/pitch` 때 읽는다. 신뢰도: **high** = 3-0 검증 + 복수 출처, **medium** = 단일 출처 또는 2-1, **low** = 참고만.

> **SOP 적용 범위:** 일반 피치·웹 데모에서 수집한 조언이다. 고객·결과를 먼저 정하고 해당하는 항목만 적용한다. 앱 형태·UI·인증·저장·제품 AI·기술 스택을 고르는 근거로 일반 권고를 강제하지 않는다. 구현 판단은 `docs/spec.md`의 주제별 요구가 우선한다.

> **행사 규칙 우선:** 행사 규칙·덱 구성은 `docs/hackathon.md`와 [공식 키트](https://ambition-for-korea.vercel.app/kit/)가 우선한다. 아래 신뢰도는 내부 검토 라벨이며 심사 성공률이나 공식 배점이 아니다. 결선은 영어 발표 3분 + 한국어 Q&A 7분이다.

## 1. 한 줄 요약

> 고객·문제·결과를 한 문장으로 설명하고, 데모는 한 사용자·한 작업·확인 가능한 결과로 좁힌다. 필요한 접근 수단을 제공하고, 자료만 읽어도 무엇을 만든 것인지 이해되게 한다.

**검증 방식:** 22개 출처 → 110개 주장 중 상위 25개를 3-vote 적대적 검증 → 18개 통과, 7개 탈락. 통과한 것만 아래 싣는다(9개 finding으로 합침).

**한계 (반드시 읽기)**
- 해커톤 심사 1차 자료는 dev.to 블로그 1건(n=3 이벤트, 신규 계정, 비VC)뿐이다. 나머지는 시드 펀드레이징(Sequoia/YC/Hustle Fund/a16z speedrun) 조언에서 유추한 것이다.
- 이번 해커톤 고유 조건(선착순 심사, "같은 자원으로 얼마나 높은 가치", 글로벌 타깃)에 직접 대응하는 증거는 없다. 전부 일반 원칙의 적용이다.

**검증 탈락 — 아래는 근거 없음, 의존하지 말 것**
- 'AI가 만든 티' 판별 기준 전부 (베이지 배경, 기본 sans-serif, 범용 에러 카피, 완성돼 보이나 깨지는 랜딩, 엣지 스테이트 유무) — 0-3 / 1-2. 이 기준으로 감점당한다는 근거가 없다.
- "4분 데모 타임라인"(0:30 사용자 선언 → 2:30 핵심 동작 → 3:15 바뀐 상태 → 4:00 마무리) — 0-3. 분 단위 구조 인용 금지.
- "라이브 end-to-end 데모가 최대 변별 요인" — 0-3.
- "YC는 5~7장·장당 한 아이디어를 권한다" — 1-2. (단 "한 슬라이드 = 한 아이디어" 자체는 아래 YC 시드덱 글에서 별도 통과)
- "Vercel Guide 빈 상태가 샘플 데이터를 선적재한다" — 1-2.
- 2024~26 AI 데모 UX 패턴(스트리밍, 에이전트 진행 표시, 결과 미리보기)이 심사자 신뢰를 높인다는 검증된 주장은 없다. Linear/Stripe/Perplexity/Cursor 벤치마크 사례도 없다.

## 2. 30초 체크리스트 — 링크를 혼자 여는 심사자

근거가 되는 규칙은 3절 번호(R1~R8)로 표기. 30초/60초 시간 구분 자체는 우리 가정이다(60초는 [VC Cafe](https://www.vccafe.com/shortening-the-time-to-wow-ttw-in-ai-products/)의 저자 휴리스틱, low).
**첫 화면 (0~30초)**
- [ ] 필요한 심사용 접근 수단으로 곧바로 핵심 작업을 시작할 수 있다 (R3)
- [ ] 첫 화면에 한 문장 선언이 보인다: "X를 Y에게 해주는 도구" (R1)
- [ ] 누가(Y) 무슨 일(job)을 하는지 설명 없이 알 수 있다 (R2)
- [ ] 화면이 비어 있지 않다. 현실적 역할·날짜·레코드가 이미 채워져 있다 (R4)
- [ ] 버튼이 하나 눈에 띄고 라벨이 "Verb + Noun"이다 (예: "견적서 만들기", "계약서 분석하기"). "시작하기/확인/계속" 금지 (R8)
- [ ] 이 제품의 핵심(기술적 돌파면 그것)이 첫 화면 또는 첫 클릭에서 보인다 (R3)
**한 번 클릭 후 (30~60초)**
- [ ] 클릭 한 번(또는 미리 채운 입력)으로 핵심 작업이 끝까지 돈다 (R2)
- [ ] 결과가 "바뀐 상태"로 눈에 보인다: 전/후, 완료된 결과물, 줄어든 숫자 (R2)
- [ ] 라이브인 것과 스크립트/수작업/합성 데이터인 것이 화면에 라벨로 표시돼 있다 (R5)
- [ ] 결과에 필요하지 않은 로그인·설정·프로필·빌링 단계가 경로에서 빠졌다 (R3)
**2장 덱을 먼저 보는 경우**
- [ ] 1장만 보고 낯선 사람이 제품을 한 문장으로 말할 수 있다 (D3)
- [ ] 각 장 상단에 결론 문장이 글로 박혀 있다 (D4)

## 3. 아이디어·스펙 적용 규칙 (`/ideate`, `/spec`)
**R1. 한 문장 선언** — 신뢰도 high
- 제품을 "X를 Y에게 해주는 도구" 단일 평서문으로 쓴다. 심사자가 한 시간 뒤 다른 심사자에게 되풀이할 유일한 한 줄이 되게 하고, 피치 전체를 이 문장에 종속시킨다. 기여하지 않는 슬라이드·화면은 뺀다.
- 배경·시장·개인사·40초짜리 문제 설명으로 시작한 팀은 점수를 잃었다는 관찰이 있다(단일 심사자, n=3).
- 주의: Xero 등은 10~20초의 사람/문제 훅 후 한 줄을 권한다. "한 줄은 반드시 30초 안에 나온다"로 읽는 게 안전하다.
- 출처: [Sequoia 템플릿](https://sequoiacap.com/article/writing-a-business-plan), [a16z speedrun](https://speedrun.substack.com/p/how-to-pitch-in-under-2-min), [dev.to 심사자](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l), [Xero](https://devblog.xero.com/land-your-hackathon-pitch-a-playbook-for-winning-the-room-8b327de726ca)
- `/ideate` 산출물에 선언 문장을 한 줄로 못 쓰면 아이디어 탈락.
**R2. 한 사용자 · 한 작업 · 눈에 보이는 바뀐 상태 하나** — 신뢰도 medium
- VC는 데모를 "창업자가 사용자 워크플로우를 이해하는가"의 증거로 읽는다. 시장 규모·수요·경제성·방어력의 증거로 보지 않는다. 기능 카탈로그가 아니라 한 사용자가 한 일을 끝내 바뀐 상태에 도달하는 경로를 보여준다.
- 이 때문에 스펙에는 "사용자 1명, 작업 1개, 끝 상태 1개"를 명시한다. 시장·수요는 데모가 아니라 2장 덱에서 말한다 (D2).
- 출처: [Hustle Fund](https://www2.hustlefund.vc/post/angel-squad-how-to-use-product-demos-to-convince-angel-investors), [Paul Graham](https://paulgraham.com/investors.html) ("when you demo, don't run through a catalog of features")
- 한계: 엔젤 미팅용 조언이며 해커톤을 언급하지 않는다. 심사자가 VC라 전이는 타당.
**R3. 불필요한 접근 단계를 줄이고 필요한 접근 수단을 준비** — 신뢰도 medium
- 결과를 바꾸지 않는 화면은 경로에서 자른다. 데모 계정은 미리 로그인·선적재해 둔다. 기술적 돌파가 제품이면 가장 먼저 보여준다 ("The login screen can wait").
- 인증·저장·결제는 고객 작업·데이터의 요구로 판단한다. 핵심 결과에 필요 없는 절차만 범위에서 뺀다. 공식 공지는 필요한 경우 테스트 계정을 안내하도록 한다.
- 출처: [Hustle Fund](https://www2.hustlefund.vc/post/angel-squad-how-to-use-product-demos-to-convince-angel-investors)
- 분 단위 타임라인은 검증 탈락. 순서 원칙만 쓴다.
**R4. 현실적인 선적재 시드 데이터** — 신뢰도 medium
- 빈 상태·플레이스홀더는 워크플로우가 실제 사용자 세계에 맞는지 판단을 막는다. 데모 계정에 현실적 역할·날짜·레코드·엣지케이스를 채운다.
- 데이터 종류를 밝힌다: 허가된 실데이터 / 익명화 / 합성임을 명시한 합성 데이터.
- 출처: [Hustle Fund](https://www2.hustlefund.vc/post/angel-squad-how-to-use-product-demos-to-convince-angel-investors)
- 시드 데이터는 한국어/글로벌 타깃 시장의 실제 맥락(고객사 이름, 날짜, 금액)에 맞게 `writer`가 쓴다.
**R5. 라이브 vs 스크립트를 먼저 공개** — 신뢰도 medium
- 어떤 출력이 사람·룰 엔진·스크립트로 준비됐으면 그렇다고 밝힌다. "명확한 경계가 암묵적 자동화보다 더 강한 대화를 만든다."
- 클릭 가능한 디자인·시뮬레이션 출력도 실제 상태를 밝혀야 한다. 공개했다고 행사 미션을 충족하거나 제출 적격성이 보장되는 것은 아니다. 핵심 AI가 동작하지 않으면 미구현으로 보고한다.
- UI에 "Live / Sample data / Scripted" 배지를 둔다 (우리 적용). 2장 덱 2장 말미에도 한 줄.
- 출처: [Hustle Fund](https://www2.hustlefund.vc/post/angel-squad-how-to-use-product-demos-to-convince-angel-investors)
**R6. 좁지만 야심 있게** — 신뢰도 medium
- 좁은 것 하나를 제대로 만든 팀은 "의사결정을 한 팀"으로 읽힌다. 기능 셋에 중심이 없는 프로젝트는 기술적으로 더 강해도 기억되지 않는다. 한 사용자·한 워크플로우·한 결과로 줄이되 야망은 크게.
- "같은 자원으로 높은 가치" 기준상 좁힘은 가치가 분명히 보이는 문제를 향해야 한다. 작은 문제를 푸는 게 아니라 큰 문제의 가장 좁은 쐐기를 푼다 (우리 해석).
- 출처: [dev.to 심사자](https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l)(n=3, 약함), [AngelHack](https://angelhack.com/blog/how-to-pick-hackathon-project-ideas/) ("a narrow question beats an open one every time")
**R7. 첫 60초 안에 가장 인상적인 기능** — 신뢰도 low
- Time to Wow를 줄인다. 60초는 데이터 없는 저자 휴리스틱이고 대상도 온보딩 퍼널이다. 방향성 참고만.
- 출처: [VC Cafe](https://www.vccafe.com/shortening-the-time-to-wow-ttw-in-ai-products/)
**R8. CTA·빈 상태 카피 기준** — 신뢰도 medium
- 빈 상태는 기본 CTA 하나(정당한 두 경로면 보조 하나). CTA 셋은 설계 냄새.
- 라벨은 결과를 명명하는 "동사+명사"(Deploy Template, Try Again). "Get Started/Continue/OK" 금지. Title Case는 Vercel 고유 규칙이라 이식하지 않는다.
- "AI 생성 UI와 구별된다"는 효과는 검증되지 않았다. 카피 품질 점검표로만 쓴다.
- 출처: [Vercel Empty State](https://vercel.com/design/empty-state), [Vercel Button](https://vercel.com/geist/button)

## 4. 2장 덱 구조 (`/pitch`)

**행사 적용:** 2장 이하는 공식 제약이다. [공식 GUIDE](https://ambition-for-korea.vercel.app/kit/GUIDE.md)에 맞춰 1장은 서비스·고객·문제·선택 주제, 2장은 오늘 만든 결과·실제 화면·Claude 사용 부분을 보여준다. 16:9, 팀 이름, 매 장 공식 로고 띠를 유지한다. 아래 투자덱 구성은 보조 질문이며 공식 두 장을 늘리거나 빽빽하게 만드는 근거로 쓰지 않는다.
- 출처: [Sequoia](https://sequoiacap.com/article/writing-a-business-plan), [YC 시드덱](https://ycombinator.com/library/2u-how-to-build-your-seed-round-pitch-deck), [HSBC Innovation Banking](https://www.hsbcinnovationbanking.com/en/resources/beyond-the-tam-slide)

- Sequoia: 목적 → 문제 → 해법 → **Why now** → 시장 → 경쟁 → 비즈니스 모델 → 팀 → 재무 → 비전
- YC: 제목+한 줄 → 문제 → 해법 → 트랙션 → 추가 지표 → 인사이트 → 비즈니스 모델 → 시장 → 팀 → 요청

**Page 1 — "무엇이고 누구의 문제인가"** (공식 구성 우선)
1. 상단 한 줄 선언 "X를 Y에게 해주는 도구" (Sequoia Company purpose, YC 제목+한 줄)
2. 문제: 실제 사람/기업에게 어떻게 영향을 주는지 구체적 사실 한두 개 (숫자·사례). 추상 형용사 금지.
3. 해법: 무엇을 하는지 최소 단어 + 구체적 이익. 선택 VC 주제와 해외 고객을 명시.
4. 페이지 결론 캡션 한 줄 (D4)
**Page 2 — "오늘 만든 결과"** (공식 구성 우선)
1. 실제 제품 스크린샷 1~2개, 입력→결과, 데모 링크.
2. Claude가 쓰인 곳, 같은 조건에서 관찰한 이점 한 가지. 측정·추정·샘플 구분.
3. 오늘 만든 것은 **제품 마일스톤**이다. 고객 사용·매출이 없다면 고객 트랙션이라고 부르지 않는다.
4. 공간이 있으면 팀 적합성·다음 7일. Why now·시장·경쟁은 필요할 때만 간단히.
5. 하단에 R5 공개 한 줄: "라이브: ○○ / 샘플 데이터: ○○".
6. 페이지 결론 캡션 한 줄.
**규칙**
- **D1 한 슬라이드 = 한 아이디어.** (YC 슬라이드 글, 3-0)
- **D2 시장·수요·경제성은 데모가 아니라 덱에서.** 데모는 이걸 증명하지 못한다 (R2).
- **D3 낯선 사람 테스트:** 낯선 사람에게 장을 보여주고 뜻을 말해보게 한다. 곧바로 아이디어를 말하지 못하면 실패 (YC Kevin Hale, 2015, high).
- **D4 결론 캡션:** 각 장·그래프에 결론을 글로 박아 "CliffsNotes"처럼 읽히게 한다. "takeaway headline"이라는 용어는 YC 원문에 없고 캡션/명시적 결론으로 표현돼 있다 (high).
- **D5 남길 한 줄 1개.** 그 한 줄에 기여하지 않는 요소는 삭제 (a16z speedrun, high).
- 출처: [YC 시드덱](https://ycombinator.com/library/2u-how-to-build-your-seed-round-pitch-deck), [YC 덱 디자인](https://www.ycombinator.com/blog/how-to-design-a-better-pitch-deck), [Sequoia](https://sequoiacap.com/article/writing-a-business-plan), [a16z speedrun](https://speedrun.substack.com/p/how-to-pitch-in-under-2-min)
- 자료가 오래됐다(Sequoia ~2015, YC 2015·2018). 각 사가 현재도 공식 가이드로 게시 중이고 슬라이드 가독성 원칙은 변하지 않았다.

## 5. 결선: 영어 3분 발표 + 한국어 7분 Q&A

공식 공지로 시간·언어가 확정됐다. 아래 내용 선택 원칙은 일반 피치 조언이며 세부 시간 배분은 팀 판단이다. 원고를 실제로 소리 내어 재며, 발표만 10분으로 작성하지 않는다.

**근거 있는 것**
- 남길 한 줄 하나. 심사자가 다른 사람에게 되풀이할 문장이 곧 그 선언 문장 (R1, high). 시장·개인사·긴 문제 설명으로 시작하지 않는다. 선언 문장은 30초 안에 말한다.
- 사람들은 발표에서 한두 가지만 가져간다. 그에 기여하지 않는 내용은 자른다 (D5, high). 자를 것: 기능 카탈로그(Paul Graham), 로그인·설정·빌링 시연(R3), 배경 이야기, 자세한 재무.
- 데모는 한 사용자·한 작업·바뀐 상태 하나. 돌파가 제품이면 데모를 앞에 (R2/R3, medium).
- 라이브인 것과 스크립트인 것을 먼저 말한다 (R5, medium). Q&A에서 들키는 것보다 낫다.
- Why now 한 줄은 반드시 말한다 (high).
- 시장 규모·수요·경제성은 데모가 증명하지 못하니 말로 따로 짚는다 (R2).
**근거 없음 — 우리가 정해야 함**
- 데모 대 슬라이드 시간 비율, 라이브 vs 녹화 (라이브가 최대 변별 요인이라는 주장은 탈락).
- Q&A 대비는 `writer`의 VC Q&A 준비로 따로 한다.

## 6. 미해결 질문 (검증 못함)

- 심사 VC 6곳이 "같은 자원으로 얼마나 높은 가치"를 어떻게 채점하는가. 가치의 단위(사용자, 절감 시간, 시장)와 "자원"의 정의(시간, 모델 호출, 인원)에 따라 좁힘 방향이 달라진다. 현장 공지·Q&A에서 확인.
- 심사자가 데모 링크를 직접 열어 사용한다는 점은 확정됐다. 자료를 읽는 순서는 미공개이므로 앱·PDF 모두 독립적으로 이해되게 만든다.
- Anthropic 주최 해커톤에서 "바이브 코딩 티"가 감점인지 무관한지 불명.

## 7. 출처 목록

**1차(공식 가이드)**
| URL | 설명 | 지지하는 주장 / 신뢰도 |
|---|---|---|
| https://sequoiacap.com/article/writing-a-business-plan | Sequoia 10섹션 템플릿 (한 문장 목적, Why now) | R1, Why now, 2장 압축 / high |
| https://ycombinator.com/library/2u-how-to-build-your-seed-round-pitch-deck | YC 시드덱 (Aaron Harris, 2018) | 10슬라이드, 문제·해법 작성, 서사 중심 / high |
| https://www.ycombinator.com/blog/how-to-design-a-better-pitch-deck | YC 덱 디자인 (Kevin Hale, 2015) | 낯선 사람 테스트, 결론 캡션, 한 슬라이드=한 아이디어 / high. (5~7장 주장은 탈락) |
| https://vercel.com/design/empty-state | Vercel Geist 빈 상태 가이드 | R8 CTA 한도 / medium. (Guide 선적재 주장은 탈락) |
| https://vercel.com/geist/button | Vercel Geist 버튼 | R8 CTA 라벨 / medium |

**VC·투자자**
| URL | 설명 | 지지하는 주장 / 신뢰도 |
|---|---|---|
| https://www2.hustlefund.vc/post/angel-squad-how-to-use-product-demos-to-convince-angel-investors | Hustle Fund, 데모로 엔젤 설득 (2026) | R2 R3 R4 R5 / medium. (4분 타임라인 탈락) |
| https://paulgraham.com/investors.html | Paul Graham, 투자자 글 | R2 "기능 카탈로그 금지" 교차확인 / medium |
| https://speedrun.substack.com/p/how-to-pitch-in-under-2-min | a16z speedrun, 2분 피치 (2025-09) | R1, D5 한 줄 남기기 / high |
| https://www.hsbcinnovationbanking.com/en/resources/beyond-the-tam-slide | HSBC Innovation Banking, SuperSeed 파트너 인용 (2024) | 15~20장 불필요, 마일스톤 요약 / high |
| https://www.vccafe.com/shortening-the-time-to-wow-ttw-in-ai-products/ | VC Cafe (Remagine), Time to Wow (2025-12) | R7 / low |

**해커톤 심사·회고**
| URL | 설명 | 지지하는 주장 / 신뢰도 |
|---|---|---|
| https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l | 해커톤 심사자 블로그 (2026-07, n=3, 신규 계정) | R1 R6 / medium. (라이브 데모 최대 변별 주장 탈락) |
| https://angelhack.com/blog/how-to-pick-hackathon-project-ideas/ | AngelHack 아이디어 선정 (2026-06 갱신) | R6 교차확인 / medium |
| https://devblog.xero.com/land-your-hackathon-pitch-a-playbook-for-winning-the-room-8b327de726ca | Xero 해커톤 피치 가이드 | R1 단서(10~20초 훅) / medium |

**읽었으나 검증된 주장 없음 (인용 금지)**
- https://dnyuz.com/2026/07/07/there-are-3-telltale-signs-that-you-used-ai-to-make-your-app-and-they-arent-pretty/ — "AI가 만든 티" 주장 3건 전부 탈락
- thefountaininstitute.com/blog/signs-vibe-coded-ui, devfolio.co/blog/the-discerning-machine/ — AI 생성 티 계열
- inference.sh/blog/ux-agent-ux-patterns, screensdesign.com/articles/ai-app-onboarding-examples/ — AI 데모 UX 패턴
- https://blog.jetbrains.com/ai/2026/06/how-to-win-a-hackathon-notes-from-the-judging-table/ — 검색 요약만 확인 (R6 보조)
- roundfunded.com, reskilll.com, angelhack.com/blog/hackathon-tips-for-winners/, klaviyo.tech, thita.ai, lablab.ai 해커톤 가이드들 — 수집만 됨

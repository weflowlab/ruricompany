# truck-1st.com 클론 스펙 (구조 + 인터랙션만 차용)

## 프로젝트 환경 (반드시 지킬 것)

- **Next.js 16.2.12 App Router** — 학습 데이터와 다를 수 있음. 불확실하면
  `node_modules/next/dist/docs/01-app/` 아래 문서를 먼저 읽을 것.
- React 19.2.4 / TypeScript 5 / **Tailwind CSS v4** (`@import "tailwindcss"` 방식, config 파일 없음)
- 프로젝트 루트: `/Volumes/BEEZAP BZ36/ruricompany`
- 컴포넌트 위치: `app/_components/`  (언더스코어 = 라우트 제외 폴더)
- 데이터 위치: `app/_data/`
- 인터랙티브 컴포넌트는 파일 최상단에 `'use client'` 선언
- **외부 라이브러리 설치 금지.** swiper/jQuery 대신 React 훅으로 직접 구현.

## 절대 규칙

1. **모든 코드에 한국어 설명 주석을 단다.** 각 컴포넌트 상단에 JSDoc 블록으로
   "무엇을 하는 섹션인지 / 어떤 인터랙션이 있는지 / 원본 사이트의 어느 부분인지"를 적고,
   내부 로직(useEffect, 상태, 계산)에도 줄 단위 주석을 단다.
2. **이미지는 전부 플레이스홀더.** 실제 이미지 URL을 가져오지 말 것.
   공용 `<Placeholder />` 컴포넌트(별도 제작)를 쓰고, `label` prop으로
   "여기에 들어갈 이미지"를 한국어로 설명한다. 예: `<Placeholder label="히어로 배너 이미지" ratio="16/9" />`
3. **텍스트는 참고용 더미**로 채운다. 원본의 문구를 그대로 베끼지 말고
   같은 성격의 일반화된 문구를 쓴다. 브랜드명은 `루리컴퍼니`, 전화번호는 `0000-0000`.
   차량명/가격은 예시 더미 데이터로 (`app/_data/vehicles.ts`).
4. 반응형 필수: 데스크톱(1280+) / 태블릿(768~1024) / 모바일(~768)
5. 접근성: 버튼에 `aria-label`, 아코디언에 `aria-expanded`, 모달에 `role="dialog"`,
   `prefers-reduced-motion` 존중.

## 디자인 토큰 (globals.css의 @theme에 정의)

```
--color-primary: #03C75A;        /* 메인 그린 */
--color-primary-hover: #02B351;
--color-ink: #111;               /* 본문 진한 글자 */
--color-ink-sub: #555;           /* 보조 글자 */
--color-line: rgba(0,0,0,.08);   /* 구분선 */
--color-surface: #f9f9f9;        /* 섹션 배경 */
--color-accent: #e60023;         /* 할인가 강조 빨강 */
```
- 컨테이너: `max-width: 1320px; margin: 0 auto; padding: 0 20px;` (원본 `.inner-128`)
- 섹션 상하 패딩: 데스크톱 100px, 모바일 60px
- 섹션 타이틀: 중앙 정렬, h2 2.6rem(모바일 1.6rem), 강조 단어만 primary 색상, 아래 회색 설명문

## 페이지 구조 (위 → 아래)

| # | 섹션 | 컴포넌트 | 핵심 인터랙션 |
|---|------|----------|---------------|
| 0 | 고정 헤더 | `Header.tsx` | fixed 상단, 스크롤 시 그림자, 데스크톱 GNB(호버 드롭다운), 모바일 햄버거 → 우측 슬라이드 패널 + 딤드 |
| 1 | 히어로 | `HeroSection.tsx` | 좌: 4장 자동재생 캐러셀(2초, 무한루프, 이전/다음, 재생·일시정지 토글, `1 / 4` 페이징) / 우: 빠른 견적 폼 |
| 2 | 고객 후기 | `ReviewSection.tsx` | 무한 흐르는 마퀴(hover 시 정지), 카드 클릭 → 모달(이미지 슬라이더 + 페이지네이션) |
| 3 | 인기 차량 | `VehicleSection.tsx` | 4열 카드 그리드, 카드 호버 시 이미지 확대 |
| 4 | 텍스트 배너 | `TextBanner.tsx` | primary 배경 띠, 스크롤 진입 시 페이드업 |
| 5 | 일반 화물차 | `VehicleSection.tsx` (재사용) | 동일 그리드 |
| 6 | 이용 절차 | `ProcessSection.tsx` | 5단계 스텝, 스크롤 진입 시 순차 등장(stagger), 데스크톱 가로 / 모바일 세로 |
| 7 | 전기 화물차 | `VehicleSection.tsx` (재사용) | 동일 그리드 |
| 8 | FAQ | `FaqSection.tsx` | 아코디언, 한 번에 하나만 열림, 높이 애니메이션 |
| 9 | 제휴사 | `PartnerMarquee.tsx` | CSS keyframes 무한 로고 마퀴(translateX 0 → -50%) |
| 10 | 하단 상담 | `ConsultSection.tsx` | 좌: 상담 폼 / 우: 전화·카톡 CTA 카드 |
| 11 | 푸터 | `Footer.tsx` | 사업자 정보, 개인정보처리방침 링크(아코디언) |
| — | 플로팅 | `FloatingCta.tsx` | 모바일 하단 고정 바(전화/카톡/견적), 스크롤 300px 이후 등장 + 맨위로 버튼 |

## 공용 컴포넌트

- `Placeholder.tsx` — 이미지 자리. 점선 테두리 + 회색 배경 + 아이콘 + 한국어 라벨 + 비율 유지
- `SectionTitle.tsx` — h2 + 강조 span + 설명 p
- `ConsultForm.tsx` — 성함 / 연락처 / 차종 / 연락방법 라디오(전화·문자·카톡) / 약관 동의 체크 / 제출 버튼.
  클라이언트 유효성 검사(이름 한글, 전화 숫자 형식)만. **실제 전송 없음 — submit 시 alert로 대체하고 주석으로 명시.**
- `useInView.ts` — IntersectionObserver 훅 (스크롤 진입 애니메이션용)

## 원본에서 확인된 인터랙션 디테일

- 헤더: `position: fixed`, 높이 80px, 배경 흰색, 하단 1px 라인. 모바일 768px 이하에서 햄버거(24×18px, 3줄 → X 변형)
- GNB 메뉴: `실제 고객 후기 / 추천 차량 / 이용 절차 / 전기 화물차 특가 / 자주 묻는 질문` → 각각 앵커 스크롤
- 히어로 캐러셀: `autoplay delay 2000ms`, `loop`, 우하단에 `1 / 4` 페이징 + 재생/일시정지 토글 버튼
- 후기 마퀴: `.review-marquee__track { display:flex; width:max-content; gap:24px }` +
  원본 그룹을 통째로 복제해 `translateX(-50%)`로 무한 루프.
  **768px 이하에서는 `transform:none`으로 애니메이션 끄고 flex-wrap 그리드로 전환**
- 제휴사 마퀴: `@keyframes partnerLeft { 0%{translateX(0)} 100%{translateX(-50%)} }`
- 차량 카드 그리드: `grid-template-columns: repeat(4,1fr); gap:40px` → 768px 이하 `repeat(2,1fr); gap:20px`
- 차량 카드 내용: 이미지 / 모델명 / 트림명 / 차량가(원) / 월 리스료(정가 취소선 + 할인가 강조) / 뱃지(개월수·조건) / CTA 버튼
- 이용 절차 섹션: 배경 이미지 + `#F9FCEF` 90% 오버레이 → 플레이스홀더 배경 + 동일 오버레이로 대체
- FAQ: `.boxwrap { background:#f9f9f9; border-radius:20px; padding:0 40px; margin-bottom:20px }`, 질문 클릭 시 열림
- `prefers-reduced-motion: reduce` 미디어쿼리로 모든 자동 애니메이션 정지

/**
 * page.tsx — 메인 랜딩 페이지 (`/`)
 *
 * 역할
 *  - 각 섹션 컴포넌트를 원본 사이트와 동일한 순서로 위에서 아래로 조립하기만 한다.
 *    실제 마크업·인터랙션은 전부 하위 섹션 컴포넌트가 책임진다.
 *  - 더미 데이터(app/_data/*)를 재사용 컴포넌트인 <VehicleSection /> 에 주입하는 역할도 맡는다.
 *
 * 서버 컴포넌트인 이유
 *  - 이 파일 자체에는 상태·이벤트 핸들러·브라우저 API 가 전혀 없고 조립만 한다.
 *    따라서 'use client' 가 필요 없으며, 서버에서 HTML 로 렌더되어 초기 로딩이 빠르다.
 *  - 인터랙션이 필요한 섹션(Hero 캐러셀, Review 모달, FAQ 아코디언 등)은
 *    각자 파일 최상단에 'use client' 를 선언한 클라이언트 컴포넌트이므로,
 *    서버 컴포넌트인 이 페이지에서 그대로 자식으로 렌더할 수 있다.
 *
 * 레이아웃 관련 메모
 *  - 고정 헤더(<Header />)와 플로팅 CTA(<FloatingCta />)는 모든 페이지 공통이라
 *    이 파일이 아니라 app/layout.tsx 에서 렌더한다.
 *  - 헤더가 position: fixed / height: 80px 이므로 첫 섹션인 <HeroSection /> 이
 *    내부에서 pt-20(=80px) 으로 자리를 비워 준다. 여기서 별도 보정을 하지 않는다.
 *  - 앵커 스크롤 시 제목이 헤더에 가리지 않도록 globals.css 에
 *    `scroll-padding-top: 80px` 이 걸려 있다.
 *
 * 앵커 id 대응표 (app/_data/site.ts 의 navItems 와 반드시 일치해야 한다)
 *  - #services → ServiceSection  (섹션 컴포넌트가 자체적으로 id 를 가진다)
 *  - #vehicles → VehicleSection  (이 파일에서 id prop 으로 주입)
 *  - #process  → ProcessSection  (자체 id)
 *  - #faq      → FaqSection      (자체 id)
 *  - #hero     → HeroSection     (자체 id) — 각 카드/버튼의 "상담받기" CTA 목적지
 *
 * ⚠️ 하단 상담 섹션 제거 (2026-07-31)
 *    페이지 최하단에 있던 <ConsultSection /> 을 뺐다. 히어로 우측에 이미 빠른 견적
 *    폼(<ConsultForm variant="compact" />)이 있어 같은 폼이 한 페이지에 두 번 놓였다.
 *    그래서 페이지 곳곳의 "상담받기" CTA 목적지를 #consult → #hero 로 모두 바꿨다.
 *    ConsultSection.tsx 파일은 지우지 않고 남겨 두었다 (import·렌더만 제거).
 */

import HeroSection from "./_components/HeroSection";
import ServiceSection from "./_components/ServiceSection";
import VehicleSection from "./_components/VehicleSection";
import TextBanner from "./_components/TextBanner";
import ProcessSection from "./_components/ProcessSection";
import FaqSection from "./_components/FaqSection";
import Footer from "./_components/Footer";

import { popularVehicles, cargoVehicles } from "./_data/vehicles";

export default function Home() {
  return (
    <>
      {/*
        <main> 은 페이지당 하나여야 하므로 푸터를 제외한 본문 전체를 감싼다.
        id="main-content" 는 layout.tsx 의 "본문 바로가기" 스킵 링크 목적지다.
        flex-1 로 남는 세로 공간을 차지해, 콘텐츠가 짧아도 푸터가 화면 위로 올라오지 않는다.
      */}
      <main id="main-content" className="flex-1">
        {/* ── 1. 히어로 ────────────────────────────────────────────────────────
            원본 대응: 첫 화면 메인 비주얼 영역.
            좌측은 4장짜리 자동재생 캐러셀(2초 간격, 무한 루프, 이전/다음 + 재생·일시정지),
            우측은 이름·연락처만 받는 축약형 빠른 견적 폼(<ConsultForm variant="compact" />).
            1024px 미만에서는 캐러셀 위 / 폼 아래로 세로 스택된다. */}
        <HeroSection />

        {/* ── 2. 서비스 안내 (id="services") ───────────────────────────────────
            원본(truck-1st)에서는 이 자리가 고객 후기 마퀴였다. 2026-07-31 교체.

            왜 바꿨나
              후기는 "다른 사람이 좋았다"는 신뢰 신호일 뿐, 방문자가 첫 화면에서
              실제로 막히는 지점("할부·리스·장기렌트 중 뭘 골라야 하지")을 풀어 주지 못한다.
              업종이 3종(신차 할부 / 신차 장기렌트 / 신차 리스)이므로, 히어로 바로 다음에
              세 방식을 비교해 주는 것이 이탈을 가장 크게 줄인다.

            <ServiceSection /> 은 3열 비교 카드 + 하단 상담 CTA 하나로 구성되며,
            금액을 일절 노출하지 않고 "성격"과 "이런 분께 맞습니다"만 비교한다.

            ⚠️ ReviewSection.tsx 와 _data/reviews.ts 는 지우지 않고 남겨 두었다.
               이 파일에서 import·렌더만 빠져 번들에는 포함되지 않는다.
               후기 섹션을 되살릴 일이 생기면 import 두 줄만 되돌리면 된다. */}
        <ServiceSection />

        {/* ── 3. 이번 달 인기 차량 (id="vehicles") ─────────────────────────────
            원본 대응: 첫 번째 차량 리스트 섹션.
            재사용 컴포넌트 <VehicleSection /> 에 인기 차량 4대를 주입한다.
            데스크톱 4열 / 모바일 2열 그리드이며, 스크롤 진입 시 카드가 80ms 간격으로
            순차 페이드업하고 호버하면 썸네일이 확대된다. */}
        <VehicleSection
          id="vehicles"
          title="이번 달 "
          highlight="인기 차량"
          description="상담 신청이 가장 많았던 차량을 모았습니다. 월 납입금과 조건을 한눈에 비교해 보세요."
          vehicles={popularVehicles}
        />

        {/* ── 4. 텍스트 배너 ───────────────────────────────────────────────────
            원본 대응: 차량 리스트 사이를 끊어 주는 primary(그린) 배경 가로 띠.
            스크롤 진입 시 배지 → 메인 카피 순서로 페이드업한다. */}
        <TextBanner />

        {/* ── 5. 일반 화물차 (id="cargo") ──────────────────────────────────────
            원본 대응: 두 번째 차량 리스트 섹션. 3번 섹션과 동일한 그리드를 재사용한다.
            surface prop 으로 배경을 연회색(#f9f9f9)으로 깔아
            위아래 흰 배경 섹션과 시각적으로 구분한다. */}
        <VehicleSection
          id="cargo"
          title="용도별로 고르는 "
          highlight="일반 화물차"
          description="1톤 소형부터 중형 카고까지, 적재 용도에 맞춘 기본 라인업입니다."
          vehicles={cargoVehicles}
          surface
        />

        {/* ── 6. 이용 절차 (id="process") ──────────────────────────────────────
            원본 대응: 상담 신청부터 출고까지의 5단계 안내 섹션.
            배경은 플레이스홀더 이미지 위에 #F9FCEF 를 90% 불투명도로 덮은 형태다.
            스크롤 진입 시 단계별로 120ms 씩 시차를 두고 등장하며,
            데스크톱은 화살표로 이어진 가로 5열 / 모바일은 점선으로 이어진 세로 1열이다. */}
        <ProcessSection />

        {/* ── 7. 자주 묻는 질문 (id="faq") ─────────────────────────────────────
            원본 대응: 하단 FAQ 아코디언 섹션.
            한 번에 하나의 항목만 열리고, grid-template-rows 0fr↔1fr 트랜지션으로
            높이가 부드럽게 늘어난다. 닫힌 패널은 inert 로 키보드 탐색에서 제외된다. */}
        <FaqSection />

      </main>

      {/* ── 11. 푸터 ──────────────────────────────────────────────────────────
          원본 대응: 사업자 정보 + 개인정보처리방침 아코디언이 있는 다크 푸터.
          <main> 바깥에 두어 "본문"과 "사이트 정보"를 의미적으로 분리한다.
          모바일에서는 하단 고정 플로팅 바에 가리지 않도록 아래쪽 여백을 크게 준다. */}
      <Footer />
    </>
  );
}

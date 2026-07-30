'use client';

/**
 * FloatingCta.tsx — 화면에 떠 있는 상담 유도 버튼 묶음 (플로팅 CTA)
 *
 * ▸ 역할
 *   - 페이지 어디를 보고 있든 즉시 상담으로 연결할 수 있는 고정 버튼을 제공한다.
 *   - 데스크톱(768px 이상): 우측 하단 세로 스택 — [상담신청] [TOP]
 *   - 모바일(768px 미만): 화면 하단에 붙는 가로 바 — [상담신청] [TOP] 2등분
 *
 * ▸ ★2026-07-30 구성 축소 (클라이언트 피드백)
 *   - 기존 [전화 상담] [카톡 상담] [맨 위로] 3버튼 구성을
 *     [상담신청] [TOP] 2버튼으로 줄였다.
 *     전화·카톡 연락 수단은 문의하기 섹션(#consult)과 푸터 아이콘 행에서 제공하므로
 *     플로팅에서는 "상담 신청으로 보내는 것"과 "맨 위로 복귀" 두 역할만 남긴다.
 *   - 상담신청 버튼에는 문서(신청서) 아이콘을 함께 넣어 역할이 한눈에 보이게 했다.
 *   - 두 버튼 모두 hover 시 커서가 포인터(손가락)로 바뀐다.
 *     (<a> 는 기본이 포인터지만, Tailwind v4 preflight 가 <button> 을 default 로
 *      두므로 명시적으로 cursor-pointer 를 지정한다.)
 *
 * ▸ 인터랙션
 *   1) 스크롤이 300px 을 넘어가면 opacity + translateY 트랜지션으로 부드럽게 등장한다.
 *      (히어로 영역을 보고 있는 동안에는 화면을 가리지 않도록 숨겨 둔다.)
 *   2) 'TOP' 버튼은 window.scrollTo({ top: 0, behavior: 'smooth' }) 로 최상단 복귀.
 *   3) iOS 홈 인디케이터에 버튼이 가리지 않도록 하단 바에 safe-area 패딩을 준다.
 *
 * ▸ 원본 대응
 *   truck-1st.com 의 우측 하단 퀵메뉴 + 모바일 하단 고정 바.
 *
 * ▸ 클라이언트 요청사항(구글폼) 반영 내역
 *   - 4번(예약·상담 문의 유도) → 상담신청 버튼이 상담 폼 섹션(#consult)으로 보낸다.
 *   - 8-1번("조잡하거나 금액 노출")
 *     → 버튼 라벨에 금액·특가 표현을 쓰지 않고("무료견적" ✕ → "상담신청" ○),
 *       각 버튼은 "단색 배경 + 미세한 그림자 하나"만 갖는다.
 *       컬러는 구글폼 13번 팔레트(primary / white) 안에서만 쓴다.
 */

import { useEffect, useState } from 'react';

/** 등장 기준선(px). 이 값보다 더 스크롤되면 CTA 가 보인다. */
const SHOW_AFTER_Y = 300;

export default function FloatingCta() {
  /**
   * visible — CTA 노출 여부.
   * false 인 동안에도 DOM 에는 남겨 두고 opacity/translate 만 조절해야
   * 트랜지션이 자연스럽게 보인다. 대신 pointer-events-none 으로 클릭을 막는다.
   */
  const [visible, setVisible] = useState(false);

  /* ---------------------------------------------------------------------------
   * 스크롤 위치 감지 — 300px 초과 시 노출
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_Y);
    };

    // 새로고침 시 이미 아래로 내려가 있을 수 있으므로 최초 1회 즉시 판정한다.
    handleScroll();

    // passive: true — 스크롤 성능 저하 방지
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 언마운트 시 리스너 해제
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /**
   * 맨 위로 이동.
   * behavior:'smooth' 는 globals.css 의 prefers-reduced-motion 블록에서
   * scroll-behavior:auto 로 덮어써지므로, 모션 최소화 사용자는 즉시 이동한다.
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 버튼 공통 그림자 — 구글폼 8-1(조잡함 회피)에 따라
   * 두 버튼 모두 이 한 겹만 쓰고, 테두리·그라디언트를 겹치지 않는다.
   */
  const softShadow = 'shadow-[0_4px_12px_rgba(26,34,51,0.12)]';

  /**
   * 노출/숨김 공통 트랜지션 클래스.
   * 숨김일 때 살짝 아래(translate-y-4)에서 대기하다가 제자리로 올라오며 나타난다.
   */
  const revealClass = visible
    ? 'pointer-events-auto translate-y-0 opacity-100'
    : 'pointer-events-none translate-y-4 opacity-0';

  return (
    <>
      {/* =====================================================================
       * (A) 데스크톱 — 우측 하단 세로 스택: [상담신청] [TOP]
       *     md(768px) 미만에서는 hidden, 이상에서는 flex.
       *     z-40 : 헤더(z-50)보다 아래에 두어 헤더를 가리지 않는다.
       * ================================================================== */}
      <div
        className={[
          'fixed bottom-6 right-5 z-40 hidden flex-col gap-2.5 md:flex',
          'transition-all duration-300 ease-out',
          revealClass,
        ].join(' ')}
      >
        {/* 상담신청 — 1순위 CTA. 유일하게 채운 primary 배경 + 신청서(문서) 아이콘.
         * 페이지 하단 상담 폼 섹션(#consult)으로 앵커 이동한다. */}
        <a
          href="#consult"
          aria-label="상담 신청 폼으로 이동"
          title="상담 신청"
          className={`flex h-14 w-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-full bg-primary text-white transition-colors hover:bg-primary-hover ${softShadow}`}
        >
          <DocumentIcon />
          <span className="text-[0.6rem] font-bold leading-none">상담신청</span>
        </a>

        {/* TOP — 보조 버튼. 흰 배경 단색으로만 구분하고 테두리는 쓰지 않는다.
         * (그림자 + 테두리를 겹치지 않는다 — 구글폼 8-1) */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="페이지 맨 위로 이동"
          title="맨 위로"
          className={`flex h-14 w-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-full bg-white text-ink-sub transition-colors hover:bg-surface ${softShadow}`}
        >
          <ArrowUpIcon />
          <span className="text-[0.6rem] font-bold leading-none">TOP</span>
        </button>
      </div>

      {/* =====================================================================
       * (B) 모바일 — 화면 하단 고정 가로 바 (2등분): [상담신청] [TOP]
       *     md(768px) 이상에서는 hidden.
       *     pb-[env(safe-area-inset-bottom)] : iOS 홈 인디케이터 영역만큼 여백 확보.
       * ================================================================== */}
      <div
        className={[
          'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white md:hidden',
          'pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]',
          'transition-all duration-300 ease-out',
          revealClass,
        ].join(' ')}
      >
        {/* 상담신청(2칸) : TOP(1칸) — 주 행동이 더 넓은 면적을 갖게 한다 */}
        <div className="grid grid-cols-[2fr_1fr]">
          {/* 상담 신청 — 페이지 하단 상담 폼 섹션(#consult)으로 앵커 이동 */}
          <a
            href="#consult"
            aria-label="상담 신청 폼으로 이동"
            className="flex cursor-pointer items-center justify-center gap-2 bg-primary py-3.5 text-white transition-colors active:bg-primary-hover"
          >
            <DocumentIcon />
            <span className="text-[0.85rem] font-bold leading-none">상담신청</span>
          </a>

          {/* TOP — 최상단 복귀 */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="페이지 맨 위로 이동"
            className="flex cursor-pointer items-center justify-center gap-1.5 py-3.5 text-ink-sub transition-colors active:bg-surface"
          >
            <ArrowUpIcon />
            <span className="text-[0.85rem] font-bold leading-none">TOP</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* =============================================================================
 * 아이콘들 — 외부 아이콘 라이브러리를 쓰지 않고 인라인 SVG 로 직접 그린다.
 * 모두 aria-hidden 처리하고, 의미 전달은 부모 버튼의 aria-label 이 담당한다.
 * stroke="currentColor" 라서 부모의 text 색상을 그대로 따라간다.
 * ========================================================================== */

/** 위쪽 화살표 아이콘 — TOP */
function ArrowUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 15.5V4.5M10 4.5 5 9.5M10 4.5l5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 신청서(문서) 아이콘 — 상담신청 */
function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5h7l4 4v11h-11v-15Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 2.5v4h4M7 10.5h6M7 13.5h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
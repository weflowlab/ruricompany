'use client';

/**
 * FloatingCta.tsx — 화면에 떠 있는 상담 유도 버튼 묶음 (플로팅 CTA)
 *
 * ▸ 역할
 *   - 페이지 어디를 보고 있든 즉시 상담으로 연결할 수 있는 고정 버튼을 제공한다.
 *   - 데스크톱(768px 이상): 우측 하단 세로 스택 — [전화 상담] [카톡 상담] [맨 위로]
 *   - 모바일(768px 미만): 화면 하단에 붙는 가로 바 — [전화 상담] [카톡 상담] [무료 견적] 3등분
 *
 * ▸ 인터랙션
 *   1) 스크롤이 300px 을 넘어가면 opacity + translateY 트랜지션으로 부드럽게 등장한다.
 *      (히어로 영역을 보고 있는 동안에는 화면을 가리지 않도록 숨겨 둔다.)
 *   2) '맨 위로' 버튼은 window.scrollTo({ top: 0, behavior: 'smooth' }) 로 최상단 복귀.
 *   3) iOS 홈 인디케이터에 버튼이 가리지 않도록 하단 바에 safe-area 패딩을 준다.
 *
 * ▸ 원본 대응
 *   truck-1st.com 의 우측 하단 퀵메뉴 + 모바일 하단 고정 바.
 *
 * ▸ 주의
 *   - 카톡 상담은 실제 채널이 없으므로 클릭 시 alert 로 대체한다(더미 동작).
 *   - 무료 견적은 페이지 하단 상담 섹션(#consult)으로 앵커 이동한다.
 */

import { useEffect, useState } from 'react';
import { site } from '../_data/site';

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
   * 카톡 상담 더미 핸들러.
   * 실제 카카오톡 채널 연결은 하지 않으며, 클릭 사실만 알린다.
   */
  const handleKakao = () => {
    alert('데모 화면입니다. 실제 카카오톡 상담 채널로는 연결되지 않습니다.');
  };

  /** tel: 링크용 — 하이픈을 제거한 숫자만 남긴 전화번호 */
  const telHref = `tel:${site.tel.replace(/-/g, '')}`;

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
       * (A) 데스크톱 — 우측 하단 세로 스택
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
        {/* 전화 상담 — primary 배경 원형 버튼 */}
        <a
          href={telHref}
          aria-label={`전화 상담 ${site.tel}`}
          title={`전화 상담 ${site.tel}`}
          className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full bg-primary text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-colors hover:bg-primary-hover"
        >
          <PhoneIcon />
          <span className="text-[0.6rem] font-bold leading-none">전화</span>
        </a>

        {/* 카톡 상담 — 카카오 옐로우 계열(고정 색상, 브랜드 토큰 아님) */}
        <button
          type="button"
          onClick={handleKakao}
          aria-label="카카오톡 상담 열기"
          title="카카오톡 상담"
          className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full bg-[#FEE500] text-[#3C1E1E] shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#F2DA00]"
        >
          <ChatIcon />
          <span className="text-[0.6rem] font-bold leading-none">카톡</span>
        </button>

        {/* 맨 위로 — 흰 배경 + 라인 테두리로 앞의 두 버튼과 위계를 구분 */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="페이지 맨 위로 이동"
          title="맨 위로"
          className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full border border-line bg-white text-ink shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-colors hover:bg-surface"
        >
          <ArrowUpIcon />
          <span className="text-[0.6rem] font-bold leading-none">TOP</span>
        </button>
      </div>

      {/* =====================================================================
       * (B) 모바일 — 화면 하단 고정 가로 바 (3등분)
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
        {/* grid-cols-3 로 정확히 3등분 */}
        <div className="grid grid-cols-3">
          {/* 전화 상담 */}
          <a
            href={telHref}
            aria-label={`전화 상담 ${site.tel}`}
            className="flex flex-col items-center justify-center gap-1 border-r border-line py-2.5 text-ink transition-colors active:bg-surface"
          >
            <span className="text-primary">
              <PhoneIcon />
            </span>
            <span className="text-[0.75rem] font-bold leading-none">전화상담</span>
          </a>

          {/* 카톡 상담 */}
          <button
            type="button"
            onClick={handleKakao}
            aria-label="카카오톡 상담 열기"
            className="flex flex-col items-center justify-center gap-1 border-r border-line py-2.5 text-ink transition-colors active:bg-surface"
          >
            <span className="text-[#3C1E1E]">
              <ChatIcon />
            </span>
            <span className="text-[0.75rem] font-bold leading-none">카톡상담</span>
          </button>

          {/* 무료 견적 — 페이지 하단 상담 폼 섹션으로 앵커 이동 */}
          <a
            href="#consult"
            aria-label="무료 견적 신청 폼으로 이동"
            className="flex flex-col items-center justify-center gap-1 bg-primary py-2.5 text-white transition-colors active:bg-primary-hover"
          >
            <DocumentIcon />
            <span className="text-[0.75rem] font-bold leading-none">무료견적</span>
          </a>
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

/** 수화기 아이콘 — 전화 상담 */
function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5h3l1.5 3.75-1.9 1.15a11 11 0 0 0 4.5 4.5l1.15-1.9L16.5 11.5v3a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 3 4.7a2 2 0 0 1 1.5-2.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 말풍선 아이콘 — 카카오톡 상담 */
function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3c4 0 7 2.4 7 5.4 0 3-3 5.4-7 5.4-.6 0-1.2-.05-1.75-.15L4.7 16.2l.85-2.85C4 12.4 3 10.6 3 8.4 3 5.4 6 3 10 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 위쪽 화살표 아이콘 — 맨 위로 */
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

/** 문서 아이콘 — 무료 견적 신청 */
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

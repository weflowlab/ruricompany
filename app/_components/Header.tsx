'use client';

/**
 * Header.tsx — 페이지 최상단 고정 헤더
 *
 * ============================================================================
 * ★ GNB 전면 제거 (2026-07-31)
 * ============================================================================
 * 원래는 [좌측 로고 | 데스크톱 GNB 5개 | 모바일 햄버거 → 우측 슬라이드 패널] 구성이었다.
 * 클라이언트 요청으로 **메뉴 이동을 전부 없애고** 아래 3분할로 바꿨다.
 *
 *     [ 좌: 빈 칸 ]   [ 중앙: 루리컴퍼니 ]   [ 우: 빠른 견적 문의 ]
 *
 * 왜 이게 맞나
 *  - 단일 랜딩페이지에서 섹션 이동 메뉴는 방문자를 여기저기 흩어 놓기만 한다.
 *    위에서 아래로 읽어 내려가는 흐름 자체가 이미 기획된 순서다.
 *  - 헤더에 남길 행동은 하나면 충분하다 — "상담을 남긴다".
 *    그래서 우측 버튼 하나만 남기고 목적지를 히어로의 빠른 견적 폼(#quick-quote)으로 잡았다.
 *  - 메뉴가 사라지면서 햄버거 버튼 / 슬라이드 패널 / 포커스 트랩 / body 스크롤 잠금
 *    로직이 전부 불필요해져 함께 걷어냈다. 남은 상태는 스크롤 그림자 하나뿐이다.
 *
 * ⚠️ app/_data/site.ts 의 `navItems` 배열은 지우지 않고 남아 있지만
 *    이제 어디에서도 참조하지 않는다. 메뉴를 되살릴 일이 생기면 그 배열부터 확인할 것.
 *
 * ▸ 인터랙션
 *   - 스크롤 10px 이상 내려가면 헤더 하단에 그림자를 추가해 "떠 있는" 느낌을 준다.
 *   - 로고를 누르면 최상단으로 부드럽게 되돌아간다.
 *   - 우측 버튼은 앵커(#quick-quote)라 브라우저 기본 동작에 맡긴다.
 *     (globals.css 의 scroll-behavior:smooth + scroll-padding-top:80px 이 스크롤을 처리)
 *
 * ▸ 원본 대응
 *   truck-1st.com 의 상단 고정 헤더 영역(높이 80px, 흰 배경, 하단 1px 라인).
 */

import { useEffect, useState } from 'react';
import { site } from '../_data/site';

export default function Header() {
  /**
   * scrolled — 페이지가 10px 이상 스크롤되었는지 여부.
   * true 가 되면 헤더에 그림자 클래스를 붙인다.
   */
  const [scrolled, setScrolled] = useState(false);

  /* ---------------------------------------------------------------------------
   * 스크롤 감지 — 헤더 그림자 토글
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    // 스크롤 위치를 읽어 10px 초과 여부만 상태로 반영한다.
    // 같은 값이면 setState 를 호출해도 React 가 리렌더를 건너뛰므로 별도 최적화는 생략.
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // passive: true — 스크롤 핸들러가 preventDefault 를 쓰지 않음을 브라우저에 알려
    // 스크롤 성능이 떨어지지 않게 한다.
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 새로고침으로 페이지 중간에서 시작하는 경우를 대비해 최초 1회 즉시 판정한다.
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    /* =======================================================================
     * 고정 헤더 본체
     * - h-20 = 80px (globals.css 의 scroll-padding-top 80px 과 정확히 일치)
     * - z-50 : 플로팅 CTA(z-40)보다 위
     * ==================================================================== */
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 h-20',
        'transition-[background-color,box-shadow,border-color] duration-300',
        /*
         * ★ 최상단에서는 투명 (2026-07-31)
         *   히어로가 다크 + 스포트라이트로 바뀌면서, 흰 헤더를 그대로 두면
         *   어두운 배너 위에 흰 띠가 가로로 얹힌 꼴이 됐다.
         *   맨 위에서는 배경을 비워 히어로의 스포트라이트가 헤더 뒤까지 이어지게 하고,
         *   스크롤을 내리면 네이비 반투명 + blur 로 바뀌어 본문 위에 얹힌다.
         *   (전면 다크 전환 후 본문도 어두우므로 흰 헤더로 되돌리지 않는다)
         */
        scrolled
          ? 'border-b border-line bg-navy/90 shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md'
          : 'border-b border-transparent bg-transparent shadow-none',
      ].join(' ')}
    >
      {/*
        3분할 그리드.
        flex + justify-between 으로는 좌우 요소의 폭이 달라 로고가 정확히 가운데에
        오지 않는다. grid-cols-3 로 칸을 균등하게 나눠야 가운데 칸이 화면 정중앙에 놓인다.
        좌측 첫 칸은 의도적으로 비워 둔 균형용 공간이다.
      */}
      <div className="mx-auto grid h-full w-full max-w-[1320px] grid-cols-3 items-center px-5">
        {/* ---------------- 좌측: 균형용 빈 칸 ----------------
            aria-hidden 없이도 내용이 없어 보조기기에 읽히지 않는다. */}
        <div />

        {/* ---------------- 중앙: 텍스트 로고 ----------------
         * 규칙상 이미지는 전부 Placeholder 를 써야 하지만, 로고는 텍스트 + 도형으로
         * 구성해 이미지 자체를 쓰지 않는다. 점 아이콘은 primary 색 원. */}
        <div className="flex justify-center">
          <a
            href="#top"
            // 원페이지 구조라 '홈'은 곧 최상단이다.
            // href="#top" 은 JS 가 꺼진 환경용 폴백이고, 실제 동작은 아래 핸들러가 담당한다.
            // (주소창에 #top 이 남지 않도록 기본 동작을 막고 부드럽게 스크롤)
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            /* 배경이 항상 어두우므로 로고는 흰 글자로 고정한다. */
            className={[
              'flex items-center gap-2 text-[1.25rem] font-extrabold tracking-tight whitespace-nowrap md:text-[1.4rem]',
              'transition-colors duration-300',
              'text-white',
            ].join(' ')}
            aria-label={`${site.name} 홈으로 이동`}
          >
            {/* 로고 앞 primary 색 점 아이콘은 2026-07-31 제거했다 (클라이언트 요청). */}
            {site.name}
          </a>
        </div>

        {/* ---------------- 우측: 빠른 견적 문의 버튼 ----------------
         * 헤더에 남은 유일한 행동. 히어로 우측 견적 폼(#quick-quote)으로 스크롤한다.
         * 모바일에서는 글자와 좌우 여백을 줄여 로고와 부딪히지 않게 한다. */}
        <div className="flex justify-end">
          <a
            href="#quick-quote"
            aria-label="빠른 견적 문의 폼으로 이동"
            /* 최상단(투명)에서는 흰 채움 + 네이비 글자가 배너 위에서 가장 또렷하다.
               스크롤 후에는 헤더에 네이비 배경이 깔리므로 primary 채움으로 바꿔
               버튼이 배경과 분리돼 보이게 한다. */
            className={[
              'rounded-full px-4 py-2.5 text-[0.8rem] font-bold whitespace-nowrap md:px-6 md:py-3 md:text-[0.95rem]',
              'transition-colors duration-300',
              scrolled
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'text-navy hover:bg-primary-soft bg-white',
            ].join(' ')}
          >
            빠른 견적 문의
          </a>
        </div>
      </div>
    </header>
  );
}

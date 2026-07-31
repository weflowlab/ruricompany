'use client';

/**
 * Header.tsx — 페이지 최상단 고정 헤더 (GNB)
 *
 * ▸ 역할
 *   - 화면 상단에 항상 붙어 있는(fixed) 높이 80px 짜리 흰색 헤더.
 *   - 좌측에는 텍스트 로고, 우측에는 앵커 링크로 이동하는 글로벌 내비게이션(GNB)을 배치한다.
 *   - 데스크톱(1024px 이상)에서는 GNB 를 가로로 펼치고,
 *     그 미만(태블릿·모바일)에서는 햄버거 버튼 → 우측 슬라이드 패널로 전환한다.
 *
 * ▸ 인터랙션
 *   1) 스크롤 10px 이상 내려가면 헤더 하단에 그림자를 추가해 "떠 있는" 느낌을 준다.
 *   2) 데스크톱 GNB 항목에 마우스를 올리면 밑줄이 좌 → 우로 차오른다.
 *      (가상요소 ::after 대신 실제 <span> 에 scaleX + transform-origin:left 를 적용)
 *   3) 햄버거 버튼(24×18px, 3줄)을 누르면 3줄이 X 자로 변형되고,
 *      우측에서 모바일 패널이 슬라이드 인 하며 반투명 딤드 오버레이가 깔린다.
 *   4) 패널이 열려 있는 동안 body 스크롤을 잠그고(overflow:hidden),
 *      Esc 키 / 딤드 클릭 / 메뉴 항목 클릭 중 어느 것으로도 닫을 수 있다.
 *   5) 패널 안에서 Tab 키가 밖으로 새어나가지 않도록 포커스를 순환시킨다(포커스 트랩).
 *
 * ▸ 원본 대응
 *   truck-1st.com 의 상단 고정 헤더 영역. 문구·메뉴명은 모두 일반화된 더미로 대체했다.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { navItems, site } from '../_data/site';

export default function Header() {
  /**
   * scrolled — 페이지가 10px 이상 스크롤되었는지 여부.
   * true 가 되면 헤더에 그림자 클래스를 붙인다.
   */
  const [scrolled, setScrolled] = useState(false);

  /**
   * menuOpen — 모바일 슬라이드 패널의 열림 상태.
   * 햄버거 아이콘 모양 / 패널 위치 / 딤드 표시 / body 스크롤 잠금이 모두 이 값에 연동된다.
   */
  const [menuOpen, setMenuOpen] = useState(false);

  /** 패널 DOM 참조 — 포커스 트랩에서 내부 포커스 가능한 요소를 찾을 때 사용 */
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * 햄버거 버튼 DOM 참조 —
   * 패널을 닫은 뒤 포커스를 원래 자리(햄버거 버튼)로 되돌려 주기 위해 보관한다.
   */
  const burgerRef = useRef<HTMLButtonElement>(null);

  /* ---------------------------------------------------------------------------
   * 1) 스크롤 감지 — 헤더 그림자 토글
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    // 스크롤 위치를 읽어 10px 초과 여부만 상태로 반영한다.
    // 같은 값이면 setState 를 호출해도 React 가 리렌더를 건너뛰므로 별도 최적화는 생략.
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // 새로고침 직후 이미 아래쪽에 스크롤된 상태일 수 있으므로 최초 1회 즉시 실행한다.
    handleScroll();

    // passive: true — 리스너가 preventDefault 를 호출하지 않음을 브라우저에 알려
    // 스크롤 성능 저하를 막는다.
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 언마운트 시 반드시 리스너 해제 (메모리 누수 방지)
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /* ---------------------------------------------------------------------------
   * 2) 패널 열림 중 body 스크롤 잠금
   *    - 패널 뒤의 본문이 같이 스크롤되는 현상을 막는다.
   *    - cleanup 에서 "원래 값"으로 되돌린다. (빈 문자열로 덮어쓰면 다른 곳에서 건 잠금이 풀릴 수 있음)
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    if (!menuOpen) return;

    // 잠그기 직전의 inline overflow 값을 기억해 둔다.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  /* ---------------------------------------------------------------------------
   * 3) 키보드 처리 — Esc 로 닫기 + Tab 포커스 트랩
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // (a) Esc → 패널 닫기
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }

      // (b) Tab → 패널 내부에서만 포커스가 순환하도록 가둔다.
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      // 패널 안에서 실제로 포커스를 받을 수 있는 요소들만 수집한다.
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey) {
        // Shift+Tab 인데 첫 요소에 있으면 → 마지막 요소로 되돌린다.
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // 일반 Tab 인데 마지막 요소에 있으면 → 첫 요소로 되돌린다.
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  /* ---------------------------------------------------------------------------
   * 4) 포커스 이동 — 패널이 열리면 패널 안 첫 요소로, 닫히면 햄버거 버튼으로
   * ------------------------------------------------------------------------ */
  /** 직전 렌더의 열림 상태 — "열려 있다가 닫힌 순간"만 골라내기 위한 플래그 */
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (menuOpen) {
      // 열림: 슬라이드 트랜지션과 동시에 패널 내부 첫 포커스 요소(닫기 버튼)로 이동.
      panelRef.current?.querySelector<HTMLElement>('a[href], button')?.focus();
    } else if (wasOpenRef.current) {
      // 닫힘: "열려 있다가 닫힌" 경우에만 햄버거 버튼으로 포커스를 되돌린다.
      // (최초 마운트 시점에는 wasOpenRef 가 false 라 실행되지 않으므로
      //  페이지 진입 직후 포커스가 헤더로 튀는 일이 없다.)
      burgerRef.current?.focus();
    }

    // 다음 렌더에서 비교할 수 있도록 현재 상태를 기록해 둔다.
    wasOpenRef.current = menuOpen;
  }, [menuOpen]);

  /**
   * 메뉴 항목 클릭 핸들러.
   * 앵커 이동(#reviews 등)은 브라우저 기본 동작에 맡기고, 패널만 닫는다.
   * (globals.css 의 scroll-behavior:smooth + scroll-padding-top:80px 이 스크롤을 처리)
   */
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  /** tel: 링크용 — 하이픈을 제거한 순수 숫자 전화번호 */
  const telHref = `tel:${site.tel.replace(/-/g, '')}`;

  return (
    <>
      {/* =====================================================================
       * 고정 헤더 본체
       * - h-20 = 80px (globals.css 의 scroll-padding-top 80px 과 정확히 일치)
       * - z-50 : 플로팅 CTA(z-40)보다 위, 모바일 패널(z-[60])보다 아래
       * ================================================================== */}
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 h-20 border-b border-line bg-white',
          'transition-shadow duration-300',
          // 스크롤 10px 초과 시에만 그림자를 얹는다.
          scrolled ? 'shadow-[0_4px_16px_rgba(0,0,0,0.08)]' : 'shadow-none',
        ].join(' ')}
      >
        <div className="mx-auto flex h-full w-full max-w-[1320px] items-center justify-between px-5">
          {/* ---------------- 좌측: 텍스트 로고 ----------------
           * 규칙상 이미지는 전부 Placeholder 를 써야 하지만, 로고는 텍스트 + 도형으로
           * 구성해 이미지 자체를 쓰지 않는다. 점 아이콘은 primary 색 원. */}
          <a
            href="#top"
            // 원페이지 구조라 '홈'은 곧 최상단이다.
            // href="#top" 은 JS 가 꺼진 환경용 폴백이고, 실제 동작은 아래 핸들러가 담당한다.
            // (주소창에 #top 이 남지 않도록 기본 동작을 막고 부드럽게 스크롤)
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-[1.25rem] font-extrabold tracking-tight text-ink md:text-[1.4rem]"
            aria-label={`${site.name} 홈으로 이동`}
          >
            {/* primary 색 점 아이콘 — 순수 CSS 원형 도형 */}
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
            />
            {site.name}
          </a>

          {/* ---------------- 우측: 데스크톱 GNB ----------------
           * 1024px(lg) 미만에서는 hidden, 이상에서는 flex 로 노출한다. */}
          <nav aria-label="주요 메뉴" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.id}>
                  {/* group : 자식 <span> 밑줄이 링크 hover 를 감지하도록 하는 Tailwind 패턴 */}
                  <a
                    href={item.href}
                    className="group relative inline-block py-2 text-[0.95rem] font-semibold text-ink transition-colors duration-200 hover:text-primary"
                  >
                    {item.label}
                    {/* 밑줄 — 기본 scale-x-0(폭 0) 상태에서 hover/focus 시 scale-x-100 으로 확장.
                     * origin-left 덕분에 좌 → 우 방향으로 차오르는 것처럼 보인다. */}
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------------- 우측: 모바일 햄버거 버튼 ----------------
           * 24×18px 영역 안에 2px 두께 막대 3개를 절대 위치로 배치.
           * 열리면 위/아래 막대가 가운데(top:8px)로 모이며 ±45° 회전 → X 자,
           * 가운데 막대는 opacity 0 으로 사라진다. */}
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            className="relative h-[18px] w-6 lg:hidden"
          >
            {/* 1번 막대 (위) */}
            <span
              aria-hidden="true"
              className={[
                'absolute left-0 block h-[2px] w-full rounded-full bg-ink transition-all duration-300 ease-in-out',
                menuOpen ? 'top-2 rotate-45' : 'top-0 rotate-0',
              ].join(' ')}
            />
            {/* 2번 막대 (가운데) — 열리면 사라짐 */}
            <span
              aria-hidden="true"
              className={[
                'absolute left-0 top-2 block h-[2px] w-full rounded-full bg-ink transition-all duration-300 ease-in-out',
                menuOpen ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100',
              ].join(' ')}
            />
            {/* 3번 막대 (아래) */}
            <span
              aria-hidden="true"
              className={[
                'absolute left-0 block h-[2px] w-full rounded-full bg-ink transition-all duration-300 ease-in-out',
                menuOpen ? 'top-2 -rotate-45' : 'top-4 rotate-0',
              ].join(' ')}
            />
          </button>
        </div>
      </header>

      {/* =====================================================================
       * 딤드 오버레이
       * - 패널보다 한 단계 아래 z-index. 클릭하면 패널이 닫힌다.
       * - 닫힌 상태에서도 DOM 에 남겨 두고 opacity 만 0 으로 처리해야
       *   페이드 아웃 트랜지션이 보인다. 대신 pointer-events-none 으로 클릭을 막는다.
       * ================================================================== */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={[
          'fixed inset-0 z-[55] bg-black/50 transition-opacity duration-300 lg:hidden',
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      {/* =====================================================================
       * 모바일 슬라이드 패널
       * - 화면 우측 밖(translate-x-full)에 대기하다가 열리면 translate-x-0 으로 밀려 들어온다.
       * - role="dialog" + aria-modal 로 스크린리더에 모달임을 알린다.
       * ================================================================== */}
      <div
        id="mobile-nav-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
        // 닫혀 있을 때는 화면 밖에 있는 패널이 Tab 순서에 끼어들지 않도록
        // inert 로 스크린리더·포커스 대상에서 완전히 제외한다. (React 19 부터 boolean 지원)
        inert={!menuOpen}
        className={[
          'fixed right-0 top-0 z-[60] flex h-dvh w-[80vw] max-w-[320px] flex-col bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.12)]',
          'transition-transform duration-300 ease-out lg:hidden',
          menuOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* 패널 헤더 — 로고 텍스트 + 닫기(X) 버튼. 본 헤더와 같은 80px 높이로 맞춘다. */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-line px-5">
          <span className="flex items-center gap-2 text-[1.1rem] font-extrabold text-ink">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full bg-primary"
            />
            {site.name}
          </span>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="메뉴 닫기"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface"
          >
            {/* 닫기 X 아이콘 (인라인 SVG) */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L17 17M17 1L1 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 메뉴 목록 — 항목이 많아질 경우를 대비해 세로 스크롤 허용 */}
        <nav aria-label="모바일 주요 메뉴" className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.id} className="border-b border-line last:border-b-0">
                <a
                  href={item.href}
                  // 클릭 시 패널을 닫고, 앵커 이동은 브라우저 기본 동작에 맡긴다.
                  onClick={closeMenu}
                  className="block py-4 text-[1rem] font-semibold text-ink transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 패널 하단 고정 CTA — 전화 상담 버튼 */}
        <div className="shrink-0 border-t border-line px-5 py-5">
          <p className="mb-2 text-[0.8rem] text-ink-sub">상담 가능 시간 09:00 ~ 18:00</p>
          <a
            href={telHref}
            aria-label={`전화 상담 ${site.tel}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[1rem] font-bold text-white transition-colors hover:bg-primary-hover"
          >
            {/* 수화기 아이콘 (인라인 SVG) */}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4.5 2.5h3l1.5 3.75-1.9 1.15a11 11 0 0 0 4.5 4.5l1.15-1.9L16.5 11.5v3a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 3 4.7a2 2 0 0 1 1.5-2.2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            전화 상담 {site.tel}
          </a>
        </div>
      </div>
    </>
  );
}

'use client';

/**
 * Header.tsx — 페이지 최상단 고정 헤더
 *
 * ▸ 역할
 *   - 화면 상단에 항상 붙어 있는(fixed) 높이 80px 짜리 흰색 헤더.
 *   - 좌측에 텍스트 로고, 우측에 '상담 신청' 버튼 하나만 두는 슬림 구성이다.
 *
 * ▸ 인터랙션
 *   - 스크롤 10px 이상 내려가면 헤더 하단에 그림자를 추가해 "떠 있는" 느낌을 준다.
 *     (이 컴포넌트에 'use client' 가 필요한 유일한 이유다.)
 *
 * ============================================================================
 * ★ GNB 제거 이력 (2026-07-30)
 * ============================================================================
 * 이 사이트는 라우트가 하나뿐인 단일 랜딩페이지다. 상단 섹션 이동 메뉴는
 * 여러 페이지를 오가는 사이트에서 필요한 장치이고, 랜딩페이지에서는
 * "위로 되돌아가는 출구"를 만들어 아래로 읽어 내리는 흐름을 오히려 끊는다.
 * 그래서 다음을 모두 제거했다.
 *
 *   [삭제] 데스크톱 GNB 5개 (#services / #vehicles / #process / #reviews / #faq)
 *   [삭제] 모바일 햄버거 버튼 + 우측 슬라이드 패널 + 딤드 오버레이
 *   [삭제] 패널에 딸려 있던 부수 로직 — body 스크롤 잠금, Esc 닫기,
 *          Tab 포커스 트랩, 열림/닫힘 포커스 이동
 *   [삭제] 패널 하단의 전화 CTA + 채널 아이콘 3개 및 ChannelIcon 컴포넌트
 *          → 동일한 내용이 <FloatingCta /> 와 <Footer /> 에 이미 있어 중복이었다.
 *
 * 남긴 것과 그 이유
 *   - 로고: 클릭하면 최상단으로 부드럽게 올라간다. 유일한 "처음으로" 수단이다.
 *   - '상담 신청' 버튼: 구글폼 4번(예약·상담 문의 유도) / 7-1번("편하게 상담
 *     남길 수 있는 부분")의 핵심이라 메뉴와 함께 지우지 않았다. 메뉴가 사라져
 *     자리가 남은 만큼, 이전에는 데스크톱에만 보였던 이 버튼을 모바일까지
 *     항상 노출하도록 바꿨다. (모바일에서 우측이 비어 보이는 문제도 함께 해결)
 *
 * ▸ 함께 확인한 사항
 *   - app/_data/site.ts 의 `navItems` 는 이제 아무도 참조하지 않는다.
 *     나중에 메뉴를 되살릴 수 있으므로 배열 자체는 지우지 않고 남겨 두었다.
 *   - globals.css 의 `scroll-padding-top: 80px` 은 그대로 필요하다.
 *     헤더는 여전히 fixed 80px 이고, 페이지 곳곳의 '상담받기' CTA 가
 *     #consult 로 앵커 이동하기 때문이다.
 */

import { useEffect, useState } from 'react';
import { site } from '../_data/site';

export default function Header() {
  /**
   * scrolled — 페이지가 10px 이상 스크롤되었는지 여부.
   * true 가 되면 헤더에 그림자 클래스를 붙인다.
   */
  const [scrolled, setScrolled] = useState(false);

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

  return (
    /* =======================================================================
     * 고정 헤더 본체
     * - h-20 = 80px (globals.css 의 scroll-padding-top 80px 과 정확히 일치)
     * - z-50 : 플로팅 CTA(z-40)보다 위
     * ==================================================================== */
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

        {/* ---------------- 우측: 상담 신청 버튼 ----------------
         * 헤더에 두는 유일한 CTA. 하단 상담 폼 섹션(#consult)으로 앵커 이동한다.
         * 구글폼 8-1(조잡함 회피)에 따라 그라디언트·테두리·강한 그림자를 겹치지 않고
         * 단색 primary 배경 하나로만 처리했다. 금액/특가 문구는 넣지 않는다.
         * 좁은 화면에서는 좌우 여백과 글자 크기만 한 단계 줄여 로고와 부딪히지 않게 한다. */}
        <a
          href="#consult"
          className="rounded-full bg-primary px-4 py-2 text-[0.85rem] font-bold text-white transition-colors duration-200 hover:bg-primary-hover md:px-5 md:py-2.5 md:text-[0.9rem]"
        >
          상담 신청
        </a>
      </div>
    </header>
  );
}

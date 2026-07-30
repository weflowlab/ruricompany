'use client';

/**
 * HeroSection.tsx — 첫 화면 (id="hero")
 *
 * ============================================================================
 * ★ 개편 이력 (2026-07-30)
 * ============================================================================
 * 1차 : [캐러셀 카드 2/3 | 상담 폼 1/3] 그리드 → 풀블리드 + 우측 상담 드로어
 * 2차(현재) : 클라이언트 피드백 반영
 *   - "폼은 캡처처럼 아래(문의 섹션)에 따로" → 히어로에서 상담 폼·드로어를 완전히
 *     제거했다. 상담 입력은 하단 <ConsultSection /> 하나로 모은다.
 *     히어로의 '상담 신청하기' 버튼이 #consult 로 데려다 준다.
 *   - "히어로만 검정빛이라 별로" → 어두운 스크림·Placeholder 배경을 걷어내고
 *     **흰 배경 + 진한 글자**로 비웠다. 페이지 전체가 흰 기조이므로 히어로도 맞춘다.
 *
 * 지금 구조 (참고 사이트 teukjangman.kr 의 골격, 색만 반전)
 *   - 화면을 세로로 채우는(md 이상 min-h-dvh) 흰 무대 위에
 *     카피를 가운데 정렬로 얹는다.
 *   - CTA 는 고정 2개: 상담 신청하기(#consult, 채움) / 차량 라인업 보기(#vehicles, 테두리)
 *   - 하단 가운데 도트 페이지네이션 + 이전/다음 + 재생/일시정지
 *   - 나중에 실제 사진을 받으면: 배경에 <Image fill /> 을 깔고 어두운 스크림과
 *     흰 글자로 되돌리면 참고 사이트와 같은 그림이 된다. (1차 개편 코드가
 *     git 이력에 있으므로 그대로 복원 가능)
 *
 * ▸ 캐러셀 동작
 *   - 배경 이미지가 없으므로 슬라이드 전환 = **카피 4종의 로테이션**이다.
 *   - 2초 간격 자동 재생, 무한 루프
 *   - 마우스 hover / 키보드 포커스 / 사용자의 일시정지 / OS 모션 최소화 설정
 *     중 하나라도 걸리면 자동 재생을 멈춘다
 *   - 좌우 방향키, 터치 스와이프(50px 이상)로도 넘길 수 있다
 *
 * ▸ 슬라이드별 CTA 를 두지 않는 이유
 *   자동 재생 중 버튼 문구·목적지가 2초마다 바뀌면 누르려던 버튼이 손가락 아래에서
 *   다른 버튼이 된다. 버튼 2개는 슬라이드와 무관하게 고정이다.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { site } from '../_data/site';

/** 히어로 배너 한 장의 데이터 */
type HeroSlide = {
  /** React key 용 고유 id */
  id: string;
  /** 카피 위에 붙는 짧은 라벨 */
  eyebrow: string;
  /** 메인 카피. 배열 한 칸이 한 줄이 된다 (<br> 없이 안전하게 줄바꿈) */
  titleLines: string[];
  /** 보조 설명 한 줄 */
  subtitle: string;
};

/**
 * 배너 4장 데이터.
 *
 * ★ 구글폼 3번(업종: 신차 할부 / 신차 리스 / 신차 장기렌트) 기준 카피.
 *
 * 네 장이 서로 다른 각도를 말하도록 배치했다 (같은 말을 네 번 반복하면 캐러셀이 지루해진다).
 *   1장 = 3가지 방식 비교   → "뭐가 나에게 맞는지" 라는 첫 질문에 답한다
 *   2장 = 조건 확인         → "나도 가능한가?" 라는 두 번째 불안을 다룬다
 *   3장 = 빠른 출고         → "언제 받을 수 있나?" 라는 일정 걱정을 다룬다
 *   4장 = 담당자 직접 상담  → 사람이 붙는다는 신뢰(구글폼 14번)로 마무리
 *
 * ⚠️ 카피 작성 규칙 (구글폼 8-1 "금액 노출" 회피)
 *   - 금액·이자율·할인율·"최저가/특가/실구매가/월 납입금" 표현을 쓰지 않는다.
 *   - 대신 "비교 / 조건 확인 / 일정 / 담당자" 처럼 금액이 아닌 가치를 말한다.
 *
 * 데이터 양이 적고 이 컴포넌트에서만 쓰이므로 _data 로 빼지 않고 지역 상수로 둔다.
 */
const heroSlides: HeroSlide[] = [
  {
    id: 'slide-01',
    eyebrow: '할부 · 리스 · 장기렌트',
    titleLines: ['신차 구매 방식 3가지,', '한자리에서 비교하세요'],
    subtitle: '어떤 방식이 내 상황에 맞는지부터 차이를 정리해 알려 드립니다.',
  },
  {
    id: 'slide-02',
    eyebrow: '가능 조건 확인',
    titleLines: ['내 조건으로 가능한지', '먼저 확인해 보세요'],
    subtitle:
      '명의·직군·운행 계획에 따라 진행 방법이 달라집니다.',
  },
  {
    id: 'slide-03',
    eyebrow: '출고 일정 안내',
    titleLines: ['원하는 신차,', '일정에 맞춰 출고합니다'],
    subtitle: '모델별 출고 가능 시기를 확인해 필요한 시점에 맞춰 진행해 드립니다.',
  },
  {
    id: 'slide-04',
    eyebrow: '담당자 직접 상담',
    titleLines: ['처음 문의부터 출고까지', '담당자가 직접 챙깁니다'],
    // 구글폼 17번 담당자명을 카피에 직접 노출해 "사람이 붙는다"는 신뢰를 준다
    subtitle: `상담 · 서류 · 출고를 ${site.manager} 담당자가 끝까지 안내합니다.`,
  },
];

/**
 * 자동 재생 간격(ms).
 * 원래 원본 사이트의 swiper delay 를 따라 2000ms 였는데, 개편 후 히어로가
 * 이미지 없이 카피(제목 2줄 + 설명 1줄)만 로테이션하는 구조가 되면서
 * 다 읽기 전에 넘어간다는 피드백(2026-07-30)이 있었다. 5초로 늘렸다.
 */
const AUTOPLAY_DELAY = 5000;
/** 터치 스와이프로 인정할 최소 이동 거리(px) */
const SWIPE_THRESHOLD = 50;

/* -----------------------------------------------------------------------------
 * prefers-reduced-motion 구독 유틸
 *
 * 미디어쿼리는 "React 바깥에 있는 외부 상태"이므로,
 * useState + useEffect 로 복사해 오는 대신 useSyncExternalStore 로 직접 구독한다.
 *  - effect 안에서 setState 를 동기 호출하지 않으므로 연쇄 렌더가 발생하지 않는다.
 *  - 서버 렌더 시에는 getServerSnapshot 이 항상 false 를 돌려주므로
 *    하이드레이션 불일치도 생기지 않는다.
 * 컴포넌트 바깥(모듈 스코프)에 두어야 렌더마다 함수가 새로 만들어져
 * 재구독되는 일을 막을 수 있다.
 * -------------------------------------------------------------------------- */

/** 감지할 미디어쿼리 문자열 */
const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * 구독 함수 — OS 의 "동작 줄이기" 설정이 바뀌면 onStoreChange 를 호출한다.
 * 반환값(정리 함수)에서 리스너를 반드시 해제한다.
 */
function subscribeReduceMotion(onStoreChange: () => void): () => void {
  // 구형 브라우저/비 브라우저 환경 방어 — 구독할 대상이 없으면 빈 정리 함수만 돌려준다
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};

  const mql = window.matchMedia(REDUCE_MOTION_QUERY);
  mql.addEventListener('change', onStoreChange);
  return () => mql.removeEventListener('change', onStoreChange);
}

/** 클라이언트 스냅샷 — 현재 설정값(boolean). 원시값이라 매번 호출해도 참조 동일성 문제가 없다. */
function getReduceMotionSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(REDUCE_MOTION_QUERY).matches;
}

/** 서버 스냅샷 — 서버에는 미디어쿼리 개념이 없으므로 항상 false(= 애니메이션 허용) */
function getReduceMotionServerSnapshot(): boolean {
  return false;
}

export default function HeroSection() {
  /** 현재 보이는 슬라이드 인덱스 (0 ~ heroSlides.length - 1) */
  const [index, setIndex] = useState(0);
  /** 사용자가 재생/일시정지 버튼으로 직접 끈 상태. hover 와 독립적으로 유지된다. */
  const [isPaused, setIsPaused] = useState(false);
  /** 마우스가 히어로 위에 올라와 있는지 (일시적 정지) */
  const [isHovered, setIsHovered] = useState(false);
  /** 키보드 포커스가 내부에 있는지 (탭 이동 중 카피가 바뀌면 혼란스러우므로 정지) */
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  /**
   * prefers-reduced-motion: reduce 여부.
   * 미디어쿼리를 외부 스토어로 보고 useSyncExternalStore 로 구독한다.
   * (서버에서는 false → 하이드레이션 직후 실제 설정값으로 자동 동기화된다)
   */
  const reduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotionSnapshot,
    getReduceMotionServerSnapshot,
  );

  /** touchstart 시점의 X 좌표를 담아 두는 ref (리렌더가 필요 없는 값이라 state 대신 ref) */
  const touchStartXRef = useRef<number | null>(null);

  /** 전체 슬라이드 수 — 도트 렌더와 modulo 순환에 사용 */
  const total = heroSlides.length;

  /**
   * 다음 슬라이드로 이동.
   * (index + 1) % total 로 마지막 → 첫 장이 이어지는 무한 루프를 만든다.
   */
  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % total);
  }, [total]);

  /**
   * 이전 슬라이드로 이동.
   * 음수가 되지 않도록 total 을 한 번 더해 준 뒤 modulo 를 취한다.
   */
  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  /**
   * 자동재생을 실제로 돌려도 되는지 판정.
   * - 사용자가 버튼으로 껐거나(isPaused)
   * - 마우스가 올라와 있거나(isHovered)
   * - 키보드 포커스가 안에 있거나(isFocusWithin)
   * - 모션 최소화 설정(reduceMotion)
   * 중 하나라도 해당되면 재생하지 않는다.
   */
  const autoplayActive =
    !isPaused && !isHovered && !isFocusWithin && !reduceMotion;

  /**
   * [효과] 자동 재생 타이머.
   * autoplayActive 가 true 인 동안에만 setInterval 을 걸고,
   * 조건이 하나라도 바뀌면 기존 타이머를 정리한 뒤 다시 판단한다.
   * → 타이머가 중복 생성되거나 언마운트 후에도 살아남는 일이 없다.
   */
  useEffect(() => {
    if (!autoplayActive) return;

    const timerId = window.setInterval(goNext, AUTOPLAY_DELAY);

    // cleanup: 의존성 변경 시 & 언마운트 시 항상 해제
    return () => {
      window.clearInterval(timerId);
    };
  }, [autoplayActive, goNext]);

  /**
   * 터치 시작 지점 기록.
   * 멀티터치는 무시하고 첫 번째 손가락 좌표만 사용한다.
   */
  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  /**
   * 터치 종료 시 이동 거리 계산.
   * - 왼쪽으로 50px 이상 밀었으면(delta < -50) 다음 슬라이드
   * - 오른쪽으로 50px 이상 밀었으면(delta > 50) 이전 슬라이드
   * - 그 미만은 탭으로 간주하고 무시한다.
   */
  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startX = touchStartXRef.current;
    // 시작 좌표가 없으면(스크롤 등으로 중단) 계산하지 않는다.
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const delta = endX - startX;

    if (delta <= -SWIPE_THRESHOLD) {
      goNext();
    } else if (delta >= SWIPE_THRESHOLD) {
      goPrev();
    }

    // 다음 스와이프를 위해 초기화
    touchStartXRef.current = null;
  };

  /** 키보드 좌우 방향키로도 슬라이드를 넘길 수 있게 한다 (접근성) */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    }
  };

  /** 현재 슬라이드 — 카피 영역이 참조한다 */
  const activeSlide = heroSlides[index];

  return (
    <section
      id="hero"
      /*
       * role="region" + aria-roledescription 으로 스크린리더에 "캐러셀"임을 알린다.
       * tabIndex={0} 을 줘서 키보드 좌우 방향키 조작이 가능하도록 포커스를 받는다.
       * 배경 레이어가 없어졌으므로 스와이프·방향키·hover 핸들러가 섹션에 직접 붙는다.
       */
      role="region"
      aria-roledescription="캐러셀"
      aria-label={`${site.name} 신차 상담 안내 배너`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={() => setIsFocusWithin(false)}
      /*
       * 흰 무대.
       * pt-20  : 고정 헤더 높이(80px) 확보. 헤더가 fixed 라 이 패딩이 없으면
       *          카피가 헤더 뒤로 들어간다.
       * min-h  : 모바일은 화면의 3/4 정도로 과하지 않게, md 이상에서 한 화면을 채워
       *          참고 사이트처럼 "첫 화면 = 히어로 하나" 로 만든다.
       */
      className="flex min-h-[75dvh] flex-col bg-white pt-20 md:min-h-dvh"
    >
      {/* =====================================================================
       * 카피 + CTA — 화면 가운데 정렬
       * flex-1 로 헤더 아래 남는 세로 공간을 모두 차지한 뒤 그 안에서 중앙 정렬한다.
       * ================================================================== */}
      <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        {/*
         * 슬라이드가 바뀔 때 카피만 갈아 끼운다.
         * key 에 슬라이드 id 를 주면 React 가 DOM 을 통째로 교체한다.
         * aria-live="polite" 로 스크린리더에 현재 배너 내용을 알린다.
         */}
        <div key={activeSlide.id} aria-live="polite" aria-atomic="true">
          {/* 작은 라벨 — 자간을 넓혀 참고 사이트의 상단 라벨 느낌을 낸다 */}
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-primary md:text-xs">
            {activeSlide.eyebrow}
          </p>

          {/* 메인 카피 — 줄 배열을 순회해 <br> 없이 안전하게 줄바꿈 */}
          <h2 className="mt-4 text-[1.75rem] leading-tight font-black text-ink md:text-[2.75rem] lg:text-[3.25rem]">
            {activeSlide.titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          {/* 보조 설명 — 좁은 화면에서 두 줄 이상 흐르지 않도록 폭을 제한한다 */}
          <p className="mx-auto mt-5 max-w-[34rem] text-sm leading-relaxed text-ink-sub md:text-base">
            {activeSlide.subtitle}
          </p>
        </div>

        {/*
         * CTA 2개 — 슬라이드와 무관하게 항상 같은 자리, 같은 목적지.
         * 주 버튼(primary 채움)은 하단 문의 섹션으로, 보조 버튼(테두리)은 차량으로 보낸다.
         * 히어로에서 상담 폼을 뺐으므로(파일 상단 개편 이력 참고) 이 버튼이
         * 구글폼 4번(상담 유도)의 유일한 히어로 쪽 진입점이다.
         */}
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#consult"
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover md:text-base"
          >
            상담 신청하기
          </a>
          <a
            href="#vehicles"
            className="rounded-full border border-line px-8 py-3.5 text-sm font-bold text-ink transition-colors duration-200 hover:border-primary hover:text-primary md:text-base"
          >
            차량 라인업 보기
          </a>
        </div>
      </div>

      {/* =====================================================================
       * 하단 컨트롤 — 도트 페이지네이션 + 이전/다음 + 재생/일시정지
       * 참고 사이트는 도트만 두지만, 도트는 클릭 표적이 작아 이전/다음 버튼을 함께 둔다.
       * 자동 재생을 멈출 수단(재생/일시정지)은 접근성상 반드시 필요하다.
       * ================================================================== */}
      <div className="flex items-center justify-center gap-1.5 pb-8 md:pb-10">
        {/* 이전 버튼 */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="이전 배너 보기"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-sub transition-colors hover:bg-surface hover:text-ink"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>

        {/*
         * 도트 — 현재 위치 표시 겸 직접 이동 버튼.
         * 활성 도트는 가로로 길어져(w-6) 어디에 있는지 한눈에 들어온다.
         * aria-current 로 스크린리더에도 현재 항목을 알린다.
         */}
        <ul className="flex items-center gap-1.5 px-1">
          {heroSlides.map((slide, slideIndex) => {
            const isActive = slideIndex === index;

            return (
              <li key={slide.id}>
                <button
                  type="button"
                  onClick={() => setIndex(slideIndex)}
                  aria-label={`${slideIndex + 1}번 배너로 이동`}
                  aria-current={isActive ? 'true' : undefined}
                  className={[
                    'block h-1.5 rounded-full transition-all duration-300',
                    isActive
                      ? 'w-6 bg-primary'
                      : 'w-1.5 bg-line hover:bg-ink-sub',
                  ].join(' ')}
                />
              </li>
            );
          })}
        </ul>

        {/* 다음 버튼 */}
        <button
          type="button"
          onClick={goNext}
          aria-label="다음 배너 보기"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-sub transition-colors hover:bg-surface hover:text-ink"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        {/* 구분선 */}
        <span aria-hidden="true" className="mx-1 h-3.5 w-px bg-line" />

        {/*
         * 재생 / 일시정지 토글.
         * isPaused 만 뒤집으며, hover 로 인한 일시정지에는 영향을 주지 않는다.
         * aria-pressed 로 토글 버튼의 눌림 상태를 알린다.
         */}
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          aria-pressed={isPaused}
          aria-label={isPaused ? '배너 자동 재생 시작' : '배너 자동 재생 일시정지'}
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-sub transition-colors hover:bg-surface hover:text-ink"
        >
          {isPaused ? (
            // 일시정지 상태 → 재생(▶) 아이콘 노출
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M7 4.5l12 7.5-12 7.5z" />
            </svg>
          ) : (
            // 재생 중 → 일시정지(❚❚) 아이콘 노출
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}

'use client';

/**
 * HeroSection — 상단 히어로 영역 (원본 sec1 대응)
 *
 * 역할
 *  - 페이지 최상단, 고정 헤더(80px) 바로 아래에 놓이는 첫 화면.
 *  - 좌측 2/3 : 4장짜리 자동재생 배너 캐러셀 (원본은 swiper 였지만 여기서는
 *    외부 라이브러리 없이 React 훅 + CSS transform 만으로 직접 구현했다).
 *  - 우측 1/3 : "빠른 견적 문의" 카드. 공용 ConsultForm 을 compact 형태로 노출한다.
 *
 * 인터랙션 요약
 *  1) 2000ms 간격 자동 재생 + 무한 루프(인덱스를 slides.length 로 modulo 순환).
 *  2) 트랙을 translateX(-index * 100%) 로 밀어서 전환, transition-transform duration-500.
 *  3) 우하단 컨트롤 : [이전] [현재 / 전체] [다음] [재생·일시정지 토글].
 *  4) 마우스 hover / 키보드 포커스가 캐러셀 안에 있으면 자동재생 일시정지 → 벗어나면 재개.
 *     이 "일시적 정지"는 사용자가 버튼으로 누른 일시정지(isPaused)와 완전히 별개 상태다.
 *  5) 터치 스와이프 : touchstart~touchend 의 X 좌표 차이가 50px 이상이면 좌/우 이동.
 *  6) prefers-reduced-motion: reduce 환경에서는 자동재생 자체를 돌리지 않는다.
 *  7) setInterval 은 useEffect cleanup 에서 반드시 해제한다.
 *
 * 원본 대응
 *  - truck-1st.com 첫 화면의 좌측 대형 배너 슬라이더 + 우측 견적 신청 박스 구조.
 *  - 문구/이미지는 전부 일반화된 더미이며, 이미지는 Placeholder 로 대체했다.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Placeholder from './Placeholder';
import ConsultForm from './ConsultForm';

/** 히어로 캐러셀 슬라이드 1장의 데이터 형태 */
type HeroSlide = {
  /** React key 용 고유 id */
  id: string;
  /** 카피 위에 붙는 작은 라벨 (예: 이벤트명) */
  eyebrow: string;
  /** 메인 카피 (줄바꿈은 배열로 관리해 반응형에서 깨지지 않게 함) */
  titleLines: string[];
  /** 서브 카피 */
  subtitle: string;
  /** CTA 버튼 문구 */
  ctaLabel: string;
  /** CTA 앵커 링크 — 페이지 내에 실제로 존재하는 섹션 id 만 사용한다 */
  ctaHref: string;
  /** Placeholder 에 들어갈 한국어 이미지 설명 */
  imageLabel: string;
};

/**
 * 배너 4장 더미 데이터.
 * 원본 문구를 그대로 쓰지 않고 같은 성격(프로모션/특가/상담 유도)의 일반 문구로 작성했다.
 * 데이터 양이 적고 이 컴포넌트에서만 쓰이므로 _data 로 빼지 않고 지역 상수로 둔다.
 */
const heroSlides: HeroSlide[] = [
  {
    id: 'slide-01',
    eyebrow: '이번 달 한정 프로모션',
    titleLines: ['초기 비용 부담 없이', '화물차 출고하세요'],
    subtitle: '보증금·선수금 조건을 상담 한 번으로 비교해 드립니다.',
    ctaLabel: '추천 차량 보기',
    ctaHref: '#vehicles',
    imageLabel: '히어로 배너 1 — 대형 화물차 주행 이미지',
  },
  {
    id: 'slide-02',
    eyebrow: '전기 화물차 특가',
    titleLines: ['보조금까지 계산한', '실구매가 안내'],
    subtitle: '지역별 보조금 잔여 현황을 확인하고 예상 월 납입금을 알려 드립니다.',
    ctaLabel: '전기 화물차 특가 보기',
    ctaHref: '#ev',
    imageLabel: '히어로 배너 2 — 전기 화물차 충전 장면 이미지',
  },
  {
    id: 'slide-03',
    eyebrow: '누적 상담 후기',
    titleLines: ['먼저 이용하신 분들의', '솔직한 후기를 확인하세요'],
    subtitle: '차량 인수부터 서류 처리까지 실제 진행 과정을 그대로 공개합니다.',
    ctaLabel: '고객 후기 보기',
    ctaHref: '#reviews',
    imageLabel: '히어로 배너 3 — 차량 인도식 기념 촬영 이미지',
  },
  {
    id: 'slide-04',
    eyebrow: '간편한 진행 절차',
    titleLines: ['상담 신청부터 출고까지', '단 5단계면 충분합니다'],
    subtitle: '복잡한 서류와 심사 과정을 담당 매니저가 대신 챙겨 드립니다.',
    ctaLabel: '이용 절차 확인하기',
    ctaHref: '#process',
    imageLabel: '히어로 배너 4 — 계약 상담 데스크 이미지',
  },
];

/** 자동 재생 간격(ms). 원본 swiper autoplay delay 와 동일한 2000ms. */
const AUTOPLAY_DELAY = 2000;
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
  /** 마우스가 캐러셀 위에 올라와 있는지 (일시적 정지) */
  const [isHovered, setIsHovered] = useState(false);
  /** 키보드 포커스가 캐러셀 내부에 있는지 (탭 이동 중 슬라이드가 바뀌면 혼란스러우므로 정지) */
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

  /** 전체 슬라이드 수 — 페이징 표시와 modulo 순환에 사용 */
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
  const autoplayActive = !isPaused && !isHovered && !isFocusWithin && !reduceMotion;

  /**
   * [효과 2] 자동 재생 타이머.
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
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  /**
   * 터치 종료 시 이동 거리 계산.
   * - 왼쪽으로 50px 이상 밀었으면(delta < -50) 다음 슬라이드
   * - 오른쪽으로 50px 이상 밀었으면(delta > 50) 이전 슬라이드
   * - 그 미만은 탭으로 간주하고 무시한다.
   */
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
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
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    }
  };

  return (
    /*
     * 고정 헤더 높이(80px)만큼 pt-20 으로 밀어 준다.
     * 헤더가 fixed 라 이 패딩이 없으면 첫 슬라이드가 헤더 뒤로 들어간다.
     */
    <section id="hero" className="pt-20" aria-label="메인 배너 및 빠른 견적 문의">
      <div className="mx-auto w-full max-w-[1320px] px-5 py-8 md:py-12">
        {/*
         * 레이아웃
         *  - 1024px 미만(기본) : 세로 스택 (캐러셀 위 / 폼 아래)
         *  - 1024px 이상(lg)   : 3열 그리드에서 캐러셀 2칸 + 폼 1칸 (2/3 : 1/3)
         */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* ───────────────── 좌측 : 자체 구현 캐러셀 ───────────────── */}
          <div
            className="lg:col-span-2"
            /* 마우스가 들어오면 자동재생 일시정지, 나가면 재개 */
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            /* 포커스가 내부 요소로 들어오/나가는 것을 캡처 단계에서 감지 (focusin/focusout 대응) */
            onFocusCapture={() => setIsFocusWithin(true)}
            onBlurCapture={() => setIsFocusWithin(false)}
          >
            <div
              /*
               * 캐러셀 뷰포트.
               * - role="region" + aria-roledescription 으로 스크린리더에 "캐러셀"임을 알린다.
               * - tabIndex={0} 을 줘서 키보드 좌우 방향키 조작이 가능하도록 포커스를 받는다.
               * - overflow-hidden 이 트랙의 나머지 3장을 잘라 준다.
               * - 비율은 모바일 4/3 → 태블릿 16/9 → 데스크톱 16/10 으로 조정.
               */
              role="region"
              aria-roledescription="캐러셀"
              aria-label="루리컴퍼니 프로모션 배너"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface md:aspect-[16/9] lg:aspect-[16/10]"
            >
              {/*
               * 트랙 : 슬라이드를 가로로 나열한 뒤 translateX 로 이동시킨다.
               * index * 100% 만큼 왼쪽으로 밀면 해당 슬라이드가 뷰포트에 들어온다.
               * (prefers-reduced-motion 시에는 globals.css 전역 규칙이 transition 을 없앤다)
               */}
              <div
                className="flex h-full w-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {heroSlides.map((slide, slideIndex) => {
                  // 현재 보이는 슬라이드인지 여부 — 접근성 처리에 사용
                  const isActive = slideIndex === index;

                  return (
                    <div
                      key={slide.id}
                      /*
                       * 각 슬라이드는 뷰포트 100% 폭을 차지한다(basis-full + shrink-0).
                       * 비활성 슬라이드는 inert 로 접근성 트리와 탭 순서에서 제외해
                       * 화면에 보이지 않는 CTA 로 포커스가 빠지는 문제를 막는다.
                       */
                      inert={!isActive}
                      role="group"
                      aria-roledescription="슬라이드"
                      aria-label={`${slideIndex + 1} / ${total}`}
                      className="relative h-full w-full shrink-0 grow-0 basis-full"
                    >
                      {/* 배경 이미지 자리 — 실제 이미지 대신 Placeholder 를 꽉 채워 배치 */}
                      <Placeholder
                        label={slide.imageLabel}
                        className="absolute inset-0 h-full border-0"
                      />

                      {/*
                       * 가독성 오버레이.
                       * 배경이 밝은 회색이므로 왼쪽에서 흰색 그라데이션을 덮어
                       * 진한 글자(text-ink)가 또렷하게 읽히도록 한다.
                       */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30"
                      />

                      {/* 텍스트 오버레이 (카피 / 서브카피 / CTA) */}
                      <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 md:gap-4 md:p-10 lg:p-14">
                        {/* 작은 라벨 — primary 배경 칩 */}
                        <span className="w-fit rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white md:text-xs">
                          {slide.eyebrow}
                        </span>

                        {/* 메인 카피 — 줄 배열을 순회해 <br> 없이 안전하게 줄바꿈 */}
                        <h2 className="text-[1.35rem] leading-tight font-bold text-ink md:text-[2rem] lg:text-[2.5rem]">
                          {slide.titleLines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </h2>

                        {/* 서브 카피 — 모바일에서는 공간이 좁아 숨긴다 */}
                        <p className="hidden max-w-[28rem] text-sm text-ink-sub md:block md:text-base">
                          {slide.subtitle}
                        </p>

                        {/* CTA — 같은 페이지 내 섹션으로 앵커 스크롤 */}
                        <a
                          href={slide.ctaHref}
                          className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary md:px-6 md:py-3 md:text-sm"
                        >
                          {slide.ctaLabel}
                          {/* 장식용 화살표 아이콘 (인라인 SVG) */}
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
                            <path d="M5 12h14" />
                            <path d="M13 6l6 6-6 6" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/*
               * 우하단 컨트롤 바.
               * [이전] [현재 / 전체] [다음] [재생·일시정지] 순서.
               * 트랙 위에 떠 있어야 하므로 absolute + z-10.
               */}
              <div className="absolute right-4 bottom-4 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-[0_2px_10px_rgba(0,0,0,0.12)] backdrop-blur-sm md:right-6 md:bottom-6">
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
                 * 페이징 표시 "1 / 4".
                 * aria-live="polite" 로 슬라이드가 바뀔 때 스크린리더가 현재 위치를 읽어 준다.
                 * tabular-nums 로 숫자 폭을 고정해 전환 시 흔들리지 않게 한다.
                 */}
                <p
                  aria-live="polite"
                  aria-atomic="true"
                  className="min-w-[3.25rem] text-center text-xs font-semibold tabular-nums text-ink"
                >
                  <span className="text-primary">{index + 1}</span>
                  <span className="mx-1 text-ink-sub">/</span>
                  <span className="text-ink-sub">{total}</span>
                </p>

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
                <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-line" />

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
            </div>
          </div>

          {/* ───────────────── 우측 : 빠른 견적 문의 카드 ───────────────── */}
          <aside
            aria-label="빠른 견적 문의"
            /*
             * 흰 카드 + 그림자 + 라운드.
             * lg 이상에서는 캐러셀과 높이를 맞추기 위해 h-full 로 늘린다.
             */
            className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.07)] md:p-7"
          >
            <h2 className="text-xl font-bold text-ink md:text-2xl">빠른 견적 문의</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-sub">
              연락처만 남겨 주시면 담당 매니저가 조건에 맞는 견적을 정리해 안내해 드립니다.
            </p>

            {/*
             * 공용 상담 폼(compact 변형).
             * 실제 전송 로직은 ConsultForm 내부에서 처리하며, 이 컴포넌트는 배치만 담당한다.
             * mt-5 이후 남는 공간을 차지하도록 flex-1 을 준다.
             */}
            <div className="mt-5 flex-1">
              <ConsultForm variant="compact" />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

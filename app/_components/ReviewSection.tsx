'use client';

/**
 * ReviewSection.tsx — 실제 고객 후기 섹션 (원본 `sec-review` 대응)
 *
 * ▸ 역할
 *   - `app/_data/reviews.ts` 의 후기 6건을 가로로 끝없이 흐르는 마퀴(marquee)로 보여 준다.
 *   - 카드를 클릭하면 후기 전문 + 이미지 슬라이더가 들어 있는 모달이 열린다.
 *   - 섹션 앵커 id 는 `#reviews` (헤더 GNB 의 "실제 고객 후기" 링크 목적지).
 *
 * ▸ 인터랙션
 *   1) 무한 마퀴 — 후기 배열을 "원본 그룹 + 복제 그룹" 두 벌로 렌더링한 뒤,
 *      트랙 전체를 CSS `@keyframes marquee-left` 로 translateX(0) → translateX(-50%) 이동시킨다.
 *      복제 그룹이 원본 자리에 정확히 도달하는 순간 애니메이션이 되감기므로 이음새가 보이지 않는다.
 *   2) 마우스를 올리거나(hover) 내부 카드가 키보드 포커스를 받으면(focus-within) 흐름이 멈춘다.
 *      → globals.css 의 `.marquee-hover-pause` 훅 사용.
 *      모달이 열려 있는 동안에도 트랙에 `data-paused="true"` 를 주어 정지시킨다.
 *   3) 768px 미만(모바일)에서는 원본과 동일하게 마퀴를 끄고 flex-wrap 세로 목록으로 전환한다.
 *      (컴포넌트 하단의 <style> 블록에서 미디어쿼리로 처리 — Tailwind 유틸만으로는
 *       globals.css 의 `.animate-marquee` 규칙을 안전하게 덮어쓰기 어려워 직접 CSS 를 넣었다.)
 *   4) 카드 클릭 → 모달 오픈. 딤드 클릭 / Esc / 닫기 버튼으로 닫히고,
 *      열려 있는 동안 body 스크롤이 잠기며 Tab 포커스가 모달 안에서만 순환한다(포커스 트랩).
 *   5) 모달 이미지 슬라이더는 좌우 화살표 버튼 + 하단 점 페이지네이션 + ←/→ 키로 조작한다.
 *      이미지가 1장뿐이면 화살표와 페이지네이션을 숨긴다.
 *
 * ▸ 원본 대응
 *   truck-1st.com 의 고객 후기 마퀴 영역. 고객명·후기 내용·이미지는 모두 더미로 대체했고,
 *   실제 사진 자리에는 공용 <Placeholder /> 를 넣었다.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import Placeholder from './Placeholder';
import SectionTitle from './SectionTitle';
import { useInView } from '../_hooks/useInView';
import { reviews, type Review } from '../_data/reviews';

/* ---------------------------------------------------------------------------
 * 모바일(768px 미만) 전용 오버라이드 CSS
 *
 * globals.css 의 `.animate-marquee` 는 `display:flex; width:max-content; animation:...`
 * 을 레이어 밖에서 선언한다. Tailwind 유틸리티는 `@layer utilities` 안에 들어가므로
 * 레이어 밖 규칙을 이기지 못하는 경우가 있어, 확실하게 끄기 위해 !important 를 붙인
 * 전용 CSS 를 컴포넌트와 함께 삽입한다.
 *
 * 767.98px 을 경계로 잡은 이유: Tailwind 의 md 브레이크포인트가 정확히 768px 이므로
 * 768px 지점에서 두 규칙이 동시에 적용되는 것을 피한다.
 * ------------------------------------------------------------------------ */
const MOBILE_MARQUEE_CSS = `
@media (max-width: 767.98px) {
  /* 트랙: 애니메이션·가로 이동을 모두 끄고 컨테이너 폭에 맞춘다 */
  .review-marquee__track {
    width: 100% !important;
    animation: none !important;
    transform: none !important;
  }
  /* 그룹: 가로 한 줄 → 줄바꿈 되는 세로 목록으로 전환 */
  .review-marquee__group {
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }
  /* 복제 그룹은 모바일에서 중복 노출이므로 제거 */
  .review-marquee__group[data-clone='true'] {
    display: none;
  }
  /* 카드: 고정 폭 → 화면 폭에 맞춘 유동 폭 */
  .review-marquee__item {
    width: 100%;
    max-width: 420px;
  }
}
`;

/* ===========================================================================
 * 별점 표시 — 채워진 별 개수를 rating 으로 환산해 5개 중 일부만 색칠한다
 * ======================================================================== */
function StarRating({ rating }: { rating: number }) {
  // 소수점 평점(4.5 등)이 들어와도 별은 정수 개수로만 칠할 수 있으므로 반올림한다
  const filledCount = Math.round(rating);

  return (
    <span className="flex items-center gap-1">
      {/*
        별 아이콘 묶음 전체를 하나의 이미지로 읽히게 한다.
        별 5개가 각각 낭독되면 소음이 되므로 개별 svg 는 aria-hidden 처리.
      */}
      <span
        role="img"
        aria-label={`5점 만점에 ${rating}점`}
        className="flex items-center gap-0.5"
      >
        {[1, 2, 3, 4, 5].map((index) => (
          <svg
            key={index}
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={[
              'h-3.5 w-3.5',
              // 채워진 별은 주황, 나머지는 아주 옅은 회색
              index <= filledCount ? 'text-[#ffb300]' : 'text-black/15',
            ].join(' ')}
          >
            <path d="M10 1.6l2.55 5.17 5.7.83-4.12 4.02.97 5.68L10 14.62l-5.1 2.68.97-5.68L1.75 7.6l5.7-.83z" />
          </svg>
        ))}
      </span>

      {/* 숫자 점수 — 위 role="img" 밖에 두어야 중복 낭독 없이 그대로 읽힌다 */}
      <span className="text-xs font-semibold text-ink">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

/* ===========================================================================
 * 후기 카드 한 장
 *  - 전체를 <button> 으로 감싸 마우스 클릭과 키보드(Enter/Space) 모두로 열 수 있게 한다.
 *  - clone=true 인 복제 카드는 스크린리더 중복 낭독과 Tab 중복 정지를 막기 위해
 *    aria-hidden + tabIndex={-1} 을 준다(마우스 클릭은 그대로 동작).
 * ======================================================================== */
function ReviewCard({
  review,
  clone,
  onOpen,
}: {
  review: Review;
  /** 마퀴 복제 그룹에 속한 카드인지 */
  clone: boolean;
  /** 카드 클릭 시 호출 — 어떤 후기를, 어떤 버튼에서 열었는지 부모에 알린다 */
  onOpen: (review: Review, trigger: HTMLButtonElement) => void;
}) {
  return (
    <li className="review-marquee__item w-[300px] shrink-0 lg:w-[340px]">
      <button
        type="button"
        // 복제 카드는 보조기기·키보드 탐색 대상에서 제외한다
        aria-hidden={clone || undefined}
        tabIndex={clone ? -1 : 0}
        aria-label={`${review.customer}의 후기 "${review.title}" 자세히 보기`}
        onClick={(event) => onOpen(review, event.currentTarget)}
        className={[
          // 카드 골격 — 높이를 꽉 채워 마퀴 한 줄의 카드 높이를 맞춘다
          'flex h-full w-full flex-col gap-4 rounded-2xl border border-line bg-white p-6 text-left',
          'shadow-[0_2px_10px_rgba(0,0,0,0.04)]',
          // hover 시 살짝 떠오르며 그림자가 짙어진다 (reduced-motion 이면 globals.css 가 전환을 끈다)
          'transition duration-200 ease-out',
          'hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)]',
          'focus-visible:-translate-y-1',
          'cursor-pointer',
        ].join(' ')}
      >
        {/* ── 상단: 원형 아바타 + 고객명 + 별점 ───────────────────────── */}
        <div className="flex items-center gap-3">
          {/*
            Placeholder 는 w-full 로 부모를 채우므로,
            크기·원형 마스크는 감싸는 div 가 담당한다(유틸리티 충돌 방지).
          */}
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
            <Placeholder label="고객 프로필" ratio="1/1" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">
              {review.customer}
            </p>
            <div className="mt-1">
              <StarRating rating={review.rating} />
            </div>
          </div>
        </div>

        {/* ── 본문: 제목 + 내용 3줄 말줄임 ────────────────────────────── */}
        <div className="flex-1">
          <p className="line-clamp-1 text-base font-bold text-ink">
            {review.title}
          </p>
          {/* line-clamp-3 = 3줄까지만 노출하고 나머지는 "..." 처리 */}
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-sub">
            {review.content}
          </p>
        </div>

        {/* ── 하단: 뱃지 + 차량/업종 한 줄 요약 ───────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {review.badge}
          </span>
          <span className="truncate text-xs text-ink-sub">
            {review.vehicleLine}
          </span>
        </div>
      </button>
    </li>
  );
}

/* ===========================================================================
 * 섹션 본체
 * ======================================================================== */
export default function ReviewSection() {
  /**
   * activeReview — 현재 모달에 띄운 후기. null 이면 모달이 닫힌 상태.
   * (id 가 아니라 객체를 통째로 들고 있어야 원본/복제 어느 카드에서 눌러도 동일하게 동작한다.)
   */
  const [activeReview, setActiveReview] = useState<Review | null>(null);

  /** slide — 모달 이미지 슬라이더의 현재 인덱스(0부터) */
  const [slide, setSlide] = useState(0);

  /**
   * entered — 모달 등장 트랜지션용 플래그.
   * 모달이 DOM 에 붙은 "다음 프레임"에 true 로 바뀌면서 opacity/scale 이 전환된다.
   * (처음부터 true 면 트랜지션이 일어나지 않고 그냥 나타난다.)
   */
  const [entered, setEntered] = useState(false);

  /** 모달 컨테이너 DOM — 포커스 트랩에서 내부 포커스 가능 요소를 찾을 때 사용 */
  const dialogRef = useRef<HTMLDivElement>(null);

  /** 모달 닫기 버튼 DOM — 모달이 열릴 때 첫 포커스를 여기에 준다 */
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /** 모달을 연 카드 버튼 — 닫을 때 포커스를 원래 자리로 되돌리기 위해 보관 */
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  /** 모달 제목과 dialog 를 aria-labelledby 로 연결하기 위한 고유 id */
  const dialogTitleId = useId();

  /** 섹션 진입 시 제목/마퀴가 아래에서 살짝 떠오르는 효과 */
  const [sectionRef, sectionInView] = useInView<HTMLDivElement>({
    threshold: 0.15,
    once: true,
  });

  /* -------------------------------------------------------------------------
   * 모달 열기 / 닫기
   * ---------------------------------------------------------------------- */

  /** 카드 클릭 → 후기 저장, 슬라이드 0번으로 초기화, 트리거 버튼 기억 */
  const openModal = useCallback((review: Review, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setSlide(0);
    setActiveReview(review);
  }, []);

  /** 모달 닫기 — 상태를 비우고 포커스를 원래 카드로 되돌린다 */
  const closeModal = useCallback(() => {
    setEntered(false);
    setActiveReview(null);
    // 닫힌 뒤 포커스가 <body> 로 떨어지지 않도록 직전 트리거로 복귀시킨다
    lastTriggerRef.current?.focus();
  }, []);

  /* -------------------------------------------------------------------------
   * 모달이 열린 "다음 프레임"에 등장 트랜지션을 시작한다
   * ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!activeReview) return;

    // requestAnimationFrame 을 한 번 통과시켜야 브라우저가 초기 상태(opacity-0)를
    // 실제로 그린 뒤 전환을 인식한다.
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [activeReview]);

  /* -------------------------------------------------------------------------
   * 모달이 열려 있는 동안 body 스크롤 잠금
   *  - overflow:hidden 만 주면 스크롤바가 사라지면서 화면이 좌우로 흔들린다.
   *    사라질 스크롤바 폭만큼 padding-right 를 넣어 레이아웃 이동을 막는다.
   * ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!activeReview) return;

    const { body } = document;
    // 되돌리기 위해 원래 인라인 값을 보관
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // 화면 폭 - 문서 폭 = 세로 스크롤바 폭 (스크롤바가 없으면 0)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [activeReview]);

  /* -------------------------------------------------------------------------
   * 모달 키보드 처리 — Esc 닫기 / Tab 포커스 트랩 / ←→ 슬라이드 이동
   * ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!activeReview) return;

    // 이 모달이 다루는 이미지 장수 (화살표 키 사용 가능 여부 판단용)
    const imageCount = activeReview.imageLabels.length;

    const handleKeyDown = (event: KeyboardEvent) => {
      /* (1) Esc → 닫기 */
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      /* (2) ← / → → 이미지 슬라이드 이동 (2장 이상일 때만) */
      if (imageCount > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        setSlide((current) =>
          event.key === 'ArrowLeft'
            ? // 첫 장에서 왼쪽 → 마지막 장으로 순환
              (current - 1 + imageCount) % imageCount
            : // 마지막 장에서 오른쪽 → 첫 장으로 순환
              (current + 1) % imageCount,
        );
        return;
      }

      /* (3) Tab → 모달 안에서만 포커스가 순환하도록 가둔다 */
      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      // 현재 모달 안에서 포커스를 받을 수 있는 요소 목록 (숨김 요소 제외)
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        // 첫 요소에서 Shift+Tab → 마지막 요소로 감싼다
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        // 마지막 요소에서 Tab → 첫 요소로 감싼다
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeReview, closeModal]);

  /* -------------------------------------------------------------------------
   * 모달이 열리면 닫기 버튼으로 첫 포커스를 옮긴다
   * ---------------------------------------------------------------------- */
  useEffect(() => {
    if (!activeReview) return;
    closeButtonRef.current?.focus();
  }, [activeReview]);

  /** 모달에 표시할 이미지 장수 (모달이 닫혀 있으면 0) */
  const imageCount = activeReview?.imageLabels.length ?? 0;

  /** 이전 이미지 (첫 장에서 누르면 마지막 장으로 순환) */
  const goPrev = () =>
    setSlide((current) => (current - 1 + imageCount) % imageCount);

  /** 다음 이미지 (마지막 장에서 누르면 첫 장으로 순환) */
  const goNext = () => setSlide((current) => (current + 1) % imageCount);

  return (
    <section id="reviews" className="bg-white py-15 md:py-25">
      {/* 모바일 마퀴 해제용 CSS 삽입 (컴포넌트 스코프 규칙) */}
      <style dangerouslySetInnerHTML={{ __html: MOBILE_MARQUEE_CSS }} />

      <div
        ref={sectionRef}
        className={[
          'transition-all duration-700 ease-out',
          // 화면에 들어오기 전에는 살짝 아래에서 투명하게 대기
          sectionInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        ].join(' ')}
      >
        {/* 섹션 제목 — 컨테이너 폭 안에서 중앙 정렬 */}
        <div className="mx-auto w-full max-w-[1320px] px-5">
          <SectionTitle
            title="계약을 마친 "
            highlight="고객들의 이야기"
            description="상담부터 출고까지 직접 경험한 분들이 남겨 주신 후기를 모았습니다. 카드를 누르면 후기 전문을 볼 수 있습니다."
          />
        </div>

        {/*
          마퀴 뷰포트
           - overflow-hidden 으로 트랙이 넘치는 부분을 잘라 낸다.
           - .marquee-hover-pause : hover / focus-within 시 흐름 정지 (globals.css)
           - 모바일에서는 좌우 여백이 필요하므로 px-5 를 준다(데스크톱은 0 → 화면 끝까지 흐름).
        */}
        <div className="review-marquee marquee-hover-pause relative overflow-hidden px-5 md:px-0">
          <div
            className="review-marquee__track animate-marquee gap-6"
            // 후기 12장(6장×2벌)이 천천히 흐르도록 55초를 준다
            style={{ '--marquee-duration': '55s' } as CSSProperties}
            // 모달이 열려 있는 동안에는 배경 마퀴를 정지시켜 시선 분산을 막는다
            data-paused={activeReview ? 'true' : undefined}
          >
            {/* 원본 그룹 — 실제로 읽히고 Tab 으로 접근되는 카드들 */}
            <ul className="review-marquee__group flex shrink-0 gap-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  clone={false}
                  onOpen={openModal}
                />
              ))}
            </ul>

            {/*
              복제 그룹 — 무한 루프의 "이음새"를 채우는 시각적 사본.
              내용이 동일하므로 aria-hidden 으로 중복 낭독을 막는다.
              모바일에서는 CSS 로 display:none 처리된다.
            */}
            <ul
              className="review-marquee__group flex shrink-0 gap-6"
              data-clone="true"
              aria-hidden="true"
            >
              {reviews.map((review) => (
                <ReviewCard
                  key={`${review.id}-clone`}
                  review={review}
                  clone
                  onOpen={openModal}
                />
              ))}
            </ul>
          </div>

          {/*
            좌우 페이드 마스크 — 카드가 화면 끝에서 툭 잘리지 않고 흰색으로 스며들게 한다.
            클릭을 가로막지 않도록 pointer-events-none 필수. 마퀴가 꺼지는 모바일에서는 숨긴다.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-white to-transparent md:block lg:w-28"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-white to-transparent md:block lg:w-28"
          />
        </div>
      </div>

      {/* =====================================================================
        후기 상세 모달
        activeReview 가 있을 때만 DOM 에 그린다(닫히면 언마운트 → 상태 정리 자동).
      ===================================================================== */}
      {activeReview ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          {/* 딤드 배경 — 클릭하면 닫힌다. 장식이므로 aria-hidden */}
          <div
            aria-hidden="true"
            onClick={closeModal}
            className={[
              'absolute inset-0 bg-black/50 transition-opacity duration-200',
              entered ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />

          {/* 모달 본체 */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className={[
              'relative z-10 flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden',
              'rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]',
              // 페이드 + 스케일 인 트랜지션
              'transition-all duration-200 ease-out',
              entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
            ].join(' ')}
          >
            {/* ── 헤더: 고객 정보 + 닫기 버튼 ─────────────────────────── */}
            <div className="flex items-start gap-3 border-b border-line p-5 md:p-6">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                <Placeholder label="고객 프로필" ratio="1/1" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">
                  {activeReview.customer}
                </p>
                <div className="mt-1">
                  <StarRating rating={activeReview.rating} />
                </div>
              </div>

              {/* 닫기 버튼 — 모달이 열릴 때 첫 포커스를 받는 요소 */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeModal}
                aria-label="후기 상세 닫기"
                className="-mt-1 -mr-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-sub transition hover:bg-surface hover:text-ink"
              >
                {/* X 아이콘 (인라인 SVG) */}
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="h-5 w-5"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* ── 본문: 스크롤 영역 ──────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {/* 이미지 슬라이더 */}
              <div className="relative overflow-hidden rounded-xl">
                {/*
                  트랙: 이미지를 가로로 이어 붙이고 translateX 로 밀어서 넘긴다.
                  슬라이드 1장이 100% 폭이므로 이동량은 (인덱스 × 100%).
                */}
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${slide * 100}%)` }}
                >
                  {activeReview.imageLabels.map((label, index) => (
                    <div
                      key={label}
                      className="w-full shrink-0"
                      // 현재 보이지 않는 슬라이드는 보조기기에서 숨긴다
                      aria-hidden={index !== slide || undefined}
                    >
                      <Placeholder label={label} ratio="4/3" />
                    </div>
                  ))}
                </div>

                {/* 이미지가 2장 이상일 때만 좌우 화살표를 노출한다 */}
                {imageCount > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="이전 이미지 보기"
                      className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-ink shadow-md transition hover:bg-white"
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
                        className="h-5 w-5"
                      >
                        <path d="M15 5l-7 7 7 7" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="다음 이미지 보기"
                      className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-ink shadow-md transition hover:bg-white"
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
                        className="h-5 w-5"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                ) : null}
              </div>

              {/* 하단 점 페이지네이션 — 역시 2장 이상일 때만 */}
              {imageCount > 1 ? (
                <div className="mt-3 flex justify-center gap-2">
                  {activeReview.imageLabels.map((label, index) => (
                    <button
                      key={`dot-${label}`}
                      type="button"
                      onClick={() => setSlide(index)}
                      aria-label={`${index + 1}번째 이미지로 이동`}
                      // 현재 슬라이드를 보조기기에 알린다
                      aria-current={index === slide ? 'true' : undefined}
                      className={[
                        'h-2 cursor-pointer rounded-full transition-all duration-200',
                        // 현재 점만 가로로 길고 진하게
                        index === slide ? 'w-5 bg-primary' : 'w-2 bg-black/15',
                      ].join(' ')}
                    />
                  ))}
                </div>
              ) : null}

              {/* 후기 제목 + 전문 */}
              <h3
                id={dialogTitleId}
                className="mt-6 text-lg font-extrabold text-ink md:text-xl"
              >
                {activeReview.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-sub md:text-base">
                {activeReview.content}
              </p>

              {/* 계약 정보 요약 */}
              <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl bg-surface px-4 py-3">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {activeReview.badge}
                </span>
                <span className="text-xs text-ink-sub md:text-sm">
                  {activeReview.vehicleLine}
                </span>
              </div>
            </div>

            {/* ── 하단 고정 CTA ──────────────────────────────────────── */}
            <div className="border-t border-line p-5 md:p-6">
              <a
                href="#consult"
                // 앵커로 이동하기 전에 모달을 닫아야 스크롤 잠금이 풀린다
                onClick={closeModal}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary-hover md:text-base"
              >
                이 조건으로 상담받기
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

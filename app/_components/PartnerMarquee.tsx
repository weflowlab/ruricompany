/**
 * PartnerMarquee — 제휴 금융사 로고가 좌측으로 무한히 흐르는 배너 섹션
 *
 * 역할
 *  - 원본 사이트 하단의 `partner-wrap`(제휴사 로고 띠)에 대응하는 섹션이다.
 *  - `app/_data/partners.ts` 의 제휴사 이름 12개를 로고 자리(Placeholder)로 렌더링하고,
 *    같은 목록을 "두 벌" 이어 붙여 CSS 애니메이션으로 끊김 없이 순환시킨다.
 *
 * 인터랙션
 *  - JS 를 전혀 쓰지 않는다. globals.css 의 `@keyframes marquee-left`
 *    (translateX(0) → translateX(-50%)) 와 `.animate-marquee` 유틸만으로 동작하므로
 *    **'use client' 가 필요 없는 서버 컴포넌트**다.
 *  - 마우스를 올리거나 내부 요소가 키보드 포커스를 받으면 흐름이 멈춘다.
 *    (부모에 붙인 `.marquee-hover-pause` 클래스가 globals.css 에서 처리)
 *  - `prefers-reduced-motion: reduce` 사용자에게는 globals.css 의 미디어쿼리가
 *    `.animate-marquee { animation:none; transform:none }` 를 강제하므로
 *    첫 번째 그룹이 그대로 정지 상태로 보인다. (이 컴포넌트에서 따로 처리할 필요 없음)
 *
 * 원본 대응
 *  - 페이지 구조 9번 "제휴사" 섹션.
 *
 * 무한 루프가 매끄럽게 이어지는 원리(중요)
 *  - 트랙(`.animate-marquee`)은 `width: max-content` 이고 -50% 만큼 이동한다.
 *    즉 "트랙 전체 폭의 정확히 절반"이 첫 번째 그룹의 폭과 같아야 이음새가 보이지 않는다.
 *  - 그래서 트랙에는 `gap` 을 쓰지 않는다. gap 을 쓰면 그룹 사이에도 gap 이 한 번 더 껴서
 *    (전체폭/2) 와 (한 그룹의 폭) 이 gap 의 절반만큼 어긋나 매 바퀴마다 미세하게 튄다.
 *  - 대신 각 아이템이 좌우 패딩을 스스로 갖게 해서 모든 아이템 폭을 동일하게 맞췄다.
 */

import Placeholder from "./Placeholder";
import { partners } from "../_data/partners";

/** 마퀴 한 바퀴에 걸리는 시간. 로고 24개(12개 × 2벌)가 천천히 흐르도록 30초로 잡았다. */
const MARQUEE_DURATION = "30s";

export default function PartnerMarquee() {
  /*
   * 원본 배열을 두 벌로 복제한다.
   * - copy 0: 실제로 읽히는 그룹 (스크린리더가 제휴사 이름을 낭독)
   * - copy 1: 시각적 연속성만을 위한 복제본 → aria-hidden 으로 중복 낭독을 막는다
   */
  const copies = [0, 1] as const;

  return (
    <section
      aria-labelledby="partner-heading"
      className="overflow-hidden bg-white py-15 md:py-25"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5">
        {/* ── 섹션 상단의 작은 라벨 ─────────────────────────────────────────
            큰 h2 를 쓰는 다른 섹션과 달리, 원본에서도 로고 띠 위에 작은 캡션만 놓인다.
            시각적으로는 작지만 마크업상으로는 이 섹션의 제목 역할을 하므로 h2 로 둔다. */}
        <h2
          id="partner-heading"
          className="text-center text-sm font-semibold tracking-[0.2em] text-ink-sub md:text-base"
        >
          제휴 금융사
        </h2>

        {/* 라벨 아래 짧은 보조 설명 — 더미 문구 */}
        <p className="mt-3 text-center text-xs leading-relaxed text-ink-sub md:text-sm">
          다양한 금융사와 함께 조건을 비교해 가장 유리한 견적을 안내해 드립니다.
        </p>
      </div>

      {/*
       * ── 마퀴 영역 ──────────────────────────────────────────────────────
       * relative: 좌우 끝 페이드 마스크를 absolute 로 겹치기 위한 기준점
       * marquee-hover-pause: hover / focus-within 시 내부 .animate-marquee 정지 (globals.css)
       * 컨테이너(max-w-1320px) 밖으로 넓게 흐르도록 일부러 inner 밖에 둔다.
       */}
      <div className="marquee-hover-pause relative mt-8 overflow-hidden md:mt-12">
        {/* 좌측 페이드 마스크 — 흰 배경에서 로고가 서서히 사라지는 것처럼 보이게 한다.
            pointer-events-none 이라 아래 콘텐츠의 hover/클릭을 막지 않는다. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent md:w-32"
        />
        {/* 우측 페이드 마스크 (방향만 반대) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent md:w-32"
        />

        {/*
         * 트랙: globals.css 의 .animate-marquee 가
         *   display:flex / width:max-content / animation: marquee-left var(--marquee-duration)
         * 를 담당한다. 속도만 CSS 변수로 주입한다.
         * (TypeScript 는 CSSProperties 에 임의의 `--*` 키를 허용하지 않으므로 캐스팅한다.)
         */}
        <ul
          className="animate-marquee items-center"
          style={
            { "--marquee-duration": MARQUEE_DURATION } as React.CSSProperties
          }
        >
          {copies.map((copy) =>
            partners.map((name) => (
              <li
                /* 두 벌을 렌더링하므로 key 에 복제본 번호를 함께 넣어 충돌을 피한다 */
                key={`${copy}-${name}`}
                /*
                 * 복제본(copy 1)은 화면 연속성을 위한 장식이므로 낭독에서 제외한다.
                 * aria-hidden 은 boolean 이 아니라 문자열이어야 하므로 undefined 로 분기.
                 */
                aria-hidden={copy === 1 ? "true" : undefined}
                /*
                 * shrink-0: flex 트랙 안에서 로고가 찌그러지지 않도록 고정
                 * px-5(md:px-7): gap 대신 쓰는 좌우 여백 → 모든 아이템 폭이 동일해져 이음새가 사라짐
                 */
                className="shrink-0 px-5 md:px-7"
              >
                {/*
                 * 폭 고정용 래퍼.
                 * Placeholder 내부가 `w-full` 이므로, 폭은 이렇게 바깥에서 잡아 준다.
                 * (className 으로 w-[160px] 을 넘기면 Tailwind 규칙 순서에 따라
                 *  w-full 에 덮일 수 있어 래퍼 방식이 안전하다.)
                 */}
                <div className="w-[160px]">
                  {/* 로고 자리. 실제 이미지는 쓰지 않고 라벨에 제휴사 이름을 노출한다.
                      가로형 로고에 맞춰 3/1 비율. */}
                  <Placeholder label={name} ratio="3/1" rounded />
                </div>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}

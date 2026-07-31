"use client";

/**
 * TextBanner — 섹션 사이를 끊어 주는 브랜드 그린 가로 띠 배너
 *
 * 역할
 *  - 차량 목록 섹션과 섹션 사이에 들어가는 "한 줄 카피" 영역.
 *    작은 상단 문구(리드)와 큰 메인 문구(카피) 두 단으로 구성된다.
 *  - 배경 전체가 primary 그린이라 페이지를 위에서 아래로 훑을 때
 *    시선을 한 번 끊어 주는 리듬 역할을 한다.
 *
 * 인터랙션
 *  - 스크롤로 화면에 들어오는 순간 useInView 가 true 가 되면서
 *    아래에서 위로 떠오르는 페이드업(opacity + translateY)이 실행된다.
 *  - 리드 문구와 메인 문구에 서로 다른 transition-delay 를 줘서
 *    아주 짧은 시차(0ms / 120ms)로 순차 등장하게 했다.
 *  - `prefers-reduced-motion: reduce` 사용자는 globals.css 의 전역 규칙이
 *    transition-duration/delay 를 !important 로 0 에 가깝게 만들기 때문에
 *    애니메이션 없이 곧바로 최종 상태로 나타난다. (콘텐츠가 숨겨지는 일은 없음)
 *
 * 원본 대응
 *  - 원본 사이트의 `text-banner` 영역(초록 배경 가로 띠 + 2단 문구).
 *    원본 문구는 그대로 쓰지 않고 같은 성격의 더미 카피로 교체했다.
 *
 * 이미지 사용 없음
 *  - 배경 장식은 이미지가 아니라 CSS `repeating-linear-gradient` 사선 패턴으로 처리한다.
 */

import { useInView } from "@/app/_hooks/useInView";

export default function TextBanner() {
  /*
   * 배너 전체를 감싸는 요소를 관찰한다.
   *  - threshold 0.3: 띠 높이가 낮은 편이라 30% 정도 보였을 때 시작해야 자연스럽다.
   *  - once true: 등장 효과는 한 번만 재생하고 이후에는 관찰을 해제한다.
   */
  const [bannerRef, inView] = useInView<HTMLElement>({
    threshold: 0.3,
    once: true,
  });

  /*
   * 페이드업 공통 클래스 문자열.
   * inView 이전에는 opacity-0 + 아래로 살짝 내려간 상태(translate-y-6),
   * inView 이후에는 제자리(opacity-100 / translate-y-0)로 이동한다.
   * transform 과 opacity 만 애니메이션하므로 리페인트 비용이 낮다.
   */
  const fadeUp = [
    "transition-all duration-700 ease-out",
    inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
  ].join(" ");

  return (
    <section
      ref={bannerRef}
      /*
       * 시각 장식 성격의 배너지만 안내 문구를 담고 있으므로 랜드마크로 이름을 붙여 준다.
       * (스크린리더 사용자가 섹션 목록에서 구분할 수 있게)
       */
      aria-label="출고 안내 배너"
      /*
       * relative + overflow-hidden: 아래 사선 패턴 레이어를 안쪽에 가둬 둔다.
       * 세로 패딩은 모바일 40px(py-10) / 데스크톱 64px(py-16).
       */
      className="relative overflow-hidden bg-primary py-10 md:py-16"
    >
      {/*
        배경 사선 패턴 레이어.
        - 흰색 아주 옅은(6%) 줄무늬를 135도 방향으로 반복해 밋밋한 단색을 살짝 깨 준다.
        - 순수 장식이므로 aria-hidden 처리하고 클릭도 막는다(pointer-events-none).
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 2px, transparent 2px, transparent 14px)",
        }}
      />

      {/* 실제 문구 영역 — 패턴 레이어보다 위에 오도록 relative + z-10 */}
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 text-center">
        {/* 상단 작은 리드 문구: 흰색 반투명 알약 배지 형태 (지연 0ms — 가장 먼저 등장) */}
        <p
          className={`inline-block rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-white md:text-sm ${fadeUp}`}
          style={{ transitionDelay: "0ms" }}
        >
          계약 완료 후 평균 7일 이내 출고
        </p>

        {/* 메인 큰 문구: 모바일 1.3rem → 태블릿 1.8rem → 데스크톱 2.4rem (지연 120ms) */}
        <p
          className={`mt-4 text-[1.3rem] leading-snug font-extrabold text-white md:mt-5 md:text-[1.8rem] lg:text-[2.4rem] ${fadeUp}`}
          style={{ transitionDelay: "120ms" }}
        >
          복잡한 비교는 저희가 대신합니다
          {/*
            모바일에서는 줄을 나눠 두 줄로, 데스크톱에서는 한 줄로 이어 보이게 하려고
            <br> 를 md 이상에서 숨긴다. 대신 공백 한 칸을 넣어 단어가 붙지 않게 한다.
          */}
          <br className="md:hidden" />
          <span className="hidden md:inline"> </span>
          <span className="text-white/85">
            필요한 건 조건에 맞는 한 대뿐입니다
          </span>
        </p>
      </div>
    </section>
  );
}

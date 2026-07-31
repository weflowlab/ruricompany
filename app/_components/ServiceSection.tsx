"use client";

/**
 * ServiceSection — "서비스 안내" 3열 비교 섹션 (id="services")
 *
 * 왜 있나 (클라이언트 구글폼 응답 반영)
 *  - 6번 "섹션 구성"에서 **서비스/제품 소개** 섹션을 요청했다.
 *  - 3번 업종이 "신차할부 / 신차장기렌트 / 신차리스" 3종이므로,
 *    이 3가지를 나란히 놓고 성격을 비교하는 카드 섹션이 그 요청의 정답이다.
 *  - 데이터는 `app/_data/services.ts` 의 `servicePlans`(3개)를 그대로 쓴다.
 *
 * ============================================================================
 * ★ 삭제 → 복구 이력 (2026-07-30)
 * ============================================================================
 * 이 섹션은 한 번 페이지에서 빠졌다가 다시 들어왔다.
 *   - 뺀 이유 : 카드가 무거워 화면이 길어졌다.
 *   - 되살린 이유 : 빼고 나니 구글폼 6번이 명시한 "서비스/제품 소개"를 담당하는
 *     화면이 사라졌다. 업종이 3종인데 세 방식의 차이를 설명하는 자리가 없으면
 *     방문자는 "뭘 골라야 하지"에서 막힌다.
 *
 * 그래서 같은 카드를 그대로 되돌리지 않고 **무게를 덜어서** 복구했다.
 *   [삭제] 카드 상단 128px 아이콘 원형 + Placeholder
 *          → 회색 이미지 자리 3개가 나란히 놓이는 게 조잡함(8-1)의 주원인이었다.
 *          대신 서비스명 옆에 작은 파스텔 블루 점 하나만 남겼다.
 *   [축소] 설명문 2~3문장 → 한 문장 (`summary`)
 *   [축소] 특징 4개 → 3개
 *   결과적으로 카드 높이가 대략 절반이 되어, 3장이 한 화면에 들어온다.
 *
 * 컬러 (13·14번: 블루 계열 + 파스텔톤 / 신뢰감 있고 전문적)
 *  - 예전에는 카드마다 민트/크림/라벤더 파스텔을 나눠 썼는데, 색조가 3개로 흩어져
 *    "전문적인" 톤을 깎았다. 지금은 **블루 한 색조 안에서** 명도만 나눈다.
 *    섹션 배경 = 파스텔 블루(bg-surface) / 카드 = 흰색 / 강조 = primary.
 *
 * 절대 원칙 — 금액 미노출 (8-1)
 *  - 차량가·월 납입금·이자율·개월수·선수금 비율 같은 **숫자를 일절 쓰지 않는다.**
 *    비교 축을 "얼마인가"가 아니라 "어떤 성격인가 / 누구에게 맞는가"로 잡았다.
 *  - 금액이 궁금한 고객은 하단 상담 앵커(#hero)로 흘려보낸다. 이는 4번
 *    "예약·상담 문의 유도"와도 방향이 같다.
 *  - CTA 는 섹션 하단에 **딱 하나만** 둔다. 카드마다 버튼을 달면 버튼 남발이 된다.
 *
 * 인터랙션
 *  - useInView(IntersectionObserver)로 그리드가 화면에 들어오면 카드가
 *    index * 100ms 간격으로 순차 페이드업(stagger)한다. → 브라우저 API 사용 = 'use client'.
 *  - `prefers-reduced-motion: reduce` 환경에서는 globals.css 전역 규칙이
 *    transition-duration / delay 를 눌러 주므로 시차 없이 즉시 최종 상태로 표시된다.
 */

import Image from "next/image";

import SectionTitle from "@/app/_components/SectionTitle";
import { servicePlans } from "@/app/_data/services";
import { useInView } from "@/app/_hooks/useInView";

/** 카드 한 장당 늘어나는 등장 지연 시간(ms) — 3장이므로 0 / 100 / 200ms */
const STAGGER_MS = 100;

export default function ServiceSection() {
  /*
   * 카드 그리드(ul)를 관찰 대상으로 삼는다.
   *  - threshold 0.2 : 그리드의 20% 가 보이면 등장 시작.
   *    제목을 읽는 사이에 카드가 자연스럽게 떠오르는 타이밍이다.
   *  - once true     : 한 번 등장하면 다시 숨기지 않는다(스크롤 되감을 때 깜빡임 방지).
   */
  const [gridRef, inView] = useInView<HTMLUListElement>({
    threshold: 0.2,
    once: true,
  });

  return (
    <section
      id="services"
      /*
       * 앵커(#services)로 이동했을 때 스크린리더가 섹션 이름을 읽어 주도록 짧은 이름을 붙인다.
       * (SectionTitle 의 h2 를 aria-labelledby 로 참조하면 설명문까지 딸려 읽힌다.)
       */
      aria-label="서비스 안내"
      /*
       * bg-surface(파스텔 블루) 고정.
       * 앞뒤 섹션이 흰 배경(히어로 / 추천 차량)이라, 여기서 색을 깔아야
       * 흰 → 파스텔 → 흰 리듬이 생기고 흰 카드의 경계도 또렷해진다.
       * 상하 패딩 60px / 100px 은 다른 섹션과 동일한 리듬이다.
       */
      className="bg-navy-soft py-15 md:py-25"
    >
      {/* 공통 컨테이너: 최대 1320px, 좌우 여백 20px */}
      <div className="mx-auto w-full max-w-[1320px] px-5">
        {/*
          섹션 제목.
          "무엇을 파는가"가 아니라 "어떤 방식이 있는가"로 말해야
          금액 없이도 고객이 읽을 이유가 생긴다.
        */}
        <SectionTitle
          /* "신차를 타는 세 가지 방법" 에서 교체(2026-07-30 클라이언트 확정).
             방문자를 주어로 세워 설명문("맞고 안 맞음의 차이")과 한 문맥으로 잇는다 */
          title="나에게 맞는 방식은 "
          highlight="따로 있습니다"
          /* 배열 한 칸 = 한 줄. 두 문장을 각각의 줄로 끊어 읽기 리듬을 준다 (클라이언트 요청) */
          description={[
            "할부·리스·장기렌트는 좋고 나쁨이 아니라 상황에 맞고 안 맞음의 차이입니다.",
            "각 방식의 성격을 먼저 비교해 보세요.",
          ]}
        />

        {/*
          서비스 비교 카드 그리드
          - ul/li 로 마크업해 "3개 항목의 목록" 구조를 보조기기에 전달한다.
          - 모바일(~767px): 1열 세로 스택 / 태블릿 이상: 3열.
          - grid 는 같은 행의 셀 높이를 자동으로 맞춰 주므로,
            안쪽 article 에 h-full 만 걸면 카드 3장 높이가 완전히 정렬된다(8-1 대응).
        */}
        <ul
          ref={gridRef}
          className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3 md:gap-6"
        >
          {servicePlans.map((plan, index) => (
            <li
              key={plan.id}
              /*
               * 순차 등장 지연.
               * inView 이전에는 0ms 로 두어 아직 등장하지 않은 카드가
               * 엉뚱한 타이밍에 반응하지 않게 한다.
               */
              style={{
                transitionDelay: inView ? `${index * STAGGER_MS}ms` : "0ms",
              }}
              className={[
                // 등장 전환: 투명도 + 세로 이동만 대상으로 지정
                "transition-[opacity,transform] duration-600 ease-out",
                inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0",
              ].join(" ")}
            >
              {/* ── 서비스 카드 본체 ──────────────────────────────────────────
                  h-full   : 그리드 셀(=행 높이)을 꽉 채워 3장 높이를 맞춘다
                  flex-col : 위에서 아래로 정보를 쌓고, features 가 남는 높이를 흡수
                  hover 는 그림자만 아주 약하게 — 과한 움직임은 "전문적인" 톤을 깎는다.
                  그림자는 Tailwind 기본 유틸(shadow-sm → hover:shadow-lg)만 쓴다.
                  임의 rgba 값을 박아 넣으면 globals.css 의 토큰 체계 밖으로 색이 새어 나간다. */}
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-shadow duration-300 ease-out hover:shadow-lg">
                {/* ── 0) 카드 상단 이미지 (2026-07-31 실사진 적용) ───────────────
                    이 자리는 원래 128px 아이콘 원형 + Placeholder 였다가 "회색 이미지
                    자리 3개가 조잡하다"는 이유로 뺐던 곳이다(파일 상단 이력 참고).
                    실사진이 들어오면서 되살렸지만, 카드가 다시 길어지지 않도록
                    정사각·4:3 이 아니라 **21:9 가로 띠**로 얇게 쓴다.

                    - full-bleed: 카드 안쪽 여백(px-6)을 무시하고 좌우 끝까지 채운다.
                      그래서 패딩을 article 에서 걷어내고 아래 콘텐츠 블록으로 옮겼다.
                    - article 에 overflow-hidden 을 줘서 이미지 위쪽 모서리가
                      카드의 rounded-2xl 을 따라 잘리게 한다.
                    - object-cover: 원본은 16:9 라 21:9 틀에서 위아래가 잘린다.
                      세 장 모두 피사체가 가운데 있어 기본 center crop 으로 충분하다. */}
                <div className="relative aspect-[21/9] w-full shrink-0 bg-navy-soft">
                  <Image
                    src={plan.image}
                    alt={plan.imageAlt}
                    fill
                    /* 태블릿 이상 3열(최대 1320px ÷ 3 ≈ 440px), 그 미만은 1열이라 화면 폭 전체 */
                    sizes="(min-width: 768px) 440px, 100vw"
                    className="object-cover"
                  />
                </div>

                {/* 텍스트 블록 — 이미지가 full-bleed 라 패딩을 여기서 준다 */}
                <div className="flex flex-1 flex-col p-6 md:p-7">
                {/*
                  1) 서비스명 — 카드에서 가장 굵고 큰 글자.
                  앞의 작은 원은 예전 128px 아이콘 자리를 대신하는 최소한의 표식이다.
                  색은 세 장 모두 같은 파스텔 블루다. 카드마다 색을 다르게 주면
                  "무엇이 더 중요한가"라는 없는 위계가 생긴다.
                */}
                <h3 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink md:text-2xl">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
                  />
                  {plan.name}
                </h3>

                {/* 2) 한 줄 요약(tagline) — 브랜드 블루로 짧게. 카드의 성격을 한 번에 알린다 */}
                <p className="mt-2 text-sm font-bold text-primary md:text-base">
                  {plan.tagline}
                </p>

                {/* 3) 본문 — 한 문장. 회색 본문 톤 */}
                <p className="mt-2.5 text-sm leading-relaxed text-ink-sub md:text-[15px]">
                  {plan.summary}
                </p>

                {/*
                  4) 특징 3개 체크 리스트
                  - flex-1: 카드마다 문장 길이가 달라 생기는 높이 차이를 이 목록이 흡수한다.
                    덕분에 아래 구분선과 "이런 분께 맞습니다" 블록이 3장 모두 같은 선에 놓인다.
                  - 체크 아이콘은 외부 라이브러리 없이 인라인 SVG 로 그리고,
                    의미 없는 장식이므로 aria-hidden 처리한다(목록 구조만으로 충분히 전달된다).
                */}
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        /* mt-0.5 로 첫 줄 글자 높이에 광학적으로 맞춘다 */
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span className="text-[13px] leading-relaxed text-ink md:text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/*
                  5) 하단 구분선 + 추천 대상
                  - dl(정의 목록)로 "라벨 - 값" 관계를 보조기기에 전달한다.
                */}
                <dl className="mt-5 border-t border-line pt-4">
                  <dt className="text-xs font-bold tracking-wide text-ink-sub">
                    이런 분께 맞습니다
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed font-semibold text-ink md:text-[15px]">
                    {plan.bestFor}
                  </dd>
                </dl>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {/*
          섹션 하단 안내 + 상담 앵커 1개
          - 3가지를 비교해도 결론을 못 내리는 고객이 가장 많다. 그 고객을 그대로
            상담으로 연결하는 것이 이 섹션의 최종 목적이다(구글폼 4번 "예약·상담 문의 유도").
          - 섹션 배경이 파스텔 블루(surface)라 안내 박스는 흰색으로 둔다.
            예전에는 반대로 흰 섹션 위에 파스텔 박스였는데, 배경색이 바뀌면
            같은 색끼리 겹쳐 박스 경계가 사라진다.
        */}
        <div className="mt-8 flex flex-col items-start gap-5 rounded-2xl border border-line bg-surface px-7 py-8 text-left md:mt-12 md:flex-row md:items-center md:justify-between md:gap-8 md:px-10 md:py-10">
          {/*
            문구를 두 줄로 나눈다.
            첫 줄(굵게)이 고객의 상태를 짚고, 둘째 줄(회색)이 무엇을 해 주는지 알린다.
            <br> 로 줄을 강제하지 않고 블록 요소 2개로 쌓아, 화면 폭에 따라
            줄바꿈 위치가 자연스럽게 잡히게 했다.
          */}
          <div className="md:max-w-[620px]">
            <p className="text-sm leading-relaxed font-semibold text-ink md:text-base">
              어떤 방식이 맞는지 모르겠다면, 지금 상황만 알려 주세요.
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-sub md:text-sm">
              운행 목적과 명의 조건을 확인한 뒤, 부담이 가장 적은 방식부터
              안내해 드립니다.
            </p>
          </div>

          {/*
            히어로 견적 폼(#hero)으로 이동하는 앵커.
            부드러운 스크롤은 globals.css 의 scroll-behavior 가 처리한다.
            shrink-0 으로 데스크톱 가로 배치 시 버튼 문구가 두 줄로 깨지지 않게 한다.
            화살표는 "여기서 끝이 아니라 다음 단계로 이어진다"는 신호이므로
            장식으로 보고 aria-hidden 처리한다(문구만 읽히면 충분하다).
          */}
          <a
            href="#hero"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover md:text-base"
          >
            맞는 방식 상담받기
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

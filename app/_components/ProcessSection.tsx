"use client";

/**
 * ProcessSection — "이용 절차" 5단계 섹션 (id="process")
 *
 * 역할
 *  - 상담 신청부터 차량 출고까지의 과정을 5개 스텝 카드로 보여 준다.
 *  - 데이터는 `app/_data/process.ts` 의 `processSteps` 를 그대로 사용한다.
 *  - GNB 의 "이용 절차" 앵커(#process) 목적지이므로 section 에 id 를 부여했다.
 *
 * 배경 구조 (원본 대응)
 *  - 원본은 "배경 사진 + 연노랑(#F9FCEF) 90% 오버레이" 2겹 구조였다.
 *    이 클론은 실제 이미지를 쓰지 않으므로 배경 사진 자리를 <Placeholder /> 로 깔고,
 *    그 위에 동일한 색/투명도의 오버레이를 덮어 같은 인상을 만든다.
 *  - 두 레이어 모두 absolute inset-0 이며 순수 장식이라 pointer-events 를 막았다.
 *
 * 레이아웃
 *  - 모바일/태블릿(~1023px): 세로 1열. 카드 사이를 "세로 점선"으로 연결한다.
 *  - 데스크톱(1024px~): 가로 5열. 카드 사이를 "오른쪽 화살표 SVG"로 연결한다.
 *    연결선은 의미 없는 장식이므로 전부 aria-hidden 처리했다.
 *
 * 인터랙션
 *  - 목록이 화면에 들어오면(useInView) 1번 → 5번 카드가 index * 120ms 간격으로
 *    순차 페이드업(stagger)한다.
 *  - 카드에 마우스를 올리면 살짝 떠오르고(-translate-y-1) 그림자가 진해진다.
 *  - `prefers-reduced-motion: reduce` 는 globals.css 전역 규칙이
 *    transition-duration / transition-delay 를 !important 로 눌러 주므로
 *    시차 없이 즉시 최종 상태로 표시된다.
 */

import Placeholder from "@/app/_components/Placeholder";
import SectionTitle from "@/app/_components/SectionTitle";
import { processSteps } from "@/app/_data/process";
import { useInView } from "@/app/_hooks/useInView";

/** 카드가 순차 등장할 때 한 장당 늘어나는 지연 시간(ms) */
const STAGGER_MS = 120;

export default function ProcessSection() {
  /*
   * 스텝 목록(ol)을 관찰 대상으로 삼는다.
   *  - threshold 0.15: 카드가 5장이라 목록이 길다. 15% 만 보여도 시작해야
   *    데스크톱에서 마지막 카드가 화면 밖에 있는 채로 애니메이션이 끝나지 않는다.
   *  - once true: 등장 효과는 1회만.
   */
  const [listRef, inView] = useInView<HTMLOListElement>({
    threshold: 0.15,
    once: true,
  });

  return (
    <section
      id="process"
      /*
       * 앵커(#process)로 이동했을 때 스크린리더가 섹션 이름을 읽어 주도록 이름을 붙인다.
       * SectionTitle 이 렌더하는 h2 를 aria-labelledby 로 참조하면
       * 그 아래 설명문까지 이름에 딸려 읽히므로, 짧은 aria-label 을 직접 지정했다.
       */
      aria-label="이용 절차"
      /*
       * relative: 배경 2겹 레이어의 기준점.
       * isolate: 내부 z-index 가 바깥 섹션(고정 헤더 등)에 간섭하지 않도록 스택 문맥을 분리.
       * overflow-hidden: 배경 레이어가 섹션 밖으로 새지 않게 잘라 낸다.
       */
      className="relative isolate overflow-hidden py-15 md:py-25"
    >
      {/* ── 배경 1겹: 이미지 자리 (실제 사진 대신 플레이스홀더) ───────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Placeholder
          label="이용 절차 섹션 배경 이미지 (물류 현장 전경)"
          /*
           * absolute inset-0 로 높이가 이미 정해지므로 비율 계산은 필요 없다.
           * ratio="auto" 를 넘겨 aspect-ratio 가 높이를 덮어쓰지 않게 한다.
           */
          ratio="auto"
          className="h-full border-0"
        />
      </div>

      {/* ── 배경 2겹: 연노랑 오버레이 90% (원본의 #F9FCEF 오버레이 재현) ──────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#F9FCEF]/90"
      />

      {/* ── 실제 콘텐츠 (배경 레이어보다 위) ─────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5">
        {/* 섹션 제목 — SectionTitle 이 h2 + 강조 span + 설명 p 와 하단 여백까지 담당한다 */}
        <SectionTitle
          title="처음이어도 어렵지 않은 "
          highlight="5단계 이용 절차"
          description="상담 신청부터 차량 인수까지, 지금 어디쯤 왔는지 항상 알 수 있게 안내해 드립니다."
        />

        {/*
          스텝 목록.
          - 순서가 의미를 가지므로 ul 이 아닌 ol 을 쓴다.
          - 모바일: 세로 스택(flex-col) / 데스크톱: 가로 한 줄(lg:flex-row).
          - lg 에서 items-stretch 로 카드 높이를 서로 맞춘다.
        */}
        <ol
          ref={listRef}
          className="flex flex-col items-stretch lg:flex-row lg:items-stretch"
        >
          {processSteps.map((item, index) => {
            // 마지막 카드 뒤에는 "보이는" 연결선을 그리지 않는다
            const isLast = index === processSteps.length - 1;

            return (
              <li
                key={item.step}
                /*
                 * lg:flex-1 → `flex: 1 1 0%` 이므로 기준 너비가 0 에서 출발한다.
                 *   덕분에 설명문 길이와 무관하게 5개 항목이 정확히 같은 너비를 나눠 갖는다.
                 * lg:min-w-0 → flex 항목의 기본 min-width:auto 때문에 긴 단어가
                 *   칸을 밀어내는 현상을 막는다.
                 * lg:flex-row → 카드와 연결 화살표가 가로로 나란히 놓인다.
                 * lg:items-stretch → 카드가 li 높이를 꽉 채워 5칸 높이가 서로 맞는다.
                 */
                className="flex flex-col items-stretch lg:min-w-0 lg:flex-1 lg:flex-row lg:items-stretch"
              >
                {/*
                  등장(stagger) 전용 래퍼.
                  hover 떠오름과 지연 시간을 한 요소에 몰면, 등장용 transition-delay
                  (최대 480ms) 가 hover 반응에도 그대로 걸려 카드가 굼뜨게 느껴진다.
                  그래서 "등장은 이 래퍼", "hover 는 안쪽 article" 로 역할을 분리했다.
                */}
                <div
                  className={[
                    "flex lg:min-w-0 lg:flex-1",
                    // opacity 와 transform 만 전환 대상으로 지정
                    "transition-[opacity,transform] duration-500 ease-out",
                    inView
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0",
                  ].join(" ")}
                  /*
                   * 카드 순서대로 120ms 씩 밀린 지연 시간 → 1번부터 5번까지 차례로 등장.
                   * transition-delay 는 유틸 클래스로 임의값을 만들기보다
                   * 인라인 style 로 계산해 넣는 편이 명확하다.
                   */
                  style={{ transitionDelay: `${index * STAGGER_MS}ms` }}
                >
                  {/* ── 스텝 카드 본체 (hover 떠오름 담당) ─────────────────── */}
                  <article
                    className={[
                      "group flex w-full flex-col items-center rounded-2xl border border-line bg-white/80 px-5 py-7 text-center backdrop-blur-sm",
                      "shadow-[0_2px_10px_rgba(0,0,0,0.04)]",
                      // 지연 없이 즉각 반응하는 hover 전환
                      "transition-[transform,box-shadow] duration-300 ease-out",
                      "hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)]",
                    ].join(" ")}
                  >
                    {/* 원형 번호 배지 — primary 배경 + 흰 숫자 */}
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-white shadow-[0_4px_12px_rgba(3,199,90,0.35)] transition-transform duration-300 group-hover:scale-110"
                    >
                      {/* 1 → "01" 형태로 0 을 채워 표시 */}
                      {String(item.step).padStart(2, "0")}
                    </span>

                    {/*
                      STEP 라벨 — 시각적으로는 작은 보조 문구지만,
                      위 배지가 aria-hidden 이므로 스크린리더에는 여기서 단계 번호를 읽어 준다.
                    */}
                    <span className="mt-3 text-[11px] font-bold tracking-widest text-primary uppercase">
                      STEP {String(item.step).padStart(2, "0")}
                    </span>

                    {/* 단계 제목 */}
                    <h3 className="mt-1.5 text-base font-bold text-ink md:text-lg">
                      {item.title}
                    </h3>

                    {/* 단계 설명 — 데스크톱에서 5칸으로 쪼개지므로 글자를 한 단계 줄인다 */}
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-sub md:text-sm">
                      {item.description}
                    </p>
                  </article>
                </div>

                {/* ── 카드 사이 연결선 (순수 장식) ─────────────────────────
                    마지막 항목에서는:
                      - 모바일: 아예 렌더 영역을 없앤다(hidden) → 꼬리 점선이 남지 않음
                      - 데스크톱: invisible 로 자리만 차지시켜 5개 칸 너비를 균등하게 유지
                */}
                <span
                  aria-hidden="true"
                  className={[
                    "items-center justify-center",
                    isLast ? "hidden lg:invisible lg:flex" : "flex",
                  ].join(" ")}
                >
                  {/* 모바일/태블릿: 세로 점선 (카드 위아래를 잇는 모양) */}
                  <span className="my-2 block h-7 border-l-2 border-dashed border-primary/45 lg:hidden" />

                  {/* 데스크톱: 오른쪽 화살표 — 외부 아이콘 없이 인라인 SVG 로 직접 그린다 */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    focusable="false"
                    className="mx-1 hidden h-6 w-6 shrink-0 text-primary/55 lg:block xl:mx-2"
                  >
                    {/* 가로선 + 화살촉 */}
                    <path d="M4 12h14" />
                    <path d="M13 7l5 5-5 5" />
                  </svg>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

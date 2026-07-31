"use client";

/**
 * ProcessSection — "이용 절차" 5단계 섹션 (id="process")
 *
 * 역할
 *  - 신차 상담 신청부터 출고·사후 관리까지의 과정을 5개 스텝 카드로 보여 준다.
 *  - 데이터는 `app/_data/process.ts` 의 `processSteps` 를 그대로 사용한다.
 *  - GNB 의 "이용 절차" 앵커(#process) 목적지이므로 section 에 id 를 부여했다.
 *
 * 배경 구조 (원본 대응 + 컬러 방향 수정)
 *  - 원본은 "배경 사진 + 연노랑 90% 오버레이" 2겹 구조였다.
 *    이 클론은 실제 이미지를 쓰지 않으므로 배경 사진 자리를 <Placeholder /> 로 깔고,
 *    그 위에 오버레이를 덮어 같은 인상을 만든다.
 *  - ★구글폼 13번(블루 계열 + 파스텔톤) 반영: 오버레이의 하드코딩 연노랑(#F9FCEF)을
 *    파스텔 블루 토큰 `bg-surface`(--color-surface #f5f8fd) 로 교체했다.
 *    노란 기운이 남아 있으면 페이지 전체의 블루 톤과 어긋나 조잡해 보인다(8-1번).
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

import Image from "next/image";

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
          /* 업종 변경(구글폼 3번)에 맞춰 라벨을 물류 현장 → 신차 전시장으로 교체 */
          label="이용 절차 섹션 배경 이미지 (신차 전시장 전경)"
          /*
           * absolute inset-0 로 높이가 이미 정해지므로 비율 계산은 필요 없다.
           * ratio="auto" 를 넘겨 aspect-ratio 가 높이를 덮어쓰지 않게 한다.
           */
          ratio="auto"
          className="h-full border-0"
        />
      </div>

      {/*
        ── 배경 2겹: 파스텔 블루 오버레이 90% ──────────────────────────────────
        구글폼 13번(블루 + 파스텔) 반영으로 하드코딩 연노랑을 토큰으로 교체했다.
        bg-surface = --color-surface(#f5f8fd) → 아주 옅은 블루 그레이.
        /90 투명도를 유지해 뒤 배경 플레이스홀더의 결이 살짝 남게 한다.
      */}
      <div
        aria-hidden="true"
        className="bg-navy/85 pointer-events-none absolute inset-0"
      />

      {/* ── 실제 콘텐츠 (배경 레이어보다 위) ─────────────────────────────────── */}
      <div className="relative z-10">
        {/*
          섹션 제목 — SectionTitle 이 h2 + 강조 span + 설명 p 와 하단 여백까지 담당한다.
          문구는 구글폼 3번(신차 할부·리스·장기렌트)과 4번(상담 문의 유도)에 맞춰
          "상담 한 번으로 시작된다"는 인상을 주도록 다듬었다.
          제목은 다른 섹션과 같은 폭(1320px)을 유지한다 — 넓히는 건 스텝 목록만.
        */}
        <div className="mx-auto w-full max-w-[1320px] px-5">
          <SectionTitle
            title="처음이어도 어렵지 않은 "
            highlight="5단계 이용 절차"
            description="상담 신청부터 차량 인도까지, 지금 어느 단계인지 항상 알 수 있게 안내해 드립니다."
          />
        </div>

        {/*
          스텝 목록.
          - 순서가 의미를 가지므로 ul 이 아닌 ol 을 쓴다.
          - 모바일: 세로 스택(flex-col) / 데스크톱: 가로 한 줄(lg:flex-row).
          - lg 에서 items-stretch 로 카드 높이를 서로 맞춘다.
          - ★컨테이너를 제목(1320px)보다 넓은 1480px 로 잡았다: 데스크톱에서
            5칸 + 화살표 4개가 한 줄에 놓이면 카드 하나가 좁아져 답답해 보인다는
            피드백 반영. 카드 한 장의 가로 폭을 키우는 것이 목적이므로
            목록 래퍼만 넓히고 제목 블록은 건드리지 않는다.
          - ★화살표 배치 방식 변경 (좌우 여백 불일치 수정):
            이전에는 화살표가 카드와 같은 flex 흐름에 있었고, 5칸 너비를 맞추려고
            마지막 카드 뒤에 "invisible 화살표"를 자리만 차지시켰다. 그 투명 화살표
            때문에 목록의 오른쪽 여백이 왼쪽보다 넓어 보이는 문제가 있었다.
            이제는 lg 에서 카드 사이를 gap-12(48px)로 벌리고, 화살표(24px)는
            흐름에서 빼서 각 li 오른쪽 gap 의 정중앙에 절대배치한다.
            → 투명 화살표가 필요 없어져 좌우 여백이 대칭이 된다.
        */}
        <div className="mx-auto w-full max-w-[1480px] px-5">
          <ol
            ref={listRef}
            className="flex flex-col items-stretch lg:flex-row lg:items-stretch lg:gap-12"
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
                 *   (화살표가 흐름 밖(절대배치)으로 빠졌으므로 투명 화살표 없이도
                 *    5칸 너비가 그대로 균등하다)
                 * lg:min-w-0 → flex 항목의 기본 min-width:auto 때문에 긴 단어가
                 *   칸을 밀어내는 현상을 막는다.
                 * relative → 데스크톱 연결 화살표(absolute)의 위치 기준점.
                 */
                className="relative flex flex-col items-stretch lg:min-w-0 lg:flex-1"
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
                      "group flex w-full flex-col items-center rounded-2xl border border-line bg-surface/85 px-5 py-7 text-center backdrop-blur-sm",
                      "shadow-[0_2px_10px_rgba(0,0,0,0.04)]",
                      // 지연 없이 즉각 반응하는 hover 전환
                      "transition-[transform,box-shadow] duration-300 ease-out",
                      "hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)]",
                    ].join(" ")}
                  >
                    {/* ── 단계 이미지 (2026-07-31 실사진 적용) ────────────────
                        원형 번호 배지는 이미지 위 좌상단에 겹쳐 둔다 — 이미지와 배지를
                        위아래로 따로 쌓으면 카드가 세로로 길어져, 데스크톱에서 5칸이
                        나란히 놓였을 때 섹션 전체가 지나치게 높아진다.

                        비율은 4/3 고정. 5장이 같은 비율이어야 한 줄로 늘어섰을 때
                        아래 텍스트 시작 위치가 서로 어긋나지 않는다.
                        원본 사진은 전부 16/9 가로형이라 그대로 넣으면 칸에 안 맞는다.
                        그래서 4/3 상자를 만들고 <Image fill /> + object-cover 로
                        가운데를 채워 자른다(비율이 다른 사진이 와도 카드가 안 깨진다).

                        ★ 래퍼가 2겹인 이유
                          바깥 div 에는 overflow-hidden 을 주면 안 된다. 좌상단 번호
                          배지가 음수 offset(-top-2 -left-2)으로 상자 밖에 걸쳐 있어
                          바깥에서 자르면 배지의 모서리가 잘려 나간다.
                          그래서 "자르는 상자"(안쪽)와 "배지 기준점"(바깥)을 분리했다. */}
                    <div className="relative w-full">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface">
                        <Image
                          src={item.image}
                          alt={item.imageAlt}
                          fill
                          /*
                           * sizes — 브라우저가 srcset 에서 고를 기준.
                           * 데스크톱(1024px~)에서는 목록 폭 1480px 을 5칸으로 나눠
                           * 카드 한 장이 최대 260px 남짓이라 300px 로 잡아 두면 충분하다.
                           * 그 미만에서는 카드가 화면 폭을 거의 다 쓰므로 100vw.
                           * 이 값이 없으면 원본 4MB PNG 에 가까운 크기를 받아 온다.
                           */
                          sizes="(min-width: 1024px) 300px, 100vw"
                          className="object-cover"
                        />
                      </div>

                      {/*
                        원형 번호 배지 — primary 배경 + 흰 숫자.
                        이미지 좌상단에 살짝 걸치도록 음수 offset 을 준다.
                        기준점은 바로 위 "자르는 상자"가 아니라 그 바깥 래퍼다 —
                        article 과 바깥 래퍼 모두 overflow-hidden 이 없어 잘리지 않는다.
                      */}
                      <span
                        aria-hidden="true"
                        className="bg-primary shadow-primary/25 absolute -top-2 -left-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                      >
                        {/* 1 → "01" 형태로 0 을 채워 표시 */}
                        {String(item.step).padStart(2, "0")}
                      </span>
                    </div>

                    {/*
                      STEP 라벨 — 시각적으로는 작은 보조 문구지만,
                      위 배지가 aria-hidden 이므로 스크린리더에는 여기서 단계 번호를 읽어 준다.
                    */}
                    <span className="mt-4 text-[11px] font-bold tracking-widest text-primary uppercase">
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
                    마지막 항목 뒤에는 아무것도 렌더하지 않는다.
                    (이전의 "invisible 화살표로 자리 차지" 방식은 목록 오른쪽에만
                     여백이 더 생겨 좌우가 비대칭이 되는 문제가 있었다)
                */}
                {!isLast && (
                  <>
                    {/* 모바일/태블릿: 세로 점선 (카드 위아래를 잇는 모양) — 흐름 안에 둔다 */}
                    <span
                      aria-hidden="true"
                      className="flex items-center justify-center lg:hidden"
                    >
                      <span className="my-2 block h-7 border-l-2 border-dashed border-primary/45" />
                    </span>

                    {/* 데스크톱: 오른쪽 화살표 — li 오른쪽 gap(48px)의 정중앙에 절대배치.
                        left-full: li 오른쪽 끝에서 시작 / translate-x-1/2: 화살표(24px)의
                        절반만큼 밀어 48px gap 정중앙에 오게 한다. 세로는 top-1/2 + -translate-y-1/2 로
                        카드 높이의 중앙에 맞춘다. 흐름 밖이므로 칸 너비에 영향이 없다. */}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      focusable="false"
                      className="pointer-events-none absolute top-1/2 left-full hidden h-6 w-6 translate-x-1/2 -translate-y-1/2 text-primary/55 lg:block"
                    >
                      {/* 가로선 + 화살촉 */}
                      <path d="M4 12h14" />
                      <path d="M13 7l5 5-5 5" />
                    </svg>
                  </>
                )}
              </li>
            );
          })}
          </ol>
        </div>
      </div>
    </section>
  );
}

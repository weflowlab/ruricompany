"use client";

/**
 * Footer — 페이지 최하단 푸터
 *
 * ============================================================================
 * ★ 레이아웃 전면 교체 (2026-07-31)
 * ============================================================================
 * 이전에는 bg-ink(#111) 다크 푸터에 [로고 → 사업자정보 → 약관 아코디언 → 카피라이트]
 * 순서로 쌓는 형태였다. 클라이언트가 지정한 원본 푸터 구성으로 다시 맞췄다.
 *
 *   1) 상단 한 줄  — 좌: 약관 링크 2개 / 우: "대표번호 0000-0000"
 *   2) 대형 헤드라인 — 2줄. 푸터에서 가장 큰 글자
 *   3) 사업자 정보  — 작은 회색 글씨 2줄 (상호·대표·주소 / 사업자번호·TEL·이메일)
 *   4) 카피라이트   — 가장 흐린 회색
 *
 * 바뀐 점과 이유
 *  - 배경: 다크(#111) → 흰색 + 상단 1px 라인.
 *    바로 위 FAQ 섹션이 흰 배경이라 검은 덩어리가 갑자기 나타나면 페이지가 끊겨 보였다.
 *    라인 하나로만 구분하면 본문에서 사이트 정보로 자연스럽게 이어진다.
 *  - 대표번호를 우측 상단으로 끌어올렸다. 푸터까지 스크롤한 사용자는 이미
 *    "연락할 마음"이 있는 상태이므로, 전화번호가 가장 먼저 눈에 닿아야 한다.
 *  - 약관 2종은 여전히 아코디언이지만 위치를 상단 좌측으로 옮겼다.
 *    (원본이 링크 형태라 자리만 맞추고, 동작은 페이지 이동 없는 아코디언을 유지했다.
 *     별도 약관 페이지가 아직 없어 링크로 만들면 갈 곳이 없기 때문이다.)
 *
 * 인터랙션
 *  - 아코디언 토글 때문에 클라이언트 컴포넌트('use client')다.
 *  - 두 아코디언은 서로 독립적으로 열고 닫힌다(동시에 둘 다 열려도 됨).
 *  - 열림/닫힘은 `grid-template-rows: 0fr → 1fr` 트릭으로 높이를 애니메이션한다.
 *    (max-height 를 임의값으로 추정하지 않아도 되어 내용 길이에 안전하다.)
 *  - 버튼에 aria-expanded / aria-controls, 패널에 id 와 role="region" 을 붙여
 *    스크린리더가 펼침 상태를 인지할 수 있게 했다.
 *  - `prefers-reduced-motion: reduce` 는 globals.css 전역 미디어쿼리가
 *    transition-duration 을 0 으로 만들어 즉시 열리고 닫힌다.
 *
 * 레이아웃 주의
 *  - 모바일에서는 화면 하단에 FloatingCta(고정 바)가 떠 있으므로,
 *    푸터 마지막 줄이 가려지지 않도록 `pb-24`(≈96px) 여유를 준다. 데스크톱은 원복.
 */

import { useEffect, useRef, useState } from "react";
import { site } from "../_data/site";

/**
 * 저작권 연도.
 * `new Date().getFullYear()` 를 렌더 중에 쓰면 서버 렌더 시점과 클라이언트 하이드레이션 시점이
 * 연말/연초에 갈릴 때 hydration mismatch 경고가 날 수 있어, 상수로 고정한다.
 */
const COPYRIGHT_YEAR = 2026;

/** 아코디언 한 항목의 데이터 구조 */
type PolicyItem = {
  /** aria-controls / id 연결에 쓰는 고유 키 */
  id: string;
  /** 버튼에 표시할 제목 */
  title: string;
  /** 본문 문단 배열 (문단마다 <p> 하나) */
  body: string[];
};

/**
 * 푸터 약관 아코디언 2종.
 * 실제 법적 효력이 있는 문구가 아니라, 같은 성격의 일반화된 더미 텍스트다.
 */
const policies: PolicyItem[] = [
  {
    id: "privacy",
    title: "개인정보 처리방침",
    body: [
      "루리컴퍼니는 상담 신청 과정에서 수집한 개인정보를 상담 및 견적 안내 목적으로만 이용하며, 목적이 달성된 후에는 지체 없이 파기합니다.",
      "수집 항목: 성함, 연락처, 관심 차종, 희망 연락 방법. 보유 기간: 상담 종료 후 즉시 파기(관계 법령에 별도 보관 의무가 있는 경우 그 기간을 따릅니다).",
      "이용자는 언제든지 본인의 개인정보 열람·정정·삭제 및 처리 정지를 요청할 수 있으며, 요청은 대표번호를 통해 접수할 수 있습니다.",
      "※ 본 문구는 레이아웃 확인을 위한 예시 텍스트이며 실제 방침이 아닙니다.",
    ],
  },
  {
    id: "email",
    title: "이메일무단수집거부",
    body: [
      "본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용해 무단으로 수집되는 것을 거부합니다.",
      "이를 위반할 경우 관련 법령에 따라 형사 처벌될 수 있습니다.",
      "※ 본 문구는 레이아웃 확인을 위한 예시 텍스트입니다.",
    ],
  },
];

export default function Footer() {
  /*
   * 현재 열려 있는 약관 팝오버의 id. null 이면 모두 닫힘.
   *
   * 2026-07-31 아코디언 → 팝오버로 바꾸면서 Set(복수 열림) → 단일 id 로 줄였다.
   * 떠 있는 창을 두 개 동시에 띄우면 서로 겹쳐 읽기 어렵다.
   * 아코디언일 때는 위아래로 쌓여 겹칠 일이 없어 복수 열림이 가능했다.
   */
  const [openId, setOpenId] = useState<string | null>(null);

  /**
   * 약관 버튼 + 팝오버를 함께 감싼 래퍼 참조.
   * "바깥 클릭 시 닫기" 판정에 쓴다 — 클릭 지점이 이 래퍼 안이면 닫지 않는다.
   */
  const policyWrapRef = useRef<HTMLDivElement>(null);

  /** 같은 버튼을 다시 누르면 닫고, 다른 버튼을 누르면 그쪽으로 갈아탄다 */
  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  /* ---------------------------------------------------------------------------
   * 팝오버 닫기 — 바깥 클릭 / Esc
   * (히어로 상담 폼의 개인정보 동의 [보기] 팝오버와 같은 관례를 따른다)
   * 열려 있을 때만 리스너를 걸어 두어 평소에는 비용이 들지 않는다.
   * ------------------------------------------------------------------------ */
  useEffect(() => {
    if (openId === null) return;

    /* mousedown 을 쓰는 이유: click 까지 기다리면 버튼의 토글 핸들러와 순서가 엉켜
       "열자마자 닫히는" 현상이 생긴다. */
    const handlePointerDown = (event: MouseEvent) => {
      if (!policyWrapRef.current) return;
      if (policyWrapRef.current.contains(event.target as Node)) return;
      setOpenId(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openId]);

  /*
   * 사업자 정보를 두 줄로 나눠 담는다.
   * 원본 푸터가 "상호·대표·주소" / "사업자등록번호·TEL·이메일" 두 줄 구성이라 그대로 맞췄다.
   * 한 줄에 다 넣으면 데스크톱에서 한 줄이 지나치게 길어져 읽기 어렵다.
   */
  const businessRows: { label: string; value: string }[][] = [
    [
      { label: "상호", value: site.company },
      { label: "대표", value: site.ceo },
      { label: "주소", value: site.address },
    ],
    [
      { label: "사업자등록번호", value: site.bizNo },
      { label: "TEL", value: site.tel },
      { label: "이메일", value: site.email },
    ],
  ];

  return (
    <footer
      /*
       * 흰 배경 + 상단 1px 라인. 모바일에서는 하단 플로팅 CTA 바에 가려지지 않도록
       * pb-24 로 여유를 두고, md 이상에서는 pb-16 으로 되돌린다.
       */
      className="border-line text-ink border-t bg-white pt-12 pb-24 md:pt-16 md:pb-16"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5">
        {/* ── 1. 상단 줄: 좌 약관 토글 / 우 대표번호 ───────────────────────
            모바일에서는 세로로 쌓이고(약관 → 대표번호),
            md 이상에서는 양 끝으로 벌어진다. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* ── 약관 토글 버튼 2개 + 각자의 팝오버 ──────────────────────────
              래퍼에 ref 를 걸어 "이 영역 바깥을 누르면 닫기" 판정 범위로 쓴다. */}
          <div
            ref={policyWrapRef}
            className="flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {policies.map((policy) => {
              const isOpen = openId === policy.id;

              return (
                /* relative — 안쪽 팝오버(absolute)의 위치 기준점.
                   버튼마다 따로 감싸야 팝오버가 "자기 버튼" 아래에 정확히 붙는다. */
                <div key={policy.id} className="relative">
                  <button
                    type="button"
                    onClick={() => toggle(policy.id)}
                    /* 팝오버와 연결 + 현재 열림 상태를 보조기기에 전달 */
                    aria-expanded={isOpen}
                    aria-controls={`footer-policy-${policy.id}`}
                    className="text-ink hover:text-primary flex cursor-pointer items-center gap-1.5 text-sm font-bold transition-colors md:text-[0.95rem]"
                  >
                    {policy.title}

                    {/* 화살표 — 열리면 180도 회전. 장식이므로 낭독 제외 */}
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {/* ── 약관 전문 팝오버 ────────────────────────────────────
                      2026-07-31 아코디언 → 떠 있는 작은 창으로 교체.
                      (히어로 상담 폼의 개인정보 동의 [보기] 와 같은 방식)

                      아코디언일 때의 문제
                        버튼이 푸터 맨 위에 있어서, 펼치면 아래의 대형 헤드라인·
                        사업자 정보·카피라이트가 통째로 밀려 내려갔다. 약관을 닫으면
                        다시 올라와 페이지가 출렁였다.

                      위치
                        top-full + mt-2 → 버튼 "아래쪽". 히어로 폼의 팝오버는 위로
                        띄웠는데(폼 하단이라), 여기는 푸터 상단이라 아래가 자연스럽다.

                      닫기 수단 3가지 : 우상단 × / 바깥 클릭 / Esc
                      닫혀 있을 때는 DOM 에서 제거해 스크린리더가 읽지 않게 한다. */}
                  {isOpen ? (
                    <div
                      id={`footer-policy-${policy.id}`}
                      role="dialog"
                      aria-label={`${policy.title} 내용`}
                      className="border-line absolute top-full left-0 z-30 mt-2 w-[min(26rem,calc(100vw-3rem))] rounded-xl border bg-white shadow-[0_8px_28px_rgba(0,0,0,0.16)]"
                    >
                      {/* 팝오버 헤더 — 제목 + 닫기 버튼 */}
                      <div className="border-line flex items-center justify-between gap-3 border-b px-4 py-2.5">
                        <p className="text-ink text-xs font-bold md:text-sm">
                          {policy.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => setOpenId(null)}
                          aria-label={`${policy.title} 창 닫기`}
                          className="text-ink-sub hover:bg-surface hover:text-ink flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors"
                        >
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            className="h-3.5 w-3.5"
                          >
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </div>

                      {/* 본문 — 문단이 길어 최대 높이 + 세로 스크롤을 준다 */}
                      <div className="text-ink-sub max-h-56 space-y-2.5 overflow-y-auto px-4 py-3 text-xs leading-relaxed">
                        {policy.body.map((paragraph, index) => (
                          // 문단 텍스트는 고정 더미이므로 인덱스 key 로 충분하다
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/*
            대표번호 — 푸터에서 가장 강한 신호.
            라벨은 잉크색 굵게, 번호는 primary 로 크게 띄운다.
            tel: 링크로 감싸 모바일에서 바로 통화로 이어지게 한다.
          */}
          <p className="flex items-baseline gap-2.5">
            <span className="text-ink text-base font-extrabold md:text-lg">
              대표번호
            </span>
            <a
              href={`tel:${site.tel}`}
              aria-label={`${site.name} 대표번호 ${site.tel} 로 연결`}
              className="text-primary hover:text-primary-hover text-xl font-extrabold tracking-tight transition-colors md:text-2xl"
            >
              {site.tel}
            </a>
          </p>
        </div>

        {/* 약관 본문은 위 버튼에 붙은 팝오버 안으로 들어갔다.
            여기 있던 아코디언 패널 블록은 2026-07-31 제거. */}

        {/* ── 2. 대형 헤드라인 (2줄) ─────────────────────────────────────
            배열 한 칸 = 한 줄. block span 으로 쌓아 <br> 없이 줄을 나눈다. */}
        <p className="mt-12 text-[1.6rem] leading-[1.35] font-extrabold tracking-tight md:mt-16 md:text-[2.4rem]">
          {site.footerHeadline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        {/* ── 3. 사업자 정보 2줄 ─────────────────────────────────────────
            dl/dt/dd 로 "라벨 - 값" 관계를 보조기기에 전달한다.
            시각적으로는 "라벨 : 값" 형태로 한 줄에 이어 붙인다. */}
        <section aria-labelledby="footer-biz-heading" className="mt-10 md:mt-14">
          {/* 시각적으로는 숨기고 스크린리더에게만 이 블록의 성격을 알린다 */}
          <h2 id="footer-biz-heading" className="sr-only">
            사업자 정보
          </h2>

          <div className="space-y-1.5">
            {businessRows.map((row, rowIndex) => (
              <dl
                key={rowIndex}
                className="text-ink-sub flex flex-col gap-y-1 text-[0.8rem] leading-relaxed md:flex-row md:flex-wrap md:gap-x-6 md:text-sm"
              >
                {row.map((item) => (
                  // dt/dd 한 쌍을 div 로 묶는다 (HTML5 에서 허용되는 패턴)
                  <div key={item.label} className="flex gap-1.5">
                    <dt className="shrink-0">{item.label} :</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        </section>

        {/* ── 4. 카피라이트 + 데모 고지 ──────────────────────────────────
            푸터에서 가장 흐린 톤. 정보 위계상 마지막이다. */}
        <div className="mt-8 md:mt-10">
          <p className="text-ink-sub/70 text-[0.8rem] md:text-sm">
            Copyright ⓒ {COPYRIGHT_YEAR} {site.name}. All rights reserved.
          </p>
          {/* 참고 제작임을 명확히 밝히는 고지 문구 (필수) */}
          <p className="text-ink-sub/60 mt-2 text-[0.75rem] leading-relaxed md:text-xs">
            본 페이지는 truck-1st.com의 레이아웃/인터랙션을 참고해 제작된
            데모입니다. 게시된 브랜드명, 차량 정보, 사업자 정보는 모두 예시용
            더미 데이터이며 실제와 무관합니다.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

/**
 * Footer — 페이지 최하단 푸터
 *
 * 역할
 *  - 브랜드 로고 텍스트 + 한 줄 소개
 *  - `app/_data/site.ts` 의 사업자 정보(상호/대표/사업자등록번호/주소/대표번호)를
 *    dl · dt · dd 로 의미에 맞게 마크업해 노출
 *  - "개인정보처리방침" / "이메일무단수집거부" 두 개의 토글 아코디언 (더미 약관 텍스트)
 *  - 저작권 문구 + 본 페이지가 데모임을 밝히는 고지 문구
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
 * 원본 대응
 *  - 페이지 구조 11번 "푸터" (사업자 정보 + 개인정보처리방침 아코디언).
 *
 * 레이아웃 주의
 *  - 모바일에서는 화면 하단에 FloatingCta(고정 바)가 떠 있으므로,
 *    푸터 마지막 줄이 가려지지 않도록 `pb-24`(≈96px) 여유를 준다. 데스크톱은 원복.
 */

import { useState } from "react";
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
 * 푸터 하단 약관 아코디언 2종.
 * 실제 법적 효력이 있는 문구가 아니라, 같은 성격의 일반화된 더미 텍스트다.
 */
const policies: PolicyItem[] = [
  {
    id: "privacy",
    title: "개인정보처리방침",
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
   * 열려 있는 아코디언 id 들의 집합.
   * FAQ 섹션과 달리 "한 번에 하나만" 제약이 없으므로 Set 으로 여러 개를 관리한다.
   * (Set 은 참조가 같으면 리렌더가 되지 않으므로 항상 새 Set 을 만들어 교체한다.)
   */
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  /** 특정 아코디언의 열림/닫힘을 뒤집는다 */
  const toggle = (id: string) => {
    setOpenIds((prev) => {
      // 기존 Set 을 직접 변경하지 않고 복사본을 만든다 (불변성 유지 → 리렌더 보장)
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /**
   * 사업자 정보 목록.
   * 라벨(dt)과 값(dd) 쌍으로 렌더링하기 위해 배열로 미리 정리해 둔다.
   */
  const businessInfo: { label: string; value: string }[] = [
    { label: "상호", value: site.company },
    { label: "대표", value: site.ceo },
    { label: "사업자등록번호", value: site.bizNo },
    { label: "주소", value: site.address },
    { label: "대표번호", value: site.tel },
  ];

  return (
    <footer
      /*
       * bg-ink(#111) 위에 흰 글씨. 모바일에서는 하단 플로팅 CTA 바에 가려지지 않도록
       * pb-24 로 여유를 두고, md 이상에서는 pb-14 로 되돌린다.
       */
      className="bg-ink pt-14 pb-24 text-white md:pt-20 md:pb-14"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5">
        {/* ── 상단: 로고 텍스트 + 한 줄 소개 ───────────────────────────── */}
        <div className="border-b border-white/10 pb-8 md:pb-10">
          {/* 이미지 로고 대신 텍스트 로고를 쓴다(이미지 사용 금지 규칙). */}
          <p className="text-xl font-extrabold tracking-tight md:text-2xl">
            {site.name}
          </p>
          {/* 브랜드 한 줄 소개 — site.description 재사용 */}
          <p className="mt-3 max-w-[46rem] text-sm leading-relaxed text-white/60 md:text-base">
            {site.description}
          </p>
        </div>

        {/* ── 중단: 사업자 정보 (dl / dt / dd) ────────────────────────── */}
        <section aria-labelledby="footer-biz-heading" className="py-8 md:py-10">
          {/* 시각적으로는 숨기고 스크린리더에게만 이 블록의 성격을 알린다 */}
          <h2 id="footer-biz-heading" className="sr-only">
            사업자 정보
          </h2>

          {/*
           * dl 안의 각 항목을 div 로 감싸 dt/dd 한 쌍을 묶는다(HTML5 에서 허용되는 패턴).
           * flex-wrap + gap 으로 데스크톱에서는 한 줄에 여러 항목이,
           * 모바일에서는 한 항목씩 아래로 쌓이도록 한다.
           */}
          <dl className="flex flex-col gap-y-2 text-sm md:flex-row md:flex-wrap md:gap-x-8 md:gap-y-3">
            {businessInfo.map((item) => (
              <div key={item.label} className="flex gap-2">
                {/* 라벨은 한 톤 흐리게 */}
                <dt className="shrink-0 text-white/45">{item.label}</dt>
                <dd className="text-white/80">{item.value}</dd>
              </div>
            ))}
          </dl>

          {/* 정보성 안내 문구 (더미) */}
          <p className="mt-5 text-xs leading-relaxed text-white/40 md:text-sm">
            표시된 차량 가격과 월 납입금은 예시 조건 기준의 참고 값이며, 실제
            계약 조건에 따라 달라질 수 있습니다.
          </p>
        </section>

        {/* ── 약관 아코디언 2종 ───────────────────────────────────────── */}
        <div className="border-t border-white/10">
          {policies.map((policy) => {
            // 현재 항목이 열려 있는지 여부 — 버튼 aria-expanded 와 패널 스타일에 함께 쓴다
            const isOpen = openIds.has(policy.id);

            return (
              <div
                key={policy.id}
                className="border-b border-white/10"
              >
                {/* 토글 버튼 — 클릭 또는 Enter/Space(button 기본 동작)로 열고 닫는다 */}
                <h3>
                  <button
                    type="button"
                    onClick={() => toggle(policy.id)}
                    /* 패널과 연결 + 현재 펼침 상태를 보조기기에 전달 */
                    aria-expanded={isOpen}
                    aria-controls={`footer-policy-${policy.id}`}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-medium text-white/80 transition-colors hover:text-white md:text-base"
                  >
                    <span>{policy.title}</span>

                    {/* 화살표 아이콘 — 열리면 180도 회전. 장식이므로 낭독 제외 */}
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </h3>

                {/*
                 * 패널 높이 애니메이션:
                 *  grid + grid-rows-[0fr] → grid-rows-[1fr] 로 바꾸면
                 *  내용의 실제 높이를 몰라도 부드럽게 펼쳐진다.
                 *  자식에는 반드시 overflow-hidden + min-h-0 을 줘야 접힌 상태에서 잘린다.
                 */}
                <div
                  id={`footer-policy-${policy.id}`}
                  role="region"
                  aria-label={`${policy.title} 내용`}
                  /*
                   * 닫혀 있을 때는 inert 로 포커스/낭독 대상에서 제외한다.
                   * (hidden 속성은 display:none 이라 grid-rows 트랜지션이 끊기므로 쓰지 않는다.)
                   */
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="space-y-3 pb-5 text-xs leading-relaxed text-white/55 md:text-sm">
                      {policy.body.map((paragraph, index) => (
                        // 문단 텍스트는 고정 더미이므로 인덱스 key 로 충분하다
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 하단: 저작권 + 데모 고지 ────────────────────────────────── */}
        <div className="pt-8 md:pt-10">
          <p className="text-xs text-white/40 md:text-sm">
            © {COPYRIGHT_YEAR} {site.name}. All rights reserved.
          </p>
          {/* 참고 제작임을 명확히 밝히는 고지 문구 (필수) */}
          <p className="mt-2 text-xs leading-relaxed text-white/30 md:text-sm">
            본 페이지는 truck-1st.com의 레이아웃/인터랙션을 참고해 제작된
            데모입니다. 게시된 브랜드명, 차량 정보, 후기, 사업자 정보는 모두
            예시용 더미 데이터이며 실제와 무관합니다.
          </p>
        </div>
      </div>
    </footer>
  );
}

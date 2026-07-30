"use client";

/**
 * Footer — 페이지 최하단 푸터
 *
 * ★ 2026-07-30 간결화 개편 (클라이언트 피드백: "지금 너무 번잡해")
 *  참고 시안(teukjangman.kr 푸터)의 구조를 따라 정보 밀도를 크게 낮췄다.
 *
 *  이전 구조(5덩어리): 브랜드 소개 / 사업자 정보 dl / SNS 카드 3장 /
 *                     약관 아코디언 / 저작권 — 구분선이 4개나 쌓여 번잡했다.
 *  현재 구조(3덩어리):
 *    ① 브랜드명 + 두 줄 소개 (좌) ↔ 원형 채널 아이콘 4개 (우)
 *       — 기존 "SNS 카드 3장 + 설명문" 섹션을 아이콘 버튼으로 축소했다.
 *    ② 사업자 정보 한 줄 (상호 ㅣ 대표 ㅣ 대표번호 ㅣ 사업자등록번호 ㅣ 주소)
 *       — dl 항목별 나열 + "확인 중" 뱃지를 걷어내고 구분점으로 이어 붙였다.
 *    ③ 구분선 아래 중앙 정렬: 약관 링크 2개 / 저작권 / 데모 고지
 *       — 약관은 아코디언 기능(grid-rows 애니메이션)을 유지하되
 *         버튼을 중앙 텍스트 링크 모양으로 바꿨다.
 *
 * 클라이언트 요청사항(구글폼) 유지 내역
 *  - 15번 채널(카카오톡/인스타그램/블로그) → 우상단 원형 아이콘. href 미전달
 *    플레이스홀더는 클릭을 막고 title 로 "준비 중"을 알린다.
 *  - 16번 사업자 정보 → 한 줄 표기. 주소·사업자등록번호는 값을 전달받지 못해
 *    "확인 후 기입"으로 노출한다(임의 값 생성 금지 — site.ts 주석 참고).
 *  - 17·18번 → 대표번호를 정보 줄에 노출하고, 아이콘 행 끝에 전화 아이콘을 둔다.
 *
 * 레이아웃 주의
 *  - 모바일에서는 화면 하단에 FloatingCta(고정 바)가 떠 있으므로,
 *    푸터 마지막 줄이 가려지지 않도록 `pb-24`(≈96px) 여유를 준다. 데스크톱은 원복.
 */

import { useState } from "react";
import { channels, site } from "../_data/site";

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
      // 구글폼 3번(신차 할부·장기렌트·리스) 반영 — 기존 '화물차' 표현을 '신차'로 다듬었다.
      "루리컴퍼니는 신차 할부·리스·장기렌트 상담 신청 과정에서 수집한 개인정보를 상담 및 조건 안내 목적으로만 이용하며, 목적이 달성된 후에는 지체 없이 파기합니다.",
      "수집 항목: 성함, 연락처, 관심 신차 모델, 희망 연락 방법. 보유 기간: 상담 종료 후 즉시 파기(관계 법령에 별도 보관 의무가 있는 경우 그 기간을 따릅니다).",
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
   * "한 번에 하나만" 제약이 없으므로 Set 으로 여러 개를 관리한다.
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
   * 사업자 정보 (구글폼 16번: 연락처 / 주소 / 사업자) — 한 줄 표기용.
   *
   * TODO: 사업자등록번호와 사업장 주소를 전달받으면 app/_data/site.ts 의
   *       bizNo / address 를 실제 값으로 교체하고, 아래 "확인 후 기입" 두 값을
   *       site.bizNo / site.address 참조로 되돌리면 된다.
   *       (site.ts 의 현재 문자열은 "사업자등록번호 확인 후 기입" 처럼 라벨을
   *        포함하고 있어 한 줄 표기에서는 라벨과 겹치므로 값만 따로 적었다.
   *        임의 값을 만들어 넣는 것은 금지 — 실제 사업자 정보와 달라지면 법적 문제)
   */
  const businessInfo: { label: string; value: string }[] = [
    { label: "상호명", value: site.company },
    { label: "대표", value: site.ceo },
    { label: "대표번호", value: site.tel },
    { label: "사업자등록번호", value: "확인 후 기입" },
    { label: "주소", value: "확인 후 기입" },
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
        {/* ── ① 브랜드 + 소개 (좌) ↔ 채널 아이콘 (우) ─────────────────── */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            {/* 이미지 로고 대신 텍스트 로고를 쓴다(이미지 사용 금지 규칙). */}
            <p className="text-xl font-extrabold tracking-tight md:text-2xl">
              {site.name}
            </p>
            {/* 브랜드 소개 — 한 줄로 그대로 노출한다 (좁은 화면에서만 자연 줄바꿈) */}
            <p className="mt-4 text-sm leading-relaxed text-white/55 md:text-[15px]">
              {site.description}
            </p>
          </div>

          {/* 채널 아이콘 행 (구글폼 15번) + 전화 (구글폼 17·18번)
              — 카드형 나열 대신 참고 시안처럼 원형 아이콘 버튼으로 축소했다 */}
          <ul className="flex shrink-0 items-center gap-3">
            {/* 전화 — 유일하게 지금도 동작하는 연락 수단이라 아이콘 행 맨 앞에 둔다 */}
            <li>
              <a
                href={`tel:${site.telHref}`}
                aria-label={`전화 상담 걸기 ${site.tel}`}
                title={`전화 상담 ${site.tel}`}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-[18px] w-[18px]"
                >
                  {/* 수화기 모양 패스 */}
                  <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24c1.1.37 2.3.57 3.5.57a1 1 0 011 1V20a1 1 0 01-1 1C10.9 21 3 13.1 3 3.4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.4.57 3.5a1 1 0 01-.25 1l-2.22 2.2z" />
                </svg>
              </a>
            </li>

            {channels.map((channel) => (
              <li key={channel.id}>
                <a
                  href={channel.href}
                  /*
                   * 플레이스홀더 차단 (구글폼 15번 — 채널 주소 미전달)
                   *  href 가 "#" 인 채로 두면 클릭 시 페이지가 최상단으로 튀므로
                   *  기본 동작을 막고 aria-disabled 로 비활성임을 알린다.
                   *  실제 주소를 받으면 site.ts 의 href 를 채우고 isPlaceholder 를
                   *  false 로 바꾸면 이 차단이 자동으로 풀린다.
                   */
                  onClick={
                    channel.isPlaceholder
                      ? (event) => event.preventDefault()
                      : undefined
                  }
                  aria-disabled={channel.isPlaceholder || undefined}
                  target={channel.isPlaceholder ? undefined : "_blank"}
                  rel={channel.isPlaceholder ? undefined : "noreferrer noopener"}
                  aria-label={channel.label}
                  title={
                    channel.isPlaceholder
                      ? `${channel.label} (채널 주소 준비 중)`
                      : channel.label
                  }
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors",
                    channel.isPlaceholder
                      ? "cursor-default"
                      : "hover:border-white/40 hover:text-white",
                  ].join(" ")}
                >
                  <ChannelIcon id={channel.id} />
                </a>
              </li>
            ))}

          </ul>
        </div>

        {/* ── ② 사업자 정보 한 줄 (구글폼 16번) ───────────────────────────
            항목 사이를 얇은 세로 구분선으로 잇고, 좁은 화면에서는 자연스럽게 줄바꿈 */}
        <ul className="mt-8 flex flex-wrap items-center gap-y-1.5 text-xs text-white/40 md:mt-10 md:text-[13px]">
          {businessInfo.map((item, index) => (
            <li key={item.label} className="flex items-center">
              {/* 첫 항목 앞에는 구분선을 그리지 않는다 */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="mx-3 h-3 w-px bg-white/15"
                />
              )}
              <span className="shrink-0">{item.label}</span>
              <span aria-hidden="true" className="mx-1">
                :
              </span>
              <span className="text-white/55">{item.value}</span>
            </li>
          ))}
        </ul>

        {/* ── ③ 구분선 아래: 약관 / 저작권 / 데모 고지 (중앙 정렬) ─────────── */}
        <div className="mt-8 border-t border-white/10 pt-8 md:mt-10">
          {/* 약관 토글 2개 — 참고 시안의 하단 링크 줄처럼 중앙에 나란히 둔다.
              눌러서 펼치는 아코디언 기능은 유지 (내용을 없애면 방침 확인 수단이 사라진다) */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {policies.map((policy) => {
              const isOpen = openIds.has(policy.id);
              return (
                <button
                  key={policy.id}
                  type="button"
                  onClick={() => toggle(policy.id)}
                  aria-expanded={isOpen}
                  aria-controls={`footer-policy-${policy.id}`}
                  className={[
                    "cursor-pointer text-xs transition-colors md:text-sm",
                    // 열려 있는 항목은 또렷하게, 닫힌 항목은 한 톤 흐리게
                    isOpen
                      ? "font-semibold text-white"
                      : "text-white/55 hover:text-white",
                  ].join(" ")}
                >
                  {policy.title}
                </button>
              );
            })}
          </div>

          {/* 펼쳐지는 약관 본문 — grid-rows 0fr→1fr 트릭으로 높이를 애니메이션한다.
              내용 길이를 몰라도 부드럽게 열리고, 닫힌 상태에서는 inert 로
              포커스/낭독 대상에서 제외된다. */}
          {policies.map((policy) => {
            const isOpen = openIds.has(policy.id);
            return (
              <div
                key={policy.id}
                id={`footer-policy-${policy.id}`}
                role="region"
                aria-label={`${policy.title} 내용`}
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="mx-auto max-w-[720px] space-y-3 pt-5 text-xs leading-relaxed text-white/55">
                    {policy.body.map((paragraph, index) => (
                      // 문단 텍스트는 고정 더미이므로 인덱스 key 로 충분하다
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 저작권 */}
          <p className="mt-6 text-center text-xs text-white/35 md:text-[13px]">
            Copyright © {COPYRIGHT_YEAR} {site.name}. All Rights Reserved.
          </p>

          
        </div>
      </div>
    </footer>
  );
}

/* =============================================================================
 * ChannelIcon — 카카오톡 / 인스타그램 / 블로그 아이콘 (구글폼 15번)
 *
 * 외부 아이콘 라이브러리 설치가 금지되어 있어 인라인 SVG 로 직접 그렸다.
 * 브랜드 원색(카카오 옐로우 등)을 쓰면 구글폼 13번(블루 + 파스텔) 팔레트가 깨지고
 * 8-1번(조잡함)에도 어긋나므로, 색을 지정하지 않고 stroke/fill 에 currentColor 를 써
 * 부모의 텍스트 색을 그대로 물려받게 했다.
 * ========================================================================== */
function ChannelIcon({ id }: { id: "kakao" | "instagram" | "blog" }) {
  // 세 아이콘의 크기·선 두께를 통일해 나란히 놓았을 때 무게가 튀지 않게 한다.
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 20 20",
    fill: "none",
    "aria-hidden": true,
  } as const;

  if (id === "kakao") {
    // 말풍선 — 카카오톡 상담
    return (
      <svg {...common}>
        <path
          d="M10 3.5c3.7 0 6.5 2.2 6.5 5s-2.8 5-6.5 5c-.55 0-1.1-.05-1.6-.14L5.4 16l.8-2.65C4.5 12.4 3.5 10.85 3.5 8.5c0-2.8 2.8-5 6.5-5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (id === "instagram") {
    // 둥근 사각 프레임 + 렌즈 원 + 점 — 인스타그램
    return (
      <svg {...common}>
        <rect
          x="3.25"
          y="3.25"
          width="13.5"
          height="13.5"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="10" cy="10" r="3.1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13.9" cy="6.1" r="0.95" fill="currentColor" />
      </svg>
    );
  }

  // 글줄이 있는 문서 — 블로그
  return (
    <svg {...common}>
      <path
        d="M4.25 4.25h11.5v11.5H4.25v-11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7 7.75h6M7 10.5h6M7 13.25h3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

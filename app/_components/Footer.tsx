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
 *  - 대표번호를 우측 상단으로 끌어올렸다. 푸터까지 스크롤한 사용자는 이미
 *    "연락할 마음"이 있는 상태이므로, 전화번호가 가장 먼저 눈에 닿아야 한다.
 *  - 약관 2종을 상단 좌측으로 옮기고, 클릭하면 그 자리에 팝오버가 뜬다.
 *    (원본이 링크 형태라 자리만 맞췄다. 별도 약관 페이지가 아직 없어
 *     링크로 만들면 갈 곳이 없기 때문에 페이지 이동은 하지 않는다.)
 *
 * ============================================================================
 * ★ 다크 전환 (2026-07-31)
 * ============================================================================
 * 흰 배경으로 만들었다가 딥 네이비(bg-navy)로 다시 뒤집었다.
 *
 * 처음 흰색으로 잡은 근거는 "위 FAQ 가 흰 배경이라 검은 덩어리가 갑자기 나오면
 * 페이지가 끊겨 보인다"였다. 그 근거는 히어로가 밝을 때만 성립한다.
 * 지금은 히어로가 다크 + 스포트라이트라, 푸터도 다크여야 위아래가 짝을 이룬다.
 * 페이지가 [다크 → 밝은 본문 → 다크]로 닫히면서 다크가 의도된 리듬으로 읽힌다.
 *
 * 다만 약관 팝오버는 흰색 그대로 뒀다. 떠 있는 창은 배경에서 떨어져 보여야
 * 하는데, 네이비 위에 네이비 창을 얹으면 경계가 사라진다.
 *
 * 인터랙션
 *  - 팝오버 토글 때문에 클라이언트 컴포넌트('use client')다.
 *  - 한 번에 하나만 열린다 (떠 있는 창 둘이 겹치면 읽기 어렵다).
 *  - 닫는 방법 3가지: 우상단 × / 바깥 클릭 / Esc.
 *  - 버튼에 aria-expanded / aria-controls, 팝오버에 role="dialog" 를 붙여
 *    스크린리더가 열림 상태를 인지할 수 있게 했다.
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

/**
 * 푸터 채널 버튼 한 항목.
 * 아이콘은 외부 라이브러리 없이 인라인 SVG 로 직접 그린다.
 * 각 서비스의 실제 로고 아트워크가 아니라, 성격을 알아볼 수 있는 일반 도형이다.
 */
type Channel = {
  /** React key */
  id: string;
  /** aria-label / title 에 쓰는 한국어 이름 */
  label: string;
  /** 이동할 주소 */
  href: string;
  /** 외부 사이트인지 여부 — true 면 새 탭에서 연다 */
  external: boolean;
  /**
   * 채널 브랜드 색 클래스 (2026-07-31 변경).
   * 이전에는 hover 에서만 색이 켜졌는데, 이제 아이콘 선과 바깥 원 테두리에
   * 상시로 브랜드 색을 입힌다. hover 에서는 그 색으로 면을 채운다.
   */
  colorClass: string;
  /** 버튼 안에 들어갈 아이콘 */
  icon: React.ReactNode;
};

/**
 * 채널 목록 (2026-07-31 추가).
 *
 * ⚠️ 카카오톡 링크는 카카오 오픈채팅 **소개 페이지**다.
 *    루리컴퍼니의 실제 오픈채팅방 주소를 아직 전달받지 못해 임시로 넣어 두었다.
 *    인스타그램·블로그도 각 서비스 홈이며 브랜드 계정 주소가 아니다.
 *    실제 계정 주소를 받으면 이 배열의 href 3개만 교체하면 된다.
 */
const channels: Channel[] = [
  {
    id: 'phone',
    label: `전화 상담 ${site.tel}`,
    href: `tel:${site.tel}`,
    external: false,
    colorClass: 'border-primary text-primary hover:bg-primary hover:text-white',
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4.5 2.5h3l1.5 3.75-1.9 1.15a11 11 0 0 0 4.5 4.5l1.15-1.9L16.5 11.5v3a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 3 4.7a2 2 0 0 1 1.5-2.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'kakao',
    label: '카카오톡 오픈채팅',
    href: 'https://www.kakaocorp.com/page/service/service/openchat',
    external: true,
    /* 채워졌을 때(hover) 노란 면 위에서는 흰 아이콘이 묻히므로 갈색으로 뒤집는다 */
    colorClass:
      'border-[#FEE500] text-[#FEE500] hover:bg-[#FEE500] hover:text-[#3C1E1E]',
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 3c4 0 7 2.4 7 5.4 0 3-3 5.4-7 5.4-.6 0-1.2-.05-1.75-.15L4.7 16.2l.85-2.85C4 12.4 3 10.6 3 8.4 3 5.4 6 3 10 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'instagram',
    label: '인스타그램',
    href: 'https://www.instagram.com/',
    external: true,
    colorClass: 'border-[#E1306C] text-[#E1306C] hover:bg-[#E1306C] hover:text-white',
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {/* 둥근 사각 테두리 + 가운데 원 + 우상단 점 — 카메라를 뜻하는 일반 도형 */}
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          rx="4.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="14.2" cy="5.8" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'blog',
    label: '블로그',
    href: 'https://section.blog.naver.com/BlogHome.naver?directoryNo=0&currentPage=1&groupId=0',
    external: true,
    colorClass: 'border-[#03C75A] text-[#03C75A] hover:bg-[#03C75A] hover:text-white',
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {/* 글이 적힌 문서 — 블로그(글) 를 뜻하는 일반 도형 */}
        <path
          d="M4.5 3.5h11v13h-11z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M7.2 7h5.6M7.2 10h5.6M7.2 13h3.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
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
       * 딥 네이비 + 상단 1px 라인(흰색 저알파). 모바일에서는 하단 플로팅 CTA 바에
       * 가려지지 않도록 pb-24 로 여유를 두고, md 이상에서는 pb-16 으로 되돌린다.
       */
      className="bg-navy border-line-dark border-t pt-12 pb-24 text-white md:pt-16 md:pb-16"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5">
        {/* ── 1. 상단 줄: 약관 토글 2개 ─────────────────────────────────
            2026-07-31 대표번호·채널 버튼을 이 줄에서 빼서 아래 헤드라인 옆으로
            옮겼다. 헤드라인과 가로 라인을 맞춰 달라는 요청. */}
        <div className="flex flex-col gap-6">
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
                    /* 2026-07-31 글씨 축소: text-sm/0.95rem → text-xs/0.8rem.
                       푸터 최상단의 보조 링크라 헤드라인·대표번호보다 확실히 작아야 한다.
                       흰색 대신 ink-sub 로 낮춰 위계도 함께 내렸다. */
                    className="text-ink-sub hover:text-primary-on-dark flex cursor-pointer items-center gap-1 text-xs font-bold transition-colors md:text-[0.8rem]"
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
                      className={`h-3 w-3 shrink-0 transition-transform duration-300 ${
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
                      className="border-line absolute top-full left-0 z-30 mt-2 w-[min(26rem,calc(100vw-3rem))] rounded-xl border bg-surface shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
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

        </div>

        {/* 약관 본문은 위 버튼에 붙은 팝오버 안으로 들어갔다.
            여기 있던 아코디언 패널 블록은 2026-07-31 제거. */}

        {/* ── 2. 대형 헤드라인 (좌) + 대표번호·채널 (우) ───────────────────
            2026-07-31 두 블록을 한 행으로 묶었다.
            md:items-end 로 아래쪽 기준선을 맞춰, 헤드라인 마지막 줄과
            채널 버튼 줄이 같은 라인에 놓이게 한다. */}
        <div className="mt-6 flex flex-col gap-8 md:mt-8 md:flex-row md:items-end md:justify-between md:gap-10">
          {/* 배열 한 칸 = 한 줄. block span 으로 쌓아 <br> 없이 줄을 나눈다. */}
          <p className="text-[1.6rem] leading-[1.35] font-extrabold tracking-tight md:text-[2.4rem]">
            {site.footerHeadline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>

          {/* 대표번호 + 그 아래 채널 버튼 줄.
            md 이상에서는 오른쪽 끝으로 정렬해 좌측 약관과 양 끝에 놓이게 한다. */}
        <div className="flex flex-col gap-3 md:items-end">
          {/*
            대표번호 — 푸터에서 가장 강한 신호.
            라벨은 흰 글자 굵게, 번호는 다크용 밝은 블루로 크게 띄운다.
            tel: 링크로 감싸 모바일에서 바로 통화로 이어지게 한다.
          */}
          <p className="flex items-baseline gap-2.5">
            <span className="text-base font-extrabold text-white md:text-lg">
              대표번호
            </span>
            <a
              href={`tel:${site.tel}`}
              aria-label={`${site.name} 대표번호 ${site.tel} 로 연결`}
              className="text-primary-on-dark text-xl font-extrabold tracking-tight transition-colors hover:text-white md:text-2xl"
            >
              {site.tel}
            </a>
          </p>

          {/* ── 채널 버튼 4개 (2026-07-31 추가) ──────────────────────────
              전화 / 카카오톡 / 인스타그램 / 블로그.

              모두 같은 크기의 원형 버튼으로 통일했다. 채널마다 다른 모양을 주면
              "무엇이 더 중요한가" 하는 없는 위계가 생긴다. 중요도 차이는
              바로 위 대표번호가 이미 표현하고 있다.

              아이콘 선과 바깥 원 테두리에 각 채널의 브랜드 색을 상시로 입혔다.
              면(배경)까지 브랜드 색으로 채우면 원색 원 4개가 나란히 켜져 다크 톤이
              깨지므로, 채우기는 hover 에서만 일어난다.

              외부 링크는 target="_blank" 로 새 탭에서 열고,
              rel="noopener noreferrer" 로 원본 탭 접근(window.opener)을 차단한다. */}
          <ul className="flex items-center gap-2.5">
            {channels.map((channel) => (
              <li key={channel.id}>
                <a
                  href={channel.href}
                  aria-label={channel.label}
                  title={channel.label}
                  /* tel: 은 같은 탭에서 열려야 통화 앱으로 넘어간다.
                     외부 채널만 새 탭 처리한다. */
                  {...(channel.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className={[
                    /* 테두리·아이콘 색은 channel.colorClass 가 지정한다.
                       면은 평소 거의 투명하고 hover 에서만 브랜드 색으로 찬다. */
                    'flex h-13 w-13 items-center justify-center rounded-full border bg-white/5',
                    'transition-colors duration-200',
                    channel.colorClass,
                  ].join(' ')}
                >
                  {channel.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
        </div>

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
                className="flex flex-col gap-y-1 text-[0.8rem] leading-relaxed text-white/55 md:flex-row md:flex-wrap md:gap-x-6 md:text-sm"
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
          <p className="text-[0.8rem] text-white/40 md:text-sm">
            Copyright ⓒ {COPYRIGHT_YEAR} {site.name}. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
}

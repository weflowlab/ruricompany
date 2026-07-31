/**
 * ConsultSection — 페이지 하단 "무료 상담 신청" 섹션
 *
 * 역할
 *  - 페이지 구조 10번 섹션. 스크롤을 끝까지 내린 사용자가 마지막으로 만나는 전환 지점이다.
 *  - 좌측에는 공용 상담 폼(full 변형), 우측에는 전화 / 카카오톡 CTA 카드 2개를 배치한다.
 *  - 헤더 GNB·플로팅 CTA 에서 `#consult` 앵커로 이동해 오는 목적지이기도 하다.
 *
 * 인터랙션
 *  - 이 컴포넌트 자체에는 상태가 없다 → **서버 컴포넌트**.
 *    입력·검증 등 클라이언트 로직은 전부 자식인 ConsultForm('use client') 안에 있다.
 *  - CTA 카드는 hover / focus 시 살짝 떠오르고(translate-y) 그림자가 깊어진다.
 *    (prefers-reduced-motion 사용자는 globals.css 가 transition 을 끄므로 이동만 즉시 적용)
 *
 * 원본 대응
 *  - 원본 하단 상담 영역(좌 폼 / 우 전화·카톡 버튼)에 대응한다.
 *
 * 반응형
 *  - 1024px 미만 : 폼 → CTA 카드 순서로 세로 스택 (1열)
 *  - 1024px 이상 : 좌 1.25 : 우 1 비율의 2열
 */

import SectionTitle from './SectionTitle';
import ConsultForm from './ConsultForm';
import { site } from '../_data/site';

export default function ConsultSection() {
  /*
   * tel: 링크에는 하이픈 등 숫자가 아닌 문자를 넣지 않는 편이 호환성이 좋다.
   * site.tel 이 '0000-0000' 이므로 숫자만 남겨 '00000000' 형태로 만든다.
   */
  const telHref = `tel:${site.tel.replace(/[^0-9]/g, '')}`;

  /* CTA 카드 공통 클래스 — 흰 카드 + 라운드 + hover 시 떠오름 */
  const cardBase =
    'group flex items-center gap-4 rounded-2xl border p-6 shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] focus-visible:-translate-y-1 md:p-7';

  return (
    <section id="consult" className="bg-surface py-15 md:py-25">
      <div className="mx-auto w-full max-w-[1320px] px-5">
        {/* 섹션 제목 — 강조어만 primary 색으로 */}
        <SectionTitle
          title="1분이면 충분한 "
          highlight="무료 견적 상담"
          description="차종과 연락처만 남겨 주시면 조건에 맞는 월 납입액을 정리해 안내해 드립니다. 상담만 받아 보셔도 부담 없습니다."
        />

        {/*
          2열 레이아웃.
          - 기본(모바일/태블릿) : 1열 세로 스택
          - lg(1024px) 이상    : 폼이 조금 더 넓은 1.25 : 1 비율
        */}
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-10">
          {/* ───────────────── 좌측 : 상담 폼 카드 ───────────────── */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.05)] md:p-9">
            <h3 className="text-lg font-bold text-ink md:text-xl">견적 신청서</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-sub">
              아래 항목을 채워 주시면 담당 매니저가 확인 후 순차적으로 연락드립니다.
            </p>

            {/* 공용 폼의 full 변형 — 라벨이 보이고 2열 그리드로 배치된다 */}
            <div className="mt-6">
              <ConsultForm variant="full" />
            </div>
          </div>

          {/* ───────────────── 우측 : 연락 CTA 카드 ───────────────── */}
          <div className="flex flex-col gap-5">
            {/* ── 카드 1 : 전화 상담 ──
                tel: 링크라 모바일에서는 바로 통화 앱이 열린다. */}
            <a
              href={telHref}
              aria-label={`전화 상담 걸기 ${site.tel}`}
              className={`${cardBase} border-line bg-white`}
            >
              {/* 아이콘 원형 배지 (인라인 SVG — 외부 아이콘 라이브러리 사용 금지) */}
              <span
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  {/* 수화기 모양 패스 */}
                  <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24c1.1.37 2.3.57 3.5.57a1 1 0 011 1V20a1 1 0 01-1 1C10.9 21 3 13.1 3 3.4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.4.57 3.5a1 1 0 01-.25 1l-2.22 2.2z" />
                </svg>
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink-sub">전화 상담</span>
                {/* 큰 전화번호 — 이 카드의 핵심 정보 */}
                <strong className="mt-0.5 block text-2xl font-extrabold tracking-tight text-ink md:text-[1.75rem]">
                  {site.tel}
                </strong>
                <span className="mt-1 block text-xs text-ink-sub">
                  평일 09:00 ~ 19:00 / 주말·공휴일 예약 상담
                </span>
              </span>
            </a>

            {/* ── 카드 2 : 카카오톡 상담 ──
                TODO: 실제 서비스에서는 href 를 카카오톡 채널 주소로 교체한다.
                      지금은 외부 링크를 쓰지 않는 더미 구현이라 위쪽 상담 폼으로 이동시킨다. */}
            <a
              href="#consult"
              aria-label="카카오톡으로 상담 신청하기"
              className={`${cardBase} border-[#f2d64b] bg-[#fee500]`}
            >
              <span
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black/10 text-[#3a1d1d]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  {/* 말풍선 모양 패스 */}
                  <path d="M12 3C6.9 3 2.8 6.3 2.8 10.3c0 2.6 1.7 4.8 4.3 6.1l-1 3.7c-.1.3.2.6.5.4l4.4-2.9c.3 0 .7.1 1 .1 5.1 0 9.2-3.3 9.2-7.4S17.1 3 12 3z" />
                </svg>
              </span>

              <span className="min-w-0">
                {/* '가장 빠르게' 라벨 — 이 카드를 우선 선택하도록 유도하는 뱃지 */}
                <span className="inline-block rounded-full bg-[#3a1d1d] px-2 py-0.5 text-[0.7rem] font-bold text-[#fee500]">
                  가장 빠르게
                </span>
                <strong className="mt-1.5 block text-xl font-extrabold tracking-tight text-[#3a1d1d] md:text-2xl">
                  카카오톡 상담
                </strong>
                <span className="mt-1 block text-xs text-[#3a1d1d]/70">
                  채팅으로 편하게 문의하고 견적을 받아 보세요.
                </span>
              </span>
            </a>

            {/* ── 보조 안내 박스 ──
                CTA 카드만 있으면 우측 열이 허전해 보여, 신뢰를 더하는 짧은 안내를 덧붙였다. */}
            <div className="rounded-2xl border border-line bg-white p-5 text-sm leading-relaxed text-ink-sub md:p-6">
              <strong className="mb-1.5 block font-semibold text-ink">상담 전 확인해 주세요</strong>
              <ul className="list-disc space-y-1 pl-4">
                <li>상담과 견적 산출은 전액 무료이며 별도 수수료가 없습니다.</li>
                <li>남겨 주신 정보는 상담 목적 외에 사용되지 않습니다.</li>
                <li>차량 재고와 프로모션 조건은 시점에 따라 달라질 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

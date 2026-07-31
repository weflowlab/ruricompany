'use client';

/**
 * FaqSection.tsx — 자주 묻는 질문(FAQ) 아코디언 섹션
 *
 * 무엇을 하는 섹션인가
 *  - `app/_data/faq.ts` 의 `faqItems`(8개)를 아코디언 목록으로 렌더링한다.
 *  - 페이지 최하단 상담 영역 직전에 위치하며, 앵커 `#faq` 로 GNB에서 스크롤 이동한다.
 *
 * 어떤 인터랙션이 있는가
 *  1. 아코디언 — 질문 줄을 누르면 답변이 열린다. **한 번에 하나만 열린다.**
 *     열려 있는 항목을 다시 누르면 닫힌다. (openId 상태 하나로 단일 개폐 제어)
 *  2. 높이 애니메이션 — JS로 높이를 계산하지 않고 CSS grid 트릭을 쓴다.
 *     바깥 div 를 `display:grid` 로 두고 `grid-template-rows` 를 `0fr ↔ 1fr` 로 전환하면
 *     내용 높이를 몰라도 브라우저가 알아서 보간해 준다. (안쪽 div 는 `overflow-hidden` 필수)
 *  3. +/− 아이콘 — 닫혀 있을 때 `+`, 열리면 래퍼가 45도 회전해 `×` 모양이 된다.
 *  4. 스크롤 진입 시 목록 전체가 살짝 떠오르는 페이드업. (useInView, 1회만)
 *
 * 원본 사이트 대응
 *  - sec6 FAQ 영역. 원본 `.boxwrap { background:#f9f9f9; border-radius:20px; padding:0 40px; margin-bottom:20px }`
 *    수치를 그대로 반영했다 → `bg-surface rounded-[20px] px-6 md:px-10 mb-5`.
 *
 * 접근성
 *  - 질문은 실제 `<button>` 이므로 Tab 이동 / Enter·Space 조작이 기본 지원된다.
 *  - `aria-expanded` 로 열림 상태를, `aria-controls` 로 답변 패널을 연결한다.
 *  - 답변 패널은 `role="region"` + `aria-labelledby`(질문 버튼 id)로 이름을 갖는다.
 *  - 닫힌 패널에는 `inert` 를 걸어 화면에는 0 높이로 남아 있어도
 *    스크린리더 낭독 대상과 Tab 순서에서 제외되도록 한다.
 *  - `prefers-reduced-motion` 사용자를 위해 `motion-reduce:transition-none` 을 붙였다.
 *    (globals.css 에도 전역 차단 규칙이 있으나 컴포넌트 단에서도 명시한다.)
 */

import { useState } from 'react';

import SectionTitle from './SectionTitle';
import { faqItems } from '../_data/faq';
import { useInView } from '../_hooks/useInView';

export default function FaqSection() {
  /**
   * 현재 열려 있는 항목의 id. `null` 이면 전부 닫힌 상태.
   * 배열이 아니라 단일 값이므로 "한 번에 하나만 열림"이 구조적으로 보장된다.
   */
  const [openId, setOpenId] = useState<string | null>(null);

  /** 섹션이 화면에 들어오면 목록에 페이드업을 적용하기 위한 관찰 ref (once: true → 1회만) */
  const [listRef, listInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });

  /**
   * 질문 버튼 클릭 핸들러.
   * - 지금 열려 있는 항목을 다시 누르면 `null` 로 만들어 닫는다(토글).
   * - 다른 항목을 누르면 그 id 로 교체 → 기존에 열려 있던 항목은 자동으로 닫힌다.
   */
  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-white py-15 md:py-25"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5">
        {/* 섹션 타이틀 — 강조 단어만 primary 색으로 표시된다 */}
        <div id="faq-heading">
          <SectionTitle
            title="자주 묻는 "
            highlight="질문"
            description="상담 전에 많이 물어보시는 내용을 모았습니다. 찾는 답이 없다면 편하게 문의해 주세요."
          />
        </div>

        {/*
          아코디언 목록.
          - 가독성을 위해 본문 폭을 900px 로 제한하고 가운데 정렬한다.
          - 스크롤 진입 시 아래에서 위로 8px 올라오며 나타난다.
        */}
        <div
          ref={listRef}
          className={[
            'mx-auto w-full max-w-[900px]',
            'transition-all duration-700 ease-out motion-reduce:transition-none',
            listInView ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          ].join(' ')}
        >
          <ul className="list-none">
            {faqItems.map((item) => {
              /** 이 항목이 현재 열려 있는가 */
              const open = openId === item.id;
              /** aria-controls / id 로 서로를 가리키기 위한 고정 문자열 */
              const buttonId = `${item.id}-button`;
              const panelId = `${item.id}-panel`;

              return (
                <li
                  key={item.id}
                  /* 원본 .boxwrap 수치: 회색 배경 / 라운드 20px / 좌우 패딩 / 아래 여백 20px */
                  className="bg-surface mb-5 overflow-hidden rounded-[20px] px-6 shadow-sm md:px-10"
                >
                  {/* ── 질문 줄 ─────────────────────────────────────────── */}
                  <h3 className="m-0">
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => handleToggle(item.id)}
                      className="flex w-full cursor-pointer items-center gap-3 py-6 text-left md:gap-4 md:py-7"
                    >
                      {/* 좌측 Q 배지 — primary 색 원형 배지 */}
                      <span
                        aria-hidden="true"
                        className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.95rem] font-bold text-white md:h-9 md:w-9 md:text-[1.05rem]"
                      >
                        Q
                      </span>

                      {/* 질문 텍스트 — 남는 폭을 모두 차지하고, 열리면 primary 색으로 강조 */}
                      <span
                        className={[
                          'flex-1 text-[1rem] leading-snug font-semibold transition-colors duration-200 md:text-[1.15rem]',
                          'motion-reduce:transition-none',
                          open ? 'text-primary' : 'text-ink',
                        ].join(' ')}
                      >
                        {item.question}
                      </span>

                      {/*
                        우측 +/− 아이콘.
                        가로 막대 1개 + 세로 막대 1개로 `+` 를 만들고,
                        열렸을 때 래퍼 전체를 45도 돌려 `×` 로 보이게 한다.
                      */}
                      <span
                        aria-hidden="true"
                        className={[
                          'relative h-5 w-5 shrink-0 transition-transform duration-300 ease-out',
                          'motion-reduce:transition-none',
                          open ? 'text-primary rotate-45' : 'text-ink-sub rotate-0',
                        ].join(' ')}
                      >
                        {/* 가로 막대 (항상 표시) */}
                        <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 rounded-full bg-current" />
                        {/* 세로 막대 (항상 표시 — 45도 회전과 합쳐져 × 모양이 된다) */}
                        <span className="absolute top-0 left-1/2 h-full w-[2px] -translate-x-1/2 rounded-full bg-current" />
                      </span>
                    </button>
                  </h3>

                  {/* ── 답변 패널 ───────────────────────────────────────── */}
                  {/*
                    높이 애니메이션 트릭:
                    바깥 grid 컨테이너의 grid-template-rows 를 0fr ↔ 1fr 로 전환한다.
                    JS로 scrollHeight 를 재지 않아도 되고, 내용이 바뀌어도 항상 정확하다.
                  */}
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                    style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                  >
                    {/* 실제로 잘려 나가는 층. overflow-hidden 이 없으면 0fr 이어도 내용이 삐져나온다 */}
                    <div className="overflow-hidden">
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        /* 닫혀 있는 동안에는 포커스·스크린리더 대상에서 제외 */
                        inert={!open}
                        className="border-line flex gap-3 border-t pt-5 pb-6 md:gap-4 md:pt-6 md:pb-8"
                      >
                        {/* 좌측 A 배지 — Q 배지와 같은 크기, 대비를 위해 흰 배경 + primary 테두리 */}
                        <span
                          aria-hidden="true"
                          className="border-primary text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white text-[0.95rem] font-bold md:h-9 md:w-9 md:text-[1.05rem]"
                        >
                          A
                        </span>

                        {/* answer 배열의 각 원소를 한 문단씩 렌더링 */}
                        <div className="text-ink-sub flex-1 text-[0.92rem] leading-relaxed md:text-[1rem]">
                          {item.answer.map((paragraph, index) => (
                            <p key={index} className={index === 0 ? '' : 'mt-3'}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* 하단 CTA 한 줄("더 궁금한 점은 상담으로 확인해 주세요 …")은
              2026-07-31 삭제했다. 상단 히어로에 이미 견적 폼이 있고,
              모바일 플로팅 바에도 전화/상담 버튼이 상시 떠 있어 중복이었다. */}
        </div>
      </div>
    </section>
  );
}

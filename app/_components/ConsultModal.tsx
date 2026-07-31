'use client';

/**
 * ConsultModal — "상담 신청" 팝업 (모달 다이얼로그)
 *
 * 왜 만들었나 (2026-07-30 클라이언트 요청)
 *  - 원본 사이트(화물1번지)에서는 차량 카드의 "상담받기" 를 누르면 페이지 이동 없이
 *    상담 폼이 팝업으로 뜨고, 누른 차량의 차종이 폼에 미리 채워져 있다.
 *    클라이언트가 캡처를 보내며 같은 동작을 요청했다.
 *  - 지금까지는 카드 버튼이 하단 문의 섹션(#consult)으로 앵커 스크롤만 했는데,
 *    긴 페이지를 내려보내는 것보다 그 자리에서 바로 입력받는 쪽이
 *    구글폼 4번(상담 유도) / 7-1(편하게 상담) 에 더 맞는다.
 *
 * 역할
 *  - 딤드 오버레이 + 중앙 흰 카드 안에 공용 상담 폼(<ConsultForm variant="compact" />)을
 *    담아 보여 준다. compact 변형(라벨 숨김 / 1열)은 히어로 개편으로 소비처를 잃었던
 *    것인데, 이 모달이 새 소비처가 됐다 — 캡처의 폼도 라벨 없는 1열 구성이다.
 *  - vehicleName 을 받으면 폼 안에 해당 차종이 미리 채워진다(ConsultForm 의
 *    presetVehicle prop 으로 전달). 어느 차를 보다가 왔는지 상담자가 알 수 있다.
 *
 * 동작 (제거된 옛 Header 모바일 패널과 같은 관례를 따른다)
 *  - 열려 있는 동안 body 스크롤을 잠근다. cleanup 에서 원래 값으로 되돌린다.
 *  - Esc 키 / 딤드 클릭 / X 버튼 어느 것으로도 닫힌다.
 *  - Tab 포커스가 모달 밖으로 새지 않도록 내부에서 순환시킨다(포커스 트랩).
 *  - 열리면 첫 포커스 가능한 요소로, 닫히면 열기 전에 포커스가 있던 요소로 되돌린다.
 *  - 닫힌 상태에서는 아예 렌더하지 않는다(return null). DOM 에 남겨 두고
 *    opacity 로 숨기는 방식은 폼 입력값이 열 때마다 남아 있게 되는데,
 *    "다른 차량"으로 다시 열 때 이전 차종·입력이 남아 있으면 오히려 혼란스럽다.
 *    언마운트 → 재마운트로 폼이 매번 초기화되는 쪽이 이 용도에 맞는다.
 *
 * 접근성
 *  - role="dialog" + aria-modal 로 모달임을 알리고, aria-labelledby 로 제목과 연결한다.
 */

import { useEffect, useRef } from 'react';

import ConsultForm from './ConsultForm';
import { site } from '../_data/site';

/** ConsultModal 이 받는 props */
type ConsultModalProps = {
  /** true 일 때만 렌더된다 */
  open: boolean;
  /** 닫기 요청 콜백 — Esc / 딤드 클릭 / X 버튼이 모두 이것을 호출한다 */
  onClose: () => void;
  /** 폼에 미리 채울 차종명 (예: "쏘렌토 하이브리드"). 없으면 차종 없이 일반 상담 폼 */
  vehicleName?: string;
};

export default function ConsultModal({
  open,
  onClose,
  vehicleName,
}: ConsultModalProps) {
  /** 모달 카드 DOM — 포커스 트랩에서 내부 포커스 가능 요소를 찾을 때 사용 */
  const panelRef = useRef<HTMLDivElement>(null);

  /*
   * 열림 중 부수효과 3종을 한 effect 로 묶는다 (조건·해제 시점이 전부 동일하므로).
   *  1) body 스크롤 잠금 — 이전 inline 값을 기억했다가 cleanup 에서 복원
   *  2) 키보드 — Esc 로 닫기 + Tab 포커스 트랩
   *  3) 포커스 이동 — 열리면 모달 안 첫 요소로, 닫히면(cleanup) 원래 자리로
   */
  useEffect(() => {
    if (!open) return;

    // (1) body 스크롤 잠금
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // (3) 지금 포커스된 요소(= 상담받기 버튼)를 기억해 두고, 모달 안으로 포커스 이동
    const previousActive = document.activeElement as HTMLElement | null;
    panelRef.current
      ?.querySelector<HTMLElement>('button, a[href], input, select, textarea')
      ?.focus();

    // (2) 키보드 처리
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      // 모달 안에서 실제로 포커스를 받을 수 있는 요소들만 수집한다
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey) {
        // Shift+Tab 인데 첫 요소에 있으면 → 마지막 요소로 되돌린다
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // 일반 Tab 인데 마지막 요소에 있으면 → 첫 요소로 되돌린다
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // 모달을 열었던 버튼으로 포커스를 되돌린다 (요소가 사라졌을 수도 있으므로 옵셔널)
      previousActive?.focus?.();
    };
  }, [open, onClose]);

  // 닫힌 상태 — 아예 렌더하지 않는다 (파일 상단 주석의 "초기화" 근거 참고)
  if (!open) return null;

  return (
    /*
     * 최상위 래퍼 — 화면 전체를 덮는 고정 레이어.
     * z-[70] : 고정 헤더(z-50)·플로팅 CTA(z-40)보다 위.
     * 모바일에서는 카드가 화면 아래쪽에 닿지 않도록 세로 중앙 + 좌우 여백을 준다.
     */
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6">
      {/* 딤드 오버레이 — 클릭하면 닫힌다. 장식이므로 보조기기에서는 숨긴다 */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
      />

      {/*
       * 모달 카드 본체.
       * relative : 딤드(absolute) 위로 올라오게 한다.
       * max-h + overflow-y-auto : 약관 패널을 펼치는 등 내용이 길어져도
       * 화면 밖으로 넘치지 않고 카드 안에서 스크롤된다.
       */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consult-modal-title"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[26rem] overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_12px_48px_rgba(0,0,0,0.24)] md:p-7"
      >
        {/* 헤더 — 제목 + 닫기(X) 버튼 */}
        <div className="mb-1 flex items-start justify-between gap-3">
          <h2
            id="consult-modal-title"
            className="text-xl font-extrabold text-ink md:text-2xl"
          >
            상담 신청
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="상담 신청 창 닫기"
            className="-mt-1 -mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-sub transition-colors hover:bg-surface hover:text-ink"
          >
            {/* 닫기 X 아이콘 (인라인 SVG) */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L17 17M17 1L1 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 부제 — 담당자명으로 "누가 연락하는지" 를 알린다 (구글폼 17번 / 7-1) */}
        <p className="mb-5 text-[13px] leading-relaxed text-ink-sub">
          연락처만 남겨 주시면 담당 {site.manager} 매니저가 직접 확인해 안내해
          드립니다.
        </p>

        {/* 공용 상담 폼 — 라벨 숨김 / 1열의 compact 변형. 차종을 미리 채워 넘긴다 */}
        <ConsultForm variant="compact" presetVehicle={vehicleName} />
      </div>
    </div>
  );
}

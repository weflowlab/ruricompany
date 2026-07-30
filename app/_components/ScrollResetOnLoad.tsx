'use client';

/**
 * ScrollResetOnLoad — 새로고침하면 항상 페이지 맨 위에서 시작하게 만드는 부수효과 컴포넌트
 *
 * 문제
 *  브라우저는 기본적으로 새로고침(F5 / Cmd+R) 시 **직전 스크롤 위치를 복원**한다
 *  (`history.scrollRestoration` 의 기본값이 'auto'). 랜딩페이지는 히어로 → 서비스 →
 *  차량 → 문의 순서로 읽히도록 설계돼 있어서, 페이지 중간에서 새로고침했을 때
 *  그 중간부터 다시 시작하면 위에서부터 읽는 흐름이 깨진다.
 *
 * 해결
 *  1) `history.scrollRestoration = 'manual'` — 복원 동작을 끈다.
 *     ⚠️ 이 값은 **다음 로드부터** 적용된다. 이번 로드에서는 이미 브라우저가
 *        복원을 마친 뒤이므로, 아래 2)로 현재 위치도 직접 되돌려야 한다.
 *  2) `window.scrollTo(0, 0)` — 이번 로드의 복원된 위치를 즉시 맨 위로 되돌린다.
 *     globals.css 가 `scroll-behavior: smooth` 를 걸어 두었으므로 그냥 부르면
 *     새로고침 직후 화면이 주르륵 올라가는 게 보인다. `behavior: 'instant'` 로
 *     이 한 번만 부드러운 스크롤을 건너뛴다.
 *
 * 예외 — 해시(#consult 등)가 붙은 주소
 *  플로팅 CTA·헤더 버튼이 `#consult` 로 이동시킨 상태에서 새로고침하거나,
 *  누군가 `.../#consult` 링크를 직접 열었을 때까지 맨 위로 끌어올리면
 *  "앵커 링크가 동작하지 않는" 버그가 된다. 그래서 해시가 있으면 2)를 건너뛴다.
 *  (1)의 scrollRestoration 설정은 해시 여부와 무관하게 항상 적용한다 —
 *   해시가 있으면 브라우저 복원 대신 해시 위치로 가는 게 맞는 동작이다.)
 *
 * 왜 컴포넌트인가
 *  layout.tsx 는 서버 컴포넌트라 window/history 에 접근할 수 없다.
 *  화면에 아무것도 그리지 않고(null) 부수효과만 담당하는 클라이언트 컴포넌트를
 *  하나 두어 <body> 안에 얹는 방식이 가장 가볍다.
 */

import { useEffect } from 'react';

export default function ScrollResetOnLoad() {
  useEffect(() => {
    // 아주 오래된 브라우저에는 scrollRestoration 이 없다 — 있을 때만 끈다
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 해시 링크로 들어온 경우는 그 섹션으로 가는 게 맞으므로 건드리지 않는다
    if (window.location.hash) return;

    // 이번 로드에서 이미 복원된 위치를 맨 위로. instant = smooth 스크롤 건너뛰기
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // 렌더할 UI 가 없다
  return null;
}
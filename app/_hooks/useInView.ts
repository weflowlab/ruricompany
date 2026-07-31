"use client";

/**
 * useInView — 요소가 화면(뷰포트)에 들어왔는지 감지하는 IntersectionObserver 훅
 *
 * 역할
 *  - 스크롤 진입 시 페이드업/스태거 애니메이션을 트리거하기 위한 공용 훅.
 *    반환된 ref 를 DOM 요소에 달아 두면, 그 요소가 화면에 보이는 순간 inView 가 true 가 된다.
 *
 * 사용 예
 *  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2, once: true })
 *  <div ref={ref} className={inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} />
 *
 * 원본 대응
 *  - 텍스트 배너 페이드업, 이용 절차 5단계 순차 등장 등 스크롤 기반 등장 효과 전반.
 *
 * SSR 안전성
 *  - 관찰 로직은 전부 useEffect 안에서만 실행되므로 서버 렌더 단계에서는 동작하지 않는다.
 *  - IntersectionObserver 를 지원하지 않는 환경에서는 곧바로 inView=true 로 만들어
 *    콘텐츠가 영영 숨겨지는(투명도 0으로 남는) 사고를 방지한다.
 */

import { useEffect, useRef, useState, type RefObject } from "react";

/** useInView 옵션 */
export type UseInViewOptions = {
  /**
   * 요소가 몇 % 보였을 때 감지할지. 0~1 사이 값.
   * 기본 0.2 = 요소의 20% 가 보이면 등장으로 판단한다.
   */
  threshold?: number;
  /**
   * 뷰포트 경계를 늘리거나 줄이는 마진. CSS margin 문법 문자열.
   * 예) "0px 0px -80px 0px" → 화면 아래쪽 80px 은 아직 "보이지 않은 것"으로 취급.
   */
  rootMargin?: string;
  /**
   * true 면 한 번 보인 뒤 관찰을 해제한다(등장 애니메이션은 보통 1회로 충분).
   * false 면 스크롤로 화면을 벗어날 때 다시 false 가 된다.
   * 기본값 true.
   */
  once?: boolean;
};

/**
 * @returns [ref, inView] 튜플
 *  - ref: 관찰할 DOM 요소에 그대로 달아 주는 ref 객체
 *  - inView: 화면 진입 여부
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options: UseInViewOptions = {},
): [RefObject<T | null>, boolean] {
  // 옵션 기본값 — 호출부에서 일부만 넘겨도 되도록 여기서 채운다
  const { threshold = 0.2, rootMargin = "0px", once = true } = options;

  // 관찰 대상 DOM 요소를 담을 ref. 초기값은 null (아직 마운트 전)
  const ref = useRef<T>(null);

  // 화면 진입 여부. 서버 렌더 시점에는 항상 false 로 시작한다.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // 마운트된 실제 DOM 노드. 아직 없으면 아무것도 하지 않는다.
    const element = ref.current;
    if (!element) return;

    // 구형 브라우저/테스트 환경 대비 — 관찰이 불가능하면 곧바로 보인 것으로 처리한다.
    //
    // 이때 setInView 를 effect 본문에서 "동기적으로" 호출하면
    // 렌더 → effect → setState → 재렌더 가 연쇄로 일어나고,
    // React 의 set-state-in-effect 규칙에도 걸린다.
    // 그래서 requestAnimationFrame 콜백(= 외부 시스템의 콜백)으로 한 프레임 미뤄서 호출하고,
    // cleanup 에서 예약된 프레임을 취소해 언마운트 후 setState 가 일어나지 않게 한다.
    if (typeof IntersectionObserver === "undefined") {
      const frameId = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // 관찰 대상이 하나뿐이므로 첫 번째 엔트리만 사용한다
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setInView(true);
          // once 모드에서는 한 번 보이면 더 이상 감시할 필요가 없으므로 해제
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          // 반복 모드에서만 화면을 벗어났을 때 false 로 되돌린다
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    // 언마운트 또는 옵션 변경 시 관찰을 정리해 메모리 누수를 막는다
    return () => observer.disconnect();
    // 옵션 값이 바뀌면 옵저버를 새로 만든다 (객체가 아닌 원시값만 의존성에 넣어 재생성 최소화)
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/**
 * Placeholder — 이미지 자리 표시 컴포넌트
 *
 * 역할
 *  - 이 클론 프로젝트는 실제 이미지 파일/URL 을 일절 사용하지 않는다.
 *    원본 사이트에서 사진이 들어가던 모든 자리를 이 컴포넌트로 대체한다.
 *  - 점선 테두리 + 연회색 배경 + 중앙 이미지 아이콘(인라인 SVG) + 한국어 라벨 로
 *    "여기에 어떤 이미지가 들어갈 자리인지"를 눈으로 바로 알 수 있게 한다.
 *
 * 인터랙션
 *  - 없음. 순수 표시용이므로 'use client' 가 필요 없는 서버 컴포넌트다.
 *  - 다만 부모(차량 카드 등)가 hover 시 확대 효과를 주는 경우가 있어
 *    transform 이 걸려도 깨지지 않도록 내부를 flex 중앙 정렬로만 구성했다.
 *
 * 원본 대응
 *  - 히어로 캐러셀 슬라이드, 차량 카드 썸네일, 후기 모달 이미지,
 *    이용 절차 섹션 배경, 제휴사 로고 등 이미지가 있던 전 영역.
 */

/** Placeholder 가 받는 props */
type PlaceholderProps = {
  /** 이 자리에 들어갈 이미지에 대한 한국어 설명. 예: "히어로 배너 이미지" */
  label: string;
  /**
   * CSS aspect-ratio 문자열. "16/9", "4/3", "1/1" 처럼 전달한다.
   * 인라인 style 로 적용하므로 Tailwind 임의값 클래스를 만들 필요가 없다.
   * 기본값은 가로형 배너에 흔한 16/9.
   */
  ratio?: string;
  /** 추가 클래스. 크기(w-full, h-full)나 여백을 부모가 직접 제어할 때 사용 */
  className?: string;
  /** true 면 모서리를 둥글게(rounded-2xl) 처리한다 */
  rounded?: boolean;
};

export default function Placeholder({
  label,
  ratio = "16/9",
  className = "",
  rounded = false,
}: PlaceholderProps) {
  return (
    <div
      /*
       * role="img" + aria-label 조합으로 스크린리더에게 "이미지"로 읽히게 한다.
       * 내부 SVG 아이콘과 텍스트는 장식이므로 중복 낭독을 막기 위해 aria-hidden 처리.
       */
      role="img"
      aria-label={`${label} (이미지 자리 표시)`}
      /* aspect-ratio 는 문자열을 그대로 받아 인라인 style 로 적용 */
      style={{ aspectRatio: ratio }}
      className={[
        // 기본 박스: 점선 테두리 + 연회색 배경 + 내용 중앙 정렬
        "flex w-full flex-col items-center justify-center gap-2",
        "border border-dashed border-line bg-surface",
        // 아이콘/글자 색은 보조 톤으로 낮춰 실제 콘텐츠와 헷갈리지 않게 한다
        "text-ink-sub select-none",
        // 내부 콘텐츠가 넘칠 때 잘라 낸다 (부모의 hover 확대 효과 대응)
        "overflow-hidden",
        // 라벨이 길어질 수 있으니 좌우 여백 확보
        "px-4 text-center",
        rounded ? "rounded-2xl" : "",
        className,
      ]
        // 빈 문자열을 걸러 낸 뒤 공백으로 합친다
        .filter(Boolean)
        .join(" ")}
    >
      {/* 중앙 이미지 아이콘 — 외부 아이콘 라이브러리 없이 인라인 SVG 로 직접 그린다 */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        /* 컨테이너가 아주 작아도(로고 자리 등) 아이콘이 박스를 넘지 않도록 크기 제한 */
        className="h-6 w-6 shrink-0 opacity-50 md:h-8 md:w-8"
      >
        {/* 사진 프레임 */}
        <rect x="3" y="4" width="18" height="16" rx="2" />
        {/* 해 모양 점 */}
        <circle cx="8.5" cy="9.5" r="1.5" />
        {/* 산 모양 실루엣 */}
        <path d="M21 16l-5-5-5 5" />
        <path d="M11 16l-2-2-6 6" />
      </svg>

      {/* 라벨 텍스트 — 어떤 이미지가 들어갈 자리인지 한국어로 설명 */}
      <span
        aria-hidden="true"
        className="text-[11px] leading-snug font-medium md:text-xs"
      >
        {label}
      </span>
    </div>
  );
}

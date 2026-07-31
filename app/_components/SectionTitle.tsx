/**
 * SectionTitle — 섹션 공통 제목 블록
 *
 * 역할
 *  - 페이지의 각 섹션(고객 후기 / 인기 차량 / 이용 절차 / FAQ ...) 상단에 오는
 *    중앙 정렬 제목을 통일된 모양으로 렌더링한다.
 *  - h2 안에서 `title` 은 기본 잉크색, `highlight` 만 브랜드 그린(primary)으로 강조한다.
 *  - 그 아래 회색 설명문(description)은 선택 사항이다.
 *
 * 인터랙션
 *  - 없음(순수 표시용) → 서버 컴포넌트.
 *    스크롤 진입 애니메이션이 필요하면 이 컴포넌트를 감싸는 쪽에서 useInView 를 쓴다.
 *
 * 원본 대응
 *  - 원본의 각 섹션 헤더(중앙 정렬 h2 + 강조 단어 + 아래 설명 p) 영역.
 *    데스크톱 2.6rem / 모바일 1.6rem 크기 규칙을 반응형 클래스로 옮겼다.
 *
 * 사용 예
 *  <SectionTitle title="이번 달 " highlight="인기 차량" description="설명 문구" />
 *  → "이번 달 인기 차량" 에서 '인기 차량' 만 초록색으로 표시된다.
 *    (title 끝의 공백까지 그대로 렌더되므로 호출부에서 띄어쓰기를 포함해 넘긴다.)
 */

/** SectionTitle 이 받는 props */
type SectionTitleProps = {
  /** 제목의 앞부분(기본 색). 강조어와 붙지 않게 끝에 공백을 포함해 넘기는 것을 권장 */
  title: string;
  /** 브랜드 그린으로 강조할 단어. 없으면 렌더링하지 않는다 */
  highlight?: string;
  /** 제목 아래 보조 설명문. 없으면 렌더링하지 않는다 */
  description?: string;
};

export default function SectionTitle({
  title,
  highlight,
  description,
}: SectionTitleProps) {
  return (
    /* 섹션 제목과 본문 사이 간격: 모바일 32px / 데스크톱 56px */
    <header className="mb-8 text-center md:mb-14">
      {/*
        h2 크기: 모바일 1.6rem → 태블릿 2.1rem → 데스크톱 2.6rem
        tracking-tight 로 한글 제목의 자간을 살짝 좁혀 밀도를 높인다.
      */}
      <h2 className="text-[1.6rem] font-extrabold tracking-tight text-ink md:text-[2.1rem] lg:text-[2.6rem]">
        {title}
        {/* highlight 가 있을 때만 primary 색 span 을 덧붙인다 */}
        {highlight ? <span className="text-primary">{highlight}</span> : null}
      </h2>

      {/* 설명문 — 한 줄이 너무 길어지지 않도록 최대 폭을 제한하고 가운데 정렬 */}
      {description ? (
        <p className="mx-auto mt-3 max-w-[640px] text-sm leading-relaxed text-ink-sub md:mt-4 md:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}

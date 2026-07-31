/**
 * VehicleCard — 차량 1대를 보여 주는 카드
 *
 * 역할
 *  - VehicleSection 이 그리는 4열(모바일 2열) 그리드의 셀 하나를 담당한다.
 *  - 썸네일 / 제조사 / 모델명 / 트림 / 차량가 / 월 리스료(정가 취소선 + 할인가) /
 *    계약 조건 뱃지 / 하단 CTA 버튼 순서로 정보를 쌓아 올린다.
 *
 * 인터랙션
 *  - 카드에 마우스를 올리면(hover) "이미지만" 1.05배로 확대된다.
 *    구현 방식: 카드 루트에 `group`, 썸네일 래퍼에 `overflow-hidden`,
 *    Placeholder 자체에 `group-hover:scale-105 transition-transform duration-500` 를 준다.
 *    → 래퍼가 넘치는 부분을 잘라 내므로 카드 크기는 그대로인 채 이미지만 커지는 효과가 난다.
 *  - 하단 CTA 는 실제 견적 로직이 없다. 페이지 하단 상담 섹션(#consult)으로 이동하는
 *    앵커 링크(<a>)로만 동작한다. (부드러운 스크롤은 globals.css 의 scroll-behavior 가 처리)
 *
 * 원본 대응
 *  - 원본 사이트의 차량 리스트 카드(썸네일 + 모델/트림 + 차량가 + 월 리스료 + 조건 뱃지 + 버튼).
 *
 * 컴포넌트 종류
 *  - 상태나 이벤트 핸들러가 전혀 없으므로 'use client' 를 붙이지 않는다.
 *    (부모인 VehicleSection 이 클라이언트 컴포넌트라 실제로는 함께 클라이언트 번들에 포함되지만,
 *     이 파일 자체는 서버/클라이언트 어디서든 쓸 수 있는 순수 표시 컴포넌트로 유지한다.)
 */

import Placeholder from './Placeholder';
import type { Vehicle } from '../_data/vehicles';

/** VehicleCard 가 받는 props */
type VehicleCardProps = {
  /** 카드에 표시할 차량 한 대의 더미 데이터 */
  vehicle: Vehicle;
};

/**
 * 원화 금액을 한국 로케일 천 단위 구분 문자열로 바꾼다.
 * 예) 23400000 → "23,400,000"
 * 로케일을 'ko-KR' 로 못 박아 두어야 서버 렌더 결과와 브라우저 렌더 결과가
 * 항상 같은 문자열이 되어 hydration 불일치가 발생하지 않는다.
 */
function formatWon(value: number): string {
  return value.toLocaleString('ko-KR');
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    /*
      article: 카드 하나가 독립적인 정보 단위이므로 시맨틱 태그를 사용한다.
      group          : 자식(썸네일)이 hover 상태를 감지할 수 있게 하는 Tailwind 그룹 지정
      overflow-hidden: 확대된 이미지가 카드 모서리(rounded-2xl) 밖으로 삐져나오지 않게 자른다
      h-full         : 그리드 셀 높이가 서로 달라도 카드가 셀을 꽉 채우게 한다
      flex-col       : 하단 CTA 버튼을 mt-auto 로 바닥에 붙이기 위한 세로 플렉스
    */
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow duration-300 hover:shadow-lg">
      {/*
        썸네일 영역
        - 래퍼가 overflow-hidden 을 한 번 더 갖는 이유: 카드 루트에도 있지만,
          래퍼 단위로 잘라야 카드 하단(텍스트 영역)까지 이미지가 번지지 않는다.
      */}
      <div className="overflow-hidden">
        <Placeholder
          label={vehicle.imageLabel}
          /* 차량 썸네일은 가로로 살짝 긴 4:3 비율 */
          ratio="4/3"
          /* hover 시 확대: 0.5초 동안 1.05배. 확대 기준점은 중앙(기본값) */
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* 텍스트 정보 영역 — 모바일에서는 여백을 줄여 2열 그리드에서도 답답하지 않게 한다 */}
      <div className="flex flex-1 flex-col p-4 md:p-5">
        {/* 제조사: 모델명 위에 오는 작은 보조 라벨 */}
        <p className="text-[11px] font-medium tracking-wide text-ink-sub md:text-xs">
          {vehicle.brand}
        </p>

        {/* 모델명 — 카드에서 가장 굵고 큰 글자 */}
        <h3 className="mt-1 text-base leading-snug font-bold text-ink md:text-lg">
          {vehicle.model}
        </h3>

        {/* 트림/사양 — 회색 작은 글씨. 길면 두 줄까지 자연스럽게 흐르도록 leading 여유를 준다 */}
        <p className="mt-1 text-xs leading-relaxed text-ink-sub md:text-sm">
          {vehicle.trim}
        </p>

        {/* 구분선 — 차량 정보(위)와 가격 정보(아래)를 시각적으로 분리 */}
        <hr className="my-3 border-0 border-t border-line md:my-4" />

        {/*
          가격 블록
          dl(정의 목록)로 마크업해 "라벨 - 값" 관계를 스크린리더에도 전달한다.
        */}
        <dl className="space-y-1.5">
          {/* 1) 차량가 */}
          <div className="flex items-baseline justify-between gap-2">
            <dt className="shrink-0 text-xs text-ink-sub md:text-sm">차량가</dt>
            <dd className="text-sm font-bold text-ink md:text-base">
              {formatWon(vehicle.price)}원
            </dd>
          </div>

          {/* 2) 월 리스료 — 정가는 취소선 회색, 할인가는 accent(빨강) 굵게 */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <dt className="shrink-0 text-xs text-ink-sub md:text-sm">
              월 리스료
            </dt>
            <dd className="flex flex-wrap items-baseline justify-end gap-x-1.5">
              {/*
                정가: line-through 로 취소선.
                금액만 읽으면 혼동되므로 sr-only 로 "정가" 라는 맥락을 덧붙인다.
              */}
              <span className="text-[11px] text-ink-sub line-through md:text-xs">
                <span className="sr-only">정가 </span>
                {formatWon(vehicle.monthlyOriginal)}원
              </span>
              {/* 할인가: 카드에서 가장 강조되는 숫자 */}
              <span className="text-base font-extrabold text-accent md:text-lg">
                <span className="sr-only">할인가 </span>
                {formatWon(vehicle.monthlySale)}원
              </span>
            </dd>
          </div>
        </dl>

        {/*
          조건 뱃지 목록 (개월 수 / 선수금 조건 등)
          - ul/li 로 묶어 개수 정보를 보조기기에 전달한다.
          - flex-wrap 으로 모바일 2열 그리드에서도 자연스럽게 줄바꿈된다.
        */}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {vehicle.badges.map((badge) => (
            <li
              key={badge}
              /* pill 형태: 아주 연한 회색 배경 + 완전 둥근 모서리 */
              className="rounded-full border border-line bg-surface px-2 py-1 text-[10px] font-medium text-ink-sub md:px-2.5 md:text-[11px]"
            >
              {badge}
            </li>
          ))}
        </ul>

        {/*
          하단 CTA
          - mt-auto: 카드마다 트림/뱃지 줄 수가 달라도 버튼을 항상 카드 바닥에 정렬시킨다.
            (여백은 mt 대신 pt 로 줘야 mt-auto 의 정렬 기능이 깨지지 않는다)
          - <a> 앵커로 하단 상담 섹션(#consult) 이동. 실제 견적 요청 처리 로직은 없다.
          - aria-label 에 모델명을 넣어 여러 카드의 동일한 버튼 문구를 구분할 수 있게 한다.
        */}
        <div className="mt-auto pt-4 md:pt-5">
          <a
            href="#consult"
            aria-label={`${vehicle.brand} ${vehicle.model} 리스 견적 받기 — 하단 상담 신청으로 이동`}
            className="block rounded-xl bg-primary px-3 py-3.5 text-center text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover md:text-base"
          >
            리스 견적 받기
          </a>
        </div>
      </div>
    </article>
  );
}

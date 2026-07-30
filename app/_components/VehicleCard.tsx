/**
 * VehicleCard — 차량 1대를 보여 주는 카드
 *
 * 역할
 *  - VehicleSection 이 그리는 4열(모바일 2열) 그리드의 셀 하나를 담당한다.
 *  - 썸네일(+분류 뱃지) / 모델명 / 트림 / 한 줄 설명 / 특징 태그 3개 / 하단 CTA 순서로
 *    정보를 쌓아 올린다.
 *
 * ★ 재설계 이력 — 구글폼 8-1 "조잡하거나 금액 노출" 을 피하고 싶다는 요청
 *
 *  1) 금액 표기를 **전면 제거**했다.
 *     - 삭제한 것: 차량가(price), 월 리스료 정가(monthlyOriginal), 할인가(monthlySale),
 *       그리고 이 값들을 "23,400,000원" 형태로 찍던 formatWon() 헬퍼 함수까지.
 *     - 특히 "정가 취소선(line-through) + 빨간 할인가" 조합을 없앤 것이 핵심이다.
 *       이 표현은 금액 노출과 조잡함이라는 두 가지 회피 요청을 동시에 위반한다.
 *     - 금액은 어떤 카드에서도 알 수 없고, 오직 상담을 통해서만 안내된다.
 *       이는 구글폼 4번 "예약·상담 문의 유도"와도 방향이 맞는다.
 *
 *  2) 비워진 자리를 "숫자"가 아니라 "용도"로 채웠다.
 *     - summary(한 줄 설명, 2줄 말줄임) + tags 3개 pill 로 구성해,
 *       카드의 성격을 "가격 비교표"에서 "내 상황에 맞는 차 찾기"로 바꿨다.
 *     - 삭제된 계약조건 뱃지(badges) 자리에는 차량 특징 태그가 들어간다.
 *       태그에 숫자가 있어도 인승·적재량처럼 금액과 무관한 스펙만 쓴다(vehicles.ts 참고).
 *
 *  3) 삭제된 brand 필드 대신, 썸네일 좌상단에 category 뱃지를 올렸다.
 *     - bg-primary-soft + text-primary 조합(구글폼 13번 블루 계열 + 파스텔톤).
 *     - 원색 채우기 뱃지가 아니라 옅은 면 위 블루 글자여서 카드가 차분하게 유지된다.
 *
 *  4) 카드의 정보 단위를 4개(분류 / 모델·트림 / 설명 / 태그)로 제한했다.
 *     한 카드에 정보를 더 얹지 않는 것이 조잡함을 막는 가장 확실한 방법이다.
 *
 * 인터랙션
 *  - 카드에 마우스를 올리면(hover) "이미지만" 1.05배로 확대된다.
 *    구현 방식: 카드 루트에 `group`, 썸네일 래퍼에 `overflow-hidden`,
 *    Placeholder 자체에 `group-hover:scale-105 transition-transform duration-500` 를 준다.
 *    → 래퍼가 넘치는 부분을 잘라 내므로 카드 크기는 그대로인 채 이미지만 커지는 효과가 난다.
 *  - ★하단 CTA (2026-07-30 변경): #consult 앵커 이동에서 **상담 모달 열기**로 바꿨다.
 *    원본 사이트처럼 누른 차종이 채워진 팝업이 뜨는 것이 클라이언트 요청.
 *    모달 자체는 부모(VehicleSection)가 하나만 들고 있고, 이 카드는 "어느 차량으로
 *    열어 달라"는 onConsult 콜백만 호출한다. 이동이 아니라 동작이므로 <a> → <button>.
 *
 * 컴포넌트 종류
 *  - 상태·훅이 없으므로 'use client' 를 붙이지 않는다. 콜백 prop 은 클라이언트
 *    컴포넌트(VehicleSection)가 만들어 넘기므로 문제없다.
 */

import Placeholder from './Placeholder';
import type { Vehicle } from '../_data/vehicles';

/** VehicleCard 가 받는 props */
type VehicleCardProps = {
  /** 카드에 표시할 차량 한 대의 더미 데이터 */
  vehicle: Vehicle;
  /** 하단 "이 차량으로 상담받기" 클릭 시 호출 — 부모가 이 차량으로 상담 모달을 연다 */
  onConsult: () => void;
};

export default function VehicleCard({ vehicle, onConsult }: VehicleCardProps) {
  return (
    /*
      article: 카드 하나가 독립적인 정보 단위이므로 시맨틱 태그를 사용한다.
      group          : 자식(썸네일)이 hover 상태를 감지할 수 있게 하는 Tailwind 그룹 지정
      overflow-hidden: 확대된 이미지가 카드 모서리(rounded-2xl) 밖으로 삐져나오지 않게 자른다
      h-full         : 그리드 셀 높이가 서로 달라도 카드가 셀을 꽉 채우게 한다
                       (= 같은 행의 카드 높이가 정렬된다 — 구글폼 8-1 조잡함 회피)
      flex-col       : 하단 CTA 버튼을 mt-auto 로 바닥에 붙이기 위한 세로 플렉스
    */
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-shadow duration-300 hover:shadow-lg">
      {/*
        썸네일 영역
        - relative: 좌상단 분류 뱃지(absolute)의 위치 기준점.
        - 래퍼가 overflow-hidden 을 한 번 더 갖는 이유: 카드 루트에도 있지만,
          래퍼 단위로 잘라야 카드 하단(텍스트 영역)까지 이미지가 번지지 않는다.
      */}
      <div className="relative overflow-hidden">
        <Placeholder
          label={vehicle.imageLabel}
          /* 차량 썸네일은 가로로 살짝 긴 4:3 비율 */
          ratio="4/3"
          /* hover 시 확대: 0.5초 동안 1.05배. 확대 기준점은 중앙(기본값) */
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/*
          분류 뱃지 (세단 / SUV / 전기 / 상용)
          - 썸네일 위에 얹되, 파스텔 블루 면 + 블루 글자라 이미지 위에서도 차분하다.
          - 이미지가 확대돼도 뱃지는 함께 움직이지 않아야 해서
            Placeholder 형제 요소로 두고 absolute 로 띄웠다.
          - 문구가 곧 화면에 보이는 정보이므로 aria-hidden 하지 않는다.
        */}
        <span className="absolute top-2.5 left-2.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold text-primary md:top-3 md:left-3 md:px-3 md:text-[11px]">
          {vehicle.category}
        </span>
      </div>

      {/* 텍스트 정보 영역 — 모바일에서는 여백을 줄여 2열 그리드에서도 답답하지 않게 한다 */}
      <div className="flex flex-1 flex-col p-4 md:p-5">
        {/* 모델명 — 카드에서 가장 굵고 큰 글자 */}
        <h3 className="text-base leading-snug font-bold text-ink md:text-lg">
          {vehicle.model}
        </h3>

        {/* 트림/사양 — 회색 작은 글씨. 길면 두 줄까지 자연스럽게 흐르도록 leading 여유를 준다 */}
        <p className="mt-1 text-xs leading-relaxed text-ink-sub md:text-sm">
          {vehicle.trim}
        </p>

        {/*
          한 줄 설명
          - line-clamp-2 로 정확히 2줄에서 말줄임 처리한다.
          - ★min-h-[2lh]: line-clamp 는 "최대 2줄"만 보장하고 1줄짜리 문장은 1줄
            높이만 차지한다. 그래서 문장이 짧은 카드(예: 밴 H)만 태그·버튼 줄이
            위로 딸려 올라가 옆 카드와 라인이 어긋났다. 최소 높이를 2줄(2lh)로
            고정해, 문장 길이와 무관하게 태그 줄 시작 위치가 카드끼리 정렬된다.
          - 구분선(hr)을 두지 않은 이유: 금액 블록이 사라진 뒤로는 카드 안에서
            분리해야 할 정보 덩어리가 없다. 선을 줄이는 쪽이 더 정돈돼 보인다.
        */}
        <p className="mt-2.5 line-clamp-2 min-h-[2lh] text-xs leading-relaxed text-ink-sub md:text-[13px]">
          {vehicle.summary}
        </p>

        {/*
          차량 특징 태그 3개
          - ul/li 로 묶어 개수 정보를 보조기기에 전달한다.
          - flex-wrap 으로 모바일 2열 그리드에서도 자연스럽게 줄바꿈된다.
          - pill 형태: 아주 옅은 배경(bg-surface) + 완전 둥근 모서리.
            가격 뱃지를 대체하는 요소지만 시각적 무게는 훨씬 가볍게 잡았다.
        */}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {vehicle.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line bg-surface px-2 py-1 text-[10px] font-medium text-ink-sub md:px-2.5 md:text-[11px]"
            >
              {tag}
            </li>
          ))}
        </ul>

        {/*
          하단 CTA
          - mt-auto: 카드마다 트림/태그 줄 수가 달라도 버튼을 항상 카드 바닥에 정렬시킨다.
            (여백은 mt 대신 pt 로 줘야 mt-auto 의 정렬 기능이 깨지지 않는다)
          - ★<a href="#consult"> → <button onClick> (2026-07-30): 하단 섹션으로
            스크롤하는 대신, 이 차종이 채워진 상담 모달을 그 자리에서 연다.
            페이지 이동이 아니라 동작이므로 button 이 맞는 시맨틱이다.
            (다른 "상담 신청" 버튼들은 여전히 #consult 앵커다 — 차량 카드만 팝업.)
          - 문구를 "리스 견적 받기" → "이 차량으로 상담받기" 로 바꿨다.
            '견적'은 금액을 기대하게 만드는 단어라, 금액을 노출하지 않는 이 페이지의
            톤(구글폼 8-1)과 맞지 않는다. 상담이라는 실제 행동으로 표현을 맞췄다.
          - aria-label 에 모델명을 넣어 여러 카드의 동일한 버튼 문구를 구분할 수 있게 한다.
        */}
        <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row md:pt-5">
          {/*
            차량 자세히 보기 (2026-07-30 추가) — 상담 버튼 왼쪽의 보조 버튼.
            ⚠️ 아직 연결할 상세 페이지/모달이 없어 동작이 비어 있다 ("일단 버튼만").
            TODO: 상세 화면이 정해지면 onClick 또는 <a href> 로 교체.
            외곽선 스타일로 두어 채움(primary)인 상담 버튼과 위계를 구분한다(구글폼 8-1).
            sm 미만(모바일 2열 그리드)에서는 카드가 좁아 두 버튼을 세로로 쌓는다.
          */}
          <button
            type="button"
            aria-label={`${vehicle.model} ${vehicle.trim} 자세히 보기`}
            className="block w-full cursor-pointer rounded-xl border border-line bg-white px-3 py-3.5 text-center text-sm font-bold whitespace-nowrap text-ink transition-colors duration-200 hover:border-primary hover:text-primary sm:flex-1 md:text-base"
          >
            차량 자세히 보기
          </button>

          <button
            type="button"
            onClick={onConsult}
            aria-label={`${vehicle.model} ${vehicle.trim} 상담받기 — 상담 신청 창 열기`}
            className="block w-full cursor-pointer rounded-xl bg-primary px-3 py-3.5 text-center text-sm font-bold whitespace-nowrap text-white transition-colors duration-200 hover:bg-primary-hover sm:flex-1 md:text-base"
          >
            이 차량으로 상담받기
          </button>
        </div>
      </div>
    </article>
  );
}

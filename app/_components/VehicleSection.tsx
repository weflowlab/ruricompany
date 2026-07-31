'use client';

/**
 * VehicleSection — 차량 카드 그리드 섹션
 *
 * 역할
 *  - 제목 + 설명 + 차량 카드 그리드를 한 덩어리로 묶은 섹션.
 *  - id prop 을 <section> 에 그대로 달아 헤더 GNB 앵커(#vehicles)의 목적지가 된다.
 *
 * ★ 사용 방식 변경 이력 — 구글폼 5번 "예상 섹션 개수 5~7개"
 *  - 이전에는 이 컴포넌트를 페이지에서 **세 번** 재사용했다.
 *      1) 인기 차량(popularVehicles) 2) 일반 화물차(cargoVehicles) 3) 전기 화물차(evVehicles)
 *    차량 섹션만 3개여서 전체 섹션 수가 10개까지 늘어나 있었고,
 *    같은 모양의 그리드가 세 번 반복되는 구성은 "조잡함"(8-1) 에 가까웠다.
 *  - 이제는 **"추천 차량" 섹션 하나로 통합**되어 페이지에서 한 번만 쓰인다.
 *    app/_data/vehicles.ts 의 recommendedVehicles(9대) 를 한 그리드에 담는다.
 *  - 재사용이 가능한 props 구조 자체는 그대로 남겨 두었다.
 *    (차종별 섹션을 나중에 다시 나눌 수 있고, props 를 없애는 편이 이득도 아니다.)
 *
 * 레이아웃 (2026-07-31 4열로 되돌림)
 *  - grid-cols-2 → md:grid-cols-3 → lg:grid-cols-4
 *  - 한동안 3열이었다. 카드 폭을 넓혀 차량명·트림·태그가 덜 눌리게 하려는 의도였는데,
 *    이 페이지의 두 섹션은 각각 4대씩이라 3열로 깔면 둘째 행에 한 장만 남아
 *    오른쪽이 크게 비었다. 클라이언트 요청대로 데스크톱에서 4열로 되돌려
 *    4대가 한 행에 정확히 떨어지게 했다.
 *  - 3열 때 폭을 넓히려 잡았던 근거(태그가 눌린다)는 같은 날 태그 pill 이
 *    제거되면서 사라졌다. 이제 카드 안에는 분류 뱃지 + 모델 + 트림 + 한 줄 설명뿐이라
 *    좁아진 폭에서도 눌리지 않는다.
 *  - md(태블릿)는 3열로 남긴다. 768~1023px 에서 4열은 카드가 지나치게 좁아진다.
 *
 * 인터랙션
 *  - ★상담 모달(2026-07-30 클라이언트 요청): 카드의 "이 차량으로 상담받기" 를 누르면
 *    #consult 로 스크롤하는 대신, 그 차종이 미리 채워진 <ConsultModal /> 팝업이 뜬다.
 *    모달은 카드마다 만들지 않고 **섹션에 하나만** 두고, 어떤 차량으로 열지(consultVehicle)만
 *    상태로 바꾼다 — 카드마다 폼을 마운트하는 낭비를 막고, 열림 상태 관리도 한 곳이 된다.
 *  - useInView(IntersectionObserver)로 그리드가 화면에 들어오는 순간을 감지해
 *    카드들이 아래에서 위로 페이드업 한다.
 *  - 카드마다 index * 80ms 만큼 transitionDelay 를 줘서 순차 등장(stagger)시킨다.
 *  - 이 훅은 브라우저 API 를 쓰므로 이 컴포넌트는 반드시 클라이언트 컴포넌트여야 한다.
 *  - prefers-reduced-motion: reduce 환경에서는 globals.css 가 transition 을 전역으로 끈다.
 *    그 경우에도 inView 가 true 가 되는 순간 클래스가 즉시 opacity-100 으로 바뀌므로
 *    콘텐츠가 투명한 채로 남는 사고는 발생하지 않는다.
 *
 * 금액 관련 주의 (구글폼 8-1)
 *  - 카드 안에는 금액이 전혀 없다(VehicleCard 참고).
 *    따라서 이 섹션의 title / description 에도 "월 납입금", "특가", "할인" 같은
 *    금액을 기대하게 만드는 문구를 넣지 말아야 한다. 호출부에서 문구를 정할 때 주의.
 */

import { useState } from 'react';

import ConsultModal from './ConsultModal';
import SectionTitle from './SectionTitle';
import VehicleCard from './VehicleCard';
import { useInView } from '../_hooks/useInView';
import type { Vehicle } from '../_data/vehicles';

/** VehicleSection 이 받는 props */
type VehicleSectionProps = {
  /**
   * 섹션 DOM id — GNB 앵커 링크(#vehicles)의 스크롤 목적지.
   * 앵커 대상이 아닌 곳에 쓸 수도 있으므로 선택 항목으로 두었다.
   */
  id?: string;
  /** 제목 앞부분(기본 잉크색). 강조어와 붙지 않게 끝에 공백을 포함해 넘긴다 */
  title: string;
  /** primary(블루)로 강조할 제목 단어 */
  highlight?: string;
  /** 제목 아래 회색 설명문 */
  description?: string;
  /** 그리드에 렌더링할 차량 목록 (현재 구성은 8대) */
  vehicles: Vehicle[];
  /** true 면 섹션 배경을 연블루그레이(bg-surface)로 깔아 위아래 섹션과 구분한다 */
  surface?: boolean;
};

/** 카드 간 순차 등장 간격(ms). index 에 곱해 각 카드의 transitionDelay 로 사용한다 */
const STAGGER_MS = 80;

export default function VehicleSection({
  id,
  title,
  highlight,
  description,
  vehicles,
  surface = false,
}: VehicleSectionProps) {
  /*
    그리드 컨테이너를 관찰 대상으로 삼는다.
    - threshold 0.15 : 카드가 9장이라 그리드가 길다. 20% 로 두면 데스크톱에서
      두 번째 행이 이미 화면에 들어온 뒤에야 애니메이션이 시작될 수 있어 조금 낮췄다.
    - once true      : 한 번 등장하면 다시 숨기지 않는다 (위아래 스크롤 시 깜빡임 방지)
  */
  const [gridRef, inView] = useInView<HTMLUListElement>({
    threshold: 0.15,
    once: true,
  });

  /**
   * 상담 모달이 열려 있는 대상 차량. null 이면 닫힘.
   * "열림 여부" 와 "어떤 차량인지" 를 상태 하나로 겸한다 —
   * 두 상태로 나누면 "열려 있는데 차량이 null" 같은 불가능한 조합이 생길 수 있다.
   */
  const [consultVehicle, setConsultVehicle] = useState<Vehicle | null>(null);

  return (
    <section
      id={id}
      /* 스크린리더가 섹션 경계를 인식하도록 제목 텍스트를 접근 이름으로 제공 */
      aria-label={`${title}${highlight ?? ''}`}
      className={[
        // 섹션 상하 패딩: 모바일 60px / 데스크톱 100px
        'py-15 md:py-25',
        // surface 가 true 일 때만 연회색 배경. 아니면 부모(흰색) 배경을 그대로 쓴다
        surface ? 'bg-surface' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* 공통 컨테이너: 최대 1320px, 좌우 여백 20px */}
      <div className="mx-auto w-full max-w-[1320px] px-5">
        {/* 섹션 공통 제목 블록 (h2 + 강조 span + 설명 p, 하단 마진 포함) */}
        <SectionTitle
          title={title}
          highlight={highlight}
          description={description}
        />

        {/*
          차량 카드 그리드
          - ul/li 로 마크업해 "N개 항목의 목록" 이라는 구조를 보조기기에 전달한다.
          - 모바일 2열(gap 20px) → 태블릿/데스크톱 4열(gap 32px)
          - items-stretch(grid 기본값)로 li 높이가 행 단위로 통일되고,
            VehicleCard 의 h-full 이 그 높이를 채워 같은 행 카드 높이가 정렬된다.
        */}
        <ul
          ref={gridRef}
          className="grid grid-cols-2 items-stretch gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
        >
          {vehicles.map((vehicle, index) => (
            <li
              key={vehicle.id}
              /*
                순차 등장의 지연 시간.
                inView 이전에는 delay 를 0 으로 두어, 아직 등장하지 않은 카드가
                (스크롤을 위로 되감았을 때 등) 엉뚱한 타이밍에 반응하지 않게 한다.
              */
              style={{ transitionDelay: inView ? `${index * STAGGER_MS}ms` : '0ms' }}
              className={[
                // 페이드업 전환 자체: 투명도 + 세로 이동을 0.6초에 걸쳐
                'transition-[opacity,transform] duration-600 ease-out',
                // 등장 전: 살짝 아래(24px)에서 투명 / 등장 후: 제자리에서 불투명
                inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
              ].join(' ')}
            >
              <VehicleCard
                vehicle={vehicle}
                onConsult={() => setConsultVehicle(vehicle)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/*
        상담 신청 모달 — 섹션에 단 하나. 카드의 "상담받기" 가 대상 차량을 지정해 연다.
        모델명 + 트림을 합쳐 넘겨, 폼의 "관심 차량" 칸에서 어떤 사양인지까지 보이게 한다.
      */}
      <ConsultModal
        open={consultVehicle !== null}
        onClose={() => setConsultVehicle(null)}
        vehicleName={
          consultVehicle
            ? `${consultVehicle.model} ${consultVehicle.trim}`
            : undefined
        }
      />
    </section>
  );
}

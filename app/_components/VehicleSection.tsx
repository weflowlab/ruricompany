'use client';

/**
 * VehicleSection — 차량 카드 그리드 섹션 (재사용 컴포넌트)
 *
 * 역할
 *  - 제목 + 설명 + 차량 카드 4장 그리드를 한 덩어리로 묶은 섹션.
 *  - 페이지에서 **세 번 재사용**된다.
 *      1) 인기 차량   (popularVehicles)
 *      2) 일반 화물차 (cargoVehicles)
 *      3) 전기 화물차 (evVehicles, 보통 surface 배경으로 리듬을 준다)
 *  - id prop 을 <section> 에 그대로 달아 헤더 GNB 앵커(#vehicles, #ev 등)의 목적지가 된다.
 *
 * 인터랙션
 *  - useInView(IntersectionObserver)로 그리드가 화면에 들어오는 순간을 감지해
 *    카드들이 아래에서 위로 페이드업 한다.
 *  - 카드마다 index * 80ms 만큼 transitionDelay 를 줘서 순차 등장(stagger)시킨다.
 *  - 이 훅은 브라우저 API 를 쓰므로 이 컴포넌트는 반드시 클라이언트 컴포넌트여야 한다.
 *  - prefers-reduced-motion: reduce 환경에서는 globals.css 가 transition 을 전역으로 끈다.
 *    그 경우에도 inView 가 true 가 되는 순간 클래스가 즉시 opacity-100 으로 바뀌므로
 *    콘텐츠가 투명한 채로 남는 사고는 발생하지 않는다.
 *
 * 원본 대응
 *  - 원본의 차량 리스트 섹션. 그리드 규칙(데스크톱 4열 gap 40px / 모바일 2열 gap 20px)을
 *    그대로 옮겼다: grid-cols-2 gap-5 → md:grid-cols-4 md:gap-10
 */

import SectionTitle from './SectionTitle';
import VehicleCard from './VehicleCard';
import { useInView } from '../_hooks/useInView';
import type { Vehicle } from '../_data/vehicles';

/** VehicleSection 이 받는 props */
type VehicleSectionProps = {
  /** 섹션 DOM id — GNB 앵커 링크(#vehicles, #ev ...)의 스크롤 목적지 */
  id: string;
  /** 제목 앞부분(기본 잉크색). 강조어와 붙지 않게 끝에 공백을 포함해 넘긴다 */
  title: string;
  /** primary(그린)로 강조할 제목 단어 */
  highlight?: string;
  /** 제목 아래 회색 설명문 */
  description?: string;
  /** 그리드에 렌더링할 차량 목록 (보통 4대) */
  vehicles: Vehicle[];
  /** true 면 섹션 배경을 연회색(bg-surface)으로 깔아 위아래 섹션과 구분한다 */
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
    - threshold 0.2 : 그리드의 20% 가 보이면 등장 시작 (제목을 읽는 사이 자연스럽게 뜨는 타이밍)
    - once true     : 한 번 등장하면 다시 숨기지 않는다 (위아래 스크롤 시 깜빡임 방지)
  */
  const [gridRef, inView] = useInView<HTMLUListElement>({
    threshold: 0.2,
    once: true,
  });

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
          - 모바일 2열(gap 20px) → 태블릿/데스크톱 4열(gap 40px)
        */}
        <ul
          ref={gridRef}
          className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-10"
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
                'transition-all duration-600 ease-out',
                // 등장 전: 살짝 아래(24px)에서 투명 / 등장 후: 제자리에서 불투명
                inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
              ].join(' ')}
            >
              <VehicleCard vehicle={vehicle} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

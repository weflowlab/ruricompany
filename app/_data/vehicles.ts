/**
 * vehicles.ts — 차량 카드 그리드용 더미 데이터
 *
 * 역할
 *  - 인기 차량 / 일반 화물차 / 전기 화물차 3개 섹션이 각각 4대씩 렌더링할 목록을 제공한다.
 *  - VehicleSection 컴포넌트가 이 배열을 받아 4열(모바일 2열) 카드 그리드를 그린다.
 *
 * 주의
 *  - 가격·월 리스료·프로모션 조건은 전부 임의로 만든 예시 값이다. 실제 시세가 아니다.
 *  - imageLabel 은 Placeholder 컴포넌트의 label prop 으로 그대로 전달된다.
 */

/** 차량 카드 한 장에 필요한 데이터 */
export type Vehicle = {
  /** React key 용 고유 id */
  id: string;
  /** 제조사 (예: 현대, 기아) */
  brand: string;
  /** 모델명 (예: 포터2) */
  model: string;
  /** 세부 트림/사양 (예: 초장축 슈퍼캡 디럭스) */
  trim: string;
  /** 차량가(원). 화면에서는 toLocaleString 으로 천 단위 구분해 표시한다 */
  price: number;
  /** 월 리스료 정가(원). 카드에서 취소선으로 표시 */
  monthlyOriginal: number;
  /** 월 리스료 할인가(원). accent 색으로 강조 표시 */
  monthlySale: number;
  /** 계약 조건 뱃지 (개월 수, 선수금 조건 등) */
  badges: string[];
  /** 썸네일 자리 표시용 한국어 라벨 */
  imageLabel: string;
};

/**
 * 1) 인기 차량 4대 — 히어로 바로 아래 "이번 달 인기 차량" 섹션용.
 *    소형 탑차 위주로 구성해 조회수가 높은 라인업을 흉내 냈다.
 */
export const popularVehicles: Vehicle[] = [
  {
    id: "pop-01",
    brand: "현대",
    model: "포터2",
    trim: "초장축 슈퍼캡 스마트",
    price: 23_400_000,
    monthlyOriginal: 519_000,
    monthlySale: 429_000,
    badges: ["60개월", "선수금 0원", "즉시 출고"],
    imageLabel: "소형 트럭 측면 썸네일 이미지",
  },
  {
    id: "pop-02",
    brand: "기아",
    model: "봉고3",
    trim: "1톤 킹캡 표준 데크",
    price: 22_900_000,
    monthlyOriginal: 505_000,
    monthlySale: 418_000,
    badges: ["48개월", "보증금 없음", "인기"],
    imageLabel: "1톤 트럭 정면 썸네일 이미지",
  },
  {
    id: "pop-03",
    brand: "현대",
    model: "마이티",
    trim: "3.5톤 와이드캡 카고",
    price: 58_600_000,
    monthlyOriginal: 1_180_000,
    monthlySale: 985_000,
    badges: ["60개월", "취등록세 포함", "재고 한정"],
    imageLabel: "중형 카고 트럭 썸네일 이미지",
  },
  {
    id: "pop-04",
    brand: "기아",
    model: "봉고3",
    trim: "1톤 냉동 탑차 표준형",
    price: 31_200_000,
    monthlyOriginal: 712_000,
    monthlySale: 598_000,
    badges: ["36개월", "냉동기 포함", "특가"],
    imageLabel: "냉동 탑차 후면 썸네일 이미지",
  },
];

/**
 * 2) 일반 화물차 4대 — 디젤/LPG 기반의 일반 상용차 섹션용.
 *    소형부터 중형까지 폭넓게 배치했다.
 */
export const cargoVehicles: Vehicle[] = [
  {
    id: "cargo-01",
    brand: "현대",
    model: "포터2",
    trim: "1톤 파워게이트 장착형",
    price: 27_800_000,
    monthlyOriginal: 628_000,
    monthlySale: 529_000,
    badges: ["60개월", "리프트 포함", "전국 출고"],
    imageLabel: "파워게이트 장착 트럭 썸네일 이미지",
  },
  {
    id: "cargo-02",
    brand: "타타대우",
    model: "구쎈",
    trim: "5톤 카고 롱바디",
    price: 89_500_000,
    monthlyOriginal: 1_760_000,
    monthlySale: 1_490_000,
    badges: ["60개월", "선수금 10%", "사업자 전용"],
    imageLabel: "5톤 카고 트럭 측면 썸네일 이미지",
  },
  {
    id: "cargo-03",
    brand: "현대",
    model: "메가트럭",
    trim: "4.5톤 윙바디 표준",
    price: 76_400_000,
    monthlyOriginal: 1_520_000,
    monthlySale: 1_290_000,
    badges: ["48개월", "윙바디 포함", "중고 인수 가능"],
    imageLabel: "윙바디 트럭 개방 상태 썸네일 이미지",
  },
  {
    id: "cargo-04",
    brand: "기아",
    model: "봉고3",
    trim: "1톤 더블캡 6인승",
    price: 24_600_000,
    monthlyOriginal: 548_000,
    monthlySale: 462_000,
    badges: ["36개월", "초기비용 최소", "법인 가능"],
    imageLabel: "더블캡 트럭 사선 썸네일 이미지",
  },
];

/**
 * 3) 전기 화물차 4대 — 보조금 안내를 곁들인 EV 특가 섹션용.
 *    뱃지에 '보조금 지원' 같은 EV 전용 조건을 넣었다.
 */
export const evVehicles: Vehicle[] = [
  {
    id: "ev-01",
    brand: "현대",
    model: "포터2 일렉트릭",
    trim: "초장축 슈퍼캡 스마트",
    price: 43_500_000,
    monthlyOriginal: 742_000,
    monthlySale: 489_000,
    badges: ["60개월", "보조금 지원", "충전기 상담"],
    imageLabel: "전기 소형 트럭 충전 장면 썸네일 이미지",
  },
  {
    id: "ev-02",
    brand: "기아",
    model: "봉고3 EV",
    trim: "1톤 표준 데크 프레스티지",
    price: 44_200_000,
    monthlyOriginal: 758_000,
    monthlySale: 496_000,
    badges: ["60개월", "선수금 0원", "친환경 혜택"],
    imageLabel: "전기 1톤 트럭 정면 썸네일 이미지",
  },
  {
    id: "ev-03",
    brand: "기아",
    model: "봉고3 EV",
    trim: "1톤 전기 냉동 탑차",
    price: 52_900_000,
    monthlyOriginal: 968_000,
    monthlySale: 685_000,
    badges: ["48개월", "냉동기 포함", "보조금 지원"],
    imageLabel: "전기 냉동 탑차 후면 썸네일 이미지",
  },
  {
    id: "ev-04",
    brand: "현대",
    model: "포터2 일렉트릭",
    trim: "1톤 전기 특장 윙탑",
    price: 55_300_000,
    monthlyOriginal: 1_020_000,
    monthlySale: 728_000,
    badges: ["60개월", "특장 제작", "출고 대기 짧음"],
    imageLabel: "전기 특장 트럭 측면 썸네일 이미지",
  },
];

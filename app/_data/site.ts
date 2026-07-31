/**
 * site.ts — 사이트 공통 정보 & 글로벌 내비게이션 더미 데이터
 *
 * 역할
 *  - 헤더 GNB / 모바일 슬라이드 패널 / 푸터 / 플로팅 CTA 가 공통으로 참조하는
 *    브랜드명·전화번호·사업자 정보와 앵커 메뉴 목록을 한곳에서 관리한다.
 *
 * 주의
 *  - 모두 예시용 더미 값이다. 실제 사업자 정보가 아니며, 전화번호는 규칙대로 0000-0000 을 쓴다.
 */

/** GNB 메뉴 한 항목 */
export type NavItem = {
  /** React key 및 활성 메뉴 판별용 고유 id (앵커 id 와 동일하게 맞춤) */
  id: string;
  /** 메뉴에 노출되는 한국어 라벨 */
  label: string;
  /** 이동할 앵커 링크. 모두 같은 페이지 내 섹션으로 스크롤된다 */
  href: string;
};

/**
 * 상단 GNB 메뉴 5개.
 * href 의 해시는 각 섹션 컴포넌트의 id 와 반드시 일치해야 한다.
 * (globals.css 의 scroll-padding-top: 80px 덕분에 고정 헤더에 가려지지 않는다.)
 */
export const navItems: NavItem[] = [
  { id: "reviews", label: "실제 고객 후기", href: "#reviews" },
  { id: "vehicles", label: "추천 차량", href: "#vehicles" },
  { id: "process", label: "이용 절차", href: "#process" },
  { id: "ev", label: "전기 화물차 특가", href: "#ev" },
  { id: "faq", label: "자주 묻는 질문", href: "#faq" },
];

/**
 * 사이트 전역 정보.
 * - name: 브랜드명 (규칙상 '루리컴퍼니' 고정)
 * - tel: 대표 전화 (규칙상 '0000-0000' 고정)
 * - description: 메타 설명 및 푸터 소개 문구
 * - company / ceo / bizNo / address: 푸터 사업자 정보 (전부 가상의 예시)
 */
export const site = {
  name: "루리컴퍼니",
  tel: "0000-0000",
  description:
    "화물차 리스·장기렌트 상담부터 출고까지 한 번에. 초기 비용 부담을 낮춘 맞춤 견적을 안내해 드립니다.",
  company: "루리컴퍼니 주식회사",
  ceo: "홍길동",
  bizNo: "000-00-00000",
  address: "서울특별시 예시구 샘플대로 000, 0층 000호",
};

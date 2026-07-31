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
  { id: "services", label: "서비스 안내", href: "#services" },
  { id: "vehicles", label: "추천 차량", href: "#vehicles" },
  { id: "process", label: "이용 절차", href: "#process" },
  /* "전기 화물차 특가 → #ev" 항목은 2026-07-31 해당 섹션 삭제와 함께 제거했다. */
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
  /** 담당자 성함 — 상담 폼/모달에 "담당 ○○○" 형태로 노출 (예시값) */
  manager: "홍길동",
  bizNo: "000-00-00000",
  address: "서울특별시 예시구 샘플대로 000, 0층 000호",
  /** 푸터 사업자 정보 줄에 노출하는 대표 이메일 (예시값) */
  email: "contact@example.com",
  /**
   * 푸터 대형 헤드라인 (2026-07-31 추가).
   * 배열 한 칸 = 한 줄. 푸터에서 가장 큰 글자로, "무엇을 하는 곳인지"를 못 박는 자리다.
   * 문구를 <br> 로 강제하지 않고 배열로 두어 줄 수를 자유롭게 늘릴 수 있게 했다.
   */
  footerHeadline: ["신차 할부·리스·장기렌트", "조건 비교부터 출고까지"],
};

/** 상담 폼의 "연락 받을 방법" 선택지 한 항목 */
export type ContactMethod = {
  /** input value 로 쓰이는 고유 id */
  id: string;
  /** 라디오 버튼에 노출되는 라벨 */
  label: string;
};

/**
 * 연락 방법 선택지 (2026-07-31 추가 — ConsultForm 이 참조한다).
 *
 * 기존 3지선다(전화/문자/카톡)에서 문자를 뺀 2지선다다.
 * 선택지를 줄이면 입력 부담이 줄어든다.
 */
export const contactMethods: ContactMethod[] = [
  { id: "phone", label: "전화" },
  { id: "kakao", label: "카카오톡" },
];

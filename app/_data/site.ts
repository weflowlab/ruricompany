/**
 * site.ts — 사이트 공통 정보 / 내비게이션 / 외부 채널 데이터
 *
 * 역할
 *  - 헤더, 푸터, 플로팅 CTA, 상담 폼이 공통으로 참조하는
 *    브랜드 정보·연락처·외부 채널 목록을 한곳에서 관리한다.
 *  - navItems(앵커 메뉴)는 GNB 제거 후 미사용 상태다. 해당 선언 위 주석 참고.
 *
 * 클라이언트 요청사항(구글폼) 반영 내역
 *  - 2번  업체명            → 루리컴퍼니
 *  - 3번  업종              → 신차 할부 / 신차 장기렌트 / 신차 리스
 *  - 15번 폼 연동 채널      → 카카오톡, 인스타그램, 블로그  (channels 배열)
 *  - 16번 기입 정보         → 연락처 / 주소 / 사업자 정보    (site 객체)
 *  - 17번 담당자            → 박철현 010.4679.4984
 *  - 18번 선호 연락 방법    → 전화, 카카오톡                 (contactMethods 배열)
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
 *
 * ⚠️ 현재 어디에서도 렌더하지 않는다 (2026-07-30).
 *    단일 랜딩페이지에는 섹션 이동 메뉴가 오히려 방해가 되어 Header 의 GNB 와
 *    모바일 슬라이드 패널을 함께 제거했다. 자세한 배경은 Header.tsx 상단 주석 참고.
 *    나중에 메뉴를 되살릴 수 있으므로 배열은 지우지 않고 남겨 둔다.
 *
 * 되살릴 때 유효한 규칙
 *   - href 의 해시는 각 섹션 컴포넌트의 id 와 반드시 일치해야 한다.
 *     ⚠️ 지금 이 목록은 그 조건을 만족하지 않는다. 2026-07-30 고객 후기 섹션이
 *        삭제되어 #reviews 는 페이지에 존재하지 않는 앵커다. (#services 는
 *        같은 날 삭제됐다가 복구되어 유효하다.) 메뉴를 되살린다면 #reviews
 *        항목을 먼저 지우거나 후기 섹션부터 복구해야 한다.
 *   - globals.css 의 scroll-padding-top: 80px 덕분에 고정 헤더에 가려지지 않는다.
 */
export const navItems: NavItem[] = [
  { id: "services", label: "서비스 안내", href: "#services" },
  { id: "vehicles", label: "추천 차량", href: "#vehicles" },
  { id: "process", label: "이용 절차", href: "#process" },
  { id: "reviews", label: "고객 후기", href: "#reviews" },
  { id: "faq", label: "자주 묻는 질문", href: "#faq" },
];

/**
 * 사이트 전역 정보.
 *
 * ⚠️ 미확정 항목 주의
 *  구글폼 16번에서 "연락처 / 주소 / 사업자"를 사이트에 기입해 달라고 요청받았지만,
 *  실제 주소와 사업자등록번호 값은 전달받지 못했다.
 *  따라서 address / bizNo 는 임의로 만들지 않고 "확인 후 기입" 문구를 넣어 두었다.
 *  값을 받으면 이 두 줄만 교체하면 된다.
 *
 *  tel 은 구글폼 17번의 담당자 연락처(박철현 010.4679.4984)를 그대로 넣었다.
 *  개인 휴대폰 번호이므로, 사이트에 공개할 대표번호가 따로 있다면 교체가 필요하다.
 */
export const site = {
  /** 브랜드명 (구글폼 2번) */
  name: "루리컴퍼니",
  /** 대표 연락처 — 화면 표시용 하이픈 포맷 (구글폼 17번) */
  tel: "010-4679-4984",
  /** tel: 링크에 넣을 숫자만 남긴 형태 (하이픈이 섞이면 일부 기기에서 오작동한다) */
  telHref: "01046794984",
  /** 담당자 성함 (구글폼 17번) — 상담 CTA 에 "담당 박철현" 형태로 노출 */
  manager: "박철현",
  /** 메타 설명 및 푸터 소개 문구 (구글폼 3번 업종 반영) — 두 문장을 한 문장으로 합쳤다 */
  description:
    "신차 할부·장기렌트·리스, 조건 확인부터 출고까지 상담 한 번으로 정리해 드립니다.",
  /** 상호 (푸터 사업자 정보) */
  company: "루리컴퍼니",
  /** 대표자 */
  ceo: "박철현",
  /** TODO: 실제 사업자등록번호를 전달받아 교체 필요 */
  bizNo: "사업자등록번호 확인 후 기입",
  /** TODO: 실제 사업장 주소를 전달받아 교체 필요 */
  address: "사업장 주소 확인 후 기입",
  /** 희망 오픈일 (구글폼 10번) — 화면에 노출하지 않고 기록 목적으로만 보관 */
  targetLaunchDate: "2026-08-17",
};

/** 상담 폼의 "연락 받을 방법" 선택지 한 항목 */
export type ContactMethod = {
  /** input value 로 쓰이는 고유 id */
  id: string;
  /** 라디오 버튼에 노출되는 라벨 */
  label: string;
};

/**
 * 연락 방법 선택지.
 *
 * 구글폼 18번에서 클라이언트가 선호하는 방법으로 "전화, 카카오톡"을 골랐으므로
 * 기존 3지선다(전화/문자/카톡)에서 문자를 빼고 2지선다로 줄였다.
 * 선택지를 줄이면 입력 부담이 줄어드는데, 이는 요청사항 7-1
 * ("편하게 상담 남길 수 있는 부분")과도 방향이 맞다.
 */
export const contactMethods: ContactMethod[] = [
  { id: "phone", label: "전화" },
  { id: "kakao", label: "카카오톡" },
];

/** 외부 채널 한 항목 */
export type Channel = {
  /** React key 및 아이콘 분기용 id */
  id: "kakao" | "instagram" | "blog";
  /** 화면에 노출되는 라벨 */
  label: string;
  /** 채널 설명 한 줄 */
  description: string;
  /** 이동할 외부 주소 */
  href: string;
  /** 아직 실제 주소를 못 받은 플레이스홀더인지 여부 */
  isPlaceholder: boolean;
};

/**
 * 외부 채널 목록 (구글폼 15번: 카카오톡 / 인스타그램 / 블로그).
 *
 * 푸터와 플로팅 CTA 가 공통으로 이 배열을 참조한다.
 *
 * ⚠️ href 는 실제 채널 주소를 전달받지 못해 전부 "#" 플레이스홀더다.
 *    isPlaceholder 가 true 인 항목은 클릭해도 이동하지 않도록 컴포넌트에서 막고,
 *    "준비 중" 임을 알 수 있게 처리한다.
 *    주소를 받으면 href 를 채우고 isPlaceholder 를 false 로 바꾸면 된다.
 */
export const channels: Channel[] = [
  {
    id: "kakao",
    label: "카카오톡 상담",
    description: "가장 빠르게 답변받는 방법",
    href: "#",
    isPlaceholder: true,
  },
  {
    id: "instagram",
    label: "인스타그램",
    description: "출고 차량과 소식 보기",
    href: "#",
    isPlaceholder: true,
  },
  {
    id: "blog",
    label: "블로그",
    description: "구매 방식 비교 가이드",
    href: "#",
    isPlaceholder: true,
  },
];

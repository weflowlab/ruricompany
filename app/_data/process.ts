/**
 * process.ts — 이용 절차 5단계 더미 데이터
 *
 * 역할
 *  - ProcessSection 이 스크롤 진입 시 순차(stagger) 등장시키는 5개 스텝 카드를 제공한다.
 *  - 데스크톱에서는 가로 5칸, 모바일에서는 세로 목록으로 배치된다.
 *
 * 주의
 *  - step 번호는 1부터 시작하며 화면에서 "STEP 01" 형태로 0 패딩해 표시하면 된다.
 */

/** 이용 절차 한 단계 */
export type ProcessStep = {
  /** 단계 번호 (1~5). React key 로도 사용 가능 */
  step: number;
  /** 단계 제목 (짧게) */
  title: string;
  /** 단계 설명 (한두 문장) */
  description: string;
};

/** 상담 신청부터 출고까지 5단계 */
export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "상담 신청",
    description:
      "간단한 정보만 남겨 주시면 담당자가 원하시는 방법(전화·문자·메신저)으로 먼저 연락드립니다.",
  },
  {
    step: 2,
    title: "차량 상담",
    description:
      "운행 거리와 적재 조건을 확인해 과한 옵션은 덜어내고 필요한 사양 위주로 후보를 좁혀 드립니다.",
  },
  {
    step: 3,
    title: "맞춤 견적 확인",
    description:
      "선수금과 계약 기간을 바꿔 가며 월 납입금이 어떻게 달라지는지 비교표로 정리해 보내 드립니다.",
  },
  {
    step: 4,
    title: "서류 접수 및 심사",
    description:
      "필요한 서류 목록을 미리 안내해 드리고, 접수 후 진행 상황을 단계별로 공유해 드립니다.",
  },
  {
    step: 5,
    title: "차량 출고 및 인수",
    description:
      "원하시는 장소에서 차량을 인수하실 수 있으며, 인수 후 관리 방법과 만기 안내까지 함께 도와드립니다.",
  },
];

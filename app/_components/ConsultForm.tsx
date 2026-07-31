'use client';

/**
 * ConsultForm — 공용 "상담 신청" 폼
 *
 * 역할
 *  - 사이트에서 두 군데에 재사용되는 단일 상담 폼이다.
 *      1) 하단 상담 섹션        → <ConsultForm variant="full" />     (라벨 표시 / 2열 그리드)
 *      2) 상담 신청 모달(팝업)  → <ConsultForm variant="compact" />  (라벨 숨김 / 1열)
 *         차량 카드의 "상담받기" 가 여는 <ConsultModal /> 안이다. compact 변형은
 *         원래 히어로 우측 카드용이었는데 히어로 개편으로 소비처를 잃었다가
 *         이 모달이 새 소비처가 됐다(2026-07-30).
 *  - 입력 항목:
 *    성함(필수) / 연락처(필수) / 관심 차량(모달 전용, 읽기 전용 프리필)
 *    / 관심 방식(선택, 셀렉트) / 연락 방법(라디오) / 동의(필수).
 *
 * ============================================================================
 * ★ 클라이언트 요청사항(구글폼) 반영 내역
 * ============================================================================
 *  - 7-1 "고객이 편하게 상담 남길 수 있는 부분" → **입력 부담 줄이기가 이 폼의 최우선 목표.**
 *      · 필수 입력을 성함·연락처 2개로만 남겼다. (개편 전에는 차종도 필수였다)
 *      · "관심 차종" 자유 입력 텍스트를 **셀렉트**로 바꿨다. 자유 입력은 오타가 나고,
 *        "뭐라고 써야 하지?" 하고 멈추는 순간이 곧 이탈 지점이기 때문이다.
 *        선택지는 app/_data/services.ts 의 servicePlans 를 순회해 만들고,
 *        아직 정하지 못한 사람을 위해 "아직 모르겠어요" 를 마지막에 붙였다.
 *      · 관심 방식은 **선택 항목**이다. 비워 둬도 제출된다.
 *  - 18번 선호 연락 방법(전화 / 카카오톡) → 라디오를 하드코딩하지 않고
 *      app/_data/site.ts 의 `contactMethods` 배열을 순회해 렌더한다.
 *      문자를 뺐으므로 이제 2지선다이며, 기본 선택은 배열의 첫 항목(전화)이다.
 *      선택지가 데이터로 빠져 있으므로 나중에 늘려도 이 파일은 손댈 필요가 없다.
 *  - 8-1 "금액 노출 회피" → 버튼 문구를 "무료 견적 신청" → **"상담 신청하기"** 로 바꿨다.
 *      '견적'은 금액 안내를 약속하는 말로 읽힌다. 금액은 상담 중에만 안내한다.
 *  - 3번 업종 변경 → 약관 문구의 "화물차 리스·장기렌트" 를 "신차 할부·리스·장기렌트" 로 정리.
 *
 * 인터랙션
 *  - 연락처는 숫자만 받아 입력 도중 자동으로 하이픈을 넣는다. (010-1234-5678)
 *  - 각 필드는 blur(포커스 이탈) 시점과 제출 시점에 검증하고,
 *    에러 문구를 해당 필드 바로 아래에 accent 색으로 보여준다.
 *    (accent 토큰은 원래 할인가 강조용 빨강이었으나 가격 표기 제거 후
 *     **폼 에러 전용 색**으로 용도가 바뀌었다 — globals.css 주석 참고)
 *  - "[보기]" 버튼으로 약관 전문 패널을 토글한다. (aria-expanded / aria-controls 연결)
 *  - 제출 버튼은 필수 3종(성함·연락처·동의)이 모두 유효해질 때까지 disabled 이고,
 *    버튼 아래에 "무엇이 남았는지" 안내 문구가 나온다.
 *    (처음에는 동의만 체크하면 버튼이 활성화됐는데, 빈 성함·연락처로 눌러 에러를
 *     만나게 하는 것보다 애초에 막는 게 낫다는 피드백(2026-07-30)으로 바꿨다.)
 *  - 제출은 **실제 전송이 없다.** preventDefault 후 성공 상태로 전환해
 *    "접수되었습니다" 안내를 인라인으로 보여주고, 다시 신청하기 버튼으로 초기화한다.
 *  - 스팸 봇 차단용 honeypot(사람 눈에 안 보이는 함정 입력)을 하나 포함한다.
 *
 * 접근성
 *  - compact 변형에서도 라벨은 DOM 에 남기고 `sr-only` 로만 감춘다(스크린리더는 읽음).
 *  - 라디오 그룹은 fieldset/legend 로 묶고, 에러는 role="alert" + aria-describedby 로 연결한다.
 *  - 폼이 두 번 렌더되므로 id 중복을 막기 위해 React 의 useId() 로 접두사를 만든다.
 */

// React 19 타입에서는 FormEvent 가 deprecated 이므로 폼 제출에는 SubmitEvent 를 쓴다.
// (DOM 전역 SubmitEvent 와 이름이 겹치므로 react 에서 명시적으로 type import 한다)
import { useEffect, useId, useRef, useState, type SubmitEvent } from 'react';
// 구글폼 18번(전화·카카오톡) 선택지는 하드코딩하지 않고 데이터에서 가져온다
import { contactMethods, site } from '../_data/site';
// 구글폼 3번 업종 3종(할부/리스/장기렌트) = "관심 방식" 셀렉트의 원본 데이터
import { servicePlans } from '../_data/services';

/* ==========================================================================
 * 타입 정의
 * ========================================================================== */

/** 폼의 표시 형태. compact = 히어로 카드용(좁음), full = 하단 섹션용(넓음) */
export type ConsultFormVariant = 'compact' | 'full';

/**
 * 검증 대상이 되는 필드 키.
 * honeypot / method / plan 은 검증하지 않는다.
 *  - method : 항상 기본값이 선택되어 있으므로 미입력 상태가 존재하지 않는다.
 *  - plan   : 구글폼 7-1(입력 부담 최소화)에 따라 **선택 항목**으로 뒀다.
 */
type FieldName = 'name' | 'phone' | 'agree';

/** 폼이 들고 있는 전체 값 */
type FormValues = {
  /** 성함 — 한글 2자 이상 */
  name: string;
  /** 연락처 — 화면에는 하이픈이 포함된 문자열로 저장된다 */
  phone: string;
  /**
   * 관심 방식 — 셀렉트로 고른 값(빈 문자열 = 선택 안 함).
   * 개편 전 자유 입력 'vehicle' 필드를 대체한다 (구글폼 7-1).
   */
  plan: string;
  /** 연락 방법 — contactMethods 의 id 를 저장한다. 기본값은 배열 첫 항목 */
  method: string;
  /** 개인정보 수집·이용 동의 여부 */
  agree: boolean;
  /** honeypot — 사람은 채우지 않는 함정 필드. 값이 있으면 봇으로 간주 */
  honeypot: string;
};

/** 필드별 에러 메시지 맵. 값이 없으면 에러 없음 */
type FormErrors = Partial<Record<FieldName, string>>;

/* ==========================================================================
 * 상수 / 순수 함수 — 컴포넌트 밖에 두어 렌더마다 재생성되지 않게 한다
 * ========================================================================== */

/**
 * "관심 방식" 셀렉트 선택지.
 *
 * 구글폼 3번 업종 3종을 services.ts 에서 그대로 가져오므로
 * 서비스 안내 섹션의 카드 제목과 폼 선택지가 영구히 어긋나지 않는다.
 * 마지막에 "아직 모르겠어요" 를 붙인 이유 : 방식을 모르는 사람이 훨씬 많고,
 * 그 사람이 폼 앞에서 멈추지 않게 해야 상담이 들어온다 (구글폼 7-1).
 */
const PLAN_OPTIONS: string[] = [...servicePlans.map((plan) => plan.name), '아직 모르겠어요'];

/**
 * 폼 초기값. 리셋할 때도 이 객체를 그대로 쓴다.
 * method 기본값은 contactMethods 의 첫 항목(= 구글폼 18번 기준 '전화').
 * 배열이 비는 경우는 없지만 타입 안전을 위해 빈 문자열 폴백을 둔다.
 */
const INITIAL_VALUES: FormValues = {
  name: '',
  phone: '',
  plan: '', // 빈 문자열 = 아직 고르지 않음 (선택 항목이라 그대로 제출 가능)
  method: contactMethods[0]?.id ?? '',
  agree: false,
  honeypot: '',
};

/**
 * 약관 전문 더미 텍스트.
 * 실제 법적 효력이 있는 문구가 아니라 구조 확인용 예시 문구다.
 * 업종이 바뀌었으므로(구글폼 3번) "화물차" 표현을 "신차"로 정리했고,
 * 수집 항목도 실제 필드 구성(관심 방식 셀렉트)과 일치시켰다.
 */
const TERMS_PARAGRAPHS: string[] = [
  '수집 항목 : 성함, 연락처, 관심 방식, 희망 연락 방법',
  '수집 목적 : 신차 할부·리스·장기렌트 상담 안내 및 상담 이력 관리',
  '보유 기간 : 상담 종료 후 6개월간 보관하며, 기간이 지나면 지체 없이 파기합니다.',
  '동의를 거부하실 수 있으며, 이 경우 상담 신청이 제한될 수 있습니다.',
];

/**
 * 입력된 문자열을 전화번호 형태(하이픈 포함)로 다듬는다.
 *
 * 동작
 *  - 숫자가 아닌 문자는 모두 제거한다.
 *  - 국번 규칙을 아주 단순화해서, '02' 로 시작하면 2-4-4, 그 외에는 3-4-4 로 끊는다.
 *  - 각 그룹 길이의 합을 넘는 입력은 잘라내므로 최대 자릿수가 자동으로 제한된다.
 *  - 아직 다 입력하지 않은 중간 단계에서도 자연스럽게 하이픈이 붙는다.
 *    (예: '0101' → '010-1', '01012345' → '010-1234-5')
 *
 * 참고 : 10자리 번호(예: 011-123-4567)는 위 규칙상 마지막 그룹이 3자리로 표시되지만,
 *        검증은 "숫자 10~11자리" 기준이므로 정상 통과한다.
 */
function formatPhone(raw: string): string {
  // 1) 숫자만 남긴다
  const digits = raw.replace(/[^0-9]/g, '');

  // 2) 서울 지역번호(02)만 2자리 국번으로 취급하고 나머지는 3자리로 본다
  const groups = digits.startsWith('02') ? [2, 4, 4] : [3, 4, 4];

  // 3) 그룹 길이의 총합(=최대 자릿수)만큼만 사용한다
  const maxLength = groups.reduce((sum, size) => sum + size, 0);
  const limited = digits.slice(0, maxLength);

  // 4) 앞에서부터 그룹 크기대로 잘라 배열에 담는다
  const chunks: string[] = [];
  let cursor = 0;
  for (const size of groups) {
    if (cursor >= limited.length) break; // 남은 글자가 없으면 종료
    chunks.push(limited.slice(cursor, cursor + size));
    cursor += size;
  }

  // 5) 하이픈으로 연결
  return chunks.join('-');
}

/** 문자열에서 숫자만 세어 반환 (전화번호 자릿수 검증용) */
function countDigits(value: string): number {
  return value.replace(/[^0-9]/g, '').length;
}

/**
 * 단일 필드 검증기.
 * 통과하면 undefined, 실패하면 사용자에게 보여줄 한국어 에러 문구를 돌려준다.
 */
function validateField(field: FieldName, values: FormValues): string | undefined {
  switch (field) {
    case 'name': {
      const name = values.name.trim();
      if (!name) return '성함을 입력해 주세요.';
      // 한글 완성형 2자 이상만 허용 (영문/숫자/자음·모음 단독 입력 차단)
      if (!/^[가-힣]{2,}$/.test(name)) return '성함은 한글 2자 이상으로 입력해 주세요.';
      return undefined;
    }
    case 'phone': {
      if (!values.phone.trim()) return '연락처를 입력해 주세요.';
      const length = countDigits(values.phone);
      // 휴대폰 11자리 / 일부 지역번호·구번호 10자리를 허용
      if (length < 10 || length > 11) return '연락처는 숫자 10~11자리로 입력해 주세요.';
      return undefined;
    }
    /*
     * 개편 전에는 여기에 'vehicle'(관심 차종 자유 입력) 필수 검증이 있었다.
     * 구글폼 7-1("편하게 상담 남길 수 있는")에 따라 셀렉트 + 선택 항목으로 바꿨으므로
     * 검증 케이스 자체를 없앴다. 필수 항목은 성함·연락처·동의 셋뿐이다.
     */
    case 'agree': {
      if (!values.agree) return '개인정보 수집·이용에 동의해 주세요.';
      return undefined;
    }
  }
}

/** 전체 필드를 한 번에 검증해 에러 맵을 만든다 (제출 시 사용) */
function validateAll(values: FormValues): FormErrors {
  const fields: FieldName[] = ['name', 'phone', 'agree'];
  const errors: FormErrors = {};
  for (const field of fields) {
    const message = validateField(field, values);
    if (message) errors[field] = message;
  }
  return errors;
}

/* ==========================================================================
 * 컴포넌트
 * ========================================================================== */

export default function ConsultForm({
  variant = 'full',
  presetVehicle,
}: {
  /** 표시 형태. 기본은 하단 섹션용 full */
  variant?: ConsultFormVariant;
  /**
   * 미리 채워 보여 줄 관심 차량명 (예: "쏘렌토 하이브리드").
   * 차량 카드의 "상담받기" → 모달 경로에서만 넘어온다.
   * 읽기 전용 표시 필드라 값 상태·검증에는 관여하지 않는다 — 사용자가 고칠 수
   * 없게 한 이유는, 여기서 차종을 바꾸게 하면 "자유 입력 차종" 필드를 없앤
   * 개편(구글폼 7-1, 위 주석 참고)이 도로 살아나기 때문이다.
   * 다른 차량이 궁금하면 모달을 닫고 그 차량 카드에서 다시 열면 된다.
   */
  presetVehicle?: string;
}) {
  /* ── 변형 플래그 ──────────────────────────────────────────────────────
     JSX 안에서 조건이 자주 쓰이므로 boolean 으로 한 번 꺼내 둔다. */
  const isCompact = variant === 'compact';

  /* ── 상태 ─────────────────────────────────────────────────────────── */

  /** 입력값 전체 */
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  /** 필드별 에러 메시지 */
  const [errors, setErrors] = useState<FormErrors>({});
  /** 한 번이라도 blur/제출로 "건드린" 필드 목록 — 건드리기 전에는 에러를 띄우지 않는다 */
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  /** 약관 전문 팝오버 열림 여부 */
  const [termsOpen, setTermsOpen] = useState(false);
  /**
   * 약관 팝오버 + 토글 버튼을 함께 감싼 래퍼 참조.
   * "바깥 클릭 시 닫기" 판정에 쓴다 — 클릭 지점이 이 래퍼 안이면 닫지 않는다.
   */
  const termsWrapRef = useRef<HTMLDivElement>(null);
  /** 제출 완료 여부 — true 가 되면 폼 대신 완료 안내를 보여준다 */
  const [submitted, setSubmitted] = useState(false);

  /* ── 약관 팝오버 닫기 처리 (2026-07-31) ────────────────────────────────
     아래로 밀어내는 아코디언 → 떠 있는 작은 창(팝오버)으로 바꾸면서,
     "밖을 누르거나 Esc 를 누르면 닫힌다"는 팝오버의 기본 관례를 구현한다.
     열려 있을 때만 리스너를 걸어 두어 평소에는 비용이 들지 않는다. */
  useEffect(() => {
    if (!termsOpen) return;

    /* 팝오버 바깥을 눌렀을 때만 닫는다. 안쪽(버튼 포함)은 무시한다.
       mousedown 을 쓰는 이유: click 까지 기다리면 버튼의 토글 핸들러와
       순서가 엉켜 "열자마자 닫히는" 현상이 생긴다. */
    const handlePointerDown = (event: MouseEvent) => {
      if (!termsWrapRef.current) return;
      if (termsWrapRef.current.contains(event.target as Node)) return;
      setTermsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTermsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [termsOpen]);

  /* ── id 생성 ──────────────────────────────────────────────────────────
     같은 페이지에 이 폼이 2개(히어로 + 하단) 렌더되므로 id 가 겹치면
     label ↔ input 연결과 aria-describedby 가 잘못 물린다.
     useId() 로 인스턴스마다 고유한 접두사를 만들어 붙인다. */
  const uid = useId();
  const id = (key: string) => `${uid}-${key}`;

  /* ── 이벤트 핸들러 ─────────────────────────────────────────────────── */

  /**
   * 텍스트 계열 입력 변경 처리.
   * - phone 은 입력 즉시 하이픈 포맷을 적용한다.
   * - 이미 에러가 떠 있는 필드라면, 값이 바뀔 때마다 다시 검증해서
   *   사용자가 고치는 즉시 에러가 사라지도록 한다(입력 중 새 에러는 띄우지 않음).
   */
  const handleChange = (field: 'name' | 'phone', raw: string) => {
    const nextValue = field === 'phone' ? formatPhone(raw) : raw;

    // 다음 값 객체를 미리 만들어 둔다.
    // (setValues 의 업데이터 함수 안에서 setErrors 를 호출하면 StrictMode 에서
    //  업데이터가 두 번 실행될 때 부수효과도 두 번 일어나므로 밖에서 계산한다.)
    const nextValues: FormValues = { ...values, [field]: nextValue };
    setValues(nextValues);

    // 이미 touched 인 필드만 실시간 재검증 (첫 입력부터 빨간 글씨가 뜨는 것을 방지)
    if (touched[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: validateField(field, nextValues) }));
    }
  };

  /** 포커스가 빠져나갈 때 해당 필드를 touched 로 표시하고 검증한다 */
  const handleBlur = (field: FieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
  };

  /**
   * 연락 방법 라디오 변경 — 검증 대상이 아니므로 값만 갱신한다.
   * 인수는 contactMethods 항목의 id 문자열이다 (구글폼 18번: phone / kakao).
   */
  const handleMethodChange = (methodId: string) => {
    setValues((prev) => ({ ...prev, method: methodId }));
  };

  /**
   * 관심 방식 셀렉트 변경 — 선택 항목이라 검증하지 않고 값만 저장한다.
   * (구글폼 7-1: 필수 항목을 늘리지 않는다)
   */
  const handlePlanChange = (plan: string) => {
    setValues((prev) => ({ ...prev, plan }));
  };

  /** 동의 체크박스 토글 — 체크하는 순간 동의 에러는 즉시 해제된다 */
  const handleAgreeChange = (checked: boolean) => {
    setValues((prev) => ({ ...prev, agree: checked }));
    setTouched((prev) => ({ ...prev, agree: true }));
    setErrors((prev) => ({ ...prev, agree: checked ? undefined : '개인정보 수집·이용에 동의해 주세요.' }));
  };

  /**
   * 제출 처리.
   * 네트워크 요청을 전혀 보내지 않는 데모용 구현이다.
   */
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    // 페이지 새로고침(기본 폼 전송) 차단
    event.preventDefault();

    // honeypot 에 값이 있으면 자동화 봇으로 간주하고 조용히 무시한다.
    // (봇에게 "차단됐다"는 신호를 주지 않기 위해 에러도 표시하지 않는다)
    if (values.honeypot.trim() !== '') return;

    // 전체 검증 후 에러가 하나라도 있으면 모든 필드를 touched 로 만들어 에러를 노출한다
    const nextErrors = validateAll(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setTouched({ name: true, phone: true, agree: true });
      return;
    }

    // TODO: 실제 API 연동 지점
    // 실제 서비스에서는 이 위치에서 fetch('/api/consult', { method: 'POST', body: ... }) 등으로
    // 서버에 접수 요청을 보내고, 응답 성공/실패에 따라 아래 상태를 나눠 처리해야 한다.
    // 지금은 데모이므로 곧바로 성공 상태로 전환한다.
    setSubmitted(true);
  };

  /** 완료 안내에서 "다시 신청하기" 를 눌렀을 때 폼을 초기 상태로 되돌린다 */
  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
    setTermsOpen(false);
    setSubmitted(false);
  };

  /* ── 스타일 조각 ───────────────────────────────────────────────────────
     variant 에 따라 달라지는 클래스를 미리 계산해 JSX 를 읽기 쉽게 만든다. */

  /** 입력창 공통 클래스. 에러가 있으면 테두리를 accent 색으로 바꾼다 */
  const inputClass = (hasError: boolean) =>
    [
      'w-full rounded-lg border bg-white/5 text-ink outline-none transition-colors',
      'placeholder:text-white/35',
      /* compact 입력창 높이를 py-2.5(10px) → py-3(12px) 로 키웠다 (2026-07-31).
         간격만 넓히고 입력창이 얇게 남으면 오히려 위아래가 헐거워 보인다. */
      isCompact ? 'px-3.5 py-3 text-sm' : 'px-4 py-3 text-[0.95rem]',
      hasError
        ? 'border-accent focus:border-accent'
        : 'border-line focus:border-primary',
    ].join(' ');

  /** 라벨 클래스 — compact 에서는 sr-only 로 시각적으로만 감춘다.
      full 은 라벨과 입력창 사이를 mb-2 로 살짝 띄운다(다닥다닥함 완화, 2026-07-30 피드백) */
  const labelClass = isCompact
    ? 'sr-only'
    : 'mb-3 block text-sm font-semibold text-ink';

  /* ── 제출 완료 화면 ────────────────────────────────────────────────────
     폼 전체를 대체해 인라인 안내를 보여준다. (별도 모달/알럿 없음) */
  if (submitted) {
    return (
      <div
        // role="status" + aria-live 로 스크린리더에도 완료 사실이 전달되게 한다
        role="status"
        aria-live="polite"
        className={[
          'flex flex-col items-center rounded-xl border border-primary/30 bg-primary/5 text-center',
          isCompact ? 'gap-2 px-4 py-7' : 'gap-3 px-6 py-12',
        ].join(' ')}
      >
        {/* 체크 아이콘 (인라인 SVG — 외부 아이콘 라이브러리 사용 금지 규칙) */}
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-5 w-5">
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <p className="text-base font-bold text-ink md:text-lg">접수되었습니다</p>
        {/* 담당자명을 넣어 "누가 연락할지"를 분명히 알린다 (구글폼 17번) */}
        <p className="text-sm leading-relaxed text-ink-sub">
          담당 {site.manager} 매니저가 남겨 주신 연락처로 순차 연락드립니다.
          <br />
          영업시간 외 접수 건은 다음 영업일에 안내해 드려요.
        </p>

        <button
          type="button"
          onClick={handleReset}
          className="mt-2 rounded-lg border border-line bg-white/5 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary-on-dark"
        >
          다시 신청하기
        </button>
      </div>
    );
  }

  /* ── 폼 본체 ─────────────────────────────────────────────────────────── */
  return (
    <form
      onSubmit={handleSubmit}
      // noValidate: 브라우저 기본 말풍선 대신 우리가 만든 한국어 에러 문구만 쓴다
      noValidate
      aria-label="상담 신청 폼"
      // relative : honeypot 을 화면 밖으로 절대배치할 기준점
      // full 의 블록 간 간격을 space-y-5 → space-y-6/7 로 넓혔다 (다닥다닥함 완화)
      /* compact 의 블록 간 간격을 space-y-3(12px) → space-y-5(20px) 로 넓혔다
         (2026-07-31 피드백: "히어로 우측 문의폼이 너무 다닥다닥하다").
         히어로 카드는 세로 여유가 있는 편이라 12px 은 필요 이상으로 빡빡했다. */
      className={['relative', isCompact ? 'space-y-5' : 'space-y-6 md:space-y-7'].join(' ')}
    >
      {/* ────────────────────────────────────────────────────────────────
          honeypot(꿀단지) 필드
          - 사람에게는 보이지 않고(-9999px 로 화면 밖 배치) 스크린리더에도 숨긴다.
          - 자동 입력 봇은 DOM 의 모든 input 을 채우는 경향이 있으므로,
            이 필드에 값이 들어오면 제출을 조용히 무시한다.
          - display:none 대신 화면 밖 배치를 쓰는 이유: 일부 봇은 hidden 필드를 건너뛴다.
         ──────────────────────────────────────────────────────────────── */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
        <label htmlFor={id('company')}>이 항목은 비워 두세요</label>
        <input
          id={id('company')}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.honeypot}
          onChange={(e) => setValues((prev) => ({ ...prev, honeypot: e.target.value }))}
        />
      </div>

      {/* ────────────────────────────────────────────────────────────────
          입력 3종 : 성함(필수) / 연락처(필수) / 관심 방식(선택 · 셀렉트)
          - full  : 2열 그리드 (성함 / 연락처 한 줄, 관심 방식은 전체 폭)
          - compact: 1열 세로 나열
         ──────────────────────────────────────────────────────────────── */}
      {/* 입력 필드 묶음. compact 도 space-y-5 로 바깥 간격과 리듬을 맞춘다 (2026-07-31) */}
      <div className={isCompact ? 'space-y-5' : 'grid gap-x-5 gap-y-5 md:grid-cols-2'}>
        {/* ── 성함 ── */}
        <div>
          <label htmlFor={id('name')} className={labelClass}>
            성함
          </label>
          <input
            id={id('name')}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="성함 (한글 2자 이상)"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            // 에러 상태를 보조기기에 알리고, 에러 문구 요소와 연결한다
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? id('name-error') : undefined}
            className={inputClass(Boolean(errors.name))}
          />
          {errors.name ? (
            <p id={id('name-error')} role="alert" className="mt-1.5 text-xs text-accent">
              {errors.name}
            </p>
          ) : null}
        </div>

        {/* ── 연락처 ── */}
        <div>
          <label htmlFor={id('phone')} className={labelClass}>
            연락처
          </label>
          <input
            id={id('phone')}
            name="phone"
            // type="tel" : 모바일에서 숫자 키패드가 먼저 뜬다
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="연락처 (010-1234-5678)"
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? id('phone-error') : undefined}
            className={inputClass(Boolean(errors.phone))}
          />
          {errors.phone ? (
            <p id={id('phone-error')} role="alert" className="mt-1.5 text-xs text-accent">
              {errors.phone}
            </p>
          ) : null}
        </div>

        {/* ── 관심 차량 (모달 전용 · 읽기 전용 프리필) ──
            차량 카드에서 "상담받기" 로 진입했을 때만 나타나며,
            캡처로 받은 원본 사이트의 "누른 차종이 채워져 있는 칸" 에 해당한다.
            readOnly + tabIndex -1 : 수정 대상이 아니므로 탭 순서에서도 뺀다.
            (수정을 막은 이유는 presetVehicle prop 주석 참고) */}
        {presetVehicle ? (
          <div className={isCompact ? undefined : 'md:col-span-2'}>
            <label htmlFor={id('vehicle')} className={labelClass}>
              관심 차량
            </label>
            <input
              id={id('vehicle')}
              name="vehicle"
              type="text"
              readOnly
              tabIndex={-1}
              value={presetVehicle}
              className={[
                inputClass(false),
                // 읽기 전용임을 옅은 배경으로 표현하고, 클릭해도 입력 커서가 서지 않게 한다
                'pointer-events-none bg-surface font-semibold',
              ].join(' ')}
            />
          </div>
        ) : null}

        {/* ── 관심 방식 (선택 · full 에서는 2열 전체를 차지) ──
            ★ 개편 전에는 "관심 차종" 자유 입력 텍스트였고 필수였다.
              구글폼 7-1("편하게 상담 남길 수 있는")에 맞춰 셀렉트 + 선택 항목으로 바꿨다.
              - 자유 입력은 오타가 생기고, 무엇을 써야 할지 고민하는 순간이 이탈 지점이 된다.
              - 선택지는 servicePlans(할부/리스/장기렌트) + "아직 모르겠어요" 4개뿐이라
                손가락 한 번으로 끝난다.
            검증하지 않는 필드이므로 aria-invalid / 에러 문구도 없다. */}
        <div className={isCompact ? undefined : 'md:col-span-2'}>
          <label htmlFor={id('plan')} className={labelClass}>
            관심 방식 (선택)
          </label>
          {/* relative : 오른쪽 화살표 아이콘을 절대배치할 기준점 */}
          <div className="relative">
            <select
              id={id('plan')}
              name="plan"
              value={values.plan}
              onChange={(e) => handlePlanChange(e.target.value)}
              /*
               * 셀렉트도 텍스트 입력과 같은 테두리·크기를 쓴다(에러 상태가 없으므로 false 고정).
               * appearance-none 으로 OS 기본 화살표를 지우고 오른쪽 패딩(pr-10)을 확보한 뒤,
               * 아래에서 인라인 SVG 화살표를 직접 얹는다.
               *  → 브라우저마다 다른 기본 화살표 모양을 통일해야 "조잡함"(구글폼 8-1)을 피할 수 있다.
               * 선택 전에는 안내 문구를 옅은 색(text-ink-sub)으로 보여 placeholder 처럼 읽히게 한다.
               */
              className={[
                inputClass(false),
                'cursor-pointer appearance-none pr-10',
                values.plan ? 'text-ink' : 'text-ink-sub',
              ].join(' ')}
            >
              {/* 선택 안 함 상태. value='' 이며 그대로 제출해도 검증에 걸리지 않는다 */}
              <option value="">관심 방식을 골라 주세요 (선택)</option>
              {PLAN_OPTIONS.map((planName) => (
                <option key={planName} value={planName}>
                  {planName}
                </option>
              ))}
            </select>

            {/* 화살표 아이콘 — 장식이므로 aria-hidden, 클릭이 셀렉트로 통과하도록 pointer-events-none */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-ink-sub"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          연락 방법 라디오 (pill 스타일)
          ★ 개편 전에는 ['전화','문자','카톡'] 을 이 파일에 하드코딩했다.
            구글폼 18번에서 클라이언트가 "전화, 카카오톡"만 선호한다고 답했으므로
            선택지를 app/_data/site.ts 의 `contactMethods` 배열로 옮기고 여기서는 순회만 한다.
              - 문자가 빠져 2지선다가 되었다 → 선택 부담 감소(구글폼 7-1)
              - 나중에 채널이 늘거나 라벨이 바뀌어도 데이터만 고치면 된다
            값으로는 항목의 id(phone / kakao)를 저장하고 화면에는 label 을 보여 준다.

          - 실제 input[type=radio] 는 sr-only 로 숨기되 DOM 에 남겨
            키보드 좌우 화살표 이동 등 네이티브 동작을 그대로 쓴다.
          - 시각 표현은 바로 뒤의 span 이 담당하며,
            Tailwind 의 peer 유틸로 checked / focus-visible 상태를 반영한다.
         ──────────────────────────────────────────────────────────────── */}
      <fieldset>
        {/*
          연락 방법 라벨은 compact 에서도 **눈에 보이게** 둔다 (labelClass 를 쓰지 않는 이유).
          성함·연락처는 placeholder 가 안내를 대신하지만, pill 버튼 2개는 라벨이 없으면
          "이게 무슨 선택이지?" 가 된다. 실제로 모달에서 문구가 안 보인다는
          피드백(2026-07-30)을 받고 sr-only 를 풀었다.
        */}
        <legend
          className={[
            'block font-semibold text-ink',
            isCompact ? 'mb-1.5 text-[13px]' : 'mb-2 text-sm',
          ].join(' ')}
        >
          연락 방법
        </legend>

        <div className={['flex gap-2', isCompact ? '' : 'mt-0.5'].join(' ')}>
          {contactMethods.map((contactMethod) => {
            const checked = values.method === contactMethod.id;
            return (
              <label key={contactMethod.id} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  // name 에 uid 를 포함해야 두 폼의 라디오 그룹이 서로 간섭하지 않는다
                  name={id('method')}
                  value={contactMethod.id}
                  checked={checked}
                  onChange={() => handleMethodChange(contactMethod.id)}
                  className="peer sr-only"
                />
                <span
                  className={[
                    'block rounded-full border text-center font-semibold transition-colors',
                    isCompact ? 'px-2 py-2 text-sm' : 'px-3 py-2.5 text-[0.95rem]',
                    // 선택됨 : primary 배경 + 흰 글씨 / 선택 안 됨 : 흰 배경 + 회색 글씨
                    checked
                      ? 'border-primary bg-primary text-white'
                      : 'border-line bg-white/5 text-ink-sub hover:border-primary hover:text-primary-on-dark',
                    // 키보드 포커스 링 — 마우스 클릭 시에는 뜨지 않는다
                    'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
                  ].join(' ')}
                >
                  {contactMethod.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* ────────────────────────────────────────────────────────────────
          개인정보 동의 + 약관 전문 토글
         ──────────────────────────────────────────────────────────────── */}
      <div>
        {/* relative — 안쪽 팝오버(absolute)의 위치 기준점.
            ref 는 "바깥 클릭 시 닫기" 판정 범위로 쓴다. */}
        <div
          ref={termsWrapRef}
          className="relative flex flex-wrap items-center gap-x-2 gap-y-1"
        >
          {/* 체크박스 + 라벨 */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              id={id('agree')}
              name="agree"
              type="checkbox"
              checked={values.agree}
              onChange={(e) => handleAgreeChange(e.target.checked)}
              onBlur={() => handleBlur('agree')}
              aria-invalid={Boolean(errors.agree)}
              aria-describedby={errors.agree ? id('agree-error') : undefined}
              // accent-primary : 네이티브 체크박스 색만 브랜드 블루(--color-primary)로 바꾼다
              className="h-4 w-4 shrink-0 accent-primary"
            />
            <span className={['text-ink-sub', isCompact ? 'text-xs' : 'text-sm'].join(' ')}>
              개인정보 수집·이용에 동의합니다.
            </span>
          </label>

          {/* 약관 전문 토글 버튼 — 접힘/펼침 상태를 aria-expanded 로 알린다 */}
          <button
            type="button"
            onClick={() => setTermsOpen((prev) => !prev)}
            aria-expanded={termsOpen}
            aria-controls={id('terms')}
            aria-label={termsOpen ? '개인정보 수집·이용 약관 접기' : '개인정보 수집·이용 약관 보기'}
            className={[
              'font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary-hover',
              isCompact ? 'text-xs' : 'text-sm',
            ].join(' ')}
          >
            {termsOpen ? '[닫기]' : '[보기]'}
          </button>

          {/* ── 약관 전문 팝오버 (2026-07-31: 아코디언 → 떠 있는 작은 창) ──
              바뀐 이유
                아래로 펼치는 방식은 열 때마다 제출 버튼이 아래로 밀려나서,
                약관을 확인하고 돌아오면 버튼 위치가 달라져 있었다.
                팝오버는 문서 흐름 위에 떠 있으므로 폼 레이아웃이 전혀 흔들리지 않는다.

              위치
                bottom-full + mb-2 → 버튼 "위쪽"에 띄운다. 이 블록이 폼 하단에 있어
                아래로 띄우면 화면 밖으로 나가거나 제출 버튼을 가린다.

              닫기 수단 3가지 : 우상단 × / 바깥 클릭 / Esc  (위 useEffect 참고)
              닫혀 있을 때는 DOM 에서 아예 제거해 스크린리더가 읽지 않게 한다. */}
          {termsOpen ? (
            <div
              id={id('terms')}
              role="dialog"
              aria-label="개인정보 수집·이용 동의 전문"
              className="absolute bottom-full left-0 z-20 mb-2 w-[min(22rem,calc(100vw-3rem))] rounded-xl border border-line bg-surface shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
            >
              {/* 팝오버 헤더 — 제목 + 닫기 버튼 */}
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
                <p className="text-xs font-bold text-ink md:text-sm">
                  개인정보 수집·이용 동의 (예시)
                </p>
                <button
                  type="button"
                  onClick={() => setTermsOpen(false)}
                  aria-label="약관 창 닫기"
                  className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-sub transition-colors hover:bg-surface hover:text-ink"
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* 본문 — 길어질 수 있으므로 최대 높이 + 세로 스크롤 */}
              <div className="max-h-48 overflow-y-auto px-4 py-3">
                <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-ink-sub">
                  {TERMS_PARAGRAPHS.map((paragraph) => (
                    <li key={paragraph}>{paragraph}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        {/* 동의 관련 에러 문구 */}
        {errors.agree ? (
          <p id={id('agree-error')} role="alert" className="mt-1.5 text-xs text-accent">
            {errors.agree}
          </p>
        ) : null}
      </div>

      {/* ────────────────────────────────────────────────────────────────
          제출 버튼
          - ★ 활성 조건 강화(2026-07-30): 원래는 동의 체크만 보고 활성화했는데,
            성함·연락처가 비어 있어도 눌러져 에러부터 만나게 되는 문제가 있었다.
            이제 필수 3종(성함·연락처·동의)이 전부 유효해야 버튼이 켜진다.
            어떤 항목이 남았는지는 버튼 아래 안내 문구가 알려 준다.
            (disabled 버튼은 포커스를 못 받으므로 문구로 이유를 설명해야 한다.
             handleSubmit 안의 validateAll 은 이제 만일을 대비한 이중 안전장치다.)
          - ★ 문구를 "무료 견적 신청" → "상담 신청하기" 로 바꿨다.
            '견적'은 금액을 알려 준다는 약속처럼 읽혀 구글폼 8-1(금액 노출 회피)과 어긋난다.
            구글폼 4번의 목적도 "예약·상담 문의 유도" 이므로 '상담'이 정확한 표현이다.
         ──────────────────────────────────────────────────────────────── */}
      <div>
        {(() => {
          /*
           * 아직 유효하지 않은 필수 항목 목록.
           * validateField 는 순수 함수라 렌더 중에 호출해도 부수효과가 없다.
           * (touched 여부와 무관하게 "현재 값" 기준으로만 판단한다 —
           *  에러 문구 노출과 버튼 활성화는 별개의 관심사다.)
           */
          const missing: string[] = [];
          if (validateField('name', values)) missing.push('성함 입력');
          if (validateField('phone', values)) missing.push('연락처 입력');
          if (!values.agree) missing.push('개인정보 동의');

          const ready = missing.length === 0;

          return (
            <>
              <button
                type="submit"
                disabled={!ready}
                className={[
                  'w-full rounded-lg font-bold text-white transition-colors',
                  isCompact ? 'py-3 text-[0.95rem]' : 'py-4 text-base md:text-lg',
                  ready
                    ? 'bg-primary hover:bg-primary-hover'
                    : 'cursor-not-allowed bg-black/20', // 비활성: 회색 + 커서로도 알림
                ].join(' ')}
              >
                상담 신청하기
              </button>

              {!ready ? (
                <p className="mt-2 text-center text-xs text-ink-sub">
                  {missing.join(' · ')} 후 신청할 수 있습니다.
                </p>
              ) : null}
            </>
          );
        })()}
      </div>
    </form>
  );
}

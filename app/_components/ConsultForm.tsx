'use client';

/**
 * ConsultForm — 공용 "무료 견적 신청" 상담 폼
 *
 * 역할
 *  - 사이트에서 두 군데에 재사용되는 단일 상담 폼이다.
 *    1) 히어로 우측 카드   → <ConsultForm variant="compact" />  (라벨 숨김 / 1열 / 간격 축소)
 *    2) 하단 상담 섹션     → <ConsultForm variant="full" />     (라벨 표시 / 2열 그리드)
 *  - 입력 항목은 원본 폼과 동일한 구성이다:
 *    성함 / 연락처 / 차종 / 연락 방법(전화·문자·카톡) / 개인정보 수집·이용 동의.
 *
 * 인터랙션
 *  - 연락처는 숫자만 받아 입력 도중 자동으로 하이픈을 넣는다. (010-1234-5678)
 *  - 각 필드는 blur(포커스 이탈) 시점과 제출 시점에 검증하고,
 *    에러 문구를 해당 필드 바로 아래에 accent(빨강) 색으로 보여준다.
 *  - "[보기]" 버튼으로 약관 전문 패널을 토글한다. (aria-expanded / aria-controls 연결)
 *  - 동의 체크 전에는 제출 버튼이 disabled 이며, 버튼 아래 안내 문구가 나온다.
 *  - 제출은 **실제 전송이 없다.** preventDefault 후 성공 상태로 전환해
 *    "접수되었습니다" 안내를 인라인으로 보여주고, 다시 신청하기 버튼으로 초기화한다.
 *  - 스팸 봇 차단용 honeypot(사람 눈에 안 보이는 함정 입력)을 하나 포함한다.
 *
 * 원본 대응
 *  - 원본 사이트의 히어로 우측 "빠른 견적 문의" 폼과 하단 상담 폼(동일 필드 구성)에 대응한다.
 *
 * 접근성
 *  - compact 변형에서도 라벨은 DOM 에 남기고 `sr-only` 로만 감춘다(스크린리더는 읽음).
 *  - 라디오 그룹은 fieldset/legend 로 묶고, 에러는 role="alert" + aria-describedby 로 연결한다.
 *  - 폼이 두 번 렌더되므로 id 중복을 막기 위해 React 의 useId() 로 접두사를 만든다.
 */

// React 19 타입에서는 FormEvent 가 deprecated 이므로 폼 제출에는 SubmitEvent 를 쓴다.
// (DOM 전역 SubmitEvent 와 이름이 겹치므로 react 에서 명시적으로 type import 한다)
import { useId, useState, type SubmitEvent } from 'react';

/* ==========================================================================
 * 타입 정의
 * ========================================================================== */

/** 폼의 표시 형태. compact = 히어로 카드용(좁음), full = 하단 섹션용(넓음) */
export type ConsultFormVariant = 'compact' | 'full';

/** 연락 방법 라디오 값 */
type ContactMethod = '전화' | '문자' | '카톡';

/** 검증 대상이 되는 필드 키 (honeypot 과 method 는 검증하지 않는다) */
type FieldName = 'name' | 'phone' | 'vehicle' | 'agree';

/** 폼이 들고 있는 전체 값 */
type FormValues = {
  /** 성함 — 한글 2자 이상 */
  name: string;
  /** 연락처 — 화면에는 하이픈이 포함된 문자열로 저장된다 */
  phone: string;
  /** 관심 차종 — 자유 입력 */
  vehicle: string;
  /** 연락 방법 — 기본값 '전화' */
  method: ContactMethod;
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

/** 라디오로 고를 수 있는 연락 방법 목록 */
const CONTACT_METHODS: ContactMethod[] = ['전화', '문자', '카톡'];

/** 폼 초기값. 리셋할 때도 이 객체를 그대로 쓴다 */
const INITIAL_VALUES: FormValues = {
  name: '',
  phone: '',
  vehicle: '',
  method: '전화', // 기본 선택은 '전화'
  agree: false,
  honeypot: '',
};

/**
 * 약관 전문 더미 텍스트.
 * 실제 법적 효력이 있는 문구가 아니라 구조 확인용 예시 문구다.
 */
const TERMS_PARAGRAPHS: string[] = [
  '수집 항목 : 성함, 연락처, 관심 차종, 희망 연락 방법',
  '수집 목적 : 화물차 리스·장기렌트 상담 및 견적 안내, 상담 이력 관리',
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
    case 'vehicle': {
      if (!values.vehicle.trim()) return '관심 있는 차종을 입력해 주세요.';
      return undefined;
    }
    case 'agree': {
      if (!values.agree) return '개인정보 수집·이용에 동의해 주세요.';
      return undefined;
    }
  }
}

/** 전체 필드를 한 번에 검증해 에러 맵을 만든다 (제출 시 사용) */
function validateAll(values: FormValues): FormErrors {
  const fields: FieldName[] = ['name', 'phone', 'vehicle', 'agree'];
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
}: {
  /** 표시 형태. 기본은 하단 섹션용 full */
  variant?: ConsultFormVariant;
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
  /** 약관 전문 패널 열림 여부 */
  const [termsOpen, setTermsOpen] = useState(false);
  /** 제출 완료 여부 — true 가 되면 폼 대신 완료 안내를 보여준다 */
  const [submitted, setSubmitted] = useState(false);

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
  const handleChange = (field: 'name' | 'phone' | 'vehicle', raw: string) => {
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

  /** 연락 방법 라디오 변경 — 검증 대상이 아니므로 값만 갱신한다 */
  const handleMethodChange = (method: ContactMethod) => {
    setValues((prev) => ({ ...prev, method }));
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
      setTouched({ name: true, phone: true, vehicle: true, agree: true });
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
      'w-full rounded-lg border bg-white text-ink outline-none transition-colors',
      'placeholder:text-black/35',
      isCompact ? 'px-3.5 py-2.5 text-sm' : 'px-4 py-3 text-[0.95rem]',
      hasError
        ? 'border-accent focus:border-accent'
        : 'border-line focus:border-primary',
    ].join(' ');

  /** 라벨 클래스 — compact 에서는 sr-only 로 시각적으로만 감춘다 */
  const labelClass = isCompact
    ? 'sr-only'
    : 'mb-1.5 block text-sm font-semibold text-ink';

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
        <p className="text-sm leading-relaxed text-ink-sub">
          담당 매니저가 남겨 주신 연락처로 순차 연락드립니다.
          <br />
          영업시간 외 접수 건은 다음 영업일에 안내해 드려요.
        </p>

        <button
          type="button"
          onClick={handleReset}
          className="mt-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
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
      aria-label="무료 견적 신청 폼"
      // relative : honeypot 을 화면 밖으로 절대배치할 기준점
      className={['relative', isCompact ? 'space-y-3' : 'space-y-5'].join(' ')}
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
          텍스트 입력 3종
          - full  : 2열 그리드 (성함 / 연락처 한 줄, 차종은 전체 폭)
          - compact: 1열 세로 나열
         ──────────────────────────────────────────────────────────────── */}
      <div className={isCompact ? 'space-y-3' : 'grid gap-x-5 gap-y-4 md:grid-cols-2'}>
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

        {/* ── 차종 (full 에서는 2열 전체를 차지) ── */}
        <div className={isCompact ? undefined : 'md:col-span-2'}>
          <label htmlFor={id('vehicle')} className={labelClass}>
            관심 차종
          </label>
          <input
            id={id('vehicle')}
            name="vehicle"
            type="text"
            placeholder="관심 차종 (예: 1톤 냉동탑차)"
            value={values.vehicle}
            onChange={(e) => handleChange('vehicle', e.target.value)}
            onBlur={() => handleBlur('vehicle')}
            aria-invalid={Boolean(errors.vehicle)}
            aria-describedby={errors.vehicle ? id('vehicle-error') : undefined}
            className={inputClass(Boolean(errors.vehicle))}
          />
          {errors.vehicle ? (
            <p id={id('vehicle-error')} role="alert" className="mt-1.5 text-xs text-accent">
              {errors.vehicle}
            </p>
          ) : null}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          연락 방법 라디오 (pill 스타일)
          - 실제 input[type=radio] 는 sr-only 로 숨기되 DOM 에 남겨
            키보드 좌우 화살표 이동 등 네이티브 동작을 그대로 쓴다.
          - 시각 표현은 바로 뒤의 span 이 담당하며,
            Tailwind 의 peer 유틸로 checked / focus-visible 상태를 반영한다.
         ──────────────────────────────────────────────────────────────── */}
      <fieldset>
        <legend className={labelClass}>연락 방법</legend>

        {/* compact 에서는 라벨이 sr-only 라 위 여백이 필요 없다 */}
        <div className={['flex gap-2', isCompact ? '' : 'mt-0.5'].join(' ')}>
          {CONTACT_METHODS.map((method) => {
            const checked = values.method === method;
            return (
              <label key={method} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  // name 에 uid 를 포함해야 두 폼의 라디오 그룹이 서로 간섭하지 않는다
                  name={id('method')}
                  value={method}
                  checked={checked}
                  onChange={() => handleMethodChange(method)}
                  className="peer sr-only"
                />
                <span
                  className={[
                    'block rounded-full border text-center font-semibold transition-colors',
                    isCompact ? 'px-2 py-2 text-sm' : 'px-3 py-2.5 text-[0.95rem]',
                    // 선택됨 : primary 배경 + 흰 글씨 / 선택 안 됨 : 흰 배경 + 회색 글씨
                    checked
                      ? 'border-primary bg-primary text-white'
                      : 'border-line bg-white text-ink-sub hover:border-primary hover:text-primary',
                    // 키보드 포커스 링 — 마우스 클릭 시에는 뜨지 않는다
                    'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
                  ].join(' ')}
                >
                  {method}
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
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
              // accent-primary : 네이티브 체크박스 색만 브랜드 그린으로 바꾼다
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
        </div>

        {/* 약관 전문 패널
            - 닫혀 있을 때는 DOM 에서 아예 제거해 스크린리더가 읽지 않도록 한다.
            - 내용이 길어질 수 있으므로 최대 높이 + 세로 스크롤을 준다. */}
        {termsOpen ? (
          <div
            id={id('terms')}
            className={[
              'mt-2 max-h-40 overflow-y-auto rounded-lg border border-line bg-surface leading-relaxed text-ink-sub',
              isCompact ? 'p-3 text-xs' : 'p-4 text-sm',
            ].join(' ')}
          >
            <p className="mb-1.5 font-semibold text-ink">개인정보 수집·이용 동의 (예시)</p>
            <ul className="list-disc space-y-1 pl-4">
              {TERMS_PARAGRAPHS.map((paragraph) => (
                <li key={paragraph}>{paragraph}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* 동의 관련 에러 문구 */}
        {errors.agree ? (
          <p id={id('agree-error')} role="alert" className="mt-1.5 text-xs text-accent">
            {errors.agree}
          </p>
        ) : null}
      </div>

      {/* ────────────────────────────────────────────────────────────────
          제출 버튼
          - 동의 전에는 disabled. (disabled 버튼은 포커스를 못 받으므로
            바로 아래에 이유를 설명하는 안내 문구를 함께 노출한다)
         ──────────────────────────────────────────────────────────────── */}
      <div>
        <button
          type="submit"
          disabled={!values.agree}
          className={[
            'w-full rounded-lg font-bold text-white transition-colors',
            isCompact ? 'py-3 text-[0.95rem]' : 'py-4 text-base md:text-lg',
            values.agree
              ? 'bg-primary hover:bg-primary-hover'
              : 'cursor-not-allowed bg-black/20', // 비활성: 회색 + 커서로도 알림
          ].join(' ')}
        >
          무료 견적 신청
        </button>

        {!values.agree ? (
          <p className="mt-2 text-center text-xs text-ink-sub">
            개인정보 수집·이용에 동의하시면 신청할 수 있습니다.
          </p>
        ) : null}
      </div>
    </form>
  );
}

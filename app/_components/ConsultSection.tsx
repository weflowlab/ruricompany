/**
 * ConsultSection — 페이지 하단 "문의하기" 섹션 (id="consult")
 *
 * 역할
 *  - 구글폼 6번이 명시한 세 섹션 중 마지막 "문의하기" 에 해당하는 전환 지점이다.
 *  - 제목 → 연락 채널 pill 행 → 상담 폼 카드 순서로 **한 줄 중앙 정렬** 배치한다.
 *  - 헤더 GNB·플로팅 CTA 의 `#consult` 앵커가 도착하는 목적지이기도 하다.
 *
 * ============================================================================
 * ★ 레이아웃 개편 (2026-07-30)
 * ============================================================================
 *  개편 전에는 좌(연락 수단 카드 3덩어리) : 우(상담 폼) 2열 그리드였다.
 *  클라이언트가 참고 사이트를 캡처로 보내며 "왼쪽 열을 없애고 폼을 가운데로" 를
 *  요청해 **1열 중앙 정렬**로 바꿨다.
 *   - 전화 카드 / 채널 타일 카드 / 안내 박스로 나뉘어 있던 좌측 열을 걷어내고,
 *     연락 수단은 제목 바로 아래 **pill 버튼 한 줄**로 압축했다.
 *     (연락 수단 자체를 지우면 구글폼 18번의 선호 연락 방법 - 전화·카카오톡 -
 *      접근 경로가 사라지므로, 위계만 낮춰 남긴다.)
 *   - 폼 카드는 max-w-[760px] + mx-auto 로 가운데 고정. 폭을 풀어 두면
 *     1320px 컨테이너 전체로 늘어나 입력창이 지나치게 길어진다.
 *   - "상담 전 확인해 주세요" 안내는 카드에서 폼 아래 짧은 한 줄 텍스트로 축약했다.
 *
 * ============================================================================
 * ★ 클라이언트 요청사항(구글폼) 반영 내역
 * ============================================================================
 *  - 15번 폼 연동 채널(카카오톡 / 인스타그램 / 블로그)
 *      → pill 행을 app/_data/site.ts 의 `channels` 배열 기반으로 렌더한다.
 *  - 17번 담당자(박철현 010-4679-4984)
 *      → 전화 pill 의 aria-label 에 번호와 담당자명을 담고,
 *        `site.telHref` 를 그대로 써서 tel: 링크를 만든다(숫자만 들어 있는 값이다).
 *  - 18번 선호 연락 방법(전화 / 카카오톡)
 *      → pill 행에서 전화를 **채움(primary) 스타일**로 첫 자리에 둬 시선을 준다.
 *        나머지 채널은 외곽선 스타일이라 하나만 도드라진다.
 *  - 8-1 "조잡하거나 금액 노출"
 *      → 카드 덩어리를 4개에서 1개(폼)로 줄여 시각적 소음을 없앴다.
 *        금액 연상 표현("견적 / 월 납입액 / 프로모션 조건")은 계속 쓰지 않는다.
 *  - 13·14번 컬러·분위기
 *      → 하드코딩 hex 없이 primary / primary-soft / line / ink 토큰만 쓴다.
 *
 * 인터랙션
 *  - 이 컴포넌트 자체에는 상태가 없다 → **서버 컴포넌트**.
 *    입력·검증 등 클라이언트 로직은 전부 자식인 ConsultForm('use client') 안에 있다.
 *
 * 반응형
 *  - 모바일 : pill 이 두 줄로 자연스럽게 감싸지고(flex-wrap), 폼은 전체 폭
 *  - md 이상 : pill 한 줄, 폼 카드는 760px 로 고정된 채 중앙 정렬
 */

import SectionTitle from './SectionTitle';
import ConsultForm from './ConsultForm';
import { channels, site, type Channel } from '../_data/site';

/**
 * 채널 아이콘 — 외부 아이콘 라이브러리를 쓰지 않으므로 id 별 인라인 SVG 를 직접 그린다.
 * 브랜드 로고를 흉내 내지 않고 "말풍선 / 사진 / 글" 같은 성격만 단순한 선으로 표현했다.
 * (실제 로고 이미지를 쓰지 않는 것은 이 프로젝트의 Placeholder 규칙이기도 하다)
 */
function ChannelIcon({ id }: { id: Channel['id'] }) {
  // 공통 속성 — 색은 부모에서 currentColor 로 물려받는다
  const common = {
    'aria-hidden': true as const,
    focusable: 'false' as const,
    viewBox: '0 0 24 24',
    className: 'h-[1.05rem] w-[1.05rem]',
  };

  if (id === 'kakao') {
    // 카카오톡 = 채팅 말풍선
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 3.5C7.3 3.5 3.5 6.6 3.5 10.3c0 2.4 1.6 4.5 4 5.7l-.9 3.3c-.1.3.2.5.5.4l4.1-2.7h.8c4.7 0 8.5-3.1 8.5-6.9S16.7 3.5 12 3.5z" />
      </svg>
    );
  }

  if (id === 'instagram') {
    // 인스타그램 = 사진 프레임 + 렌즈
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  // 블로그 = 글이 적힌 문서
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M5.5 4.5h13v15h-13z" />
      <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" />
    </svg>
  );
}

/**
 * 이 섹션의 pill 행에 노출할 채널 id 목록.
 *
 * ★ 2026-07-30 클라이언트 요청으로 인스타그램·블로그를 뺐다.
 *   문의 폼 바로 위는 "지금 연락할 방법"만 있어야 하는 자리인데,
 *   구경거리에 가까운 인스타그램·블로그가 섞이면 전화·카카오톡으로 가야 할 클릭이
 *   분산된다. 두 채널은 푸터(Footer)와 플로팅 CTA 에 그대로 남아 있으므로
 *   사이트 어디에서도 접근 경로가 사라지지는 않는다.
 *   (구글폼 15번의 채널 3종 자체는 site.ts 의 `channels` 에 그대로 유지된다.
 *    다시 노출하려면 이 배열에 id 만 추가하면 된다.)
 */
const PILL_CHANNEL_IDS: Channel['id'][] = ['kakao'];

export default function ConsultSection() {
  /*
   * tel: 링크는 하이픈 등 숫자가 아닌 문자가 섞이면 일부 기기에서 오작동한다.
   * site.telHref 가 이미 숫자만 담고 있으므로(구글폼 17번) 그대로 쓴다.
   */
  const telHref = `tel:${site.telHref}`;

  /** 위 화이트리스트에 든 채널만 남긴다 (현재는 카카오톡 하나) */
  const pillChannels = channels.filter((channel) => PILL_CHANNEL_IDS.includes(channel.id));

  /**
   * pill 한 개의 공통 클래스.
   * 캡슐 모양 + 아이콘·라벨 가로 배치. 채움/외곽선 두 변형이 이 위에 얹힌다.
   */
  /* whitespace-nowrap : pill 은 좁은 화면에서도 "전화 상담" 이 두 줄로 접히면 안 된다.
     줄이 모자라면 pill 자체가 다음 줄로 내려가야 한다(부모의 flex-wrap 이 처리). */
  const pillBase =
    'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-5 py-3 text-sm font-semibold transition-colors md:text-[0.95rem]';

  return (
    <section id="consult" className="bg-surface py-15 md:py-25">
      <div className="mx-auto w-full max-w-[1320px] px-5">
        {/*
          섹션 제목 — 강조어만 primary 색으로.
          구글폼 8-1 에 따라 "월 납입액" 같은 금액 표현을 지우고,
          "부담 없이 물어볼 수 있다"는 심리적 진입장벽 낮추기(7-1)에 초점을 맞췄다.
        */}
        <SectionTitle
          title="궁금한 점을 "
          highlight="편하게 남겨 주세요"
          /* 배열로 넘기면 문장 단위로 줄이 바뀐다 (SectionTitle 의 string[] 지원) */
          description={[
            '전화 · 카카오톡 또는 아래 폼으로 남겨 주시면 빠르게 안내해 드립니다.',
          ]}
        />

        {/* ───────────────── ① 연락 채널 pill 행 ─────────────────
            좌측 열에 있던 전화 카드 + 채널 타일 카드를 한 줄로 압축한 자리다.
            전화만 채움 스타일이라 4개가 나열돼도 위계가 무너지지 않는다(구글폼 8-1).
            ★줄간격 통일: SectionTitle 의 header 가 md 에서 mb-14(56px)를 갖고 있어
            "설명문 ↔ pill" 간격이 "pill ↔ 폼 카드" 간격(mt-10 = 40px)보다 넓었다.
            md:-mt-4 로 16px 을 되감아(56-16=40) 위아래 간격을 40px 로 맞춘다.
            (모바일은 header mb-8 = 32px 와 아래 mt-8 이 이미 같아 그대로 둔다) */}
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5 md:-mt-4 md:gap-3">
          {/* ── 전화 (구글폼 18번 선호 1순위 → 유일한 채움 스타일) ── */}
          <li>
            <a
              href={telHref}
              aria-label={`전화 상담 걸기 ${site.tel} (담당 ${site.manager})`}
              className={`${pillBase} border-primary bg-primary text-white hover:bg-primary-hover`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[1.05rem] w-[1.05rem]">
                {/* 수화기 모양 패스 */}
                <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.24c1.1.37 2.3.57 3.5.57a1 1 0 011 1V20a1 1 0 01-1 1C10.9 21 3 13.1 3 3.4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.4.57 3.5a1 1 0 01-.25 1l-2.22 2.2z" />
              </svg>
              전화 상담
              
            </a>
          </li>

          {/* ── 외부 채널 (현재는 카카오톡만 — PILL_CHANNEL_IDS 주석 참고) ── */}
          {pillChannels.map((channel) => (
            <li key={channel.id}>
              {channel.isPlaceholder ? (
                /*
                 * ⚠️ 실제 채널 주소를 아직 전달받지 못해 href 가 "#" 인 항목이다.
                 *    <a href="#"> 로 두면 클릭 시 페이지 맨 위로 튀어 오르므로,
                 *    앵커가 아닌 <span> 으로 렌더해 **이동 자체를 차단**한다.
                 *    - 이 컴포넌트는 서버 컴포넌트라 onClick preventDefault 를 쓸 수 없다.
                 *    - aria-disabled="true" 로 "지금은 쓸 수 없는 항목" 임을 알린다.
                 *    site.ts 의 href 를 채우고 isPlaceholder 를 false 로 바꾸면
                 *    아래 <a> 분기로 자동 전환된다.
                 */
                <span
                  aria-disabled="true"
                  title="채널 주소 확인 후 연결 예정"
                  className={`${pillBase} cursor-default border-line bg-white text-ink-sub opacity-60`}
                >
                  <ChannelIcon id={channel.id} />
                  {channel.label}
                  <span className="sr-only">{channel.description} (준비 중)</span>
                </span>
              ) : (
                /* 주소를 받은 뒤 활성화되는 정상 링크. 외부 채널이므로 새 창으로 연다. */
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${pillBase} border-line bg-white text-ink hover:border-primary hover:bg-primary-soft hover:text-primary`}
                >
                  <ChannelIcon id={channel.id} />
                  {channel.label}
                  <span className="sr-only">{channel.description}</span>
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* ───────────────── ② 상담 폼 카드 (중앙 고정) ─────────────────
            max-w-[760px] + mx-auto : 1320px 컨테이너 전체로 늘어나면 입력창이
            지나치게 길어져 읽기 힘들다. 폼 한 덩어리만 남았으므로 폭을 직접 묶는다. */}
        <div className="mx-auto mt-8 w-full max-w-[760px] rounded-2xl border border-line bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.05)] md:mt-10 md:p-9">
          <h3 className="text-lg font-bold text-ink md:text-xl">상담 신청서</h3>
          

          {/* 공용 폼의 full 변형 — 라벨이 보이고 2열 그리드로 배치된다 */}
          <div className="mt-6">
            <ConsultForm variant="full" />
          </div>
        </div>

        {/* ───────────────── ③ 보조 안내 ─────────────────
            개편 전 좌측 열의 "상담 전 확인해 주세요" 박스를 한 줄로 축약했다.
            카드로 두면 폼 아래에 또 하나의 덩어리가 생겨 중앙 정렬이 흐트러진다.
            (금액 연상 문구는 그대로 배제 — 구글폼 8-1) */}
        <p className="mx-auto mt-5 max-w-[760px] text-center text-xs leading-relaxed text-ink-sub md:text-sm">
          상담은 전액 무료이며 별도 수수료가 없습니다. 남겨 주신 정보는 상담 목적 외에 사용되지 않습니다.
        </p>
      </div>
    </section>
  );
}
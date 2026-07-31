/**
 * layout.tsx — 루트 레이아웃 (App Router 최상위 셸)
 *
 * 역할
 *  - 모든 페이지가 공유하는 <html> / <body> 골격을 만든다.
 *  - 사이트 전역 메타데이터(title / description / openGraph)를 선언한다.
 *  - 한글 본문용 웹폰트(Noto Sans KR)를 next/font 로 자가 호스팅한다.
 *  - 모든 페이지 공통 UI 인 고정 헤더(<Header />)와 플로팅 CTA(<FloatingCta />)를 렌더한다.
 *
 * 원본 대응
 *  - 원본 사이트의 <head> 메타 + 전역 폰트 로딩 + 상단 고정 헤더 + 우측/하단 플로팅 버튼 영역.
 *
 * 접근성
 *  - lang="ko" 로 스크린리더가 한국어로 읽도록 지정한다.
 *  - 본문 최상단에 "본문 바로가기" 스킵 링크를 두어, 키보드 사용자가 매번 GNB 를
 *    Tab 으로 통과하지 않고 곧바로 본문(#main-content)으로 이동할 수 있게 한다.
 *    (평소에는 sr-only 로 숨겨져 있다가 포커스를 받으면 화면 좌상단에 나타난다.)
 */

import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { Noto_Sans_KR } from "next/font/google";

import "./globals.css";
import Header from "./_components/Header";
import FloatingCta from "./_components/FloatingCta";
import { site } from "./_data/site";

/* -----------------------------------------------------------------------------
 * 1) 폰트 — Noto Sans KR (한글 본문 전용)
 *
 * ⚠️ next/font/google 의 한글 폰트 주의사항
 *  - Next 의 폰트 메타데이터상 Noto Sans KR 이 지원하는 subsets 는
 *    `cyrillic | latin | latin-ext | vietnamese` 뿐이고 **`korean` 은 목록에 없다.**
 *    즉 subsets 옵션으로 한글 글리프만 골라 받을 방법이 없다.
 *  - 그래서 subsets 에는 `latin` 만 지정한다. 실제 한글 글리프는 구글이 내려주는
 *    unicode-range 로 쪼개진 서브셋 파일들로 필요할 때 로드된다.
 *  - 이 상태에서 preload 를 켜면 "한글이 하나도 없는 latin 서브셋 파일"만
 *    <link rel="preload"> 로 미리 받게 되어 대역폭만 낭비한다.
 *    → 그래서 `preload: false` 로 끄고, display: "swap" 으로 폰트가 도착하기 전까지
 *      아래 fallback 시스템 폰트로 즉시 글자를 보여 준다.
 *
 * fallback / adjustFontFallback
 *  - 사내망·오프라인 등 폰트 다운로드가 실패할 수 있는 환경을 대비해
 *    한국어 시스템 폰트 스택을 명시적으로 넘긴다. next/font 가 이 목록을
 *    생성된 CSS 의 font-family 뒤에 그대로 붙여 주므로, 웹폰트가 없어도 한글이 깨지지 않는다.
 *  - adjustFontFallback 은 기본값이 true 인데, Next 가 Arial 계열 라틴 폰트 지표를 기준으로
 *    size-adjust 를 계산한다. 한글 폰트는 자소 구조상 지표가 크게 달라 오히려 어긋나므로
 *    false 로 끄고 위의 한국어 시스템 폰트 스택에 맡긴다.
 *
 * weight
 *  - 가변 폰트로 받으면 용량이 커지므로 실제로 쓰는 4단계만 고정폭으로 받는다.
 *    400(본문) / 500(강조) / 700(소제목) / 900(섹션 타이틀·가격)
 * -------------------------------------------------------------------------- */
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"], // 위 주석 참고 — 'korean' 서브셋은 존재하지 않는다
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false, // latin 서브셋만 preload 되는 낭비를 막는다
  variable: "--font-noto-sans-kr",
  adjustFontFallback: false,
  fallback: [
    "Pretendard",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "맑은 고딕",
    "system-ui",
    "sans-serif",
  ],
});

/*
 * globals.css 의 @theme inline 블록은 아직 create-next-app 시절 변수명인
 * `--font-geist-sans` / `--font-geist-mono` 를 참조한다.
 * CSS 에서 정의되지 않은 var() 를 참조하면 그 선언 전체가 무효가 되어
 * body 의 font-family 가 통째로 날아가므로, 두 변수를 <html> 인라인 스타일에서
 * 별칭(alias)으로 연결해 준다. globals.css 는 다른 담당자의 파일이라 손대지 않고,
 * 레이아웃 쪽에서 호환 레이어만 얇게 얹는 방식이다.
 */
const legacyFontVarAliases = {
  "--font-geist-sans": "var(--font-noto-sans-kr)",
  "--font-geist-mono": "ui-monospace, SFMono-Regular, Menlo, monospace",
} as CSSProperties;

/* -----------------------------------------------------------------------------
 * 2) 메타데이터
 *
 * Next 16 App Router 에서는 서버 컴포넌트인 layout/page 에서 `metadata` 객체를
 * export 하면 프레임워크가 알아서 <head> 태그로 변환해 준다.
 * (charset / viewport meta 는 Next 가 기본으로 넣어 주므로 여기서 다루지 않는다.)
 *
 * title 을 { default, template } 형태로 쓰면 하위 페이지가 title 만 지정해도
 * "하위제목 | 루리컴퍼니" 형태로 자동 조합된다.
 *
 * openGraph 에는 이미지를 넣지 않는다. 프로젝트 규칙상 실제 이미지 파일을 쓸 수 없고,
 * 상대경로 이미지를 넣으면 metadataBase 미설정 경고가 나기 때문이다.
 * -------------------------------------------------------------------------- */
const pageTitle = `${site.name} | 화물차 리스·장기렌트 맞춤 견적`;

export const metadata: Metadata = {
  title: {
    default: pageTitle,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.company }],
  keywords: [
    "화물차 리스",
    "화물차 장기렌트",
    "전기 화물차",
    "차량 견적 상담",
    site.name,
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    title: pageTitle,
    description: site.description,
  },
  /*
   * 이 사이트는 구조·인터랙션 학습을 위한 데모 클론이다.
   * 실제 서비스로 오인되어 검색에 노출되지 않도록 색인을 막아 둔다.
   */
  robots: { index: false, follow: false },
};

/* -----------------------------------------------------------------------------
 * 3) 뷰포트
 *
 * Next 13.2 이후 viewport 관련 설정은 metadata 에서 분리되어 별도 export 가 되었다.
 * themeColor 는 모바일 브라우저 주소창 색으로, 브랜드 그린(primary)을 쓴다.
 * -------------------------------------------------------------------------- */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#03c75a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      // notoSansKr.variable → --font-noto-sans-kr 정의, legacyFontVarAliases → 구 변수명 호환
      className={`${notoSansKr.variable} h-full`}
      style={legacyFontVarAliases}
    >
      {/*
        - antialiased: 한글 웹폰트의 자간·획이 또렷하게 보이도록 서브픽셀 렌더링 완화
        - text-ink: 기본 본문 글자색(#111)
        - flex flex-col + min-h-full: 콘텐츠가 짧은 화면에서도 푸터가 바닥에 붙도록
      */}
      <body className="flex min-h-full flex-col bg-white text-ink antialiased">
        {/* 키보드 사용자용 스킵 링크 — 포커스를 받을 때만 화면에 드러난다 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          본문 바로가기
        </a>

        {/* 전 페이지 공통 고정 헤더 (position: fixed, 높이 80px) */}
        <Header />

        {/* 각 라우트의 page.tsx 가 이 자리에 들어온다 */}
        {children}

        {/*
          전 페이지 공통 플로팅 CTA.
          데스크톱은 우측 세로 버튼 스택, 모바일은 하단 고정 바로 렌더된다.
          스크롤 300px 이후에 나타나므로 첫 화면을 가리지 않는다.
        */}
        <FloatingCta />
      </body>
    </html>
  );
}

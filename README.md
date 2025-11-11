# Voidx AI Add-on

웹사이트에 인터랙티브 AI 에이전트를 추가하기 위한 React + Vite 기반 라이브러리 프로젝트입니다.

## 🏁 시작하기

이 프로젝트는 `yarn` 패키지 매니저를 사용합니다.

**1. 의존성 설치:**

```bash
yarn install
```

**2. 개발 서버 실행:**

```bash
yarn dev
```

---

## 1\. 🚀 사용자 코드에 임포트하는 법 (사용법)

본 라이브러리는 Vite의 라이브러리 모드로 빌드되며, 빌드된 JavaScript 파일을 임포트하여 사용합니다.

`src/Main.tsx` 파일에 정의된 대로, 라이브러리는 HTML 문서 내의 특정 ID를 가진 DOM 요소를 찾아 AI 에이전트를 렌더링합니다.

**1단계: HTML에 타겟 요소 추가**

라이브러리를 적용하고자 하는 웹사이트의 `index.html` (또는 해당 페이지) `<body>` 태그 내부에 AI 에이전트가 마운트될 `div` 요소를 추가합니다.

```html
<body>
  <div id="voidx-ai-add-on"></div>
</body>
```

**2단계: 빌드된 스크립트 임포트**

`yarn build` 명령어로 생성된 `dist` 폴더의 JavaScript 파일을 `<body>` 태그 최하단에서 임포트합니다.

```html
<body>
  <script type="module" src="/path/to/dist/voidx-ai-addon.es.js"></script>
</body>
```

스크립트가 로드되면 `src/Main.tsx`의 로직이 실행되어 `#voidx-ai-add-on` 요소를 찾아 React 앱(`App.tsx`)을 자동으로 렌더링합니다.

---

## 2\. 📦 빌드 및 배포

`package.json`에 정의된 스크립트를 사용하여 프로젝트를 빌드합니다.

```bash
# TypeScript 타입 체크 후 Vite로 라이브러리 빌드 실행
yarn build
```

빌드가 성공하면 `dist` 디렉토리에 다음과 같은 라이브러리 파일 및 에셋이 생성됩니다:

- `voidx-ai-addon.es.js` (메인 ES 모듈 파일)

배포는 이 `dist` 폴더의 내용물을 NPM, CDN 또는 정적 호스팅 서비스에 업로드하여 진행합니다.

---

## 3\. 🧪 테스트 코드 실행법

이 프로젝트는 **Vitest**를 사용하여 테스트를 실행합니다. `package.json`에 다음 스크립트가 정의되어 있습니다.

**단일 실행 (CI용):**

```bash
# 모든 테스트를 한 번 실행합니다.
yarn test
```

**개발 모드 (Watch):**

```bash
# 파일 변경을 감지하여 자동으로 테스트를 다시 실행합니다.
yarn test:watch
```

**UI 모드:**

```bash
# 브라우저에서 테스트 결과를 시각적으로 확인하는 UI를 실행합니다.
yarn test:ui
```

**테스트 커버리지:**

```bash
# 테스트 커버리지를 측정하고 터미널과 'coverage/' 폴더에 리포트를 생성합니다.
yarn coverage
```

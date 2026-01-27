# PMO Suite - 프로젝트 및 리소스 관리 시스템

PMO Suite는 프로젝트 관리 오피스(PMO)를 위한 웹 기반 대시보드입니다. 프로젝트 등록, 인력 할당, Man-Month(MM) 분석 및 연간 인력 가동 현황을 효율적으로 관리할 수 있도록 설계되었습니다.

## 🚀 주요 기능

### 1. 프로젝트 관리 (Project Management)
*   **CRUD 기능**: 프로젝트 생성, 수정, 삭제 및 조회.
*   **상세 속성 관리**:
    *   프로젝트 명, 코드, 고객사, 기간, 상태(Planning, Active 등) 관리.
    *   **유형 관리**: 대내(Internal), 대외(External), 기타(Other)로 구분.
    *   **수주 금액**: 대내/대외 프로젝트의 경우 수주 금액 입력 (기타 프로젝트는 제외).
*   **검색**: 프로젝트 명 및 고객사 기준 검색 지원.

### 2. 인력 할당 (Resource Allocation)
*   **리소스 투입**: 프로젝트별 멤버 할당, 역할(Role: PM, PL, DEV 등) 지정.
*   **기간 및 투입률**: 투입 기간 및 Input Ratio(0.1 ~ 1.0) 설정에 따른 예상 MM 자동 계산.
*   **편집 기능**: 기 등록된 할당 정보의 수정 및 삭제 지원.
*   **프로젝트 요약**: 선택된 프로젝트의 기본 정보 및 총 계획 MM 실시간 확인.

### 3. Man-Month 분석 (MM Analysis)
*   **월별 차트**:
    *   전체 인력 투입 현황 막대형 차트 제공.
    *   개별 인원 클릭 시 해당 인원의 월별 투입 차트(보라색)로 전환.
    *   'Show Total Resource' 버튼으로 전체 뷰 복귀.
*   **매트릭스 테이블**: 인원별/월별 투입 MM 상세 테이블 조회.
*   **엑셀 내보내기**: 분석 데이터를 `.csv` 형식으로 다운로드 (Excel 호환).

### 4. 연간 현황 (Yearly Status)
*   **가동 상태 시각화**:
    *   🟢 **가득 (Billable)**: 대내/대외 등 수익성 프로젝트 투입.
    *   🔵 **가동 (Active)**: 기타(사내 활동 등) 프로젝트 투입.
    *   ⚪ **비가득 (Unassigned)**: 할당된 프로젝트 없음.
*   **인터랙티브 기능**:
    *   **연도 변경**: 2026년 기준 전/후 연도 이동 가능.
    *   **멤버 정보 팝업**: 멤버 이름 클릭 시 스킬 및 직급 상세 조회.
    *   **투입 상세 팝업**: 월별 셀 클릭 시 해당 월에 투입된 프로젝트 정보(PM, 본인 역할, 기간 등) 조회.

---

## 🛠 기술 스택

*   **Framework**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **Charts**: Recharts
*   **Icons**: Lucide React
*   **State Management**: React Context API
*   **Build Tool**: Vite (권장)

---

## 💻 설치 및 실행 방법

이 프로젝트는 React + TypeScript 환경에서 실행됩니다. 아래 절차를 따라 로컬 환경을 구성하세요.

### 1. 사전 요구사항
*   Node.js (v18 이상 권장)
*   npm 또는 yarn

### 2. 프로젝트 설정 (Vite 사용 시)

```bash
# 1. 새로운 Vite 프로젝트 생성
npm create vite@latest pmo-suite -- --template react-ts

# 2. 프로젝트 폴더로 이동
cd pmo-suite

# 3. 필요한 라이브러리 설치
npm install lucide-react recharts tailwind-merge clsx
npm install -D tailwindcss postcss autoprefixer

# 4. Tailwind CSS 초기화
npx tailwindcss init -p
```

### 3. Tailwind 설정 (`tailwind.config.js`)
`content` 배열을 아래와 같이 수정합니다.

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. 소스 코드 적용
제공된 소스 파일들을 `src` 폴더 내 적절한 위치에 배치합니다.
*   `types.ts`, `App.tsx`, `main.tsx` (index.tsx)
*   `context/`, `components/`, `utils/` 폴더 생성 후 파일 이동

### 5. 실행

```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 접속.

---

## 📝 데이터 정책

*   **샘플 데이터**: 현재 **2026년**을 기준으로 초기 데이터가 세팅되어 있습니다.
*   **데이터 지속성**: 별도의 백엔드 DB 없이 브라우저 메모리(Context API) 상에서만 동작하므로, **새로고침 시 데이터가 초기화**됩니다.

---

## 📂 폴더 구조

```
src/
├── components/
│   ├── ui/
│   │   └── Button.tsx
│   ├── MMAnalysis.tsx      # MM 분석 화면
│   ├── ProjectManagement.tsx # 프로젝트 관리 화면
│   ├── ResourceAllocation.tsx # 인력 할당 화면
│   └── YearlyStatus.tsx    # 연간 현황 화면
├── context/
│   └── PMOContext.tsx      # 전역 상태 관리 (데이터 저장소)
├── utils/
│   └── dateUtils.ts        # 날짜 및 계산 유틸리티
├── types.ts                # TypeScript 인터페이스 정의
├── App.tsx                 # 메인 레이아웃 및 라우팅
└── index.tsx               # 진입점
```
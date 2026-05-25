# 친환경소비행동 인터뷰 텍스트 분석

서울중구가족센터 **친환경소비행동 활동 인터뷰**(응답자 20명 × 질문 4개 = 응답 80건)를
분석하여 **주요 중심언어**를 도출하고, 데이터 **분량 적정성**을 진단하는 웹 리포트입니다.

🔗 **배포 주소**: https://eco-consumption-text-analysis.vercel.app

## 분석 내용

| 구분 | 내용 |
|---|---|
| **분량 적정성 진단** | 응답자·질문별 글자/어절/문장 수, 분석 충분성 판정 |
| **중심언어 도출** | 단어 동시출현 의미연결망 → 연결·매개·위세 중심성 상위어 |
| **핵심 키워드** | 전체 및 질문별 출현 빈도 상위 단어 |
| **질문별 변별 키워드** | TF-IDF 기반 각 질문의 특징어 |

### 질문 구성
- **Q1.** 친환경소비행동 활동에 대한 전반적 느낀점
- **Q2.** 가장 기억에 남는 활동
- **Q3.** 활동 후 가정에서의 변화
- **Q4.** 나의 다짐

### 주요 결과(요약)
- 중심언어 Top: **친환경소비행동 · 실천 · 사용 · 활동** (연결중심성 상위)
- 주제어를 제외한 잠재 구조에서는 **종사자 · 센터 · 함께**가 핵심 — *공동(기관) 실천*의 성격을 드러냄
- **실천 확산 3단계** 테마: ① 직장(센터·종사자·교육) → ② 가정(가족·아이·음식배달·일회용품) → ③ 소비·나눔(마켓·물건·구매·습관)
- `함께`(73회)가 `혼자`(9회)를 크게 앞서 — "혼자보다 함께"의 공동 실천이 일관된 메시지
- 총 6,300여 어절 규모로 탐색적 텍스트 분석에 충분 (단, 표본 20명은 경향 파악 수준으로 해석)

## 기술 스택

- **분석**: Python · Kiwi(kiwipiepy) 형태소 분석 · scikit-learn(TF-IDF) · NetworkX(중심성·레이아웃)
- **웹**: Next.js 16 (App Router, TypeScript) · CSS Modules · 의존성 없는 SVG 네트워크 시각화
- **배포**: Vercel

## 실행 방법

### 1) 텍스트 분석 (결과 JSON 생성)
```bash
cd analysis
pip install -r requirements.txt
python analyze.py        # -> ../public/data/report.json 생성
```

### 2) 웹 대시보드
```bash
npm install
npm run dev              # http://localhost:3000
npm run build            # 프로덕션 빌드
```

## 디렉터리 구조
```
├── analysis/
│   ├── data/                     # 원자료(인터뷰 txt/docx)
│   ├── analyze.py                # 분석 파이프라인
│   └── requirements.txt
├── public/data/report.json       # 분석 결과(웹이 읽는 단일 데이터)
├── lib/report.ts                 # 결과 타입 정의 + import
├── components/                   # 대시보드 UI (Section/Hero/Adequacy/CentralWords/NetworkGraph/Keywords/Tfidf)
└── app/                          # Next.js App Router
```

## 분석 방법 메모
- 명사(NNG/NNP) 추출 후 1글자·불용어 제거, 도메인 복합어(친환경소비행동 등)는 사용자 사전으로 보존
- 의미연결망은 응답 단위 동시출현을 **Ochiai(코사인) 연관강도**로 정규화해 약한 연결을 제거 → 중심성 변별력 확보
- 네트워크 좌표는 `spring_layout`(seed 고정)으로 사전 계산해 정적 SVG로 렌더

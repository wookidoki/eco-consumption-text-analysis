import styles from "./Methodology.module.css";

const METHODS = [
  {
    name: "형태소 분석 (Kiwi)",
    what: "문장을 단어 단위로 쪼개고 품사를 판별. 명사·핵심 부사만 추려 분석 대상으로 삼음.",
    metric: "토큰 = 분석에 쓰인 단어 수. 많을수록 분석 근거가 풍부.",
  },
  {
    name: "키워드 빈도",
    what: "단어가 전체/질문별로 몇 번 등장했는지 집계.",
    metric: "빈도 = 등장 횟수. 가장 단순한 ‘무엇을 많이 말했나’ 지표.",
  },
  {
    name: "TF-IDF",
    what: "한 응답에서 자주 나오되 다른 응답엔 드문 단어에 가중치. 흔한 단어의 영향을 줄임.",
    metric: "점수가 높을수록 그 응답/질문을 ‘특징짓는’ 단어.",
  },
  {
    name: "Keyness (로그우도)",
    what: "특정 질문에서 통계적으로 과대표집된 단어를 검정. ‘이 질문에만 유독 많은 단어’를 수치로 증명.",
    metric: "LL>3.84 → p<.05, >6.63 → p<.01, >10.83 → p<.001 (★ 개수).",
  },
  {
    name: "의미연결망 중심성",
    what: "함께 등장하는 단어를 연결한 망에서 각 단어의 위치를 측정.",
    metric: "연결중심성=핵심성, 매개중심성=다리 역할, 위세중심성=영향력. 1에 가까울수록 강함.",
  },
  {
    name: "네트워크 지표",
    what: "연결망 전체의 구조를 요약.",
    metric: "밀도=연결 빽빽함(0~1), 모듈성=군집 분리도(>0.3이면 뚜렷), 군집계수=끼리끼리 정도.",
  },
  {
    name: "대응분석 (CA)",
    what: "질문×단어 교차표를 2차원 평면에 배치하는 차원축소.",
    metric: "차원 설명력(관성%) 합이 클수록 2차원 그림이 원자료를 잘 요약(보통 70%+면 양호).",
  },
  {
    name: "SBERT 임베딩 + 군집",
    what: "문장을 의미 벡터로 바꾼 뒤(딥러닝) 비슷한 응답끼리 군집화.",
    metric: "실루엣 계수(−1~1): 높을수록 군집이 또렷. 0.5+ 뚜렷, 0.2 미만 약함.",
  },
  {
    name: "상관 · 회귀 · 매개분석",
    what: "응답자별 수치 변수 간 관계를 검정. (이 데이터에선 n=20 한계로 탐색용)",
    metric: "상관 ρ(−1~1), 회귀 R²(설명력 0~1)·p<.05면 유의, 매개 Sobel Z·p로 간접효과 검정.",
  },
];

export default function Methodology() {
  return (
    <div className={styles.grid}>
      {METHODS.map((m) => (
        <div key={m.name} className={styles.card}>
          <h4 className={styles.name}>{m.name}</h4>
          <p className={styles.what}>{m.what}</p>
          <p className={styles.metric}>
            <span className={styles.mtag}>수치 해석</span>
            {m.metric}
          </p>
        </div>
      ))}
    </div>
  );
}

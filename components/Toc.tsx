import styles from "./Toc.module.css";

const ITEMS = [
  { id: "summary", label: "핵심 발견 요약" },
  { id: "sec-keywords", label: "A1. 핵심 키워드" },
  { id: "sec-keyness", label: "A2. 질문별 변별어" },
  { id: "sec-network", label: "A3. 중심언어·연결망" },
  { id: "sec-direction", label: "B1. 행동 변화 방향" },
  { id: "sec-factors", label: "B2. 촉진·장벽요인" },
  { id: "sec-themes", label: "B3. 실천 확산 3단계" },
  { id: "sec-pre", label: "C1. 데이터·전처리" },
  { id: "sec-eda", label: "C2. EDA·분량 적정성" },
  { id: "sec-ca", label: "부록 A. 대응분석" },
  { id: "sec-cluster", label: "부록 B. 의미 군집" },
  { id: "sec-features", label: "부록 C. 회귀·매개" },
  { id: "sec-method", label: "방법론 가이드" },
];

export default function Toc() {
  return (
    <nav className={styles.toc} aria-label="목차">
      <span className={styles.label}>목차</span>
      <ul className={styles.list}>
        {ITEMS.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className={styles.link}>
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

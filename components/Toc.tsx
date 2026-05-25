import styles from "./Toc.module.css";

const ITEMS = [
  { id: "summary", label: "핵심 발견 요약" },
  { id: "sec-pre", label: "1. 데이터 & 전처리" },
  { id: "sec-eda", label: "2. 탐색적 분석(EDA)" },
  { id: "sec-adequacy", label: "3. 분량 적정성" },
  { id: "sec-keywords", label: "4. 핵심 키워드" },
  { id: "sec-keyness", label: "5. 질문별 변별어" },
  { id: "sec-network", label: "6. 중심언어·연결망" },
  { id: "sec-themes", label: "7. 실천 확산 3단계" },
  { id: "sec-ca", label: "8. 대응분석(CA)" },
  { id: "sec-cluster", label: "부록 A. 의미 군집" },
  { id: "sec-features", label: "부록 B. 회귀·매개" },
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

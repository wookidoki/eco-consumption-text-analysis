import styles from "./Hero.module.css";
import type { Report } from "@/lib/report";

export default function Hero({
  meta,
  adequacy,
}: {
  meta: Report["meta"];
  adequacy: Report["adequacy"];
}) {
  const stats = [
    { label: "응답자", value: adequacy.respondents, unit: "명" },
    { label: "질문", value: adequacy.questions, unit: "개" },
    { label: "분석 응답", value: adequacy.totalResponses, unit: "건" },
    {
      label: "총 어절",
      value: adequacy.totalWords.toLocaleString(),
      unit: "어절",
    },
  ];

  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <span className={styles.kicker}>인터뷰 텍스트 분석 리포트</span>
        <h1 className={styles.title}>{meta.title}</h1>
        <p className={styles.subtitle}>{meta.subtitle}</p>

        <ul className={styles.stats}>
          {stats.map((s) => (
            <li key={s.label} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statUnit}>{s.unit}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </li>
          ))}
        </ul>

        <ul className={styles.questions}>
          {Object.entries(meta.questions).map(([q, label]) => (
            <li key={q} className={styles.q}>
              <span className={styles.qTag}>{q}</span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

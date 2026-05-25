import styles from "./CentralWords.module.css";
import type { Report } from "@/lib/report";

export default function CentralWords({
  central,
}: {
  central: Report["network"]["centralWords"];
}) {
  const maxDeg = Math.max(...central.map((c) => c.degree));
  const top = central.slice(0, 6);

  return (
    <div className={styles.wrap}>
      <div className={styles.highlight}>
        {top.map((c, i) => (
          <div key={c.word} className={styles.chip} data-rank={i + 1}>
            <span className={styles.chipRank}>{i + 1}</span>
            <span className={styles.chipWord}>{c.word}</span>
            <span className={styles.chipMeta}>중심성 {c.degree.toFixed(3)}</span>
          </div>
        ))}
      </div>

      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
          <span className={styles.cRank}>순위</span>
          <span className={styles.cWord}>중심언어</span>
          <span className={styles.cBar}>연결중심성</span>
          <span className={styles.cNum}>매개중심성</span>
          <span className={styles.cNum}>위세중심성</span>
          <span className={styles.cNum}>빈도</span>
        </div>
        {central.map((c, i) => (
          <div key={c.word} className={styles.row}>
            <span className={styles.cRank}>{i + 1}</span>
            <span className={styles.cWord}>{c.word}</span>
            <span className={styles.cBar}>
              <span className={styles.miniTrack}>
                <span
                  className={styles.miniFill}
                  style={{ width: `${(c.degree / maxDeg) * 100}%` }}
                />
              </span>
              <span className={styles.cBarNum}>{c.degree.toFixed(3)}</span>
            </span>
            <span className={styles.cNum}>{c.betweenness.toFixed(3)}</span>
            <span className={styles.cNum}>{c.eigenvector.toFixed(3)}</span>
            <span className={styles.cNum}>{c.freq}</span>
          </div>
        ))}
      </div>

      <p className={styles.note}>
        연결중심성 = 다른 단어와 함께 등장한 정도(핵심성), 매개중심성 = 서로 다른
        주제군을 잇는 역할, 위세중심성 = 영향력 있는 단어와 연결된 정도.
      </p>
    </div>
  );
}

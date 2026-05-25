import styles from "./Tfidf.module.css";
import type { Report, QuestionMap } from "@/lib/report";
import { QUESTION_KEYS } from "@/lib/report";

export default function Tfidf({
  tfidf,
  questions,
}: {
  tfidf: Report["tfidf"];
  questions: QuestionMap;
}) {
  return (
    <div className={styles.grid}>
      {QUESTION_KEYS.map((q) => {
        const items = (tfidf[q] || []).slice(0, 10);
        const max = Math.max(...items.map((i) => i.score), 0.0001);
        return (
          <div key={q} className={styles.card}>
            <div className={styles.head}>
              <span className={styles.tag}>{q}</span>
              <span className={styles.label}>{questions[q]}</span>
            </div>
            <ul className={styles.list}>
              {items.map((it) => (
                <li key={it.word} className={styles.item}>
                  <span className={styles.word}>{it.word}</span>
                  <span className={styles.track}>
                    <span
                      className={styles.fill}
                      style={{ width: `${(it.score / max) * 100}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

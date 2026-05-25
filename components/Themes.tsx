import styles from "./Themes.module.css";
import type { Report } from "@/lib/report";

const ACCENT = ["var(--c0)", "var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)"];

export default function Themes({ themes }: { themes: Report["themes"] }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.lead}>
        의미연결망 군집을 해석하면, 친환경소비행동의 실천이{" "}
        <b>직장 → 가정 → 소비 습관</b>으로 번져 간 흐름이 드러납니다.
      </p>
      <div className={styles.flow}>
        {themes.map((t, i) => (
          <div key={t.label} className={styles.stepWrap}>
            <div
              className={styles.card}
              style={{ borderTopColor: ACCENT[i % ACCENT.length] }}
            >
              <div className={styles.cardHead}>
                <span
                  className={styles.stage}
                  style={{ background: ACCENT[i % ACCENT.length] }}
                >
                  {t.stage}단계
                </span>
                <h3 className={styles.title}>{t.label}</h3>
              </div>
              <p className={styles.size}>핵심어 {t.size}개</p>
              <ul className={styles.words}>
                {t.words.map((w) => (
                  <li key={w} className={styles.word}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            {i < themes.length - 1 && <span className={styles.arrow}>→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

import styles from "./Keyness.module.css";
import Figure from "./Figure";
import type { Report, QuestionMap } from "@/lib/report";
import { QUESTION_KEYS } from "@/lib/report";

export default function Keyness({
  keyness,
  questions,
}: {
  keyness: Report["keyness"];
  questions: QuestionMap;
}) {
  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>
        막대 길이는 <b>로그우도(Log-Likelihood)</b> 값으로, 클수록 그 질문에만 두드러진
        단어입니다. <b>★는 유의수준</b>(★ p&lt;.05, ★★ p&lt;.01, ★★★ p&lt;.001)을 뜻합니다.
      </p>

      <Figure
        src={keyness.chart}
        alt="질문별 keyness 로그우도"
        caption="질문별 상위 변별어의 로그우도. 점선(3.84)을 넘으면 p<.05 수준으로 유의."
      />

      <div className={styles.grid}>
        {QUESTION_KEYS.map((q) => (
          <div key={q} className={styles.card}>
            <div className={styles.head}>
              <span className={styles.tag}>{q}</span>
              <span className={styles.label}>{questions[q]}</span>
            </div>
            <ul className={styles.list}>
              {keyness.byQuestion[q].slice(0, 7).map((w) => (
                <li key={w.word} className={styles.item}>
                  <span className={styles.word}>
                    {w.word}
                    <em className={styles.sig}>{w.sig}</em>
                  </span>
                  <span className={styles.ll}>LL {w.ll}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

import styles from "./Adequacy.module.css";
import type { Report } from "@/lib/report";

const LEVEL_TEXT: Record<string, string> = {
  ok: "분석에 충분",
  caution: "분석 가능 (보수적 해석)",
  low: "분량 부족",
};

export default function Adequacy({
  adequacy,
}: {
  adequacy: Report["adequacy"];
}) {
  const a = adequacy;
  const maxMean = Math.max(...a.byQuestion.map((q) => q.meanChars));

  const cards = [
    { label: "총 글자수", value: a.totalCharsNoSpace.toLocaleString(), unit: "자" },
    { label: "총 어절수", value: a.totalWords.toLocaleString(), unit: "어절" },
    { label: "총 문장수", value: a.totalSentences.toLocaleString(), unit: "문장" },
    { label: "응답당 평균", value: a.meanCharsPerResponse, unit: "자" },
  ];

  return (
    <div className={styles.wrap}>
      <div className={`${styles.verdict} ${styles[a.verdictLevel]}`}>
        <div className={styles.verdictHead}>
          <span className={styles.dot} />
          <span className={styles.verdictLabel}>
            진단 결과 · {LEVEL_TEXT[a.verdictLevel]}
          </span>
        </div>
        <p className={styles.verdictText}>{a.verdict}</p>
      </div>

      <div className={styles.cards}>
        {cards.map((c) => (
          <div key={c.label} className={styles.card}>
            <span className={styles.cardValue}>{c.value}</span>
            <span className={styles.cardUnit}>{c.unit}</span>
            <span className={styles.cardLabel}>{c.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.range}>
        응답 길이 범위 : 최소 <b>{a.minCharsPerResponse}자</b> ~ 최대{" "}
        <b>{a.maxCharsPerResponse}자</b> (응답 {a.totalResponses}건 기준)
      </div>

      <div className={styles.byq}>
        <h3 className={styles.byqTitle}>질문별 평균 응답 분량</h3>
        {a.byQuestion.map((q) => (
          <div key={q.question} className={styles.bar}>
            <div className={styles.barLabel}>
              <b>{q.question}</b>
              <span>{q.label}</span>
            </div>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{ width: `${(q.meanChars / maxMean) * 100}%` }}
              >
                <span className={styles.fillText}>{q.meanChars}자</span>
              </div>
            </div>
            <span className={styles.barMeta}>
              평균 {q.meanWords}어절 · {q.meanSentences}문장
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

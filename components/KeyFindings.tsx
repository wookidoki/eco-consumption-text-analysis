import styles from "./KeyFindings.module.css";
import type { Report } from "@/lib/report";

export default function KeyFindings({ r }: { r: Report }) {
  const central = r.network.centralWords.slice(0, 4).map((c) => c.word).join(" · ");
  const latent = r.networkLatent.centralWords.slice(0, 3).map((c) => c.word).join(" · ");

  const findings = [
    {
      n: 1,
      head: "핵심 중심언어",
      body: (
        <>
          연결중심성 상위어는 <b>{central}</b>. 자명한 주제어를 제외하면{" "}
          <b>{latent}</b>가 부상해 <b>‘기관 차원의 공동 실천’</b> 성격이 드러납니다.
        </>
      ),
    },
    {
      n: 2,
      head: "‘혼자’보다 ‘함께’",
      body: (
        <>
          <b>함께(73회)</b>가 <b>혼자(9회)</b>를 크게 앞섭니다. 종사자와 함께한 공동 실천이
          참여를 가능케 했다는 메시지가 일관됩니다.
        </>
      ),
    },
    {
      n: 3,
      head: "실천 확산 3단계",
      body: (
        <>
          실천이 <b>직장(센터·종사자) → 가정(가족·음식배달) → 소비습관(마켓·물건)</b>으로
          번진 흐름이 의미연결망 군집에서 확인됩니다.
        </>
      ),
    },
    {
      n: 4,
      head: "질문별 변별 & 데이터 적정성",
      body: (
        <>
          Q3(가정 변화)가 어휘적으로 가장 이질적(가정·음식·배달·아이).{" "}
          총 {r.adequacy.totalWords.toLocaleString()}어절로 <b>탐색적 분석엔 충분</b>하나,
          n=20이라 추론통계는 참고용입니다.
        </>
      ),
    },
  ];

  return (
    <section className={styles.wrap} id="summary">
      <div className={styles.head}>
        <span className={styles.kicker}>핵심 발견 요약</span>
        <h2 className={styles.title}>한눈에 보는 분석 결과</h2>
      </div>
      <div className={styles.grid}>
        {findings.map((f) => (
          <div key={f.n} className={styles.card}>
            <span className={styles.num}>{f.n}</span>
            <h3 className={styles.cardHead}>{f.head}</h3>
            <p className={styles.body}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

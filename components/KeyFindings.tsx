import styles from "./KeyFindings.module.css";
import type { Report } from "@/lib/report";

export default function KeyFindings({ r }: { r: Report }) {
  const central = r.network.centralWords.slice(0, 4).map((c) => c.word).join(" · ");
  const latent = r.networkLatent.centralWords.slice(0, 3).map((c) => c.word).join(" · ");

  const findings = [
    {
      n: 1,
      head: "주요 중심언어",
      body: (
        <>
          연결중심성 상위어는 <b>{central}</b>. 자명한 주제어를 제외하면{" "}
          <b>{latent}</b>가 부상해 <b>‘기관 차원의 공동 실천’</b>이 핵심임을 보여줍니다.
        </>
      ),
    },
    {
      n: 2,
      head: "행동 변화 방향",
      body: (
        <>
          <b>줄인 것</b>: 배달·일회용품·물티슈·비닐(↓) / <b>늘린 것</b>: 텀블러·개인컵·
          장바구니·손수건·분리배출(↑). 빈도가 아닌 <b>문장 분석으로 방향</b>을 확인.
        </>
      ),
    },
    {
      n: 3,
      head: "촉진요인 ≫ 장벽요인",
      body: (
        <>
          <b>함께·교육·반복</b>이 실천을 가능케 한 촉진요인. 장벽은 <b>초기 막연함·귀찮음</b>
          이 대부분이었고 <b>반복하며 극복</b>되었습니다.
        </>
      ),
    },
    {
      n: 4,
      head: "데이터 성격",
      body: (
        <>
          종사자 20명·총 {r.adequacy.totalWords.toLocaleString()}어절. 키워드·연결망 등{" "}
          <b>탐색적 분석엔 충분</b>하나 소표본이라 <b>경향 파악 수준</b>으로 해석합니다.
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

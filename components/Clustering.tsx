import styles from "./Clustering.module.css";
import Figure from "./Figure";
import type { Report } from "@/lib/report";

const ACCENT = ["#1f8a55", "#2f6fb0", "#d98324", "#9b5bb5", "#c2476a", "#3aa6a0"];

export default function Clustering({ emb }: { emb: Report["embedding"] }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>
        한국어 문장 임베딩 모델 <b>{emb.method}</b>로 응답 80건을 의미 벡터로 변환한 뒤,
        K-평균 군집화로 묶었습니다. 군집 수 {emb.k}개는 <b>실루엣 계수</b>로 선택했습니다.
      </p>

      <div className={styles.badges}>
        <div className={styles.badge}>
          <span className={styles.bv}>{emb.k}</span>
          <span className={styles.bl}>군집 수</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.bv}>{emb.silhouette}</span>
          <span className={styles.bl}>실루엣 계수</span>
        </div>
        <p className={styles.badgeNote}>
          실루엣 {emb.silhouette}는 낮은 편 — 모든 응답이 ‘긍정적 활동 후기’로 주제가 비슷해
          경계가 뚜렷하지 않다는 뜻(데이터 특성상 자연스러운 결과).
        </p>
      </div>

      <div className={styles.row}>
        <Figure
          src={emb.charts.scatter}
          alt="응답 의미 군집 산점도"
          caption="SBERT 임베딩을 PCA로 2차원 투영. 색=군집, 모양=질문."
        />
        <div className={styles.clusters}>
          {emb.clusters.map((c) => (
            <div
              key={c.id}
              className={styles.cluster}
              style={{ borderLeftColor: ACCENT[c.id % ACCENT.length] }}
            >
              <div className={styles.cHead}>
                <span
                  className={styles.cDot}
                  style={{ background: ACCENT[c.id % ACCENT.length] }}
                />
                <b>군집 {c.id + 1}</b>
                <span className={styles.cSize}>응답 {c.size}건</span>
                <span className={styles.cMix}>
                  {Object.entries(c.questionMix)
                    .sort((a, b) => b[1] - a[1])
                    .map(([q, n]) => `${q} ${n}`)
                    .join(" · ")}
                </span>
              </div>
              <div className={styles.cTerms}>
                {c.topTerms.map((t) => (
                  <span key={t} className={styles.term}>{t}</span>
                ))}
              </div>
              <p className={styles.exemplar}>
                <span className={styles.exTag}>대표 응답 {c.exemplar.respondent}_{c.exemplar.question}</span>
                “{c.exemplar.snippet}”
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <Figure
          src={emb.charts.questionSim}
          alt="질문 간 의미 유사도"
          caption="응답 임베딩 중심(centroid) 간 코사인 유사도. 1에 가까울수록 의미가 비슷."
        />
        <Figure
          src={emb.charts.dendrogram}
          alt="응답자 위계적 군집"
          caption="응답자 20명(A~T)을 응답 의미로 묶은 덴드로그램(Ward). 가까이 묶일수록 유사한 응답 성향."
        />
      </div>
    </div>
  );
}

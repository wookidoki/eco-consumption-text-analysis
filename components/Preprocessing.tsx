import styles from "./Preprocessing.module.css";
import type { Report } from "@/lib/report";

const TAG_KO: Record<string, string> = {
  NNG: "일반명사", NNP: "고유명사", NNB: "의존명사", MAG: "부사",
  VV: "동사", VA: "형용사", JKB: "조사", JKS: "조사", JC: "조사",
  XSV: "동사파생", XSA: "형용사파생", ETM: "관형형", EC: "연결어미",
  EF: "종결어미", JX: "보조사", VCP: "긍정지정사", SN: "숫자",
};

export default function Preprocessing({
  pre,
}: {
  pre: Report["preprocessing"];
}) {
  return (
    <div className={styles.grid}>
      <div className={styles.left}>
        <div className={styles.block}>
          <h4 className={styles.h}>원자료 예시 <span>({pre.rawExample.label})</span></h4>
          <blockquote className={styles.quote}>“{pre.rawExample.text}”</blockquote>
          <p className={styles.priv}>
            ※ 인터뷰 응답자는 A~T로 익명화. 원문 전체는 개인정보 보호로 비공개.
          </p>
        </div>

        <div className={styles.block}>
          <h4 className={styles.h}>전처리 파이프라인</h4>
          <ol className={styles.pipeline}>
            {pre.pipeline.map((s, i) => (
              <li key={i}>
                <span className={styles.num}>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.block}>
          <h4 className={styles.h}>형태소 분석 예시 (Kiwi)</h4>
          <div className={styles.tokens}>
            {pre.tokenExample.map((t, i) => (
              <span key={i} className={styles.token}>
                {t.surface}
                <em>{TAG_KO[t.tag] || t.tag}</em>
              </span>
            ))}
          </div>
          <p className={styles.note}>
            → 이 중 <b>일반·고유명사 + 핵심 부사</b>만 분석에 사용
          </p>
        </div>

        <div className={styles.block}>
          <h4 className={styles.h}>
            불용어 처리 <span>(총 {pre.stopwordCount}개 제거)</span>
          </h4>
          <div className={styles.chips}>
            {pre.stopwordSample.map((w) => (
              <span key={w} className={`${styles.chip} ${styles.stop}`}>
                {w}
              </span>
            ))}
            <span className={styles.more}>…</span>
          </div>
        </div>

        <div className={styles.dictRow}>
          <div className={styles.block}>
            <h4 className={styles.h}>사용자 사전(복합어 보존)</h4>
            <div className={styles.chips}>
              {pre.userDict.slice(0, 8).map((w) => (
                <span key={w} className={`${styles.chip} ${styles.keep}`}>{w}</span>
              ))}
            </div>
          </div>
          <div className={styles.block}>
            <h4 className={styles.h}>포함한 핵심 부사</h4>
            <div className={styles.chips}>
              {pre.meaningfulAdv.map((w) => (
                <span key={w} className={`${styles.chip} ${styles.adv}`}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

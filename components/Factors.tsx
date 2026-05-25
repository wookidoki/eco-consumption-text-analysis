import styles from "./Factors.module.css";
import type { Report } from "@/lib/report";

export default function Factors({ factors }: { factors: Report["factors"] }) {
  const maxF = Math.max(...factors.facilitators.map((x) => x.count), 1);
  const maxB = Math.max(...factors.barriers.map((x) => x.count), 1);

  const Col = ({
    title,
    desc,
    items,
    max,
    tone,
  }: {
    title: string;
    desc: string;
    items: Report["factors"]["facilitators"];
    max: number;
    tone: "fac" | "bar";
  }) => (
    <div className={`${styles.col} ${styles[tone]}`}>
      <div className={styles.colHead}>
        <span className={styles.icon}>{tone === "fac" ? "✓" : "△"}</span>
        <div>
          <h3 className={styles.colTitle}>{title}</h3>
          <p className={styles.colDesc}>{desc}</p>
        </div>
      </div>
      <ul className={styles.list}>
        {items.map((it) => (
          <li key={it.theme} className={styles.item}>
            <div className={styles.itemHead}>
              <span className={styles.theme}>{it.theme}</span>
              <span className={styles.count}>{it.count}문장</span>
            </div>
            <div className={styles.track}>
              <span
                className={styles.fill}
                style={{ width: `${(it.count / max) * 100}%` }}
              />
            </div>
            {it.examples[0] && (
              <p className={styles.quote}>
                <span className={styles.qtag}>
                  {it.examples[0].r}_{it.examples[0].q}
                </span>
                “{it.examples[0].text}”
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>
        행동변화 연구의 핵심은 <b>무엇이 실천을 가능케 했고(촉진요인) 무엇이 가로막았나(장벽요인)</b>입니다.
        응답 문장을 주제별로 코딩한 결과, <b>촉진요인이 장벽요인을 크게 압도</b>하며, 장벽은 대부분{" "}
        <b>활동 초기의 막연함·귀찮음</b>으로 <b>반복·교육·공동 실천을 통해 극복</b>되는 양상을 보입니다.
      </p>
      <div className={styles.cols}>
        <Col
          tone="fac"
          title="촉진요인 — 실천을 가능케 한 것"
          desc="응답에서 ‘덕분에 가능했다’로 언급된 요인"
          items={factors.facilitators}
          max={maxF}
        />
        <Col
          tone="bar"
          title="장벽요인 — 가로막은 것"
          desc="주로 활동 초기에 나타나 이후 극복됨"
          items={factors.barriers}
          max={maxB}
        />
      </div>
      <p className={styles.method}>분석 방법: {factors.method}</p>
    </div>
  );
}

import styles from "./NetworkMetrics.module.css";
import type { Report } from "@/lib/report";

export default function NetworkMetrics({
  m,
}: {
  m: Report["networkMetrics"];
}) {
  const items = [
    { v: m.nodes, l: "노드(단어)" },
    { v: m.edges, l: "연결(엣지)" },
    { v: m.density, l: "밀도", hint: "0~1" },
    { v: m.avgDegree, l: "평균 연결정도" },
    { v: m.modularity, l: "모듈성", hint: ">0.3 뚜렷" },
    { v: m.transitivity, l: "군집계수" },
  ];
  return (
    <div className={styles.wrap}>
      {items.map((it) => (
        <div key={it.l} className={styles.item}>
          <span className={styles.v}>{it.v}</span>
          <span className={styles.l}>
            {it.l}
            {it.hint && <em>{it.hint}</em>}
          </span>
        </div>
      ))}
    </div>
  );
}

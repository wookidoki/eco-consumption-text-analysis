import styles from "./BehaviorDirection.module.css";
import type { Report } from "@/lib/report";

export default function BehaviorDirection({
  direction,
}: {
  direction: Report["direction"];
}) {
  const down = direction.behaviors.filter((b) => b.arrow === "↓");
  const up = direction.behaviors.filter((b) => b.arrow === "↑");

  const Group = ({
    title,
    desc,
    items,
    tone,
  }: {
    title: string;
    desc: string;
    items: Report["direction"]["behaviors"];
    tone: "down" | "up";
  }) => (
    <div className={`${styles.group} ${styles[tone]}`}>
      <div className={styles.groupHead}>
        <span className={styles.arrow}>{tone === "down" ? "↓" : "↑"}</span>
        <div>
          <h3 className={styles.groupTitle}>{title}</h3>
          <p className={styles.groupDesc}>{desc}</p>
        </div>
      </div>
      <ul className={styles.list}>
        {items.map((b) => (
          <li key={b.word} className={styles.item}>
            <div className={styles.itemHead}>
              <span className={styles.word}>{b.word}</span>
              <span className={styles.dir}>{b.direction}</span>
              <span className={styles.count}>근거 {b.total}문장</span>
            </div>
            {b.examples[0] && (
              <p className={styles.ex}>
                <span className={styles.exTag}>
                  {b.examples[0].r}_{b.examples[0].q}
                </span>
                “{b.examples[0].text}”
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
        예를 들어 ‘배달’이 중요어로 나와도, <b>그것이 늘었는지 줄었는지는 문장을 봐야</b> 알 수
        있습니다. 아래는 응답을 정독해 각 행동의 <b>변화 방향을 코딩</b>하고 근거 문장을 제시한
        결과입니다.
      </p>
      <div className={styles.cols}>
        <Group
          tone="down"
          title="줄이거나 회피한 행동"
          desc="활동 이후 사용을 줄이거나 받지 않게 된 것"
          items={down}
        />
        <Group
          tone="up"
          title="새로 채택·강화한 행동"
          desc="활동 이후 사용을 시작·확대하거나 강화한 것"
          items={up}
        />
      </div>
      <p className={styles.method}>분석 방법: {direction.method}</p>
    </div>
  );
}

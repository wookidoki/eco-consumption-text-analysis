import styles from "./Ca.module.css";
import Figure from "./Figure";
import type { Report } from "@/lib/report";

export default function Ca({ ca }: { ca: Report["ca"] }) {
  const cum2 = ((ca.explained[0] + ca.explained[1]) * 100).toFixed(1);

  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>
        그림에서 <b>질문(원)에 가까운 단어일수록 그 질문을 특징</b>짓습니다. 두 축은 단어
        사용 패턴의 차이를 요약한 것으로, <b>멀리 떨어진 질문일수록 어휘 구성이 다릅니다.</b>
      </p>

      <div className={styles.row}>
        <Figure
          src={ca.chart}
          alt="대응분석 biplot"
          caption="네 개의 질문(원)과 상위 단어(회색)의 2차원 포지셔닝"
        />
        <div className={styles.side}>
          <div className={styles.inertia}>
            <h4 className={styles.h}>차원 설명력(관성)</h4>
            {ca.explained.map((v, i) => (
              <div key={i} className={styles.bar}>
                <span className={styles.dim}>차원 {i + 1}</span>
                <span className={styles.track}>
                  <span
                    className={styles.fill}
                    style={{ width: `${v * 100}%` }}
                  />
                </span>
                <span className={styles.pct}>{(v * 100).toFixed(1)}%</span>
              </div>
            ))}
            <p className={styles.cum}>
              앞 2개 차원이 전체의 <b>{cum2}%</b>를 설명 (2차원 요약 타당)
            </p>
          </div>
          <p className={styles.read}>
            가로축(차원 1) 오른쪽 끝에 <b>Q3(가정 변화)</b>가 홀로 위치 → 다른 질문과
            어휘 구성이 가장 이질적임을 의미합니다. 나머지 Q1·Q2·Q4는 ‘활동·실천’ 어휘를
            공유해 왼쪽에 모여 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

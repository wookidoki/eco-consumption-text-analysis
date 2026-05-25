import styles from "./Eda.module.css";
import Figure from "./Figure";
import Table from "./Table";
import type { Report } from "@/lib/report";

export default function Eda({ eda }: { eda: Report["eda"] }) {
  const k = eda.kruskal;
  const sigOk = k.pvalue < 0.05;

  const descRows = eda.descByQuestion.map((d) => ({
    q: `${d.question}`,
    n: d.n,
    mean: d.mean,
    std: d.std,
    min: d.min,
    q1: d.q1,
    median: d.median,
    q3: d.q3,
    max: d.max,
    cv: `${d.cv}%`,
  }));

  const lexRows = eda.lexical.map((l) => ({
    q: l.question,
    tokens: l.tokens,
    types: l.types,
    ttr: l.ttr.toFixed(3),
    hapax: `${(l.hapaxRatio * 100).toFixed(1)}%`,
  }));

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <Figure
          src={eda.charts.boxplot}
          alt="질문별 응답 길이 boxplot"
          caption="상자=사분위(IQR), 가운데 선=중앙값, 점=개별 응답 20건"
        />
        <Table
          caption="응답 글자수(공백 제외) 기술통계. CV(변동계수)=표준편차/평균, 클수록 응답자 간 편차 큼."
          columns={[
            { key: "q", label: "질문", strong: true },
            { key: "n", label: "n", align: "right" },
            { key: "mean", label: "평균", align: "right" },
            { key: "std", label: "표준편차", align: "right" },
            { key: "min", label: "최소", align: "right" },
            { key: "q1", label: "Q1", align: "right" },
            { key: "median", label: "중앙값", align: "right" },
            { key: "q3", label: "Q3", align: "right" },
            { key: "max", label: "최대", align: "right" },
            { key: "cv", label: "CV", align: "right" },
          ]}
          rows={descRows}
        />
      </div>

      <div className={`${styles.test} ${sigOk ? styles.sig : styles.nsig}`}>
        <span className={styles.testTag}>Kruskal–Wallis 검정</span>
        <span className={styles.testBody}>
          질문 간 응답 길이 차이: <b>H({k.df}) = {k.statistic}</b>, p ={" "}
          <b>{k.pvalue}</b>, η² = {k.eta2} → <b>{k.sig}</b>
        </span>
        <span className={styles.testNote}>
          비모수 검정(소표본·비정규에 적합). η²는 효과크기.
        </span>
      </div>

      <div className={styles.row}>
        <Figure
          src={eda.charts.ttr}
          alt="질문별 어휘 다양성 TTR"
          caption="TTR=고유단어/전체토큰. ※ TTR은 글이 짧을수록 높아지는 경향(길이 교란)이 있어, 위 응답길이와 함께 해석해야 합니다 — 가장 짧은 Q4의 TTR이 높은 것은 이 영향."
        />
        <Table
          caption="Hapax 비율 = 단 한 번만 등장한 단어의 비율(높을수록 응답이 제각각)."
          columns={[
            { key: "q", label: "질문", strong: true },
            { key: "tokens", label: "전체 토큰", align: "right" },
            { key: "types", label: "고유 단어", align: "right" },
            { key: "ttr", label: "TTR", align: "right" },
            { key: "hapax", label: "Hapax비율", align: "right" },
          ]}
          rows={lexRows}
        />
      </div>
    </div>
  );
}

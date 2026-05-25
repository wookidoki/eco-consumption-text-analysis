"use client";

import { useState } from "react";
import styles from "./SentenceLevel.module.css";
import type { Report } from "@/lib/report";

function highlight(text: string, kw: string) {
  const parts = text.split(kw);
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 && <mark className={styles.mark}>{kw}</mark>}
    </span>
  ));
}

function impClass(v: number, styles: Record<string, string>) {
  if (v >= 70) return styles.hi;
  if (v >= 45) return styles.mid;
  return styles.lo;
}

export default function SentenceLevel({
  sentences,
}: {
  sentences: Report["sentences"];
}) {
  const kws = sentences.keywords;
  const [sel, setSel] = useState<string>(
    kws.find((k) => k.word === "배달")?.word || kws[0]?.word || ""
  );

  const list = sentences.byKeyword[sel] || [];
  const meta = kws.find((k) => k.word === sel);

  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>
        키워드가 <b>실제로 어떤 문장에서</b> 쓰였는지, 그 문장이 전체 응답에서 얼마나{" "}
        <b>대표적·중심적인지(중요도)</b>를 함께 봅니다. 중요도는 SBERT 문장 임베딩 기반{" "}
        <b>TextRank 중심성</b>(0~100)으로, 다른 문장들과 의미적으로 많이 연결될수록 높습니다.
      </p>

      <div className={styles.kwbar}>
        {kws.map((k) => (
          <button
            key={k.word}
            className={`${styles.kw} ${sel === k.word ? styles.kwOn : ""}`}
            onClick={() => setSel(k.word)}
          >
            {k.word}
            <span className={styles.kwCount}>{k.count}</span>
          </button>
        ))}
      </div>

      {meta && (
        <div className={styles.summary}>
          <b>‘{sel}’</b> — {meta.count}개 문장에서 등장 · 평균 중요도{" "}
          <b>{meta.meanImportance}</b>
          <span className={styles.summaryNote}>(아래는 중요도 상위 문장)</span>
        </div>
      )}

      <ul className={styles.list}>
        {list.map((s, i) => (
          <li key={i} className={styles.item}>
            <div className={styles.impCol}>
              <span className={`${styles.impVal} ${impClass(s.importance, styles)}`}>
                {s.importance}
              </span>
              <span className={styles.impTrack}>
                <span
                  className={`${styles.impFill} ${impClass(s.importance, styles)}`}
                  style={{ height: `${s.importance}%` }}
                />
              </span>
            </div>
            <div className={styles.textCol}>
              <span className={styles.tag}>
                {s.respondent}_{s.question}
              </span>
              <p className={styles.sentence}>{highlight(s.text, sel)}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className={styles.note}>
        ※ 중요도가 ‘좋은 의견’이라는 뜻은 아닙니다 — 전체에서 <b>전형적·대표적</b>인 문장일수록
        높게 나옵니다(요약 문장이 상위에 오는 이유). 특정 주제만의 구체적 문장은 낮을 수 있습니다.
      </p>
    </div>
  );
}

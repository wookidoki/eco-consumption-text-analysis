"use client";

import { useState } from "react";
import styles from "./Keywords.module.css";
import type { Report, QuestionMap } from "@/lib/report";
import { QUESTION_KEYS } from "@/lib/report";

export default function Keywords({
  keywords,
  questions,
}: {
  keywords: Report["keywords"];
  questions: QuestionMap;
}) {
  const [tab, setTab] = useState<string>("all");

  const tabs = [
    { key: "all", label: "전체" },
    ...QUESTION_KEYS.map((q) => ({ key: q, label: q })),
  ];

  const list =
    tab === "all" ? keywords.overall.slice(0, 24) : keywords.byQuestion[tab];
  const max = Math.max(...list.map((k) => k.count));

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.active : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "all" && (
        <p className={styles.qcaption}>
          <b>{tab}.</b> {questions[tab]}
        </p>
      )}

      <div className={styles.grid}>
        {list.map((k, i) => (
          <div key={k.word} className={styles.item}>
            <span className={styles.rank}>{i + 1}</span>
            <span className={styles.word}>{k.word}</span>
            <span className={styles.track}>
              <span
                className={styles.fill}
                style={{ width: `${(k.count / max) * 100}%` }}
              />
            </span>
            <span className={styles.count}>{k.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

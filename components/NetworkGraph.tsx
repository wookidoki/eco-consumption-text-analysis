"use client";

import { useMemo, useState } from "react";
import styles from "./NetworkGraph.module.css";
import type { Report } from "@/lib/report";

const W = 1000;
const H = 680;
const PAD = 70;
const COMM_COLORS = [
  "var(--c0)",
  "var(--c1)",
  "var(--c2)",
  "var(--c3)",
  "var(--c4)",
];

export default function NetworkGraph({
  network,
}: {
  network: Report["network"];
}) {
  const [hover, setHover] = useState<string | null>(null);

  const { nodes, edges } = network;

  const pos = useMemo(() => {
    const m: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      m[n.id] = {
        x: PAD + n.x * (W - PAD * 2),
        y: PAD + n.y * (H - PAD * 2),
      };
    });
    return m;
  }, [nodes]);

  const maxDeg = Math.max(...nodes.map((n) => n.degree));
  const maxW = Math.max(...edges.map((e) => e.weight));

  const neighbors = useMemo(() => {
    if (!hover) return null;
    const set = new Set<string>([hover]);
    edges.forEach((e) => {
      if (e.source === hover) set.add(e.target);
      if (e.target === hover) set.add(e.source);
    });
    return set;
  }, [hover, edges]);

  const radius = (deg: number) => 9 + (deg / maxDeg) * 30;
  const fontSize = (deg: number) => 11 + (deg / maxDeg) * 15;

  return (
    <div className={styles.wrap}>
      <div className={styles.canvas}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          role="img"
          aria-label="단어 의미연결망"
        >
          <g>
            {edges.map((e, i) => {
              const a = pos[e.source];
              const b = pos[e.target];
              if (!a || !b) return null;
              const active =
                !neighbors ||
                (neighbors.has(e.source) && neighbors.has(e.target));
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#1f8a55"
                  strokeWidth={0.6 + (e.weight / maxW) * 3}
                  strokeOpacity={active ? 0.28 : 0.04}
                />
              );
            })}
          </g>
          <g>
            {nodes.map((n) => {
              const p = pos[n.id];
              const dim = neighbors && !neighbors.has(n.id);
              const r = radius(n.degree);
              return (
                <g
                  key={n.id}
                  transform={`translate(${p.x},${p.y})`}
                  className={styles.node}
                  opacity={dim ? 0.18 : 1}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle
                    r={r}
                    fill={COMM_COLORS[n.community % COMM_COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  <text
                    y={r + fontSize(n.degree) - 2}
                    textAnchor="middle"
                    fontSize={fontSize(n.degree)}
                    className={styles.label}
                  >
                    {n.id}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ width: 10, height: 10 }} />
          <span className={styles.legendDot} style={{ width: 16, height: 16 }} />
          <span className={styles.legendDot} style={{ width: 22, height: 22 }} />
          <span>원 크기 = 연결중심성 (클수록 핵심어)</span>
        </div>
        <div className={styles.legendItem}>
          <span>색 = 주제 군집 {network.communityCount}개</span>
        </div>
        <div className={styles.legendHint}>단어에 마우스를 올리면 직접 연결된 단어가 강조됩니다.</div>
      </div>
    </div>
  );
}

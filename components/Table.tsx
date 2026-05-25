import styles from "./Table.module.css";

export interface Column {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  strong?: boolean;
}

export default function Table({
  columns,
  rows,
  caption,
}: {
  columns: Column[];
  rows: Record<string, string | number>[];
  caption?: string;
}) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: c.align || "left" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{ textAlign: c.align || "left" }}
                  className={c.strong ? styles.strong : undefined}
                >
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
}

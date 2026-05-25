import styles from "./Section.module.css";

export default function Section({
  id,
  index,
  title,
  subtitle,
  tag,
  tone,
  children,
}: {
  id?: string;
  index: number | string;
  title: string;
  subtitle?: string;
  tag?: string;
  tone?: "appendix";
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`${styles.section} ${tone === "appendix" ? styles.appendix : ""}`}
    >
      <header className={styles.head}>
        <span className={`${styles.badge} ${tone === "appendix" ? styles.badgeMuted : ""}`}>
          {index}
        </span>
        <div>
          <h2 className={styles.title}>
            {title}
            {tag && <span className={styles.tag}>{tag}</span>}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

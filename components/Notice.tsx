import styles from "./Notice.module.css";

export default function Notice() {
  return (
    <aside className={styles.notice}>
      <span className={styles.tag}>분석 성격 · 한계</span>
      <p className={styles.body}>
        본 분석은 서울중구가족센터 <b>종사자 20명</b>의 자발적 활동 후기(긍정 회고)에 대한{" "}
        <b>탐색적·기술적 텍스트 분석</b>입니다. 대조군·기저선이 없는 소표본 자기보고 자료이므로,
        결과는 <b>‘참여 종사자들의 경향’</b>으로 해석해야 하며 일반 소비자로의 일반화나
        프로그램 효과의 인과 추론에는 사용할 수 없습니다.
      </p>
    </aside>
  );
}

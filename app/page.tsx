import styles from "./page.module.css";
import { report } from "@/lib/report";
import Hero from "@/components/Hero";
import Adequacy from "@/components/Adequacy";
import CentralWords from "@/components/CentralWords";
import NetworkGraph from "@/components/NetworkGraph";
import Keywords from "@/components/Keywords";
import Tfidf from "@/components/Tfidf";
import Themes from "@/components/Themes";
import Section from "@/components/Section";

export default function Home() {
  const { meta, adequacy, keywords, tfidf, network, networkLatent, themes } =
    report;

  return (
    <main className={styles.main}>
      <Hero meta={meta} adequacy={adequacy} />

      <div className={styles.container}>
        <Section
          index={1}
          title="데이터 분량 적정성 진단"
          subtitle="“글이 너무 작지는 않은지” — 응답 분량이 분석에 충분한지 점검합니다."
        >
          <Adequacy adequacy={adequacy} />
        </Section>

        <Section
          index={2}
          title="주요 중심언어 도출"
          subtitle="단어 동시출현 의미연결망에서 연결중심성이 높은 핵심어를 도출합니다."
        >
          <CentralWords central={network.centralWords} />
          <NetworkGraph network={network} networkLatent={networkLatent} />
        </Section>

        <Section
          index={3}
          title="실천 확산 3단계 (주제 군집)"
          subtitle="의미연결망 군집을 해석해 도출한 핵심 주제와 그 연결 흐름입니다."
        >
          <Themes themes={themes} />
        </Section>

        <Section
          index={4}
          title="핵심 키워드 빈도"
          subtitle="전체 응답과 질문별로 가장 자주 언급된 단어입니다."
        >
          <Keywords keywords={keywords} questions={meta.questions} />
        </Section>

        <Section
          index={5}
          title="질문별 변별 키워드 (TF-IDF)"
          subtitle="각 질문에서 상대적으로 두드러지게 나타나는 특징 단어입니다."
        >
          <Tfidf tfidf={tfidf} questions={meta.questions} />
        </Section>

        <footer className={styles.footer}>
          <p className={styles.method}>{meta.method}</p>
          <p className={styles.gen}>
            분석 생성 {new Date(meta.generatedAt).toLocaleString("ko-KR")} ·
            원자료 {meta.source}
          </p>
        </footer>
      </div>
    </main>
  );
}

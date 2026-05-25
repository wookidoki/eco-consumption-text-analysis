import styles from "./page.module.css";
import { report } from "@/lib/report";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import Preprocessing from "@/components/Preprocessing";
import Eda from "@/components/Eda";
import Adequacy from "@/components/Adequacy";
import Keywords from "@/components/Keywords";
import Keyness from "@/components/Keyness";
import Tfidf from "@/components/Tfidf";
import CentralWords from "@/components/CentralWords";
import NetworkGraph from "@/components/NetworkGraph";
import NetworkMetrics from "@/components/NetworkMetrics";
import Themes from "@/components/Themes";
import Ca from "@/components/Ca";
import Clustering from "@/components/Clustering";
import Features from "@/components/Features";
import Methodology from "@/components/Methodology";

export default function Home() {
  const r = report;

  return (
    <main className={styles.main}>
      <Hero meta={r.meta} adequacy={r.adequacy} />

      <div className={styles.container}>
        <Section
          index={1}
          title="데이터 & 전처리"
          subtitle="어떤 데이터를 어떻게 정제했는지 — 원자료 예시, 형태소 분석, 불용어 처리."
        >
          <Preprocessing pre={r.preprocessing} />
        </Section>

        <Section
          index={2}
          title="탐색적 데이터 분석 (EDA)"
          subtitle="응답 길이 분포·어휘 다양성·질문 간 차이 검정으로 데이터의 형태를 파악합니다."
        >
          <Eda eda={r.eda} />
        </Section>

        <Section
          index={3}
          title="데이터 분량 적정성 진단"
          subtitle="“글이 너무 작지는 않은지” — 분석에 충분한 분량인지 판정합니다."
        >
          <Adequacy adequacy={r.adequacy} />
        </Section>

        <Section
          index={4}
          title="핵심 키워드 빈도"
          subtitle="전체 응답과 질문별로 가장 자주 언급된 단어입니다."
        >
          <Keywords keywords={r.keywords} questions={r.meta.questions} />
        </Section>

        <Section
          index={5}
          title="질문별 변별어 (Keyness · TF-IDF)"
          subtitle="단순 빈도를 넘어, 각 질문에서 통계적으로 두드러진 단어를 도출합니다."
        >
          <Keyness keyness={r.keyness} questions={r.meta.questions} />
          <Tfidf tfidf={r.tfidf} questions={r.meta.questions} />
        </Section>

        <Section
          index={6}
          title="주요 중심언어 & 의미연결망"
          subtitle="단어 동시출현 망에서 연결중심성이 높은 핵심어를 도출합니다."
        >
          <NetworkMetrics m={r.networkMetrics} />
          <CentralWords central={r.network.centralWords} />
          <NetworkGraph network={r.network} networkLatent={r.networkLatent} />
        </Section>

        <Section
          index={7}
          title="실천 확산 3단계 (주제 군집)"
          subtitle="의미연결망 군집을 해석해 도출한 핵심 주제와 그 연결 흐름입니다."
        >
          <Themes themes={r.themes} />
        </Section>

        <Section
          index={8}
          title="대응분석 (Correspondence Analysis)"
          subtitle="질문과 단어를 2차원 평면에 배치해 질문별 어휘 구조를 시각화합니다."
        >
          <Ca ca={r.ca} />
        </Section>

        <Section
          index={9}
          title="응답 의미 군집 (SBERT 임베딩)"
          subtitle="딥러닝 문장 임베딩으로 응답을 의미 기준으로 묶고 유사도를 분석합니다."
        >
          <Clustering emb={r.embedding} />
        </Section>

        <Section
          index={10}
          title="파생변수 상관 · 회귀 · 매개분석"
          subtitle="응답자별 수치 변수를 만들어 다변량 통계를 시연합니다 (탐색적, n=20)."
        >
          <Features features={r.features} />
        </Section>

        <Section
          index={11}
          title="분석 방법론 & 수치 해석 가이드"
          subtitle="각 분석이 무엇이며 화면의 수치를 어떻게 읽는지 정리했습니다."
        >
          <Methodology />
        </Section>

        <footer className={styles.footer}>
          <p className={styles.method}>{r.meta.method}</p>
          <p className={styles.gen}>
            분석 생성 {new Date(r.meta.generatedAt).toLocaleString("ko-KR")} · 원자료{" "}
            {r.meta.source}
          </p>
        </footer>
      </div>
    </main>
  );
}

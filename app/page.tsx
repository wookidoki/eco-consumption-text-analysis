import styles from "./page.module.css";
import { report } from "@/lib/report";
import Hero from "@/components/Hero";
import KeyFindings from "@/components/KeyFindings";
import Toc from "@/components/Toc";
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
        <KeyFindings r={r} />
        <Toc />

        <Section
          id="sec-pre"
          index={1}
          title="데이터 & 전처리"
          subtitle="어떤 데이터를 어떻게 정제했는지 — 원자료 예시, 형태소 분석, 불용어 처리."
        >
          <Preprocessing pre={r.preprocessing} />
        </Section>

        <Section
          id="sec-eda"
          index={2}
          title="탐색적 데이터 분석 (EDA)"
          subtitle="응답 길이 분포·어휘 다양성·질문 간 차이 검정으로 데이터의 형태를 파악합니다."
        >
          <Eda eda={r.eda} />
        </Section>

        <Section
          id="sec-adequacy"
          index={3}
          title="데이터 분량 적정성 진단"
          subtitle="“글이 너무 작지는 않은지” — 분석에 충분한 분량인지 판정합니다."
        >
          <Adequacy adequacy={r.adequacy} />
        </Section>

        <Section
          id="sec-keywords"
          index={4}
          title="핵심 키워드 빈도"
          subtitle="전체 응답과 질문별로 가장 자주 언급된 단어입니다."
        >
          <Keywords keywords={r.keywords} questions={r.meta.questions} />
        </Section>

        <Section
          id="sec-keyness"
          index={5}
          title="질문별 변별어 (Keyness · TF-IDF)"
          subtitle="단순 빈도를 넘어, 각 질문에서 통계적으로 두드러진 단어를 도출합니다."
        >
          <Keyness keyness={r.keyness} questions={r.meta.questions} />
          <Tfidf tfidf={r.tfidf} questions={r.meta.questions} />
        </Section>

        <Section
          id="sec-network"
          index={6}
          title="주요 중심언어 & 의미연결망"
          subtitle="단어 동시출현 망에서 연결중심성이 높은 핵심어를 도출합니다."
        >
          <NetworkMetrics m={r.networkMetrics} />
          <CentralWords central={r.network.centralWords} />
          <NetworkGraph network={r.network} networkLatent={r.networkLatent} />
        </Section>

        <Section
          id="sec-themes"
          index={7}
          title="실천 확산 3단계 (주제 군집)"
          subtitle="의미연결망 군집을 해석해 도출한 핵심 주제와 그 연결 흐름입니다."
        >
          <Themes themes={r.themes} />
        </Section>

        <Section
          id="sec-ca"
          index={8}
          title="대응분석 (Correspondence Analysis)"
          subtitle="질문과 단어를 2차원 평면에 배치해 질문별 어휘 구조를 시각화합니다."
        >
          <Ca ca={r.ca} />
        </Section>

        <div className={styles.appendixDivider}>
          <h3>방법론 부록 · 참고용</h3>
          <p>
            아래는 다양한 분석 기법을 시연한 결과입니다. 응답자 20명(소표본)에서는 결정적
            발견으로 보기 어려워 본문과 분리했습니다 — 방법의 적용 가능성과 한계를 함께
            보여주는 참고 자료입니다.
          </p>
        </div>

        <Section
          id="sec-cluster"
          index="A"
          tag="참고용"
          tone="appendix"
          title="응답 의미 군집 (SBERT 임베딩)"
          subtitle="딥러닝 문장 임베딩으로 응답을 군집화 — 실루엣이 낮아(주제가 유사) 강한 군집 구조는 아님."
        >
          <Clustering emb={r.embedding} />
        </Section>

        <Section
          id="sec-features"
          index="B"
          tag="참고용"
          tone="appendix"
          title="파생변수 상관 · 회귀 · 매개분석"
          subtitle="응답자별 수치 변수로 다변량 통계를 시연 — n=20에선 비유의(방법 시연·한계 확인용)."
        >
          <Features features={r.features} />
        </Section>

        <Section
          id="sec-method"
          index="📖"
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

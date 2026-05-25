import reportData from "@/public/data/report.json";

export interface QuestionMap {
  [key: string]: string;
}

export interface Report {
  meta: {
    title: string;
    subtitle: string;
    generatedAt: string;
    source: string;
    questions: QuestionMap;
    method: string;
  };
  adequacy: {
    totalResponses: number;
    respondents: number;
    questions: number;
    totalCharsNoSpace: number;
    totalWords: number;
    totalSentences: number;
    meanCharsPerResponse: number;
    minCharsPerResponse: number;
    maxCharsPerResponse: number;
    byQuestion: {
      question: string;
      label: string;
      responses: number;
      meanChars: number;
      meanWords: number;
      meanSentences: number;
      totalChars: number;
    }[];
    perResponse: {
      respondent: string;
      question: string;
      chars: number;
      words: number;
      sentences: number;
    }[];
    verdictLevel: "ok" | "caution" | "low";
    verdict: string;
  };
  keywords: {
    overall: { word: string; count: number }[];
    byQuestion: { [key: string]: { word: string; count: number }[] };
  };
  tfidf: { [key: string]: { word: string; score: number }[] };
  network: NetworkData;
  networkLatent: NetworkData;
  themes: {
    label: string;
    stage: number;
    size: number;
    words: string[];
    lead: string;
  }[];
  eda: {
    descByQuestion: {
      question: string; label: string; n: number; mean: number; std: number;
      min: number; q1: number; median: number; q3: number; max: number; cv: number;
    }[];
    lexical: { question: string; tokens: number; types: number; ttr: number; hapaxRatio: number }[];
    kruskal: { statistic: number; pvalue: number; df: number; eta2: number; sig: string };
    overall: { responses: number; meanChars: number; medianChars: number; stdChars: number };
    charts: { boxplot: string; ttr: string };
  };
  keyness: {
    byQuestion: { [q: string]: { word: string; ll: number; freq: number; sig: string }[] };
    chart: string;
  };
  networkMetrics: {
    nodes: number; edges: number; density: number; avgDegree: number;
    modularity: number; transitivity: number; components: number;
  };
  ca: {
    explained: number[];
    questionCoords: { q: string; x: number; y: number }[];
    chart: string;
  };
  embedding: {
    method: string; k: number; silhouette: number;
    clusters: {
      id: number; size: number; topTerms: string[];
      exemplar: { respondent: string; question: string; snippet: string };
      questionMix: { [q: string]: number };
    }[];
    questionSim: number[][];
    charts: { scatter: string; questionSim: string; dendrogram: string };
  };
  features: {
    variables: string[];
    table: Record<string, number | string>[];
    corr: { labels: string[]; matrix: number[][] };
    regression: {
      formula: string; n: number; r2: number; adjR2: number; f_p: number;
      coefs: { name: string; coef: number; se: number; p: number }[];
    };
    mediation: {
      path: string; a: number; b: number; c_total: number; c_direct: number;
      indirect: number; sobelZ: number; sobelP: number;
    };
    chart: string;
    caveat: string;
  };
  preprocessing: {
    rawExample: { label: string; text: string };
    pipeline: string[];
    userDict: string[];
    meaningfulAdv: string[];
    stopwordCount: number;
    stopwordSample: string[];
    tokenExample: { surface: string; tag: string }[];
  };
}

export interface NetworkData {
  nodes: {
    id: string;
    freq: number;
    degree: number;
    betweenness: number;
    eigenvector: number;
    community: number;
    x: number;
    y: number;
  }[];
  edges: { source: string; target: string; weight: number; count: number }[];
  centralWords: {
    word: string;
    degree: number;
    betweenness: number;
    eigenvector: number;
    freq: number;
  }[];
  communityCount: number;
}

export const report = reportData as unknown as Report;

export const QUESTION_KEYS = ["Q1", "Q2", "Q3", "Q4"];

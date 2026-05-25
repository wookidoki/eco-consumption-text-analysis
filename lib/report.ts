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

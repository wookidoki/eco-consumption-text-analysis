# -*- coding: utf-8 -*-
"""
친환경소비행동 인터뷰 텍스트 분석
====================================
- 입력: data/eco_review_final_test0520.txt  (응답자 20명 A~T x 질문 4개 Q1~Q4)
- 처리: Kiwi 형태소 분석 -> 키워드 빈도 / TF-IDF / 의미연결망(중심성)
- 출력: ../public/data/report.json  (Next.js 대시보드가 읽는 단일 결과 파일)

교수님 요청 2가지를 그대로 반영:
  1) 주요 "중심언어" 도출  -> 의미연결망 연결중심성 상위어
  2) "글이 너무 작지 않은지" -> 분량 적정성 진단(adequacy)
"""

import re
import json
import math
import itertools
from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime, timezone, timedelta

from kiwipiepy import Kiwi
from sklearn.feature_extraction.text import TfidfVectorizer
import networkx as nx

# -----------------------------------------------------------------------------
# 경로
# -----------------------------------------------------------------------------
BASE = Path(__file__).resolve().parent
DATA = BASE / "data" / "eco_review_final_test0520.txt"
OUT_PUBLIC = BASE.parent / "public" / "data" / "report.json"
OUT_LOCAL = BASE / "output" / "report.json"

QUESTION_LABELS = {
    "Q1": "친환경소비행동 활동에 대한 전반적 느낀점",
    "Q2": "가장 기억에 남는 활동",
    "Q3": "활동 후 가정에서의 변화",
    "Q4": "나의 다짐",
}

# 도메인 복합어: 한 토큰으로 보존해 의미 보존 (Kiwi 사용자 사전)
USER_WORDS = [
    "친환경소비행동", "친환경소비", "친환경", "일회용품", "다회용기", "텀블러",
    "개인컵", "장바구니", "분리수거", "다문화축제", "사회복지사", "가족센터",
    "정책제안", "지역사회", "이면지", "포스트잇", "에너지", "재활용", "업사이클링",
]

# 불용어: 분석에 의미 없는 일반 명사/대명사/형식 명사
STOPWORDS = {
    "것", "수", "때", "등", "점", "분", "더", "안", "중", "내", "나", "저", "그",
    "이", "저희", "우리", "정말", "통해", "대한", "위해", "같이", "경우", "부분",
    "생각", "자신", "정도", "이번", "다음", "동안", "한해", "올해", "올", "년", "거",
    "좀", "또", "또한", "그리고", "하지만", "그러나", "이런", "저런", "그런", "어떤",
    "무엇", "누구", "어디", "모두", "모든", "여러", "다양", "조금", "많이", "정말로",
    "처음", "마지막", "지금", "오늘", "내일", "어제", "사실", "결국", "물론", "특히",
    "관련", "대해", "통한", "함", "줄", "데", "바", "측", "측면", "면", "쪽",
}

KST = timezone(timedelta(hours=9))


# -----------------------------------------------------------------------------
# 1) 원문 파싱
# -----------------------------------------------------------------------------
def parse_responses(raw: str):
    """'A_Q1 ...' / 'A_Q1: ...' 형태를 응답 단위로 분리."""
    matches = list(re.finditer(r"([A-Z]+)_(Q[0-9]+)\s*:?\s*", raw))
    rows = []
    for i, m in enumerate(matches):
        resp, q = m.group(1), m.group(2)
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(raw)
        text = raw[start:end].strip()
        rows.append({"respondent": resp, "question": q, "text": text})
    return rows


# -----------------------------------------------------------------------------
# 2) 형태소 분석 (명사 추출)
# -----------------------------------------------------------------------------
def build_kiwi():
    kiwi = Kiwi()
    for w in USER_WORDS:
        kiwi.add_user_word(w, "NNP", 5.0)
    return kiwi


def extract_nouns(kiwi, text):
    """의미 있는 명사(NNG/NNP) 추출. 1글자/불용어 제거."""
    nouns = []
    for tok in kiwi.tokenize(text):
        if tok.tag in ("NNG", "NNP"):
            form = tok.form
            if len(form) >= 2 and form not in STOPWORDS:
                nouns.append(form)
    return nouns


def count_sentences(kiwi, text):
    try:
        return len(kiwi.split_into_sents(text))
    except Exception:
        return len([s for s in re.split(r"[.!?。]\s", text) if s.strip()])


# -----------------------------------------------------------------------------
# 3) 분량 적정성 진단
# -----------------------------------------------------------------------------
def adequacy_report(kiwi, rows):
    def chars(s):
        return len(re.sub(r"\s", "", s))

    per_resp = []
    for r in rows:
        per_resp.append({
            "respondent": r["respondent"],
            "question": r["question"],
            "chars": chars(r["text"]),
            "words": len(r["text"].split()),
            "sentences": count_sentences(kiwi, r["text"]),
        })

    total_chars = sum(p["chars"] for p in per_resp)
    total_words = sum(p["words"] for p in per_resp)
    total_sents = sum(p["sentences"] for p in per_resp)
    char_list = [p["chars"] for p in per_resp]

    by_q = []
    for q, label in QUESTION_LABELS.items():
        sub = [p for p in per_resp if p["question"] == q]
        n = len(sub)
        by_q.append({
            "question": q,
            "label": label,
            "responses": n,
            "meanChars": round(sum(p["chars"] for p in sub) / n, 1),
            "meanWords": round(sum(p["words"] for p in sub) / n, 1),
            "meanSentences": round(sum(p["sentences"] for p in sub) / n, 1),
            "totalChars": sum(p["chars"] for p in sub),
        })

    n_resp = len(per_resp)
    mean_chars = total_chars / n_resp

    # 적정성 판정 기준(정성 인터뷰 탐색적 분석 기준)
    if total_words >= 5000 and mean_chars >= 150:
        level, verdict = "ok", (
            f"응답 {n_resp}건·총 {total_words:,}어절({total_chars:,}자) 규모로, "
            "키워드·의미연결망 등 탐색적(기술적) 텍스트 분석에 충분한 분량입니다. "
            "다만 응답자 20명은 통계적 일반화·추론용으로는 표본이 작으므로, "
            "결과는 '경향 파악' 수준으로 해석하는 것이 적절합니다."
        )
    elif total_words >= 2000:
        level, verdict = "caution", (
            f"응답 {n_resp}건·총 {total_words:,}어절 규모로 핵심 키워드 도출은 가능하나, "
            "분량이 넉넉하지는 않아 세부 주제 분석은 보수적으로 해석해야 합니다."
        )
    else:
        level, verdict = "low", (
            f"총 {total_words:,}어절로 분량이 적어, 빈도 상위어 위주의 제한적 해석을 권장합니다."
        )

    return {
        "totalResponses": n_resp,
        "respondents": len(set(p["respondent"] for p in per_resp)),
        "questions": len(QUESTION_LABELS),
        "totalCharsNoSpace": total_chars,
        "totalWords": total_words,
        "totalSentences": total_sents,
        "meanCharsPerResponse": round(mean_chars, 1),
        "minCharsPerResponse": min(char_list),
        "maxCharsPerResponse": max(char_list),
        "byQuestion": by_q,
        "perResponse": per_resp,
        "verdictLevel": level,
        "verdict": verdict,
    }


# -----------------------------------------------------------------------------
# 4) 키워드 빈도 (전체 / 질문별)
# -----------------------------------------------------------------------------
def keyword_report(tokens_by_row, rows, top_n=50):
    overall = Counter()
    by_q = defaultdict(Counter)
    for r, toks in zip(rows, tokens_by_row):
        overall.update(toks)
        by_q[r["question"]].update(toks)

    def topn(counter, n):
        return [{"word": w, "count": c} for w, c in counter.most_common(n)]

    return {
        "overall": topn(overall, top_n),
        "byQuestion": {q: topn(by_q[q], 25) for q in QUESTION_LABELS},
    }


# -----------------------------------------------------------------------------
# 5) TF-IDF (질문별 변별 키워드) - 4개 질문을 문서로
# -----------------------------------------------------------------------------
def tfidf_report(tokens_by_row, rows, top_n=15):
    docs = {q: [] for q in QUESTION_LABELS}
    for r, toks in zip(rows, tokens_by_row):
        docs[r["question"]].extend(toks)

    corpus_keys = list(docs.keys())
    corpus = [" ".join(docs[q]) for q in corpus_keys]

    vec = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b")
    mat = vec.fit_transform(corpus)
    vocab = vec.get_feature_names_out()

    result = {}
    for i, q in enumerate(corpus_keys):
        row = mat[i].toarray()[0]
        ranked = sorted(zip(vocab, row), key=lambda x: x[1], reverse=True)
        result[q] = [
            {"word": w, "score": round(float(s), 4)}
            for w, s in ranked[:top_n] if s > 0
        ]
    return result


# -----------------------------------------------------------------------------
# 6) 의미연결망 + 중심성 (중심언어 도출)
# -----------------------------------------------------------------------------
def network_report(tokens_by_row, top_nodes=40, cos_threshold=0.4, top_central=15):
    """의미연결망: 응답 단위 동시출현을 Ochiai(코사인) 연관강도로 정규화해
    '둘 다 흔해서 같이 나오는' 약한 연결을 걸러낸 뒤 중심성을 계산한다."""
    freq = Counter()
    doc_sets = []
    for toks in tokens_by_row:
        s = set(toks)
        doc_sets.append(s)
        freq.update(toks)

    # 응답(문서) 출현 빈도
    df = Counter()
    for s in doc_sets:
        for w in s:
            df[w] += 1

    # 빈도 상위 단어만 노드로
    node_words = [w for w, _ in freq.most_common(top_nodes)]
    node_set = set(node_words)

    # 동시출현(응답 단위)
    cooc = Counter()
    for s in doc_sets:
        present = sorted(w for w in s if w in node_set)
        for a, b in itertools.combinations(present, 2):
            cooc[(a, b)] += 1

    G = nx.Graph()
    for w in node_words:
        G.add_node(w, freq=freq[w])
    for (a, b), cnt in cooc.items():
        cos = cnt / math.sqrt(df[a] * df[b])  # Ochiai 계수
        if cos >= cos_threshold:
            G.add_edge(a, b, weight=round(cos, 3), count=cnt)

    # 고립 노드 제거
    G.remove_nodes_from([n for n in list(G.nodes()) if G.degree(n) == 0])

    if G.number_of_nodes() == 0:
        return {"nodes": [], "edges": [], "centralWords": []}

    deg_cent = nx.degree_centrality(G)
    btw_cent = nx.betweenness_centrality(G, weight="weight")
    try:
        eig_cent = nx.eigenvector_centrality(G, weight="weight", max_iter=1000)
    except Exception:
        eig_cent = {n: 0.0 for n in G.nodes()}

    # 커뮤니티(주제 군집)
    try:
        from networkx.algorithms.community import greedy_modularity_communities
        comms = list(greedy_modularity_communities(G, weight="weight"))
        comm_of = {}
        for idx, c in enumerate(comms):
            for n in c:
                comm_of[n] = idx
    except Exception:
        comm_of = {n: 0 for n in G.nodes()}

    # 레이아웃 좌표 사전 계산(결정적): 0~1 정규화 후 뷰포트에서 스케일
    pos = nx.spring_layout(G, weight="weight", seed=42, k=0.9, iterations=200)
    xs = [p[0] for p in pos.values()]
    ys = [p[1] for p in pos.values()]
    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)

    def norm(v, lo, hi):
        return (v - lo) / (hi - lo) if hi > lo else 0.5

    nodes = [{
        "id": n,
        "freq": int(freq[n]),
        "degree": round(deg_cent[n], 4),
        "betweenness": round(btw_cent[n], 4),
        "eigenvector": round(eig_cent.get(n, 0.0), 4),
        "community": comm_of.get(n, 0),
        "x": round(norm(pos[n][0], minx, maxx), 4),
        "y": round(norm(pos[n][1], miny, maxy), 4),
    } for n in G.nodes()]

    edges = [{"source": a, "target": b,
              "weight": float(d["weight"]), "count": int(d["count"])}
             for a, b, d in G.edges(data=True)]

    central = sorted(nodes, key=lambda x: x["degree"], reverse=True)[:top_central]
    central_words = [{
        "word": c["id"], "degree": c["degree"],
        "betweenness": c["betweenness"], "eigenvector": c["eigenvector"],
        "freq": c["freq"],
    } for c in central]

    return {
        "nodes": nodes,
        "edges": edges,
        "centralWords": central_words,
        "communityCount": len(set(comm_of.values())),
    }


# -----------------------------------------------------------------------------
# main
# -----------------------------------------------------------------------------
def main():
    raw = DATA.read_text(encoding="utf-8")
    rows = parse_responses(raw)
    print(f"[파싱] 응답 {len(rows)}건")

    kiwi = build_kiwi()
    tokens_by_row = [extract_nouns(kiwi, r["text"]) for r in rows]
    total_tokens = sum(len(t) for t in tokens_by_row)
    print(f"[형태소] 추출 명사 토큰 {total_tokens:,}개")

    report = {
        "meta": {
            "title": "친환경소비행동 인터뷰 텍스트 분석",
            "subtitle": "서울중구가족센터 · 응답자 20명 × 질문 4개",
            "generatedAt": datetime.now(KST).isoformat(),
            "source": "eco_review_final_test0520.txt",
            "questions": QUESTION_LABELS,
            "method": "Kiwi 형태소분석 → 키워드 빈도 / TF-IDF / 의미연결망 중심성",
        },
        "adequacy": adequacy_report(kiwi, rows),
        "keywords": keyword_report(tokens_by_row, rows),
        "tfidf": tfidf_report(tokens_by_row, rows),
        "network": network_report(tokens_by_row),
    }

    OUT_PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    OUT_LOCAL.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(report, ensure_ascii=False, indent=2)
    OUT_PUBLIC.write_text(payload, encoding="utf-8")
    OUT_LOCAL.write_text(payload, encoding="utf-8")

    print(f"[완료] 중심언어 Top5: "
          + ", ".join(c["word"] for c in report["network"]["centralWords"][:5]))
    print(f"[저장] {OUT_PUBLIC}")


if __name__ == "__main__":
    main()

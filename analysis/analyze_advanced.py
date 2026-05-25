# -*- coding: utf-8 -*-
"""
친환경소비행동 인터뷰 — 고급 통계/데이터분석 레이어
=====================================================
analyze.py 가 만든 public/data/report.json 에 다음을 추가하고
공통 차트(PNG)를 public/charts/ 에 생성한다.

  - EDA: 기술통계(boxplot/표) · 어휘다양성(TTR) · Kruskal-Wallis 검정
  - Keyness(로그우도): 질문별 통계적으로 과대표집된 변별어
  - 네트워크 지표: 밀도·평균연결정도·모듈성·군집계수
  - 대응분석(CA): 질문×단어 2차원 포지셔닝 biplot
  - SBERT 임베딩: 응답 의미 군집(KMeans+실루엣)·유사도 히트맵·덴드로그램
  - 응답자 파생변수: 상관행렬 · (탐색적)다중회귀 · (탐색적)매개분석
"""
import json
import math
import warnings
from pathlib import Path
from collections import Counter, defaultdict

import numpy as np
import pandas as pd
from scipy import stats
from scipy.cluster.hierarchy import linkage, dendrogram
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import statsmodels.api as sm
import networkx as nx

import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import seaborn as sns

from analyze import (
    parse_responses, build_kiwi, extract_terms,
    QUESTION_LABELS, DATA, TOPIC_WORDS, STOPWORDS, MEANINGFUL_ADV,
)

warnings.filterwarnings("ignore")

# 한글 폰트: TTF를 명시적으로 등록한 뒤 내부 폰트명으로 지정 (Windows tofu 방지)
_KFONT = "DejaVu Sans"
for _fp in (r"C:\Windows\Fonts\malgun.ttf", r"C:\Windows\Fonts\NanumGothic.ttf"):
    if os.path.exists(_fp):
        fm.fontManager.addfont(_fp)
        _KFONT = fm.FontProperties(fname=_fp).get_name()
        break
sns.set_style("whitegrid")           # 스타일 먼저 적용
plt.rcParams["font.family"] = _KFONT  # 폰트는 이후에 확정(덮어쓰기 방지)
plt.rcParams["axes.unicode_minus"] = False
print(f"[폰트] {_KFONT}")
GREEN = "#1f8a55"
PALETTE = ["#1f8a55", "#2f6fb0", "#d98324", "#9b5bb5", "#c2476a", "#3aa6a0"]

BASE = Path(__file__).resolve().parent
REPORT = BASE.parent / "public" / "data" / "report.json"
CHARTS = BASE.parent / "public" / "charts"
CHARTS.mkdir(parents=True, exist_ok=True)
QKEYS = list(QUESTION_LABELS.keys())

POS_LEX = ["좋", "감사", "보람", "행복", "만족", "기쁨", "뿌듯", "성장", "소중", "즐겁", "긍정"]
NEG_LEX = ["어렵", "힘들", "불편", "부족", "아쉽", "걱정", "귀찮", "부담"]


def save(fig, name):
    path = CHARTS / name
    fig.savefig(path, dpi=130, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return f"/charts/{name}"


# =============================================================================
# 1. EDA — 기술통계 / 어휘다양성 / 비모수 검정
# =============================================================================
def run_eda(rows, tokens_by_row, kiwi):
    df = pd.DataFrame([{
        "respondent": r["respondent"], "question": r["question"],
        "chars": len("".join(r["text"].split())),
        "words": len(r["text"].split()),
        "sents": len(kiwi.split_into_sents(r["text"])),
        "tokens": len(t),
    } for r, t in zip(rows, tokens_by_row)])

    desc = []
    for q in QKEYS:
        s = df[df.question == q]["chars"]
        desc.append({
            "question": q, "label": QUESTION_LABELS[q], "n": int(s.count()),
            "mean": round(s.mean(), 1), "std": round(s.std(), 1),
            "min": int(s.min()), "q1": round(s.quantile(.25), 1),
            "median": round(s.median(), 1), "q3": round(s.quantile(.75), 1),
            "max": int(s.max()), "cv": round(s.std() / s.mean() * 100, 1),
        })

    # 어휘 다양성 (Type-Token Ratio, Hapax 비율) — 질문별 토큰 풀
    lexical = []
    for q in QKEYS:
        toks = [w for r, t in zip(rows, tokens_by_row) if r["question"] == q for w in t]
        c = Counter(toks)
        types = len(c)
        total = len(toks)
        hapax = sum(1 for v in c.values() if v == 1)
        lexical.append({
            "question": q, "tokens": total, "types": types,
            "ttr": round(types / total, 3) if total else 0,
            "hapaxRatio": round(hapax / types, 3) if types else 0,
        })

    # Kruskal-Wallis: 질문별 응답 길이 분포가 다른가 (비모수, 소표본 적합)
    groups = [df[df.question == q]["chars"].values for q in QKEYS]
    H, p = stats.kruskal(*groups)
    N = len(df)
    eta2 = (H - len(QKEYS) + 1) / (N - len(QKEYS))  # epsilon/eta² 근사
    kruskal = {
        "statistic": round(float(H), 3), "pvalue": round(float(p), 4),
        "df": len(QKEYS) - 1, "eta2": round(float(max(eta2, 0)), 3),
        "sig": "유의미한 차이 있음" if p < 0.05 else "통계적으로 유의한 차이 없음",
    }

    # 차트 1: boxplot + strip (글자수 by 질문)
    fig, ax = plt.subplots(figsize=(7.2, 4.4))
    order = QKEYS
    sns.boxplot(data=df, x="question", y="chars", order=order, ax=ax,
                color="#cfe8d8", width=.55, fliersize=0)
    sns.stripplot(data=df, x="question", y="chars", order=order, ax=ax,
                  color=GREEN, size=5, alpha=.7, jitter=.18)
    for i, q in enumerate(order):
        m = df[df.question == q]["chars"].median()
        ax.text(i, m, f" {m:.0f}", va="center", ha="left", fontsize=9,
                fontweight="bold", color="#156b41")
    ax.set_xlabel(""); ax.set_ylabel("응답 글자수(공백 제외)")
    ax.set_title("질문별 응답 길이 분포 (Boxplot + 개별 응답)", fontsize=12, fontweight="bold")
    box_png = save(fig, "eda_boxplot.png")

    # 차트 2: 어휘 다양성(TTR) 막대
    fig, ax = plt.subplots(figsize=(7.2, 3.6))
    ttrs = [l["ttr"] for l in lexical]
    bars = ax.bar(QKEYS, ttrs, color=PALETTE[:4], width=.6)
    for b, v in zip(bars, ttrs):
        ax.text(b.get_x() + b.get_width() / 2, v, f"{v:.3f}", ha="center", va="bottom", fontsize=9)
    ax.set_ylabel("Type-Token Ratio")
    ax.set_title("질문별 어휘 다양성 (TTR · 높을수록 다양한 어휘)", fontsize=12, fontweight="bold")
    ttr_png = save(fig, "eda_ttr.png")

    return {
        "descByQuestion": desc, "lexical": lexical, "kruskal": kruskal,
        "overall": {
            "responses": int(N), "meanChars": round(df.chars.mean(), 1),
            "medianChars": round(df.chars.median(), 1), "stdChars": round(df.chars.std(), 1),
        },
        "charts": {"boxplot": box_png, "ttr": ttr_png},
    }, df


# =============================================================================
# 2. Keyness — 로그우도(Log-Likelihood) 질문별 변별어
# =============================================================================
def run_keyness(rows, tokens_by_row, top_n=12):
    by_q = {q: Counter() for q in QKEYS}
    for r, t in zip(rows, tokens_by_row):
        by_q[r["question"]].update(t)
    total = Counter()
    for c in by_q.values():
        total.update(c)
    grand = sum(total.values())

    def ll(a, c_tot, b, d_tot):
        E1 = c_tot * (a + b) / (c_tot + d_tot)
        E2 = d_tot * (a + b) / (c_tot + d_tot)
        v = 0.0
        if a > 0:
            v += a * math.log(a / E1)
        if b > 0:
            v += b * math.log(b / E2)
        return 2 * v

    result = {}
    fig, axes = plt.subplots(2, 2, figsize=(11, 7.5))
    for ax, q in zip(axes.flat, QKEYS):
        tgt = by_q[q]
        c_tot = sum(tgt.values())
        d_tot = grand - c_tot
        scored = []
        for w, a in tgt.items():
            b = total[w] - a
            score = ll(a, c_tot, b, d_tot)
            # 과대표집(질문에서 비율이 더 높은 것)만
            if (a / c_tot) > (b / d_tot if d_tot else 0):
                sig = ("***" if score > 10.83 else "**" if score > 6.63
                       else "*" if score > 3.84 else "")
                scored.append({"word": w, "ll": round(score, 2), "freq": a, "sig": sig})
        scored.sort(key=lambda x: -x["ll"])
        result[q] = scored[:top_n]

        top = scored[:10][::-1]
        ax.barh([d["word"] for d in top], [d["ll"] for d in top], color=GREEN, alpha=.85)
        ax.axvline(3.84, color="#c2476a", ls="--", lw=.8)  # p<.05
        ax.set_title(f"{q}. {QUESTION_LABELS[q]}", fontsize=10, fontweight="bold")
        ax.tick_params(labelsize=9)
    fig.suptitle("질문별 Keyness (로그우도) — 통계적으로 두드러진 단어  · 점선=p<.05",
                 fontsize=13, fontweight="bold")
    fig.tight_layout(rect=[0, 0, 1, 0.96])
    png = save(fig, "keyness.png")
    return {"byQuestion": result, "chart": png}


# =============================================================================
# 3. 네트워크 수준 지표
# =============================================================================
def run_network_metrics(report):
    net = report["network"]
    G = nx.Graph()
    for n in net["nodes"]:
        G.add_node(n["id"], community=n["community"])
    for e in net["edges"]:
        G.add_edge(e["source"], e["target"], weight=e["weight"])
    comms = defaultdict(set)
    for n in net["nodes"]:
        comms[n["community"]].add(n["id"])
    try:
        mod = nx.algorithms.community.modularity(G, comms.values(), weight="weight")
    except Exception:
        mod = float("nan")
    degs = [d for _, d in G.degree()]
    return {
        "nodes": G.number_of_nodes(), "edges": G.number_of_edges(),
        "density": round(nx.density(G), 3),
        "avgDegree": round(sum(degs) / len(degs), 2),
        "modularity": round(mod, 3),
        "transitivity": round(nx.transitivity(G), 3),
        "components": nx.number_connected_components(G),
    }


# =============================================================================
# 4. 대응분석 (Correspondence Analysis) — 질문 × 단어
# =============================================================================
def run_ca(rows, tokens_by_row, n_terms=30):
    freq = Counter(w for t in tokens_by_row for w in t)
    terms = [w for w, _ in freq.most_common(n_terms)]
    tindex = {w: i for i, w in enumerate(terms)}
    C = np.zeros((len(QKEYS), len(terms)))
    for r, t in zip(rows, tokens_by_row):
        qi = QKEYS.index(r["question"])
        for w in t:
            if w in tindex:
                C[qi, tindex[w]] += 1

    P = C / C.sum()
    r_mass = P.sum(1, keepdims=True)
    c_mass = P.sum(0, keepdims=True)
    E = r_mass @ c_mass
    S = (P - E) / np.sqrt(E)
    U, D, Vt = np.linalg.svd(S, full_matrices=False)
    inertia = D ** 2
    explained = (inertia / inertia.sum())[:3]

    row_coords = (U[:, :2] * D[:2]) / np.sqrt(r_mass)
    col_coords = (Vt[:2].T * D[:2]) / np.sqrt(c_mass.T)

    fig, ax = plt.subplots(figsize=(8.4, 6.2))
    ax.axhline(0, color="#ccc", lw=.7); ax.axvline(0, color="#ccc", lw=.7)
    ax.scatter(col_coords[:, 0], col_coords[:, 1], s=18, color="#9aa6a0", alpha=.7)
    for i, w in enumerate(terms):
        ax.annotate(w, (col_coords[i, 0], col_coords[i, 1]), fontsize=8.5, color="#5d6f66")
    ax.scatter(row_coords[:, 0], row_coords[:, 1], s=170, color=PALETTE[:4], zorder=5, edgecolor="white", linewidth=2)
    for i, q in enumerate(QKEYS):
        ax.annotate(f"{q}", (row_coords[i, 0], row_coords[i, 1]), fontsize=12,
                    fontweight="bold", color="white", ha="center", va="center", zorder=6)
    ax.set_xlabel(f"차원 1 ({explained[0]*100:.1f}%)")
    ax.set_ylabel(f"차원 2 ({explained[1]*100:.1f}%)")
    ax.set_title("대응분석(CA): 질문과 단어의 2차원 포지셔닝", fontsize=12, fontweight="bold")
    png = save(fig, "ca_biplot.png")

    return {
        "explained": [round(float(x), 3) for x in explained],
        "questionCoords": [{"q": QKEYS[i], "x": round(float(row_coords[i, 0]), 3),
                            "y": round(float(row_coords[i, 1]), 3)} for i in range(len(QKEYS))],
        "chart": png,
    }


# =============================================================================
# 5. SBERT 임베딩 — 의미 군집 / 유사도 / 덴드로그램
# =============================================================================
def run_embeddings(rows, tokens_by_row):
    texts = [r["text"] for r in rows]
    method = "SBERT (jhgan/ko-sroberta-multitask)"
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("jhgan/ko-sroberta-multitask")
        emb = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    except Exception as e:
        print("[SBERT 실패 → TF-IDF+SVD 폴백]", e)
        from sklearn.decomposition import TruncatedSVD
        X = TfidfVectorizer().fit_transform([" ".join(t) for t in tokens_by_row])
        emb = TruncatedSVD(n_components=50, random_state=42).fit_transform(X)
        emb = emb / (np.linalg.norm(emb, axis=1, keepdims=True) + 1e-9)
        method = "TF-IDF + SVD (SBERT 미사용 폴백)"

    # 최적 k (실루엣)
    best = None
    for k in range(3, 7):
        km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(emb)
        sil = silhouette_score(emb, km.labels_)
        if best is None or sil > best[0]:
            best = (sil, k, km)
    sil, k, km = best
    labels = km.labels_

    # 군집별 대표어 + exemplar
    clusters = []
    for cid in range(k):
        idx = [i for i in range(len(rows)) if labels[i] == cid]
        toks = Counter(w for i in idx for w in tokens_by_row[i])
        center = km.cluster_centers_[cid]
        dists = [np.linalg.norm(emb[i] - center) for i in idx]
        ex = idx[int(np.argmin(dists))]
        clusters.append({
            "id": cid, "size": len(idx),
            "topTerms": [w for w, _ in toks.most_common(8)],
            "exemplar": {
                "respondent": rows[ex]["respondent"], "question": rows[ex]["question"],
                "snippet": rows[ex]["text"][:90] + "…",
            },
            "questionMix": dict(Counter(rows[i]["question"] for i in idx)),
        })

    # 차트: 2D PCA 산점도 (군집 색, 질문 마커)
    xy = PCA(n_components=2, random_state=42).fit_transform(emb)
    markers = {"Q1": "o", "Q2": "s", "Q3": "^", "Q4": "D"}
    fig, ax = plt.subplots(figsize=(8, 6))
    for q in QKEYS:
        sel = [i for i in range(len(rows)) if rows[i]["question"] == q]
        ax.scatter(xy[sel, 0], xy[sel, 1], c=[PALETTE[labels[i] % len(PALETTE)] for i in sel],
                   marker=markers[q], s=70, edgecolor="white", linewidth=.6, label=q)
    ax.set_title(f"응답 의미 군집 (SBERT 임베딩 · {k}개 군집 · 색=군집, 모양=질문)",
                 fontsize=11.5, fontweight="bold")
    ax.set_xlabel("PCA 1"); ax.set_ylabel("PCA 2"); ax.legend(title="질문", fontsize=9)
    scatter_png = save(fig, "cluster_scatter.png")

    # 차트: 질문 중심(centroid) 유사도 4x4
    qcent = np.array([emb[[i for i in range(len(rows)) if rows[i]["question"] == q]].mean(0) for q in QKEYS])
    qsim = cosine_similarity(qcent)
    fig, ax = plt.subplots(figsize=(5.4, 4.6))
    sns.heatmap(qsim, annot=True, fmt=".2f", cmap="Greens", xticklabels=QKEYS,
                yticklabels=QKEYS, vmin=qsim.min(), vmax=1, ax=ax, cbar_kws={"label": "코사인 유사도"})
    ax.set_title("질문 간 의미 유사도 (응답 임베딩 중심)", fontsize=11.5, fontweight="bold")
    heat_png = save(fig, "question_sim.png")

    # 차트: 응답자(20명) 덴드로그램 (4답변 평균 임베딩)
    resp_ids = sorted(set(r["respondent"] for r in rows))
    remb = np.array([emb[[i for i in range(len(rows)) if rows[i]["respondent"] == rid]].mean(0) for rid in resp_ids])
    Z = linkage(remb, method="ward")
    fig, ax = plt.subplots(figsize=(9, 4.2))
    dendrogram(Z, labels=resp_ids, ax=ax, color_threshold=.7 * max(Z[:, 2]),
               above_threshold_color="#b8c4be")
    ax.set_title("응답자 위계적 군집 (Ward · 응답 의미 기준)", fontsize=11.5, fontweight="bold")
    ax.set_ylabel("거리")
    dendro_png = save(fig, "dendrogram.png")

    return {
        "method": method, "k": int(k), "silhouette": round(float(sil), 3),
        "clusters": clusters,
        "questionSim": [[round(float(v), 3) for v in row] for row in qsim],
        "charts": {"scatter": scatter_png, "questionSim": heat_png, "dendrogram": dendro_png},
    }, emb, labels


# =============================================================================
# 6. 응답자 파생변수 — 상관 / (탐색적)회귀 / (탐색적)매개
# =============================================================================
def run_features(rows, tokens_by_row, report, emb, labels):
    themes = {t["stage"]: set(t["words"]) for t in report["themes"]}
    raw_by_resp = defaultdict(str)
    for r in rows:
        raw_by_resp[r["respondent"]] += " " + r["text"]
    resp_ids = sorted(set(r["respondent"] for r in rows))

    feats = []
    for rid in resp_ids:
        idx = [i for i in range(len(rows)) if rows[i]["respondent"] == rid]
        toks = [w for i in idx for w in tokens_by_row[i]]
        c = Counter(toks)
        raw = raw_by_resp[rid]
        feats.append({
            "respondent": rid,
            "길이": sum(len("".join(rows[i]["text"].split())) for i in idx),
            "어휘다양성": round(len(c) / len(toks), 3) if toks else 0,
            "공동성": c.get("함께", 0) + c.get("서로", 0),
            "직장실천": sum(c.get(w, 0) for w in themes.get(1, set())),
            "가정확산": sum(c.get(w, 0) for w in themes.get(2, set())),
            "소비나눔": sum(c.get(w, 0) for w in themes.get(3, set())),
            "긍정어": sum(raw.count(p) for p in POS_LEX),
        })
    fdf = pd.DataFrame(feats).set_index("respondent")

    # 상관행렬 (Spearman — 소표본·비정규 적합)
    corr = fdf.corr(method="spearman").round(2)
    fig, ax = plt.subplots(figsize=(6.4, 5.4))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdYlGn", center=0, vmin=-1, vmax=1,
                square=True, ax=ax, cbar_kws={"label": "Spearman ρ"})
    ax.set_title("응답자 파생변수 상관행렬 (n=20, Spearman)", fontsize=11.5, fontweight="bold")
    corr_png = save(fig, "feature_corr.png")

    # 탐색적 다중회귀: 가정확산 ~ 공동성 + 직장실천 + 길이
    X = sm.add_constant(fdf[["공동성", "직장실천", "길이"]].astype(float))
    y = fdf["가정확산"].astype(float)
    m = sm.OLS(y, X).fit()
    reg = {
        "formula": "가정확산 ~ 공동성 + 직장실천 + 길이",
        "n": int(m.nobs), "r2": round(m.rsquared, 3), "adjR2": round(m.rsquared_adj, 3),
        "f_p": round(float(m.f_pvalue), 4),
        "coefs": [{"name": n, "coef": round(m.params[n], 4),
                   "se": round(m.bse[n], 4), "p": round(m.pvalues[n], 4)}
                  for n in X.columns],
    }

    # 탐색적 매개분석: 공동성(X) → 직장실천(M) → 가정확산(Y)
    a_m = sm.OLS(fdf["직장실천"].astype(float), sm.add_constant(fdf[["공동성"]].astype(float))).fit()
    b_m = sm.OLS(fdf["가정확산"].astype(float),
                 sm.add_constant(fdf[["공동성", "직장실천"]].astype(float))).fit()
    c_m = sm.OLS(fdf["가정확산"].astype(float), sm.add_constant(fdf[["공동성"]].astype(float))).fit()
    a, sa = a_m.params["공동성"], a_m.bse["공동성"]
    b, sb = b_m.params["직장실천"], b_m.bse["직장실천"]
    indirect = a * b
    sobel_se = math.sqrt(b**2 * sa**2 + a**2 * sb**2) or 1e-9
    z = indirect / sobel_se
    med = {
        "path": "공동성(X) → 직장실천(M) → 가정확산(Y)",
        "a": round(a, 3), "b": round(b, 3),
        "c_total": round(c_m.params["공동성"], 3),
        "c_direct": round(b_m.params["공동성"], 3),
        "indirect": round(indirect, 3),
        "sobelZ": round(z, 3), "sobelP": round(2 * (1 - stats.norm.cdf(abs(z))), 4),
    }

    return {
        "variables": list(fdf.columns),
        "table": fdf.reset_index().to_dict("records"),
        "corr": {"labels": list(corr.columns), "matrix": corr.values.tolist()},
        "regression": reg, "mediation": med,
        "chart": corr_png,
        "caveat": "응답자 n=20의 탐색적 분석 — 통계적 검정력이 낮아 ‘경향 예시’로만 해석. 일반화·인과 추론 불가.",
    }


# =============================================================================
# 6c. 문장 단위 분석 — KWIC(키워드 실제 문장) + SBERT TextRank 중요도
# =============================================================================
FOCUS_WORDS = [
    "배달", "함께", "혼자", "텀블러", "마켓", "일회용품", "분리배출", "분리수거",
    "가족", "아이", "교육", "워크숍", "워크샵", "팀빌딩", "다짐", "꾸준히",
    "개인컵", "장바구니", "종사자", "물티슈", "손수건", "당근마켓", "음식",
    "비닐", "플라스틱", "습관", "정책제안", "도시락",
]


def run_sentences(rows, kiwi):
    """응답을 문장으로 분해해 SBERT TextRank로 '대표성 중요도'를 매기고,
    키워드가 실제로 쓰인 문장을 중요도순으로 인덱싱(KWIC)한다."""
    sents = []
    for r in rows:
        for s in kiwi.split_into_sents(r["text"]):
            txt = getattr(s, "text", str(s)).strip()
            if len(txt.replace(" ", "")) < 10:
                continue
            sents.append({"respondent": r["respondent"], "question": r["question"], "text": txt})

    method = "SBERT TextRank (jhgan/ko-sroberta-multitask)"
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("jhgan/ko-sroberta-multitask")
        emb = model.encode([s["text"] for s in sents], normalize_embeddings=True, show_progress_bar=False)
    except Exception as e:
        print("[문장 SBERT 실패 → TF-IDF 폴백]", e)
        from sklearn.decomposition import TruncatedSVD
        toks = [" ".join(extract_terms(kiwi, s["text"])) for s in sents]
        X = TfidfVectorizer().fit_transform(toks)
        emb = TruncatedSVD(n_components=64, random_state=42).fit_transform(X)
        emb = emb / (np.linalg.norm(emb, axis=1, keepdims=True) + 1e-9)
        method = "TF-IDF TextRank (SBERT 폴백)"

    sim = cosine_similarity(emb)
    np.fill_diagonal(sim, 0.0)
    sim[sim < 0.2] = 0.0  # 약한 유사도 제거(중심성 변별)
    G = nx.from_numpy_array(sim)
    pr = nx.pagerank(G, weight="weight")
    sc = np.array([pr[i] for i in range(len(sents))])
    imp = (sc - sc.min()) / (sc.max() - sc.min()) * 100 if sc.max() > sc.min() else np.full(len(sc), 50.0)
    for i, s in enumerate(sents):
        s["importance"] = round(float(imp[i]), 1)

    def pack(lst):
        return [{"respondent": m["respondent"], "question": m["question"],
                 "importance": m["importance"], "text": m["text"]} for m in lst]

    by_kw, counts = {}, []
    for w in FOCUS_WORDS:
        matched = [s for s in sents if w in s["text"]]
        if len(matched) < 2:
            continue
        matched.sort(key=lambda x: -x["importance"])
        by_kw[w] = pack(matched[:8])
        counts.append({"word": w, "count": len(matched),
                       "meanImportance": round(float(np.mean([m["importance"] for m in matched])), 1)})
    counts.sort(key=lambda x: -x["count"])
    top_overall = pack(sorted(sents, key=lambda x: -x["importance"])[:8])

    return {
        "method": method, "totalSentences": len(sents),
        "keywords": counts, "byKeyword": by_kw, "topOverall": top_overall,
    }


# =============================================================================
# 6d. 행동 변화 '방향' 분석 — 키워드가 줄었나(↓) 늘었나/채택(↑)
#     빈도·네트워크가 못 잡는 '증가/감소'를 문장 술어 단서로 분류
# =============================================================================
BEHAVIOR_WORDS = [
    "배달", "일회용품", "텀블러", "개인컵", "장바구니", "물티슈", "손수건",
    "분리배출", "분리수거", "도시락", "비닐", "종이컵", "당근마켓",
]
REDUCE_CUES = ["줄이", "줄였", "줄여", "줄게", "줄도록", "줄임", "자제", "지양", "감소",
               "안 받", "받지 않", "안 쓰", "쓰지 않", "사용하지 않", "사용 안", "안 시키",
               "않기", "말기", "덜 ", "아끼", "절약", "절감", "끄기", "끄고", "뽑", "최소화"]
ADOPT_CUES = ["사용하", "사용합", "사용해", "사용한", "사용을", "사용 하", "사용했", "챙기", "챙겨",
              "지참", "들고 다", "가지고 다", "가져", "활용", "재사용", "마련", "준비", "증가",
              "늘었", "늘리", "늘어", "담아", "쓰고", "씁니", "시작"]


def run_behavior_direction(rows, kiwi):
    sents = []
    for r in rows:
        for s in kiwi.split_into_sents(r["text"]):
            sents.append({"r": r["respondent"], "q": r["question"],
                          "text": getattr(s, "text", str(s)).strip()})

    def classify(text, kw):
        idx = text.find(kw)
        before = text[max(0, idx - 7):idx]
        rest = text[idx + len(kw):]
        # 키워드가 속한 '절'만 보도록 구분자에서 자른다(긴 나열 문장 오분류 방지)
        cut = len(rest)
        for d in [",", ".", "/", "·", "\n", "(", ")", "。", "、"]:
            p = rest.find(d)
            if p != -1:
                cut = min(cut, p)
        after = rest[:cut]
        # 'A 대신 B' 대체 표현 처리
        if "대신" in after[:6]:
            return "reduce"   # 'keyword 대신 ~' → keyword를 줄임/회피
        if "대신" in before:
            return "adopt"    # '~ 대신 keyword' → keyword 채택
        if any(c in after for c in REDUCE_CUES):
            return "reduce"
        if any(c in after for c in ADOPT_CUES):
            return "adopt"
        # 절에 단서가 없으면 문장 전체로 보조 판정(둘 중 하나만 있을 때만)
        rt = any(c in text for c in REDUCE_CUES)
        at = any(c in text for c in ADOPT_CUES)
        if rt and not at:
            return "reduce"
        if at and not rt:
            return "adopt"
        return "neutral"

    # 방향은 원문 정독 기반 질적 코딩으로 확정(규칙기반은 뉘앙스 오분류가 있어 보조로만 사용)
    VERIFIED_DIR = {
        "배달": "감소·회피", "일회용품": "감소·회피", "물티슈": "감소·회피",
        "비닐": "감소·회피", "종이컵": "감소·회피",
        "텀블러": "채택·증가", "개인컵": "채택·증가", "장바구니": "채택·증가",
        "손수건": "채택·증가", "도시락": "채택·증가",
        "분리배출": "강화·증가", "분리수거": "강화·증가", "당근마켓": "활용·증가",
    }

    out = []
    for w in BEHAVIOR_WORDS:
        hits = [s for s in sents if w in s["text"]]
        if len(hits) < 3 or w not in VERIFIED_DIR:
            continue
        direction = VERIFIED_DIR[w]
        arrow = "↓" if direction.startswith(("감소", "회피")) else "↑"
        want = "reduce" if arrow == "↓" else "adopt"
        # 방향과 일치하는(=자동분류가 같은) 문장을 근거 예문으로, 짧은 것 우선
        matched = [s for s in hits if classify(s["text"], w) == want]
        matched.sort(key=lambda s: len(s["text"]))
        picks = (matched or sorted(hits, key=lambda s: len(s["text"])))[:2]
        out.append({
            "word": w, "total": len(hits), "direction": direction, "arrow": arrow,
            "examples": [{"r": s["r"], "q": s["q"], "text": s["text"][:140]} for s in picks],
        })
    out.sort(key=lambda x: -x["total"])
    return {"method": "질적 방향 코딩(응답 문장 정독) + 근거 문장 제시", "behaviors": out}


# =============================================================================
# 7. 전처리/데이터 예시 카드
# =============================================================================
def run_preprocessing(rows, kiwi):
    sample = rows[2]  # C_Q1 (구체적 행동 나열 응답)
    toks = [{"surface": t.form, "tag": t.tag} for t in kiwi.tokenize(sample["text"][:60])]
    return {
        "rawExample": {
            "label": f"{sample['respondent']}_{sample['question']}",
            "text": sample["text"][:160] + "…",
        },
        "pipeline": ["원문 로드(80건)", "Kiwi 형태소 분석", "명사(NNG/NNP) + 핵심 부사 추출",
                     "1글자·불용어 제거", "도메인 복합어 사용자사전 보존"],
        "userDict": sorted(list({"친환경소비행동", "일회용품", "텀블러", "개인컵", "장바구니",
                                 "다회용기", "분리수거", "다문화축제", "사회복지사", "정책제안"})),
        "meaningfulAdv": sorted(list(MEANINGFUL_ADV)),
        "stopwordCount": len(STOPWORDS),
        "stopwordSample": sorted(list(STOPWORDS))[:30],
        "tokenExample": toks[:14],
    }


# =============================================================================
def main():
    raw = DATA.read_text(encoding="utf-8")
    rows = parse_responses(raw)
    kiwi = build_kiwi()
    tokens_by_row = [extract_terms(kiwi, r["text"]) for r in rows]

    report = json.loads(REPORT.read_text(encoding="utf-8"))

    print("· EDA / Kruskal-Wallis")
    report["eda"], _ = run_eda(rows, tokens_by_row, kiwi)
    print("· Keyness (로그우도)")
    report["keyness"] = run_keyness(rows, tokens_by_row)
    print("· 네트워크 지표")
    report["networkMetrics"] = run_network_metrics(report)
    print("· 대응분석(CA)")
    report["ca"] = run_ca(rows, tokens_by_row)
    print("· SBERT 임베딩 / 군집")
    report["embedding"], emb, labels = run_embeddings(rows, tokens_by_row)
    print("· 파생변수 상관/회귀/매개")
    report["features"] = run_features(rows, tokens_by_row, report, emb, labels)
    print("· 문장 단위 KWIC / 중요도")
    report["sentences"] = run_sentences(rows, kiwi)
    print("· 행동 변화 방향(증가/감소) 분석")
    report["direction"] = run_behavior_direction(rows, kiwi)
    print("· 전처리 카드")
    report["preprocessing"] = run_preprocessing(rows, kiwi)

    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[완료] 차트 {len(list(CHARTS.glob('*.png')))}개 · report.json 갱신")
    print(f"  군집 {report['embedding']['k']}개 (실루엣 {report['embedding']['silhouette']}) "
          f"· CA 설명력 {sum(report['ca']['explained'][:2])*100:.0f}% "
          f"· 네트워크 모듈성 {report['networkMetrics']['modularity']}")


if __name__ == "__main__":
    main()

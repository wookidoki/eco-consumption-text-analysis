import styles from "./Features.module.css";
import Figure from "./Figure";
import Table from "./Table";
import type { Report } from "@/lib/report";

export default function Features({ features }: { features: Report["features"] }) {
  const reg = features.regression;
  const med = features.mediation;

  const regRows = reg.coefs.map((c) => ({
    name: c.name === "const" ? "(상수)" : c.name,
    coef: c.coef.toFixed(3),
    se: c.se.toFixed(3),
    p: c.p.toFixed(3),
    sig: c.p < 0.05 ? "✓" : "n.s.",
  }));

  const medRows = [
    { path: "a : 공동성 → 직장실천", val: med.a },
    { path: "b : 직장실천 → 가정확산", val: med.b },
    { path: "c : 공동성 → 가정확산 (총효과)", val: med.c_total },
    { path: "c′: 공동성 → 가정확산 (직접효과)", val: med.c_direct },
    { path: "a×b : 간접(매개)효과", val: med.indirect },
  ].map((r) => ({ path: r.path, val: r.val.toFixed(3) }));

  return (
    <div className={styles.wrap}>
      <div className={styles.caveat}>
        <span className={styles.caveatTag}>⚠ 탐색적 분석</span>
        {features.caveat}
      </div>

      <div className={styles.intro}>
        인터뷰 텍스트에서 응답자별(20명) 수치 변수를 만들어 다변량 분석을 시연했습니다.
        파생 변수: <b>길이·어휘다양성·공동성(‘함께/서로’ 빈도)·직장실천·가정확산·소비나눔·긍정어</b>.
      </div>

      <Figure
        src={features.chart}
        alt="파생변수 상관행렬"
        caption="Spearman 상관(소표본·비정규에 적합). +1(초록)=같이 증가, −1(빨강)=반대."
      />

      <div className={styles.models}>
        <div className={styles.model}>
          <h4 className={styles.h}>다중회귀분석</h4>
          <code className={styles.formula}>{reg.formula}</code>
          <Table
            columns={[
              { key: "name", label: "변수", strong: true },
              { key: "coef", label: "계수(b)", align: "right" },
              { key: "se", label: "표준오차", align: "right" },
              { key: "p", label: "p", align: "right" },
              { key: "sig", label: "유의", align: "center" },
            ]}
            rows={regRows}
          />
          <p className={styles.fit}>
            R² = <b>{reg.r2}</b> · 수정 R² = {reg.adjR2} · 모형 F p = {reg.f_p}{" "}
            {reg.f_p >= 0.05 && <span className={styles.warn}>→ 모형 전체 유의하지 않음</span>}
          </p>
        </div>

        <div className={styles.model}>
          <h4 className={styles.h}>매개분석 (Sobel)</h4>
          <code className={styles.formula}>{med.path}</code>
          <Table
            columns={[
              { key: "path", label: "경로", strong: true },
              { key: "val", label: "계수", align: "right" },
            ]}
            rows={medRows}
          />
          <p className={styles.fit}>
            Sobel Z = <b>{med.sobelZ}</b>, p = {med.sobelP}{" "}
            {med.sobelP >= 0.05 && <span className={styles.warn}>→ 매개효과 유의하지 않음</span>}
          </p>
        </div>
      </div>

      <p className={styles.honest}>
        ※ 회귀·매개 모두 <b>유의하지 않게</b> 나왔습니다. 이는 분석 실패가 아니라{" "}
        <b>n=20에서는 통계적 검정력이 부족</b>하다는 정직한 결과입니다. 인과·일반화 주장에는
        구조화된 설문(척도)과 더 큰 표본(통상 n≥100)이 필요합니다.
      </p>
    </div>
  );
}

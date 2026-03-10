import { getUseCases } from "@/lib/notion";
import {
  DEPARTMENTS,
  TOTAL_HEADCOUNT,
  TOTAL_REVENUE_TARGET,
  ANNUAL_WORK_MINUTES,
} from "@/lib/departments";
import { PrintButton } from "./print-button";

export const revalidate = 60;

const USAGE_PER_MONTH = 20;

export default async function ReportPage() {
  const useCases = await getUseCases();

  // === Aggregate (same logic as dashboard) ===
  const totalMinutesPerTask = useCases.reduce(
    (sum, uc) => sum + uc.impactMinutesSaved,
    0,
  );
  const totalCases = useCases.length;

  const teamMap = new Map<
    string,
    { minutes: number; count: number }
  >();
  for (const uc of useCases) {
    const team = uc.team || "未分類";
    const existing = teamMap.get(team) ?? { minutes: 0, count: 0 };
    existing.minutes += uc.impactMinutesSaved;
    existing.count += 1;
    teamMap.set(team, existing);
  }

  const teamRows = DEPARTMENTS.map((dept) => {
    const data = teamMap.get(dept.name) ?? { minutes: 0, count: 0 };
    const monthlyMinutes = data.minutes * USAGE_PER_MONTH;
    const annualMinutes = monthlyMinutes * 12;
    const annualHours = annualMinutes / 60;
    const fteEquiv = annualMinutes / ANNUAL_WORK_MINUTES;
    const revenuePerPerson =
      dept.headcount > 0 && dept.revenueTarget > 0
        ? dept.revenueTarget / dept.headcount
        : 0;
    const revenueImpact = fteEquiv * revenuePerPerson;
    return { ...dept, ...data, annualHours, fteEquiv, revenueImpact };
  }).sort((a, b) => b.minutes - a.minutes);

  const totalMonthlyMinutes = totalMinutesPerTask * USAGE_PER_MONTH;
  const totalAnnualMinutes = totalMonthlyMinutes * 12;
  const totalAnnualHours = totalAnnualMinutes / 60;
  const totalFTE = totalAnnualMinutes / ANNUAL_WORK_MINUTES;
  const avgRevenuePerPerson = TOTAL_REVENUE_TARGET / TOTAL_HEADCOUNT;
  const totalRevenueImpact = totalFTE * avgRevenuePerPerson;
  const productivityPct =
    TOTAL_HEADCOUNT > 0
      ? (totalAnnualMinutes / (ANNUAL_WORK_MINUTES * TOTAL_HEADCOUNT)) * 100
      : 0;

  const catMap = new Map<string, number>();
  for (const uc of useCases) {
    const cat = uc.category || "その他";
    catMap.set(cat, (catMap.get(cat) ?? 0) + uc.impactMinutesSaved);
  }
  const categories = [...catMap.entries()]
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  const toolMap = new Map<string, number>();
  for (const uc of useCases) {
    const tool = uc.tool || "未記入";
    toolMap.set(tool, (toolMap.get(tool) ?? 0) + 1);
  }
  const tools = [...toolMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const now = new Date().toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="report-page max-w-4xl mx-auto">
      {/* Print / Back controls — hidden on print */}
      <div className="flex items-center justify-between mb-8 no-print">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          <span>←</span>
          <span>Dashboard に戻る</span>
        </a>
        <PrintButton />
      </div>

      {/* === Report Header === */}
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          AI活用 生産性レポート
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          生成日時: {now}
        </p>
      </header>

      {/* === KPI Summary === */}
      <section className="mb-10">
        <h2 className="report-heading">全社 KPI サマリー</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KPI label="登録事例数" value={`${totalCases}件`} />
          <KPI label="削減時間/タスク合計" value={`${totalMinutesPerTask} min`} />
          <KPI label="年間削減（推計）" value={`${totalAnnualHours.toLocaleString("ja-JP", { maximumFractionDigits: 0 })} h`} />
          <KPI label="FTE換算" value={`${totalFTE.toFixed(1)} 人分`} />
          <KPI label="生産性向上率" value={`${productivityPct.toFixed(1)}%`} />
          <KPI label="売上換算（推計）" value={`${totalRevenueImpact.toLocaleString("ja-JP", { maximumFractionDigits: 0 })} 万円`} />
          <KPI label="全社売上目標" value={`${(TOTAL_REVENUE_TARGET / 10000).toFixed(1)} 億円`} />
          <KPI label="従業員数" value={`${TOTAL_HEADCOUNT} 名`} />
        </div>
      </section>

      {/* === Department Table === */}
      <section className="mb-10">
        <h2 className="report-heading">部門別実績</h2>
        <table className="report-table">
          <thead>
            <tr>
              <th className="text-left">部門</th>
              <th>人数</th>
              <th>事例数</th>
              <th>削減/タスク</th>
              <th>年間削減</th>
              <th>FTE</th>
              <th>売上換算</th>
            </tr>
          </thead>
          <tbody>
            {teamRows.map((t) => (
              <tr key={t.name}>
                <td className="font-medium">{t.name}</td>
                <td className="text-center">{t.headcount}</td>
                <td className="text-center">{t.count || "—"}</td>
                <td className="text-right">{t.minutes > 0 ? `${t.minutes} min` : "—"}</td>
                <td className="text-right">{t.annualHours > 0 ? `${t.annualHours.toFixed(0)} h` : "—"}</td>
                <td className="text-right">{t.fteEquiv > 0 ? t.fteEquiv.toFixed(2) : "—"}</td>
                <td className="text-right">
                  {t.revenueImpact > 0
                    ? `${t.revenueImpact.toFixed(0)} 万円`
                    : t.minutes > 0
                      ? "間接部門"
                      : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-slate-100">
              <td>全社合計</td>
              <td className="text-center">{TOTAL_HEADCOUNT}</td>
              <td className="text-center">{totalCases}</td>
              <td className="text-right">{totalMinutesPerTask} min</td>
              <td className="text-right">{totalAnnualHours.toFixed(0)} h</td>
              <td className="text-right">{totalFTE.toFixed(2)}</td>
              <td className="text-right">{totalRevenueImpact.toFixed(0)} 万円</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* === Category & Tool Breakdown === */}
      <div className="grid gap-8 sm:grid-cols-2 mb-10">
        <section>
          <h2 className="report-heading">カテゴリ別 削減時間</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th className="text-left">カテゴリ</th>
                <th>削減時間</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td className="text-right">{c.minutes} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="report-heading">ツール別 事例数</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th className="text-left">ツール</th>
                <th>件数</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.name}>
                  <td>{t.name}</td>
                  <td className="text-right">{t.count} 件</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* === Assumptions === */}
      <section className="text-xs text-slate-500 border-t border-slate-200 pt-4">
        <p className="font-semibold mb-1">前提条件・計算ロジック</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>各事例の削減時間 × 月{USAGE_PER_MONTH}回利用 × 12ヶ月 = 年間削減時間</li>
          <li>FTE換算 = 年間削減時間 ÷ 年間労働時間（{ANNUAL_WORK_MINUTES / 60}h）</li>
          <li>売上換算 = FTE × 部門1人あたり売上目標</li>
          <li>間接部門（売上目標なし）はFTE換算のみ</li>
        </ul>
      </section>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

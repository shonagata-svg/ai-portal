import Link from "next/link";
import { getUseCases } from "@/lib/notion";
import { PageHeader } from "@/components/card";
import {
  DEPARTMENTS,
  TOTAL_HEADCOUNT,
  TOTAL_REVENUE_TARGET,
  ANNUAL_WORK_MINUTES,
  getDepartment,
} from "@/lib/departments";

export const revalidate = 60;

/** 月あたりの利用回数想定（1事例あたり） */
const USAGE_PER_MONTH = 20;

export default async function DashboardPage() {
  const useCases = await getUseCases();

  // === Aggregate ===
  const totalMinutesPerTask = useCases.reduce(
    (sum, uc) => sum + uc.impactMinutesSaved,
    0,
  );
  const totalCases = useCases.length;

  // Per-team aggregation
  const teamMap = new Map<
    string,
    { minutes: number; count: number; cases: string[] }
  >();
  for (const uc of useCases) {
    const team = uc.team || "未分類";
    const existing = teamMap.get(team) ?? { minutes: 0, count: 0, cases: [] };
    existing.minutes += uc.impactMinutesSaved;
    existing.count += 1;
    existing.cases.push(uc.title);
    teamMap.set(team, existing);
  }

  // Build team rows with department master data
  const teamRows = DEPARTMENTS.map((dept) => {
    const data = teamMap.get(dept.name) ?? {
      minutes: 0,
      count: 0,
      cases: [],
    };
    const monthlyMinutes = data.minutes * USAGE_PER_MONTH;
    const annualMinutes = monthlyMinutes * 12;
    const annualHours = annualMinutes / 60;
    const fteEquiv = annualMinutes / ANNUAL_WORK_MINUTES;
    const revenuePerPerson =
      dept.headcount > 0 && dept.revenueTarget > 0
        ? dept.revenueTarget / dept.headcount
        : 0;
    const revenueImpact = fteEquiv * revenuePerPerson; // 万円
    return {
      ...dept,
      ...data,
      monthlyMinutes,
      annualHours,
      fteEquiv,
      revenueImpact,
    };
  }).sort((a, b) => b.minutes - a.minutes);

  const maxMinutes = Math.max(...teamRows.map((t) => t.minutes), 1);

  // Company-wide impact
  const totalMonthlyMinutes = totalMinutesPerTask * USAGE_PER_MONTH;
  const totalAnnualMinutes = totalMonthlyMinutes * 12;
  const totalAnnualHours = totalAnnualMinutes / 60;
  const totalFTE =
    totalAnnualMinutes / ANNUAL_WORK_MINUTES;
  const avgRevenuePerPerson =
    TOTAL_REVENUE_TARGET / TOTAL_HEADCOUNT;
  const totalRevenueImpact = totalFTE * avgRevenuePerPerson;
  const productivityPct =
    TOTAL_HEADCOUNT > 0
      ? (totalAnnualMinutes / (ANNUAL_WORK_MINUTES * TOTAL_HEADCOUNT)) * 100
      : 0;

  // Per-category
  const catMap = new Map<string, number>();
  for (const uc of useCases) {
    const cat = uc.category || "その他";
    catMap.set(cat, (catMap.get(cat) ?? 0) + uc.impactMinutesSaved);
  }
  const categories = [...catMap.entries()]
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes);
  const maxCatMinutes = Math.max(...categories.map((c) => c.minutes), 1);

  // Per-tool
  const toolMap = new Map<string, number>();
  for (const uc of useCases) {
    const tool = uc.tool || "未記入";
    toolMap.set(tool, (toolMap.get(tool) ?? 0) + 1);
  }
  const tools = [...toolMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Dashboard"
          description="AI活用による削減時間実績と売上生産性インパクト"
          icon="📊"
        />
        <Link
          href="/dashboard/report"
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
          レポート出力
        </Link>
      </div>

      {/* ===== Company-wide Summary ===== */}
      <section>
        <h2 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-wider">
          全社サマリー
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            label="削減時間/タスク"
            value={`${totalMinutesPerTask}`}
            unit="min"
            icon="⏱️"
            accent="blue"
          />
          <SummaryCard
            label="年間削減時間（推計）"
            value={`${totalAnnualHours.toLocaleString("ja-JP", { maximumFractionDigits: 0 })}`}
            unit="h/年"
            icon="📅"
            accent="emerald"
            sub={`月${USAGE_PER_MONTH}回利用想定`}
          />
          <SummaryCard
            label="FTE換算"
            value={totalFTE.toFixed(1)}
            unit="人分"
            icon="👤"
            accent="purple"
            sub={`全${TOTAL_HEADCOUNT}名中`}
          />
          <SummaryCard
            label="生産性向上率"
            value={productivityPct.toFixed(1)}
            unit="%"
            icon="📈"
            accent="amber"
            sub="全社労働時間比"
          />
        </div>
      </section>

      {/* ===== Revenue Impact ===== */}
      <section>
        <h2 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-wider">
          売上生産性インパクト（推計）
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 text-white">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-sm text-blue-300 font-medium mb-1">
                全社売上目標
              </p>
              <p className="text-3xl font-bold">
                {(TOTAL_REVENUE_TARGET / 10000).toFixed(1)}
                <span className="text-lg text-blue-300 ml-1">億円</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-emerald-300 font-medium mb-1">
                AI削減分の売上換算
              </p>
              <p className="text-3xl font-bold text-emerald-400">
                {totalRevenueImpact.toLocaleString("ja-JP", {
                  maximumFractionDigits: 0,
                })}
                <span className="text-lg text-emerald-300 ml-1">万円</span>
              </p>
              <p className="text-xs text-blue-300/70 mt-1">
                FTE {totalFTE.toFixed(1)}人分 × 1人あたり売上{" "}
                {avgRevenuePerPerson.toFixed(0)}万円
              </p>
            </div>
            <div>
              <p className="text-sm text-amber-300 font-medium mb-1">
                売上目標比
              </p>
              <p className="text-3xl font-bold text-amber-400">
                {TOTAL_REVENUE_TARGET > 0
                  ? ((totalRevenueImpact / TOTAL_REVENUE_TARGET) * 100).toFixed(
                      2,
                    )
                  : "—"}
                <span className="text-lg text-amber-300 ml-1">%</span>
              </p>
              <p className="text-xs text-blue-300/70 mt-1">
                従業員数: {TOTAL_HEADCOUNT}名
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs text-blue-300/50 border-t border-white/10 pt-4">
            ※ 推計ロジック: 各事例の削減時間 × 月{USAGE_PER_MONTH}
            回利用 × 12ヶ月 → FTE換算 → 1人あたり売上を乗算。事業部門のみ売上配分。
          </p>
        </div>
      </section>

      {/* ===== Team Breakdown with Impact ===== */}
      <section>
        <h2 className="mb-5 text-sm font-bold text-slate-400 uppercase tracking-wider">
          部門別 削減時間 & 生産性インパクト
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-[180px_60px_90px_100px_80px_80px_100px_1fr] gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>部門</span>
              <span className="text-right">人数</span>
              <span className="text-right">削減/タスク</span>
              <span className="text-right">年間削減</span>
              <span className="text-right">FTE</span>
              <span className="text-right">事例数</span>
              <span className="text-right">売上換算</span>
              <span>グラフ</span>
            </div>
            {/* Rows */}
            {teamRows.map((t) => {
              const pct = Math.round((t.minutes / maxMinutes) * 100);
              const hasRevenue = t.revenueTarget > 0;
              return (
                <div
                  key={t.name}
                  className="grid grid-cols-[180px_60px_90px_100px_80px_80px_100px_1fr] gap-3 items-center px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {t.name}
                    </p>
                  </div>
                  <p className="text-right text-sm text-slate-600">
                    {t.headcount}
                  </p>
                  <p className="text-right">
                    {t.minutes > 0 ? (
                      <>
                        <span className="font-bold text-slate-900">
                          {t.minutes}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-0.5">
                          min
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </p>
                  <p className="text-right">
                    {t.annualHours > 0 ? (
                      <>
                        <span className="font-bold text-slate-900">
                          {t.annualHours.toFixed(0)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-0.5">
                          h
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </p>
                  <p className="text-right">
                    {t.fteEquiv > 0 ? (
                      <span className="font-bold text-purple-700">
                        {t.fteEquiv.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </p>
                  <p className="text-right text-sm text-slate-600">
                    {t.count > 0 ? `${t.count}件` : "—"}
                  </p>
                  <p className="text-right">
                    {t.revenueImpact > 0 ? (
                      <>
                        <span className="font-bold text-emerald-700">
                          {t.revenueImpact.toFixed(0)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-0.5">
                          万円
                        </span>
                      </>
                    ) : t.minutes > 0 ? (
                      <span className="text-xs text-slate-400">間接部門</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    {t.minutes > 0 ? (
                      <>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 w-8 text-right">
                          {pct}%
                        </span>
                      </>
                    ) : (
                      <div className="flex-1 h-3 bg-slate-50 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
            {/* Total */}
            <div className="grid grid-cols-[180px_60px_90px_100px_80px_80px_100px_1fr] gap-3 items-center px-5 py-4 bg-slate-900 text-white">
              <p className="font-bold text-sm">全社合計</p>
              <p className="text-right text-sm">{TOTAL_HEADCOUNT}</p>
              <p className="text-right">
                <span className="font-bold">{totalMinutesPerTask}</span>
                <span className="text-[10px] text-slate-300 ml-0.5">min</span>
              </p>
              <p className="text-right">
                <span className="font-bold">
                  {totalAnnualHours.toFixed(0)}
                </span>
                <span className="text-[10px] text-slate-300 ml-0.5">h</span>
              </p>
              <p className="text-right font-bold">{totalFTE.toFixed(2)}</p>
              <p className="text-right text-sm">{totalCases}件</p>
              <p className="text-right">
                <span className="font-bold text-emerald-400">
                  {totalRevenueImpact.toFixed(0)}
                </span>
                <span className="text-[10px] text-slate-300 ml-0.5">万円</span>
              </p>
              <div />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Two-column: Category + Tool ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-5 text-sm font-bold text-slate-400 uppercase tracking-wider">
            カテゴリ別 削減時間
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            {categories.map((cat) => {
              const pct = Math.round((cat.minutes / maxCatMinutes) * 100);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">
                      {cat.name}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {cat.minutes}
                      <span className="text-xs text-slate-400 ml-1">min</span>
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-sm font-bold text-slate-400 uppercase tracking-wider">
            使用ツール 分布
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-sm">
                    🛠️
                  </span>
                  <span className="font-medium text-slate-800">
                    {tool.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {tool.count}
                  </span>
                  <span className="text-xs text-slate-400">件</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== Use Case Detail Table ===== */}
      <section>
        <h2 className="mb-5 text-sm font-bold text-slate-400 uppercase tracking-wider">
          事例別 詳細
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_120px_100px] gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>事例</span>
            <span>部門</span>
            <span>ツール</span>
            <span className="text-right">削減時間</span>
          </div>
          {[...useCases]
            .sort((a, b) => b.impactMinutesSaved - a.impactMinutesSaved)
            .map((uc) => (
              <Link
                key={uc.id}
                href={`/use-cases/${uc.id}`}
                className="grid grid-cols-[1fr_140px_120px_100px] gap-4 items-center px-6 py-3.5 border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-colors"
              >
                <p className="text-sm font-medium text-slate-800 truncate">
                  {uc.title}
                </p>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 w-fit">
                  {uc.team || "—"}
                </span>
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 w-fit">
                  {uc.tool || "—"}
                </span>
                <p className="text-right">
                  <span className="font-bold text-slate-900">
                    {uc.impactMinutesSaved}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">min</span>
                </p>
              </Link>
            ))}
        </div>
      </section>

      {/* ===== Assumptions ===== */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          前提条件・計算ロジック
        </h3>
        <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
          <li>
            各事例の削減時間（min/タスク）× 月間利用回数（{USAGE_PER_MONTH}
            回）× 12ヶ月 = 年間削減時間
          </li>
          <li>FTE換算 = 年間削減時間 ÷ 年間労働時間（{ANNUAL_WORK_MINUTES / 60}h = {ANNUAL_WORK_MINUTES / 60 / 8}日 × 8h）</li>
          <li>
            売上換算 = FTE × 部門の1人あたり売上目標（売上目標 ÷ 部門人数）
          </li>
          <li>間接部門（売上目標なし）はFTE換算のみ表示</li>
          <li>全社: 従業員{TOTAL_HEADCOUNT}名 / 売上目標{(TOTAL_REVENUE_TARGET / 10000).toFixed(1)}億円</li>
          <li>
            数値は departments.ts で管理。実績に合わせて更新してください。
          </li>
        </ul>
      </section>
    </div>
  );
}

// --- Sub-component ---

function SummaryCard({
  label,
  value,
  unit,
  icon,
  accent,
  sub,
}: {
  label: string;
  value: string;
  unit: string;
  icon: string;
  accent: "blue" | "emerald" | "purple" | "amber";
  sub?: string;
}) {
  const bg = {
    blue: "bg-blue-50 border-blue-200",
    emerald: "bg-emerald-50 border-emerald-200",
    purple: "bg-purple-50 border-purple-200",
    amber: "bg-amber-50 border-amber-200",
  };
  const textColor = {
    blue: "text-blue-700",
    emerald: "text-emerald-700",
    purple: "text-purple-700",
    amber: "text-amber-700",
  };
  return (
    <div className={`rounded-2xl border p-5 ${bg[accent]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-3xl font-bold ${textColor[accent]}`}>
        {value}
        <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>
      </p>
      {sub && <p className="mt-1 text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

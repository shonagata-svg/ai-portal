import { Suspense } from "react";
import Link from "next/link";
import { getAITools } from "@/lib/notion";
import { extractTags, extractValues, matchesQuery } from "@/lib/search";
import { Tag, Badge, PageHeader, EmptyState } from "@/components/card";
import { SearchBox, TagFilter } from "@/components/search-filter";

export const revalidate = 60;

const PRICING_COLORS: Record<string, string> = {
  無料: "bg-emerald-100 text-emerald-800",
  フリーミアム: "bg-blue-100 text-blue-800",
  有料: "bg-amber-100 text-amber-800",
  要問い合わせ: "bg-slate-100 text-slate-700",
};

const STATUS_COLORS: Record<string, string> = {
  推奨: "bg-emerald-100 text-emerald-800",
  試験中: "bg-blue-100 text-blue-800",
  非推奨: "bg-red-100 text-red-800",
  未評価: "bg-slate-100 text-slate-600",
};

const CATEGORY_ICONS: Record<string, string> = {
  文章生成: "✍️",
  画像生成: "🎨",
  コード支援: "💻",
  データ分析: "📊",
  "音声・動画": "🎬",
  翻訳: "🌐",
  検索: "🔍",
  その他: "🛠️",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? "text-amber-400" : "text-slate-200"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default async function ToolsPage(props: {
  searchParams: Promise<{ q?: string; tag?: string; category?: string; view?: string }>;
}) {
  const searchParams = await props.searchParams;
  const items = await getAITools();

  const allTags = extractTags(items);
  const allCategories = extractValues(items, "category");

  const q = searchParams.q ?? "";
  const tag = searchParams.tag ?? "";
  const category = searchParams.category ?? "";
  const view = searchParams.view ?? "card";

  const filtered = items.filter((item) => {
    if (tag && !item.tags.includes(tag)) return false;
    if (category && item.category !== category) return false;
    return matchesQuery(q, item.title, item.description, item.recommendedUse, item.category, item.tags);
  });

  // Sort: 推奨 first, then by rating desc
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "推奨" && b.status !== "推奨") return -1;
    if (b.status === "推奨" && a.status !== "推奨") return 1;
    return b.rating - a.rating;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="AIツール比較"
          description="社内で使用・評価済みのAIツールを一覧・比較できます。"
          icon="🛠️"
        />
        <Link
          href="/tools/new"
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
        >
          ＋ ツールを追加
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "登録ツール数", value: items.length, icon: "🛠️" },
          { label: "推奨ツール", value: items.filter((t) => t.status === "推奨").length, icon: "✅" },
          { label: "無料・フリーミアム", value: items.filter((t) => ["無料", "フリーミアム"].includes(t.pricing)).length, icon: "💰" },
          { label: "カテゴリ数", value: allCategories.length, icon: "📂" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <span className="text-xl">{s.icon}</span>
            <div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Suspense>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBox placeholder="ツールを検索..." />
            </div>
            {/* View toggle */}
            <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0">
              <Link
                href={`?${new URLSearchParams({ ...(q && { q }), ...(tag && { tag }), ...(category && { category }), view: "card" })}`}
                className={`px-3 py-2 text-sm font-medium transition-colors ${view !== "table" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                ☰ カード
              </Link>
              <Link
                href={`?${new URLSearchParams({ ...(q && { q }), ...(tag && { tag }), ...(category && { category }), view: "table" })}`}
                className={`px-3 py-2 text-sm font-medium transition-colors ${view === "table" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                ⊞ 比較表
              </Link>
            </div>
          </div>
          {allCategories.length > 0 && (
            <TagFilter allTags={allCategories} label="Category" paramKey="category" />
          )}
          {allTags.length > 0 && (
            <TagFilter allTags={allTags} label="Tag" />
          )}
        </div>
      </Suspense>

      {sorted.length === 0 ? (
        <EmptyState message="該当するツールが見つかりません。" />
      ) : view === "table" ? (
        // ===== Table View =====
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[1fr_120px_100px_100px_80px_160px] gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>ツール名</span>
              <span>カテゴリ</span>
              <span>料金</span>
              <span>ステータス</span>
              <span>評価</span>
              <span>推奨用途</span>
            </div>
            {sorted.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="grid grid-cols-[1fr_120px_100px_100px_80px_160px] gap-4 items-center px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{tool.title}</p>
                  {tool.description && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{tool.description}</p>
                  )}
                </div>
                <div>
                  <span className="text-sm">
                    {CATEGORY_ICONS[tool.category] ?? "🛠️"} {tool.category || "—"}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${PRICING_COLORS[tool.pricing] ?? "bg-slate-100 text-slate-600"}`}>
                    {tool.pricing || "—"}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[tool.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {tool.status || "未評価"}
                  </span>
                </div>
                <div>
                  {tool.rating > 0 ? <StarRating rating={tool.rating} /> : <span className="text-slate-300 text-sm">—</span>}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{tool.recommendedUse || "—"}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        // ===== Card View =====
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                    {CATEGORY_ICONS[tool.category] ?? "🛠️"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{tool.title}</p>
                    <p className="text-xs text-slate-500">{tool.category}</p>
                  </div>
                </div>
                <span className={`shrink-0 inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[tool.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {tool.status || "未評価"}
                </span>
              </div>

              {/* Description */}
              {tool.description && (
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{tool.description}</p>
              )}

              {/* Recommended use */}
              {tool.recommendedUse && (
                <div className="rounded-lg bg-slate-50 px-3 py-2 mb-3">
                  <p className="text-[11px] font-semibold text-slate-400 mb-0.5">推奨用途</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{tool.recommendedUse}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${PRICING_COLORS[tool.pricing] ?? "bg-slate-100 text-slate-600"}`}>
                    {tool.pricing || "—"}
                  </span>
                  {tool.url && (
                    <span className="text-xs text-blue-500">🔗 リンクあり</span>
                  )}
                </div>
                {tool.rating > 0 && <StarRating rating={tool.rating} />}
              </div>

              {tool.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {tool.tags.map((t) => (
                    <Tag key={t} label={t} />
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

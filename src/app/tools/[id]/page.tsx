import { notFound } from "next/navigation";
import Link from "next/link";
import { getAIToolById, getAITools } from "@/lib/notion";
import { Markdown } from "@/components/markdown";
import { Tag } from "@/components/card";

export const revalidate = 60;

export async function generateStaticParams() {
  const tools = await getAITools();
  return tools.map((t) => ({ id: t.id }));
}

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
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-lg ${i <= rating ? "text-amber-400" : "text-slate-200"}`}>
          ★
        </span>
      ))}
      <span className="ml-2 text-sm font-semibold text-slate-700">{rating} / 5</span>
    </div>
  );
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tool = await getAIToolById(id);
  if (!tool) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
      >
        ← AIツール一覧
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              {CATEGORY_ICONS[tool.category] ?? "🛠️"}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{tool.title}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{tool.category}</p>
            </div>
          </div>
          <span className={`shrink-0 inline-flex rounded-xl px-3 py-1 text-sm font-semibold ${STATUS_COLORS[tool.status] ?? "bg-slate-100 text-slate-600"}`}>
            {tool.status || "未評価"}
          </span>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">料金</p>
            <span className={`inline-flex rounded-lg px-2.5 py-1 text-sm font-semibold ${PRICING_COLORS[tool.pricing] ?? "bg-slate-100 text-slate-600"}`}>
              {tool.pricing || "—"}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">社内評価</p>
            {tool.rating > 0 ? (
              <StarRating rating={tool.rating} />
            ) : (
              <span className="text-sm text-slate-400">未評価</span>
            )}
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">アクセス</p>
            {tool.url ? (
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                🔗 開く →
              </a>
            ) : (
              <span className="text-sm text-slate-400">—</span>
            )}
          </div>
        </div>

        {/* Description */}
        {tool.description && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">概要</p>
            <div className="prose prose-sm max-w-none text-slate-700">
              <Markdown content={tool.description} />
            </div>
          </div>
        )}

        {/* Recommended use */}
        {tool.recommendedUse && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-5 mb-4">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">推奨用途</p>
            <div className="prose prose-sm max-w-none text-slate-700">
              <Markdown content={tool.recommendedUse} />
            </div>
          </div>
        )}

        {/* Tags */}
        {tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

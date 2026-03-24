import Link from "next/link";
import {
  getUseCases,
  getPrompts,
  getPlaybook,
  getFAQ,
  getEvents,
} from "@/lib/notion";
import { matchesQuery } from "@/lib/search";

export const revalidate = 60;

const SECTION_META = {
  usecase: { label: "Use Case", icon: "💡", color: "bg-blue-50 text-blue-700", href: "/use-cases" },
  prompt: { label: "Prompt", icon: "📝", color: "bg-purple-50 text-purple-700", href: "/prompts" },
  playbook: { label: "Playbook", icon: "📖", color: "bg-emerald-50 text-emerald-700", href: "/playbook" },
  faq: { label: "FAQ", icon: "❓", color: "bg-amber-50 text-amber-700", href: "/faq" },
  event: { label: "Event", icon: "📅", color: "bg-rose-50 text-rose-700", href: "/events" },
} as const;

type SectionKey = keyof typeof SECTION_META;

type SearchResult = {
  id: string;
  type: SectionKey;
  title: string;
  excerpt: string;
  tags: string[];
  href: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  // Fetch all content in parallel
  const [useCases, prompts, playbook, faq, events] = await Promise.all([
    getUseCases(),
    getPrompts(),
    getPlaybook(),
    getFAQ(),
    getEvents(),
  ]);

  const results: SearchResult[] = [];

  if (query) {
    for (const uc of useCases) {
      if (matchesQuery(query, uc.title, uc.description, uc.team, uc.category, uc.tool, uc.tags)) {
        results.push({
          id: uc.id,
          type: "usecase",
          title: uc.title,
          excerpt: uc.description
            ? uc.description.slice(0, 120)
            : `${uc.team} / ${uc.category} / ${uc.tool}`,
          tags: uc.tags,
          href: `/use-cases/${uc.id}`,
        });
      }
    }

    for (const p of prompts) {
      if (matchesQuery(query, p.title, p.purpose, p.promptText, p.tags)) {
        results.push({
          id: p.id,
          type: "prompt",
          title: p.title,
          excerpt: p.purpose || p.promptText.slice(0, 120),
          tags: p.tags,
          href: `/prompts/${p.id}`,
        });
      }
    }

    for (const pb of playbook) {
      if (matchesQuery(query, pb.title, pb.section, pb.body, pb.tags)) {
        results.push({
          id: pb.id,
          type: "playbook",
          title: pb.title,
          excerpt: pb.section ? `${pb.section} — ${pb.body.slice(0, 100)}` : pb.body.slice(0, 120),
          tags: pb.tags,
          href: `/playbook/${pb.id}`,
        });
      }
    }

    for (const f of faq) {
      if (matchesQuery(query, f.question, f.answer, f.tags)) {
        results.push({
          id: f.id,
          type: "faq",
          title: f.question,
          excerpt: f.answer.slice(0, 120),
          tags: f.tags,
          href: `/faq`,
        });
      }
    }

    for (const ev of events) {
      if (matchesQuery(query, ev.title, ev.body, ev.tags)) {
        results.push({
          id: ev.id,
          type: "event",
          title: ev.title,
          excerpt: ev.date ? `${ev.date} — ${ev.body.slice(0, 100)}` : ev.body.slice(0, 120),
          tags: ev.tags,
          href: `/events`,
        });
      }
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">横断検索</h1>
        <p className="text-sm text-slate-500">
          全セクション（ユースケース・プロンプト・プレイブック・FAQ・イベント）を横断検索します
        </p>
      </div>

      {/* Search form */}
      <form method="get" action="/search">
        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="キーワードを入力..."
            autoFocus
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            検索
          </button>
        </div>
      </form>

      {/* Results */}
      {query && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            「{query}」の検索結果 — {results.length}件
          </p>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-slate-600 font-medium">該当するコンテンツが見つかりませんでした</p>
              <p className="text-sm text-slate-400 mt-1">別のキーワードで試してみてください</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => {
                const meta = SECTION_META[r.type];
                return (
                  <Link
                    key={`${r.type}-${r.id}`}
                    href={r.href}
                    className="block rounded-2xl border border-slate-200 bg-white px-6 py-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base mt-0.5">
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${meta.color}`}>
                            {meta.label}
                          </span>
                          {r.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {r.title}
                        </p>
                        {r.excerpt && (
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                            {r.excerpt}
                          </p>
                        )}
                      </div>
                      <span className="text-slate-300 group-hover:text-blue-400 transition-colors mt-1">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state when no query */}
      {!query && (
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-600 font-medium">検索キーワードを入力してください</p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {["Claude", "プロンプト", "セキュリティ", "効率化", "自動化"].map((kw) => (
              <Link
                key={kw}
                href={`/search?q=${encodeURIComponent(kw)}`}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
              >
                {kw}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

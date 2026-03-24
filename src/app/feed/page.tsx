import { getUseCases, getPlaybook, getPrompts, getEvents, getFAQ } from "@/lib/notion";
import { ActivityFeed, type FeedItem } from "@/components/feed";

export const revalidate = 60;

const TYPE_LABELS = {
  all: "すべて",
  usecase: "Use Case",
  prompt: "Prompt",
  playbook: "Playbook",
  faq: "FAQ",
  event: "Event",
} as const;

type FilterType = keyof typeof TYPE_LABELS;

export default async function FeedPage(props: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type = "all" } = await props.searchParams;
  const activeType = (Object.keys(TYPE_LABELS).includes(type) ? type : "all") as FilterType;

  const [useCases, playbook, prompts, events, faq] = await Promise.all([
    getUseCases(),
    getPlaybook(),
    getPrompts(),
    getEvents(),
    getFAQ(),
  ]);

  const allItems: FeedItem[] = [
    ...useCases.map((u): FeedItem => ({
      id: u.id, type: "usecase", title: u.title,
      excerpt: u.description || undefined,
      tags: u.tags, updatedAt: u.updatedAt,
      href: `/use-cases/${u.id}`,
      meta: [u.team, u.category].filter(Boolean).join(" / ") || undefined,
      author: u.author || undefined,
    })),
    ...prompts.map((p): FeedItem => ({
      id: p.id, type: "prompt", title: p.title,
      excerpt: p.purpose || undefined,
      tags: p.tags, updatedAt: p.updatedAt,
      href: `/prompts/${p.id}`,
      author: p.author || undefined,
    })),
    ...playbook.map((p): FeedItem => ({
      id: p.id, type: "playbook", title: p.title,
      excerpt: p.section || undefined,
      tags: p.tags, updatedAt: p.updatedAt,
      href: `/playbook/${p.id}`,
      meta: p.section || undefined,
      author: p.author || undefined,
    })),
    ...faq.map((f): FeedItem => ({
      id: f.id, type: "faq", title: f.question,
      tags: f.tags, updatedAt: f.updatedAt,
      href: `/faq`,
      author: f.author || undefined,
    })),
    ...events.map((e): FeedItem => ({
      id: e.id, type: "event", title: e.title,
      tags: e.tags, updatedAt: e.updatedAt || e.date,
      href: `/events`,
      meta: e.date || undefined,
      author: e.author || undefined,
    })),
  ]
    .filter((item) => item.updatedAt)
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));

  const filtered = activeType === "all"
    ? allItems
    : allItems.filter((item) => item.type === activeType);

  // Count per type
  const counts: Record<string, number> = { all: allItems.length };
  for (const item of allItems) {
    counts[item.type] = (counts[item.type] ?? 0) + 1;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">更新フィード</h1>
        <p className="text-sm text-slate-500 mt-1">
          全セクションの最新コンテンツをまとめて確認できます
        </p>
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(TYPE_LABELS) as [FilterType, string][]).map(([key, label]) => (
          <a
            key={key}
            href={key === "all" ? "/feed" : `/feed?type=${key}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeType === key
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
              activeType === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {counts[key] ?? 0}
            </span>
          </a>
        ))}
      </div>

      {/* Feed */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2">
        <ActivityFeed items={filtered} grouped />
      </div>
    </div>
  );
}

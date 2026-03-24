import Link from "next/link";
import { Tag, AuthorChip } from "@/components/card";

export type FeedItem = {
  id: string;
  type: "usecase" | "prompt" | "playbook" | "faq" | "event";
  title: string;
  excerpt?: string;
  tags: string[];
  updatedAt: string;
  href: string;
  meta?: string;
  author?: string;
};

const TYPE_CONFIG = {
  usecase: { label: "Use Case", icon: "💡", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  prompt: { label: "Prompt", icon: "📝", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  playbook: { label: "Playbook", icon: "📖", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  faq: { label: "FAQ", icon: "❓", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  event: { label: "Event", icon: "📅", color: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
} as const;

function relativeTime(isoStr: string): string {
  if (!isoStr) return "";
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}週間前`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}ヶ月前`;
  return `${Math.floor(diffMonths / 12)}年前`;
}

function formatDate(isoStr: string): string {
  if (!isoStr) return "";
  return isoStr.slice(0, 10).replace(/-/g, "/");
}

// Group feed items by relative date label
function groupByDate(items: FeedItem[]): { label: string; items: FeedItem[] }[] {
  const groups = new Map<string, FeedItem[]>();
  for (const item of items) {
    const label = relativeTime(item.updatedAt) || "日付不明";
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }
  return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

export function ActivityFeed({
  items,
  grouped = false,
}: {
  items: FeedItem[];
  grouped?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <span className="text-3xl mb-2">📭</span>
        <p className="text-sm">更新情報がありません</p>
      </div>
    );
  }

  if (grouped) {
    const dateGroups = groupByDate(items);
    return (
      <div className="space-y-8">
        {dateGroups.map(({ label, items: groupItems }) => (
          <div key={label}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {label}
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <FeedList items={groupItems} />
          </div>
        ))}
      </div>
    );
  }

  return <FeedList items={items} />;
}

function FeedList({ items }: { items: FeedItem[] }) {
  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" aria-hidden />

      <div className="space-y-1">
        {items.map((item) => {
          const cfg = TYPE_CONFIG[item.type];
          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              className="group flex items-start gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 transition-colors"
            >
              {/* Timeline dot */}
              <div className="relative flex shrink-0 flex-col items-center pt-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${cfg.dot}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
                      <span>{cfg.icon}</span>
                      {cfg.label}
                    </span>
                    {item.meta && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">{item.meta}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {item.title}
                </p>

                {item.excerpt && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.excerpt}</p>
                )}

                <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((t) => (
                        <Tag key={t} label={t} />
                      ))}
                    </div>
                  )}
                  {item.author && <AuthorChip name={item.author} />}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

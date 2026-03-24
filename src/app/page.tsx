import Link from "next/link";
import { getUseCases, getPlaybook, getPrompts, getEvents, getFAQ } from "@/lib/notion";
import { Card, Tag, Badge, MetricCard } from "@/components/card";
import { ActivityFeed, type FeedItem } from "@/components/feed";

export const revalidate = 60;

const SECTIONS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", desc: "削減時間の実績", color: "from-slate-700 to-slate-900" },
  { href: "/tools", label: "Tools", icon: "🛠️", desc: "AIツール比較・一覧", color: "from-cyan-500 to-cyan-600" },
  { href: "/playbook", label: "Playbook", icon: "📖", desc: "AI利用ガイド・社内ポリシー", color: "from-blue-500 to-blue-600" },
  { href: "/use-cases", label: "Use Cases", icon: "💡", desc: "部署別AI活用事例", color: "from-emerald-500 to-emerald-600" },
  { href: "/prompts", label: "Prompts", icon: "📝", desc: "プロンプトライブラリ", color: "from-purple-500 to-purple-600" },
  { href: "/faq", label: "FAQ", icon: "❓", desc: "よくある質問", color: "from-amber-500 to-amber-600" },
  { href: "/events", label: "Events", icon: "📅", desc: "勉強会・イベント情報", color: "from-rose-500 to-rose-600" },
] as const;

export default async function Home() {
  const [useCases, playbook, prompts, events, faq] = await Promise.all([
    getUseCases(),
    getPlaybook(),
    getPrompts(),
    getEvents(),
    getFAQ(),
  ]);

  const feedItems: FeedItem[] = [
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

  const recentFeed = feedItems.slice(0, 8);

  const popularUseCases = [...useCases]
    .sort((a, b) => b.impactMinutesSaved - a.impactMinutesSaved)
    .slice(0, 3);

  const upcomingEvents = [...events]
    .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 3);

  const totalMinutesSaved = useCases.reduce(
    (sum, uc) => sum + uc.impactMinutesSaved,
    0,
  );

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-10 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative">
          <p className="text-sm font-medium text-blue-300 uppercase tracking-wider mb-2">
            Internal AI Hub
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            HERALBONY AI Portal
          </h1>
          <p className="mt-3 text-2xl font-bold text-white/90 tracking-tight">
            AI / HAPPINESS
          </p>
          <p className="mt-2 max-w-xl text-lg text-blue-200/90 leading-relaxed">
            まず触ってみる、対話しながら考える。AIは特別なツールじゃなく、日々の仕事のそばにある存在です。社内のAI活用情報をひとつに集約。ガイド・事例・プロンプト・FAQをすぐに検索できます。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-blue-50 transition-colors shadow-lg"
            >
              📊 削減実績を見る
            </Link>
            <Link
              href="/use-cases"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              💡 活用事例を見る
            </Link>
            <Link
              href="/prompts"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              📝 プロンプトを探す
            </Link>
          </div>
        </div>
      </section>

      {/* AI / HAPPINESS Image */}
      <section className="w-full rounded-2xl overflow-hidden">
        <img src="/横長16_9.jpg" alt="AI / HAPPINESS" className="w-full object-cover" />
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard value={useCases.length} label="活用事例" icon="💡" />
        <MetricCard value={prompts.length} label="プロンプト" icon="📝" />
        <MetricCard
          value={totalMinutesSaved > 0 ? `${totalMinutesSaved}min` : "—"}
          label="合計削減時間"
          icon="⏱️"
        />
        <MetricCard value={feedItems.length} label="総コンテンツ数" icon="📚" />
      </section>

      {/* Section Navigation */}
      <section>
        <h2 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-wider">
          Explore
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="group">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200">
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-xl shadow-sm`}>
                  {s.icon}
                </div>
                <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
                <p className="mt-1 text-xs text-slate-400">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Activity Feed */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            最近の更新
          </h2>
          <Link
            href="/feed"
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            すべて見る →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2">
          <ActivityFeed items={recentFeed} />
        </div>
      </section>

      {/* Popular Use Cases */}
      {popularUseCases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Popular Use Cases
            </h2>
            <Link
              href="/use-cases"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularUseCases.map((uc) => (
              <Card key={uc.id} href={`/use-cases/${uc.id}`}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-lg">
                    💡
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 leading-snug">
                      {uc.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                      {uc.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {uc.team && <Badge variant="blue">{uc.team}</Badge>}
                  {uc.tool && <Badge variant="purple">{uc.tool}</Badge>}
                  {uc.impactMinutesSaved > 0 && (
                    <Badge variant="green">-{uc.impactMinutesSaved}min</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Upcoming Events
            </h2>
            <Link
              href="/events"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((e) => (
              <Card key={e.id}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center rounded-lg bg-blue-50 px-3 py-2 min-w-[56px]">
                    <span className="text-xs font-bold text-blue-600">
                      {e.date.slice(5, 7)}/{e.date.slice(8, 10)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 leading-snug">
                      {e.title}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.tags.map((t) => (
                        <Tag key={t} label={t} />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

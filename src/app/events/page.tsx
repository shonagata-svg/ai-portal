import { Suspense } from "react";
import Link from "next/link";
import { getEvents } from "@/lib/notion";
import { extractTags, matchesQuery } from "@/lib/search";
import { Card, Tag, PageHeader, EmptyState } from "@/components/card";
import { Markdown } from "@/components/markdown";
import { SearchBox, TagFilter } from "@/components/search-filter";

export const revalidate = 60;

export default async function EventsPage(props: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const searchParams = await props.searchParams;
  const items = await getEvents();
  const allTags = extractTags(items);

  const q = searchParams.q ?? "";
  const tag = searchParams.tag ?? "";

  const today = new Date().toISOString().slice(0, 10);

  const matchFilter = (e: (typeof items)[0]) => {
    if (tag && !e.tags.includes(tag)) return false;
    return matchesQuery(q, e.title, e.body, e.tags);
  };

  const upcoming = items
    .filter((e) => matchFilter(e) && e.date >= today)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const past = items
    .filter((e) => matchFilter(e) && e.date < today)
    .sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Events"
          description="勉強会・共有会・投稿募集"
          icon="📅"
        />
        <Link
          href="/events/new"
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
        >
          ＋ 新規作成
        </Link>
      </div>
      <Suspense>
        <div className="space-y-4">
          <SearchBox placeholder="イベントを検索..." />
          <TagFilter allTags={allTags} label="Tag" />
        </div>
      </Suspense>

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-wider">
            Upcoming
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <Card key={e.id} className="border-l-4 border-l-blue-500">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center rounded-xl bg-blue-50 px-3 py-2 min-w-[56px]">
                    <span className="text-lg font-bold text-blue-600">
                      {e.date.slice(8, 10)}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-400 uppercase">
                      {new Date(e.date).toLocaleString("en", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 leading-snug">
                      {e.title}
                    </p>
                    {e.body && (
                      <div className="mt-2 text-sm text-slate-500 line-clamp-3">
                        <Markdown content={e.body} />
                      </div>
                    )}
                    {e.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {e.tags.map((t) => (
                          <Tag key={t} label={t} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-bold text-slate-500 uppercase tracking-wider">
            Past Events
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => (
              <Card key={e.id} className="opacity-60">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center rounded-xl bg-slate-100 px-3 py-2 min-w-[56px]">
                    <span className="text-lg font-bold text-slate-500">
                      {e.date.slice(8, 10)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {new Date(e.date).toLocaleString("en", { month: "short" })}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{e.title}</p>
                    {e.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {e.tags.map((t) => (
                          <Tag key={t} label={t} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <EmptyState message="イベントが見つかりません。" />
      )}
    </div>
  );
}

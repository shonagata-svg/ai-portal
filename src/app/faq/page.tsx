import { Suspense } from "react";
import Link from "next/link";
import { getFAQ } from "@/lib/notion";
import { extractTags, matchesQuery } from "@/lib/search";
import { Tag, PageHeader, EmptyState } from "@/components/card";
import { Markdown } from "@/components/markdown";
import { SearchBox, TagFilter } from "@/components/search-filter";

export const revalidate = 60;

export default async function FAQPage(props: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const searchParams = await props.searchParams;
  const items = await getFAQ();
  const allTags = extractTags(items);

  const q = searchParams.q ?? "";
  const tag = searchParams.tag ?? "";

  const filtered = items.filter((item) => {
    if (tag && !item.tags.includes(tag)) return false;
    return matchesQuery(q, item.question, item.answer, item.tags);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="FAQ"
          description="AI活用に関するよくある質問"
          icon="❓"
        />
        <Link
          href="/faq/new"
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
        >
          ＋ 新規作成
        </Link>
      </div>
      <Suspense>
        <div className="space-y-4">
          <SearchBox placeholder="質問を検索..." />
          <TagFilter allTags={allTags} label="Tag" />
        </div>
      </Suspense>

      {filtered.length === 0 ? (
        <EmptyState message="該当するFAQが見つかりません。" />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <details
              key={item.id}
              className="group rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <summary className="flex items-center gap-3 cursor-pointer px-6 py-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-sm group-open:bg-amber-100 transition-colors">
                  ❓
                </span>
                <span className="flex-1">{item.question}</span>
                <span className="text-slate-400 text-xs group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-5 pl-[4.25rem]">
                <Markdown content={item.answer} />
                {item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.tags.map((t) => (
                      <Tag key={t} label={t} />
                    ))}
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { getPrompts } from "@/lib/notion";
import { extractTags, extractValues, matchesQuery } from "@/lib/search";
import { Card, Tag, Badge, PageHeader, EmptyState } from "@/components/card";
import { SearchBox, TagFilter } from "@/components/search-filter";
import { CopyButton } from "@/components/copy-button";

export const revalidate = 60;

export default async function PromptsPage(props: {
  searchParams: Promise<{ q?: string; tag?: string; purpose?: string }>;
}) {
  const searchParams = await props.searchParams;
  const items = await getPrompts();
  const allTags = extractTags(items);
  const allPurposes = extractValues(items, "purpose");

  const q = searchParams.q ?? "";
  const tag = searchParams.tag ?? "";
  const purpose = searchParams.purpose ?? "";

  const filtered = items.filter((item) => {
    if (tag && !item.tags.includes(tag)) return false;
    if (purpose && item.purpose !== purpose) return false;
    return matchesQuery(q, item.title, item.promptText, item.purpose, item.tags);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Prompt Library"
          description="用途別プロンプト集。クリックして詳細を確認、コピーしてすぐ使えます。"
          icon="📝"
        />
        <Link
          href="/prompts/new"
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
        >
          ＋ 新規作成
        </Link>
      </div>
      <Suspense>
        <div className="space-y-4">
          <SearchBox placeholder="プロンプトを検索..." />
          <div className="flex flex-wrap gap-4">
            <TagFilter allTags={allTags} label="Tag" />
          </div>
          {allPurposes.length > 0 && (
            <TagFilter allTags={allPurposes} label="Purpose" paramKey="purpose" />
          )}
        </div>
      </Suspense>

      {filtered.length === 0 ? (
        <EmptyState message="該当するプロンプトが見つかりません。" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} href={`/prompts/${p.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-lg">
                    📝
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 leading-snug">
                      {p.title}
                    </p>
                    {p.purpose && (
                      <p className="mt-1 text-xs text-purple-600 font-medium">
                        {p.purpose}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500 line-clamp-3 font-mono">
                  {p.promptText}
                </p>
              </div>
              {p.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <Tag key={t} label={t} />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

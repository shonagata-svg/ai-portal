import { Suspense } from "react";
import Link from "next/link";
import { getPlaybook } from "@/lib/notion";
import { extractTags, extractValues, matchesQuery } from "@/lib/search";
import { Card, Tag, Badge, PageHeader, EmptyState } from "@/components/card";
import { Markdown } from "@/components/markdown";
import { SearchBox, TagFilter } from "@/components/search-filter";

export const revalidate = 60;

export default async function PlaybookPage(props: {
  searchParams: Promise<{ q?: string; tag?: string; section?: string }>;
}) {
  const searchParams = await props.searchParams;
  const items = await getPlaybook();
  const allTags = extractTags(items);
  const allSections = extractValues(items, "section");
  const q = searchParams.q ?? "";
  const tag = searchParams.tag ?? "";
  const section = searchParams.section ?? "";

  const filtered = items.filter((item) => {
    if (tag && !item.tags.includes(tag)) return false;
    if (section && item.section !== section) return false;
    return matchesQuery(q, item.title, item.body, item.tags);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Playbook"
          description="AI利用ガイド・ルール・セキュリティ・社内ポリシー"
          icon="📖"
        />
        <Link
          href="/playbook/new"
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
        >
          ＋ 新規作成
        </Link>
      </div>
      <Suspense>
        <div className="space-y-4">
          <SearchBox placeholder="ガイドを検索..." />
          <div className="flex flex-wrap gap-4">
            <TagFilter allTags={allTags} label="Tag" />
          </div>
          {allSections.length > 0 && (
            <TagFilter allTags={allSections} label="Section" paramKey="section" />
          )}
        </div>
      </Suspense>

      {filtered.length === 0 ? (
        <EmptyState message="該当するガイドが見つかりません。" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <Card key={item.id} href={`/playbook/${item.id}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                  📖
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 leading-snug">
                    {item.title}
                  </p>
                  {item.section && (
                    <Badge variant="blue">{item.section}</Badge>
                  )}
                  <div className="mt-2 text-sm text-slate-500 line-clamp-3">
                    <Markdown content={item.body} />
                  </div>
                </div>
              </div>
              {item.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
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

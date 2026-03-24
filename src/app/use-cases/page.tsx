import { Suspense } from "react";
import Link from "next/link";
import { getUseCases } from "@/lib/notion";
import { extractTags, extractValues, matchesQuery } from "@/lib/search";
import { Card, Tag, Badge, PageHeader, EmptyState, AuthorChip } from "@/components/card";
import { SearchBox, TagFilter } from "@/components/search-filter";

export const revalidate = 60;

export default async function UseCasesPage(props: {
  searchParams: Promise<{ q?: string; tag?: string; team?: string; category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const items = await getUseCases();
  const allTags = extractTags(items);
  const allTeams = extractValues(items, "team");
  const allCategories = extractValues(items, "category");

  const q = searchParams.q ?? "";
  const tag = searchParams.tag ?? "";
  const team = searchParams.team ?? "";
  const category = searchParams.category ?? "";

  const filtered = items.filter((item) => {
    if (tag && !item.tags.includes(tag)) return false;
    if (team && item.team !== team) return false;
    if (category && item.category !== category) return false;
    return matchesQuery(q, item.title, item.description, item.prompt, item.tool, item.tags);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Use Cases"
          description="社内のAI活用事例を一覧で閲覧できます。クリックして詳細を確認。"
          icon="💡"
        />
        <Link
          href="/use-cases/new"
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
        >
          ＋ 新規作成
        </Link>
      </div>

      <Suspense>
        <div className="space-y-4">
          <SearchBox placeholder="事例を検索..." />
          <div className="flex flex-wrap gap-4">
            <TagFilter allTags={allTags} label="Tag" />
          </div>
          {allTeams.length > 0 && (
            <TagFilter allTags={allTeams} label="Team" paramKey="team" />
          )}
          {allCategories.length > 0 && (
            <TagFilter allTags={allCategories} label="Category" paramKey="category" />
          )}
        </div>
      </Suspense>

      {filtered.length === 0 ? (
        <EmptyState message="該当する事例が見つかりません。" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((uc) => (
            <Card key={uc.id} href={`/use-cases/${uc.id}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                  💡
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 leading-snug line-clamp-2">
                    {uc.title}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
                    {uc.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {uc.team && <Badge variant="blue">{uc.team}</Badge>}
                {uc.category && <Badge variant="purple">{uc.category}</Badge>}
                {uc.tool && <Badge variant="amber">{uc.tool}</Badge>}
                {uc.impactMinutesSaved > 0 && (
                  <Badge variant="green">-{uc.impactMinutesSaved}min</Badge>
                )}
              </div>
              {uc.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {uc.tags.map((t) => (
                    <Tag key={t} label={t} />
                  ))}
                </div>
              )}
              {uc.author && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <AuthorChip name={uc.author} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

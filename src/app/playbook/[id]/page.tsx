import { notFound } from "next/navigation";
import { getPlaybookById, getPlaybook } from "@/lib/notion";
import { Tag, Badge, PageHeader } from "@/components/card";
import { Markdown } from "@/components/markdown";

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await getPlaybook();
  return items.map((i) => ({ id: i.id }));
}

export default async function PlaybookDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const item = await getPlaybookById(id);
  if (!item) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={item.title}
        backHref="/playbook"
        backLabel="Playbook"
      />

      {item.section && (
        <div className="mb-8">
          <Badge variant="blue">{item.section}</Badge>
        </div>
      )}

      <section className="mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <Markdown content={item.body} />
        </div>
      </section>

      {item.tags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
            タグ
          </h2>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        </section>
      )}

      {item.updatedAt && (
        <p className="text-xs text-slate-400">
          最終更新: {item.updatedAt.slice(0, 10)}
        </p>
      )}
    </div>
  );
}

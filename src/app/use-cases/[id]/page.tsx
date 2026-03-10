import { notFound } from "next/navigation";
import { getUseCaseById, getUseCases } from "@/lib/notion";
import { Tag, Badge, PageHeader } from "@/components/card";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await getUseCases();
  return items.map((i) => ({ id: i.id }));
}

export default async function UseCaseDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const item = await getUseCaseById(id);
  if (!item) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={item.title}
        backHref="/use-cases"
        backLabel="Use Cases"
      />

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 mb-8">
        {item.team && <Badge variant="blue">{item.team}</Badge>}
        {item.category && <Badge variant="purple">{item.category}</Badge>}
        {item.tool && <Badge variant="amber">{item.tool}</Badge>}
        {item.impactMinutesSaved > 0 && (
          <Badge variant="green">削減効果: {item.impactMinutesSaved}分/タスク</Badge>
        )}
      </div>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          概要
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <Markdown content={item.description} />
        </div>
      </section>

      {/* Prompt */}
      {item.prompt && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              使用プロンプト
            </h2>
            <CopyButton text={item.prompt} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-[inherit]">
              {item.prompt}
            </pre>
          </div>
        </section>
      )}

      {/* Impact */}
      {item.impactMinutesSaved > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
            効果
          </h2>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">⏱️</span>
              <div>
                <p className="text-2xl font-bold text-emerald-700">
                  {item.impactMinutesSaved}分
                </p>
                <p className="text-sm text-emerald-600">
                  1タスクあたりの削減時間
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tags */}
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

      {/* Updated at */}
      {item.updatedAt && (
        <p className="text-xs text-slate-400">
          最終更新: {item.updatedAt.slice(0, 10)}
        </p>
      )}
    </div>
  );
}

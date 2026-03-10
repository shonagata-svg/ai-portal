import { notFound } from "next/navigation";
import { getPromptById, getPrompts } from "@/lib/notion";
import { Tag, Badge, PageHeader } from "@/components/card";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await getPrompts();
  return items.map((i) => ({ id: i.id }));
}

export default async function PromptDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const item = await getPromptById(id);
  if (!item) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={item.title}
        backHref="/prompts"
        backLabel="Prompts"
      />

      {item.purpose && (
        <div className="mb-8">
          <Badge variant="purple">{item.purpose}</Badge>
        </div>
      )}

      {/* Prompt text */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            プロンプト
          </h2>
          <CopyButton text={item.promptText} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6">
          <pre className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed font-mono">
            {item.promptText}
          </pre>
        </div>
      </section>

      {/* Example output */}
      {item.example && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
            出力例
          </h2>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <Markdown content={item.example} />
          </div>
        </section>
      )}

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

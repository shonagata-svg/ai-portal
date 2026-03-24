import { DEPARTMENTS } from "@/lib/departments";
import { createUseCaseAction } from "@/lib/actions";
import {
  FormWrapper,
  TextInput,
  TextArea,
  SelectInput,
  NumberInput,
  TagInput,
} from "@/components/form-field";
import { MarkdownTextArea } from "@/components/markdown-textarea";

export default function NewUseCasePage() {
  const teamOptions = DEPARTMENTS.map((d) => d.name);

  return (
    <FormWrapper
      title="Use Case を登録"
      icon="💡"
      backHref="/use-cases"
      action={createUseCaseAction}
    >
      <TextInput label="タイトル" name="title" required placeholder="例: 議事録の自動要約" />
      <SelectInput label="部門" name="team" options={teamOptions} />
      <SelectInput
        label="カテゴリ"
        name="category"
        options={["文書作成", "データ分析", "コード生成", "リサーチ", "翻訳", "その他"]}
      />
      <SelectInput
        label="ツール"
        name="tool"
        options={["ChatGPT", "Claude", "Copilot", "Gemini", "その他"]}
      />
      <NumberInput
        label="削減時間（分/タスク）"
        name="impactMinutesSaved"
        min={0}
        placeholder="例: 30"
      />
      <MarkdownTextArea
        label="説明"
        name="description"
        placeholder="活用事例の概要を記述..."
      />
      <TextArea
        label="プロンプト"
        name="prompt"
        rows={6}
        placeholder="使用しているプロンプトを貼り付け..."
      />
      <TagInput label="タグ" name="tags" />
      <TextInput label="投稿者名" name="author" placeholder="例: 山田 太郎" hint="任意。カードに表示されます。" />
    </FormWrapper>
  );
}

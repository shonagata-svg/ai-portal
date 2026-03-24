import { FormWrapper, TextInput, TextArea, SelectInput, NumberInput, TagInput } from "@/components/form-field";
import { createAIToolAction } from "@/lib/actions";

const CATEGORIES = ["文章生成", "画像生成", "コード支援", "データ分析", "音声・動画", "翻訳", "検索", "その他"];
const PRICING_OPTIONS = ["無料", "フリーミアム", "有料", "要問い合わせ"];
const STATUS_OPTIONS = ["推奨", "試験中", "未評価", "非推奨"];

export default function NewToolPage() {
  return (
    <FormWrapper
      title="AIツールを追加"
      icon="🛠️"
      backHref="/tools"
      action={createAIToolAction}
    >
      <TextInput label="ツール名" name="title" required placeholder="例: Claude, ChatGPT, Midjourney" />
      <SelectInput label="カテゴリ" name="category" options={CATEGORIES} />
      <TextArea
        label="概要"
        name="description"
        rows={3}
        placeholder="ツールの概要・特徴を入力してください"
      />
      <TextArea
        label="推奨用途"
        name="recommendedUse"
        rows={3}
        placeholder="社内でどのように使うと効果的か記入してください"
      />
      <div className="grid grid-cols-2 gap-4">
        <SelectInput label="料金体系" name="pricing" options={PRICING_OPTIONS} />
        <SelectInput label="ステータス" name="status" options={STATUS_OPTIONS} />
      </div>
      <NumberInput
        label="社内評価（1〜5）"
        name="rating"
        min={1}
        placeholder="1〜5の数値"
      />
      <TextInput
        label="URL"
        name="url"
        placeholder="https://..."
      />
      <TagInput label="タグ" name="tags" />
    </FormWrapper>
  );
}

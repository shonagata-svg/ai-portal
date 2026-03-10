import { createPromptAction } from "@/lib/actions";
import {
  FormWrapper,
  TextInput,
  TextArea,
  SelectInput,
  TagInput,
} from "@/components/form-field";

export default function NewPromptPage() {
  return (
    <FormWrapper
      title="Prompt を登録"
      icon="📝"
      backHref="/prompts"
      action={createPromptAction}
    >
      <TextInput label="タイトル" name="title" required placeholder="例: メール返信テンプレート" />
      <SelectInput
        label="用途"
        name="purpose"
        options={["文書作成", "要約", "翻訳", "分析", "コード", "その他"]}
      />
      <TextArea
        label="プロンプト本文"
        name="promptText"
        rows={8}
        placeholder="プロンプトの内容を記述..."
      />
      <TextArea
        label="使用例"
        name="example"
        rows={4}
        placeholder="実際の入出力例を記述..."
      />
      <TagInput label="タグ" name="tags" />
    </FormWrapper>
  );
}

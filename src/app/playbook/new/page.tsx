import { createPlaybookAction } from "@/lib/actions";
import {
  FormWrapper,
  TextInput,
  SelectInput,
  TagInput,
} from "@/components/form-field";
import { MarkdownTextArea } from "@/components/markdown-textarea";

export default function NewPlaybookPage() {
  return (
    <FormWrapper
      title="Playbook を登録"
      icon="📖"
      backHref="/playbook"
      action={createPlaybookAction}
    >
      <TextInput label="タイトル" name="title" required placeholder="例: AI利用時のセキュリティガイド" />
      <SelectInput
        label="セクション"
        name="section"
        options={["ガイドライン", "セキュリティ", "ポリシー", "Tips", "その他"]}
      />
      <MarkdownTextArea
        label="本文"
        name="body"
        rows={10}
        placeholder="ガイドの内容を記述..."
      />
      <TagInput label="タグ" name="tags" />
      <TextInput label="投稿者名" name="author" placeholder="例: 山田 太郎" hint="任意。カードに表示されます。" />
    </FormWrapper>
  );
}

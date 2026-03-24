import { createFAQAction } from "@/lib/actions";
import {
  FormWrapper,
  TextInput,
  TagInput,
} from "@/components/form-field";
import { MarkdownTextArea } from "@/components/markdown-textarea";

export default function NewFAQPage() {
  return (
    <FormWrapper
      title="FAQ を登録"
      icon="❓"
      backHref="/faq"
      action={createFAQAction}
    >
      <TextInput label="質問" name="question" required placeholder="例: 社外秘の情報をAIに入力していい？" />
      <MarkdownTextArea
        label="回答"
        name="answer"
        rows={6}
        placeholder="質問に対する回答を記述..."
      />
      <TagInput label="タグ" name="tags" />
      <TextInput label="投稿者名" name="author" placeholder="例: 山田 太郎" hint="任意。カードに表示されます。" />
    </FormWrapper>
  );
}

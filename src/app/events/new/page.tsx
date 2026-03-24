import { createEventAction } from "@/lib/actions";
import {
  FormWrapper,
  TextInput,
  DateInput,
  TagInput,
} from "@/components/form-field";
import { MarkdownTextArea } from "@/components/markdown-textarea";

export default function NewEventPage() {
  return (
    <FormWrapper
      title="Event を登録"
      icon="📅"
      backHref="/events"
      action={createEventAction}
    >
      <TextInput label="タイトル" name="title" required placeholder="例: AI活用勉強会 #5" />
      <DateInput label="日付" name="date" />
      <MarkdownTextArea
        label="本文"
        name="body"
        rows={6}
        placeholder="イベントの詳細を記述..."
      />
      <TagInput label="タグ" name="tags" />
      <TextInput label="投稿者名" name="author" placeholder="例: 山田 太郎" hint="任意。カードに表示されます。" />
    </FormWrapper>
  );
}

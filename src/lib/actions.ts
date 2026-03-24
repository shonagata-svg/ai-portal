"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createUseCase,
  createPrompt,
  createPlaybookEntry,
  createFAQEntry,
  createEvent,
  createAITool,
} from "./notion";
import { notifySlack } from "./slack";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// ---------- Use Case ----------

export async function createUseCaseAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("タイトルは必須です");

  const team = (formData.get("team") as string)?.trim() ?? "";
  const category = (formData.get("category") as string)?.trim() ?? "";
  const tags = parseTags((formData.get("tags") as string) ?? "");

  const page = await createUseCase({
    title,
    team,
    category,
    tool: (formData.get("tool") as string)?.trim() ?? "",
    impactMinutesSaved: Number(formData.get("impactMinutesSaved")) || 0,
    description: (formData.get("description") as string)?.trim() ?? "",
    prompt: (formData.get("prompt") as string)?.trim() ?? "",
    tags,
    author: (formData.get("author") as string)?.trim() ?? "",
  });

  await notifySlack({
    type: "usecase",
    title,
    tags,
    meta: [team, category].filter(Boolean).join(" / ") || undefined,
    href: `/use-cases/${page.id}`,
  });

  revalidatePath("/use-cases");
  redirect("/use-cases");
}

// ---------- Prompt ----------

export async function createPromptAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("タイトルは必須です");

  const purpose = (formData.get("purpose") as string)?.trim() ?? "";
  const tags = parseTags((formData.get("tags") as string) ?? "");

  const page = await createPrompt({
    title,
    purpose,
    promptText: (formData.get("promptText") as string)?.trim() ?? "",
    example: (formData.get("example") as string)?.trim() ?? "",
    tags,
    author: (formData.get("author") as string)?.trim() ?? "",
  });

  await notifySlack({
    type: "prompt",
    title,
    tags,
    meta: purpose || undefined,
    href: `/prompts/${page.id}`,
  });

  revalidatePath("/prompts");
  redirect("/prompts");
}

// ---------- Playbook ----------

export async function createPlaybookAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("タイトルは必須です");

  const section = (formData.get("section") as string)?.trim() ?? "";
  const tags = parseTags((formData.get("tags") as string) ?? "");

  const page = await createPlaybookEntry({
    title,
    section,
    body: (formData.get("body") as string)?.trim() ?? "",
    tags,
    author: (formData.get("author") as string)?.trim() ?? "",
  });

  await notifySlack({
    type: "playbook",
    title,
    tags,
    meta: section || undefined,
    href: `/playbook/${page.id}`,
  });

  revalidatePath("/playbook");
  redirect("/playbook");
}

// ---------- FAQ ----------

export async function createFAQAction(formData: FormData) {
  const question = (formData.get("question") as string)?.trim();
  if (!question) throw new Error("質問は必須です");

  const tags = parseTags((formData.get("tags") as string) ?? "");

  await createFAQEntry({
    question,
    answer: (formData.get("answer") as string)?.trim() ?? "",
    tags,
    author: (formData.get("author") as string)?.trim() ?? "",
  });

  await notifySlack({
    type: "faq",
    title: question,
    tags,
    href: `/faq`,
  });

  revalidatePath("/faq");
  redirect("/faq");
}

// ---------- AI Tool ----------

export async function createAIToolAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("ツール名は必須です");

  await createAITool({
    title,
    category: (formData.get("category") as string)?.trim() ?? "",
    description: (formData.get("description") as string)?.trim() ?? "",
    pricing: (formData.get("pricing") as string)?.trim() ?? "",
    recommendedUse: (formData.get("recommendedUse") as string)?.trim() ?? "",
    url: (formData.get("url") as string)?.trim() ?? "",
    rating: Number(formData.get("rating")) || 0,
    status: (formData.get("status") as string)?.trim() ?? "",
    tags: parseTags((formData.get("tags") as string) ?? ""),
  });

  revalidatePath("/tools");
  redirect("/tools");
}

// ---------- Event ----------

export async function createEventAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("タイトルは必須です");

  const date = (formData.get("date") as string)?.trim() ?? "";
  const tags = parseTags((formData.get("tags") as string) ?? "");

  await createEvent({
    title,
    date,
    body: (formData.get("body") as string)?.trim() ?? "",
    tags,
    author: (formData.get("author") as string)?.trim() ?? "",
  });

  await notifySlack({
    type: "event",
    title,
    tags,
    meta: date || undefined,
    href: `/events`,
  });

  revalidatePath("/events");
  redirect("/events");
}

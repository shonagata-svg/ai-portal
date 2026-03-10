"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createUseCase,
  createPrompt,
  createPlaybookEntry,
  createFAQEntry,
  createEvent,
} from "./notion";

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

  await createUseCase({
    title,
    team: (formData.get("team") as string)?.trim() ?? "",
    category: (formData.get("category") as string)?.trim() ?? "",
    tool: (formData.get("tool") as string)?.trim() ?? "",
    impactMinutesSaved: Number(formData.get("impactMinutesSaved")) || 0,
    description: (formData.get("description") as string)?.trim() ?? "",
    prompt: (formData.get("prompt") as string)?.trim() ?? "",
    tags: parseTags((formData.get("tags") as string) ?? ""),
  });

  revalidatePath("/use-cases");
  redirect("/use-cases");
}

// ---------- Prompt ----------

export async function createPromptAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("タイトルは必須です");

  await createPrompt({
    title,
    purpose: (formData.get("purpose") as string)?.trim() ?? "",
    promptText: (formData.get("promptText") as string)?.trim() ?? "",
    example: (formData.get("example") as string)?.trim() ?? "",
    tags: parseTags((formData.get("tags") as string) ?? ""),
  });

  revalidatePath("/prompts");
  redirect("/prompts");
}

// ---------- Playbook ----------

export async function createPlaybookAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("タイトルは必須です");

  await createPlaybookEntry({
    title,
    section: (formData.get("section") as string)?.trim() ?? "",
    body: (formData.get("body") as string)?.trim() ?? "",
    tags: parseTags((formData.get("tags") as string) ?? ""),
  });

  revalidatePath("/playbook");
  redirect("/playbook");
}

// ---------- FAQ ----------

export async function createFAQAction(formData: FormData) {
  const question = (formData.get("question") as string)?.trim();
  if (!question) throw new Error("質問は必須です");

  await createFAQEntry({
    question,
    answer: (formData.get("answer") as string)?.trim() ?? "",
    tags: parseTags((formData.get("tags") as string) ?? ""),
  });

  revalidatePath("/faq");
  redirect("/faq");
}

// ---------- Event ----------

export async function createEventAction(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("タイトルは必須です");

  await createEvent({
    title,
    date: (formData.get("date") as string)?.trim() ?? "",
    body: (formData.get("body") as string)?.trim() ?? "",
    tags: parseTags((formData.get("tags") as string) ?? ""),
  });

  revalidatePath("/events");
  redirect("/events");
}

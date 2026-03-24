import { Client } from "@notionhq/client";
import { fetchPageContent } from "./notion-blocks";
import type {
  UseCase,
  Prompt,
  PlaybookEntry,
  FAQEntry,
  Event,
  AITool,
} from "./types";

export const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ---------- helpers ----------

function text(prop: unknown): string {
  const p = prop as { rich_text?: { plain_text: string }[] } | undefined;
  return p?.rich_text?.map((t) => t.plain_text).join("") ?? "";
}

function title(prop: unknown): string {
  const p = prop as { title?: { plain_text: string }[] } | undefined;
  return p?.title?.map((t) => t.plain_text).join("") ?? "";
}

function num(prop: unknown): number {
  const p = prop as { number?: number | null } | undefined;
  return p?.number ?? 0;
}

function sel(prop: unknown): string {
  const p = prop as { select?: { name: string } | null } | undefined;
  return p?.select?.name ?? "";
}

function tags(prop: unknown): string[] {
  const p = prop as
    | { multi_select?: { name: string }[] }
    | undefined;
  return p?.multi_select?.map((t) => t.name) ?? [];
}

function date(prop: unknown): string {
  const p = prop as { date?: { start: string } | null } | undefined;
  return p?.date?.start ?? "";
}

function lastEdited(prop: unknown): string {
  const p = prop as { last_edited_time?: string } | undefined;
  return p?.last_edited_time ?? "";
}

// ---------- fetchers ----------

// Cache: database_id → data_source_id (persistent across requests in same process)
const dsIdCache = new Map<string, string>();

// In-flight dedup: prevent duplicate API calls during the same render
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inflight = new Map<string, Promise<any[]>>();

async function getDataSourceId(dbId: string): Promise<string> {
  const cached = dsIdCache.get(dbId);
  if (cached) return cached;
  const db = await notion.databases.retrieve({ database_id: dbId });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dsId = (db as any).data_sources?.[0]?.id as string;
  if (!dsId) throw new Error(`No data_source found for database ${dbId}`);
  dsIdCache.set(dbId, dsId);
  return dsId;
}

async function queryAll(dbId: string) {
  // Dedup: if an identical request is already in flight, reuse it
  const existing = inflight.get(dbId);
  if (existing) return existing;

  const promise = (async () => {
    const dsId = await getDataSourceId(dbId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pages: any[] = [];
    let cursor: string | undefined;
    do {
      const res = await notion.dataSources.query({
        data_source_id: dsId,
        start_cursor: cursor,
        page_size: 100,
      });
      pages.push(...res.results);
      cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
    } while (cursor);
    return pages;
  })();

  inflight.set(dbId, promise);
  promise.finally(() => inflight.delete(dbId));
  return promise;
}

export async function getUseCases(): Promise<UseCase[]> {
  const dbId = process.env.NOTION_DB_ID_USECASES;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId); } catch (e) { console.error("getUseCases error:", e); return []; }
  return pages.map((p) => {
    const props = (p as { properties: Record<string, unknown> }).properties;
    return {
      id: p.id,
      title: title(props.title),
      team: sel(props.team),
      category: sel(props.category),
      impactMinutesSaved: num(props.impact_minutes_saved),
      tool: sel(props.tool),
      prompt: text(props.prompt),
      description: text(props.description),
      tags: tags(props.tags),
      author: text(props.submitted_by),
      updatedAt: lastEdited(props.updated_at),
    };
  });
}

export async function getPrompts(): Promise<Prompt[]> {
  const dbId = process.env.NOTION_DB_ID_PROMPTS;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId); } catch (e) { console.error("getPrompts error:", e); return []; }
  return pages.map((p) => {
    const props = (p as { properties: Record<string, unknown> }).properties;
    return {
      id: p.id,
      title: title(props.title),
      purpose: sel(props.purpose),
      promptText: text(props.prompt_text),
      tags: tags(props.tags),
      example: text(props.example),
      author: text(props.submitted_by),
      updatedAt: lastEdited(props.updated_at),
    };
  });
}

export async function getPlaybook(): Promise<PlaybookEntry[]> {
  const dbId = process.env.NOTION_DB_ID_PLAYBOOK;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId); } catch (e) { console.error("getPlaybook error:", e); return []; }
  return pages.map((p) => {
    const props = (p as { properties: Record<string, unknown> }).properties;
    return {
      id: p.id,
      title: title(props.title),
      section: sel(props.section),
      body: text(props.body),
      tags: tags(props.tags),
      author: text(props.submitted_by),
      updatedAt: lastEdited(props.updated_at),
    };
  });
}

export async function getFAQ(): Promise<FAQEntry[]> {
  const dbId = process.env.NOTION_DB_ID_FAQ;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId); } catch (e) { console.error("getFAQ error:", e); return []; }
  const items = pages.map((p) => {
    const props = (p as { properties: Record<string, unknown> }).properties;
    return {
      id: p.id,
      question: title(props.question),
      answer: text(props.answer),
      tags: tags(props.tags),
      author: text(props.submitted_by),
      updatedAt: lastEdited(props.updated_at),
    };
  });
  // Fetch block content in parallel for each FAQ item
  await Promise.all(
    items.map(async (item) => {
      const content = await fetchPageContent(item.id);
      if (content) item.answer = content;
    }),
  );
  return items;
}

// ---------- writers ----------

export async function createUseCase(data: {
  title: string;
  team: string;
  category: string;
  tool: string;
  impactMinutesSaved: number;
  description: string;
  prompt: string;
  tags: string[];
  author: string;
}) {
  const dbId = process.env.NOTION_DB_ID_USECASES;
  if (!dbId) throw new Error("NOTION_DB_ID_USECASES not set");
  return notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      title: { title: [{ text: { content: data.title } }] },
      team: { select: data.team ? { name: data.team } : null },
      category: { select: data.category ? { name: data.category } : null },
      tool: { select: data.tool ? { name: data.tool } : null },
      impact_minutes_saved: { number: data.impactMinutesSaved },
      description: { rich_text: [{ text: { content: data.description } }] },
      prompt: { rich_text: [{ text: { content: data.prompt } }] },
      tags: { multi_select: data.tags.map((t) => ({ name: t })) },
      submitted_by: { rich_text: [{ text: { content: data.author } }] },
    },
  });
}

export async function createPrompt(data: {
  title: string;
  purpose: string;
  promptText: string;
  example: string;
  tags: string[];
  author: string;
}) {
  const dbId = process.env.NOTION_DB_ID_PROMPTS;
  if (!dbId) throw new Error("NOTION_DB_ID_PROMPTS not set");
  return notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      title: { title: [{ text: { content: data.title } }] },
      purpose: { select: data.purpose ? { name: data.purpose } : null },
      prompt_text: { rich_text: [{ text: { content: data.promptText } }] },
      example: { rich_text: [{ text: { content: data.example } }] },
      tags: { multi_select: data.tags.map((t) => ({ name: t })) },
      submitted_by: { rich_text: [{ text: { content: data.author } }] },
    },
  });
}

export async function createPlaybookEntry(data: {
  title: string;
  section: string;
  body: string;
  tags: string[];
  author: string;
}) {
  const dbId = process.env.NOTION_DB_ID_PLAYBOOK;
  if (!dbId) throw new Error("NOTION_DB_ID_PLAYBOOK not set");
  return notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      title: { title: [{ text: { content: data.title } }] },
      section: { select: data.section ? { name: data.section } : null },
      body: { rich_text: [{ text: { content: data.body } }] },
      tags: { multi_select: data.tags.map((t) => ({ name: t })) },
      submitted_by: { rich_text: [{ text: { content: data.author } }] },
    },
  });
}

export async function createFAQEntry(data: {
  question: string;
  answer: string;
  tags: string[];
  author: string;
}) {
  const dbId = process.env.NOTION_DB_ID_FAQ;
  if (!dbId) throw new Error("NOTION_DB_ID_FAQ not set");
  return notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      question: { title: [{ text: { content: data.question } }] },
      answer: { rich_text: [{ text: { content: data.answer } }] },
      tags: { multi_select: data.tags.map((t) => ({ name: t })) },
      submitted_by: { rich_text: [{ text: { content: data.author } }] },
    },
  });
}

export async function createEvent(data: {
  title: string;
  date: string;
  body: string;
  tags: string[];
  author: string;
}) {
  const dbId = process.env.NOTION_DB_ID_EVENTS;
  if (!dbId) throw new Error("NOTION_DB_ID_EVENTS not set");
  return notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      title: { title: [{ text: { content: data.title } }] },
      date: { date: data.date ? { start: data.date } : null },
      body: { rich_text: [{ text: { content: data.body } }] },
      tags: { multi_select: data.tags.map((t) => ({ name: t })) },
      submitted_by: { rich_text: [{ text: { content: data.author } }] },
    },
  });
}

export async function getAITools(): Promise<AITool[]> {
  const dbId = process.env.NOTION_DB_ID_TOOLS;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId); } catch (e) { console.error("getAITools error:", e); return []; }
  return pages.map((p) => {
    const props = (p as { properties: Record<string, unknown> }).properties;
    return {
      id: p.id,
      title: title(props.title),
      category: sel(props.category),
      description: text(props.description),
      pricing: sel(props.pricing),
      recommendedUse: text(props.recommended_use),
      url: (props.url as { url?: string | null })?.url ?? "",
      rating: num(props.rating),
      status: sel(props.status),
      tags: tags(props.tags),
      updatedAt: lastEdited(props.updated_at),
    };
  });
}

export async function getAIToolById(id: string): Promise<AITool | null> {
  const items = await getAITools();
  const item = items.find((i) => i.id === id) ?? null;
  if (!item) return null;
  const content = await fetchPageContent(id);
  if (content) item.description = content;
  return item;
}

export async function createAITool(data: {
  title: string;
  category: string;
  description: string;
  pricing: string;
  recommendedUse: string;
  url: string;
  rating: number;
  status: string;
  tags: string[];
}) {
  const dbId = process.env.NOTION_DB_ID_TOOLS;
  if (!dbId) throw new Error("NOTION_DB_ID_TOOLS not set");
  return notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      title: { title: [{ text: { content: data.title } }] },
      category: { select: data.category ? { name: data.category } : null },
      description: { rich_text: [{ text: { content: data.description } }] },
      pricing: { select: data.pricing ? { name: data.pricing } : null },
      recommended_use: { rich_text: [{ text: { content: data.recommendedUse } }] },
      url: { url: data.url || null },
      rating: { number: data.rating || null },
      status: { select: data.status ? { name: data.status } : null },
      tags: { multi_select: data.tags.map((t) => ({ name: t })) },
    },
  });
}

// ---------- single item fetchers ----------

export async function getUseCaseById(id: string): Promise<UseCase | null> {
  const items = await getUseCases();
  const item = items.find((i) => i.id === id) ?? null;
  if (!item) return null;
  const content = await fetchPageContent(id);
  if (content) item.description = content;
  return item;
}

export async function getPromptById(id: string): Promise<Prompt | null> {
  const items = await getPrompts();
  const item = items.find((i) => i.id === id) ?? null;
  if (!item) return null;
  const content = await fetchPageContent(id);
  if (content) item.example = content;
  return item;
}

export async function getPlaybookById(id: string): Promise<PlaybookEntry | null> {
  const items = await getPlaybook();
  const item = items.find((i) => i.id === id) ?? null;
  if (!item) return null;
  const content = await fetchPageContent(id);
  if (content) item.body = content;
  return item;
}

export async function getEvents(): Promise<Event[]> {
  const dbId = process.env.NOTION_DB_ID_EVENTS;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId); } catch (e) { console.error("getEvents error:", e); return []; }
  return pages.map((p) => {
    const props = (p as { properties: Record<string, unknown> }).properties;
    return {
      id: p.id,
      title: title(props.title),
      date: date(props.date),
      body: text(props.body),
      tags: tags(props.tags),
      author: text(props.submitted_by),
      updatedAt: lastEdited(props.updated_at),
    };
  });
}

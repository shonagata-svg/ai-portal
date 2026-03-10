import { notion } from "./notion";

// ---------- types ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RichText = any;

// ---------- rich text → markdown ----------

function richTextToMarkdown(richTexts: RichText[]): string {
  if (!richTexts) return "";
  return richTexts
    .map((rt: RichText) => {
      let text: string = rt.plain_text ?? "";
      if (!text) return "";

      const a = rt.annotations ?? {};
      if (rt.href) text = `[${text}](${rt.href})`;
      if (a.code) text = `\`${text}\``;
      if (a.bold) text = `**${text}**`;
      if (a.italic) text = `*${text}*`;
      if (a.strikethrough) text = `~~${text}~~`;
      return text;
    })
    .join("");
}

// ---------- blocks → markdown ----------

function blockToMarkdown(block: Block, indent = ""): string {
  const type: string = block.type;
  const data = block[type];

  switch (type) {
    case "paragraph":
      return `${indent}${richTextToMarkdown(data?.rich_text)}\n\n`;

    case "heading_1":
      return `# ${richTextToMarkdown(data?.rich_text)}\n\n`;
    case "heading_2":
      return `## ${richTextToMarkdown(data?.rich_text)}\n\n`;
    case "heading_3":
      return `### ${richTextToMarkdown(data?.rich_text)}\n\n`;

    case "bulleted_list_item":
      return `${indent}- ${richTextToMarkdown(data?.rich_text)}\n`;
    case "numbered_list_item":
      return `${indent}1. ${richTextToMarkdown(data?.rich_text)}\n`;

    case "to_do": {
      const checked = data?.checked ? "x" : " ";
      return `${indent}- [${checked}] ${richTextToMarkdown(data?.rich_text)}\n`;
    }

    case "code": {
      const lang = data?.language ?? "";
      const code = richTextToMarkdown(data?.rich_text);
      return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    }

    case "quote":
      return `> ${richTextToMarkdown(data?.rich_text)}\n\n`;

    case "callout": {
      const icon = data?.icon?.emoji ?? "";
      return `> ${icon} ${richTextToMarkdown(data?.rich_text)}\n\n`;
    }

    case "divider":
      return `---\n\n`;

    case "table": {
      const rows: Block[] = block.children ?? [];
      if (rows.length === 0) return "";
      const lines: string[] = [];
      rows.forEach((row: Block, i: number) => {
        const cells = (row.table_row?.cells ?? []) as RichText[][];
        const line = cells.map((c: RichText[]) => richTextToMarkdown(c)).join(" | ");
        lines.push(`| ${line} |`);
        if (i === 0) {
          lines.push(`| ${cells.map(() => "---").join(" | ")} |`);
        }
      });
      return lines.join("\n") + "\n\n";
    }

    case "image": {
      const url = data?.file?.url ?? data?.external?.url ?? "";
      const caption = richTextToMarkdown(data?.caption);
      return `![${caption}](${url})\n\n`;
    }

    case "bookmark": {
      const url = data?.url ?? "";
      return `[${url}](${url})\n\n`;
    }

    default:
      // Unsupported block types are silently skipped
      return "";
  }
}

export function blocksToMarkdown(blocks: Block[]): string {
  let md = "";
  for (const block of blocks) {
    md += blockToMarkdown(block);
    // Handle nested children
    if (block.has_children && block.children) {
      md += blocksToMarkdown(block.children);
    }
  }
  return md.trim();
}

// ---------- fetch all blocks for a page ----------

async function fetchAllBlocks(blockId: string): Promise<Block[]> {
  const blocks: Block[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...res.results);
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return blocks;
}

async function fetchBlocksRecursive(blockId: string): Promise<Block[]> {
  const blocks = await fetchAllBlocks(blockId);
  // Fetch children for blocks that have them (tables, toggles, etc.)
  for (const block of blocks) {
    if (block.has_children) {
      block.children = await fetchBlocksRecursive(block.id);
    }
  }
  return blocks;
}

export async function fetchPageContent(pageId: string): Promise<string> {
  try {
    const blocks = await fetchBlocksRecursive(pageId);
    return blocksToMarkdown(blocks);
  } catch (e) {
    console.error("fetchPageContent error:", e);
    return "";
  }
}

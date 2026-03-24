const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

type ContentType = "usecase" | "prompt" | "playbook" | "faq" | "event";

const TYPE_META: Record<ContentType, { label: string; icon: string; color: string }> = {
  usecase:  { label: "Use Case",  icon: "💡", color: "#3b82f6" },
  prompt:   { label: "Prompt",    icon: "📝", color: "#8b5cf6" },
  playbook: { label: "Playbook",  icon: "📖", color: "#10b981" },
  faq:      { label: "FAQ",       icon: "❓", color: "#f59e0b" },
  event:    { label: "Event",     icon: "📅", color: "#ef4444" },
};

type NotifyPayload = {
  type: ContentType;
  title: string;
  tags?: string[];
  meta?: string;       // e.g. team / category / section
  href?: string;       // relative path, e.g. /use-cases/xxx
  portalUrl?: string;  // base URL of the portal, e.g. https://ai-portal.example.com
};

export async function notifySlack(payload: NotifyPayload): Promise<void> {
  if (!WEBHOOK_URL) return; // silently skip if not configured

  const meta = TYPE_META[payload.type];
  const baseUrl = payload.portalUrl ?? process.env.NEXT_PUBLIC_PORTAL_URL ?? "";
  const fullUrl = baseUrl && payload.href ? `${baseUrl}${payload.href}` : null;

  const tagText =
    payload.tags && payload.tags.length > 0
      ? payload.tags.map((t) => `\`${t}\``).join("  ")
      : null;

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${meta.icon}  *新しい${meta.label}が追加されました*`,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*タイトル*\n${fullUrl ? `<${fullUrl}|${payload.title}>` : payload.title}`,
        },
        {
          type: "mrkdwn",
          text: `*種別*\n${meta.label}`,
        },
        ...(payload.meta
          ? [{ type: "mrkdwn", text: `*詳細*\n${payload.meta}` }]
          : []),
        ...(tagText
          ? [{ type: "mrkdwn", text: `*タグ*\n${tagText}` }]
          : []),
      ],
    },
    ...(fullUrl
      ? [
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "ポータルで見る →" },
                url: fullUrl,
                style: "primary",
              },
            ],
          },
        ]
      : []),
    {
      type: "divider",
    },
  ];

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${meta.icon} 新しい${meta.label}「${payload.title}」が追加されました`,
        blocks,
      }),
    });
    if (!res.ok) {
      console.error(`Slack notification failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("Slack notification error:", err);
  }
}

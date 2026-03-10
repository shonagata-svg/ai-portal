/**
 * Notion DB セットアップスクリプト
 *
 * 使い方:
 *   NOTION_API_KEY=secret_xxx NOTION_PARENT_PAGE_ID=xxxxx node scripts/setup-notion.mjs
 *
 * 事前準備:
 *   1. https://www.notion.so/my-integrations で Integration を作成
 *   2. 作成先の Notion ページを開き、右上 ... > Connections で Integration を追加
 *   3. ページURLからページIDを取得 (notion.so/xxxxxxxxx?v=... の xxxxxxxxx 部分)
 */

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const parentPageId = process.env.NOTION_PARENT_PAGE_ID;

if (!process.env.NOTION_API_KEY || !parentPageId) {
  console.error(
    "Usage: NOTION_API_KEY=secret_xxx NOTION_PARENT_PAGE_ID=xxx node scripts/setup-notion.mjs"
  );
  process.exit(1);
}

// ---------- DB definitions ----------

const databases = [
  {
    envKey: "NOTION_DB_ID_USECASES",
    title: "UseCases",
    icon: "💡",
    properties: {
      title: { title: {} },
      team: {
        select: {
          options: [
            { name: "Engineering" },
            { name: "Sales" },
            { name: "Marketing" },
            { name: "HR" },
            { name: "Legal" },
            { name: "Finance" },
            { name: "CS" },
          ],
        },
      },
      category: {
        select: {
          options: [
            { name: "文書作成" },
            { name: "データ分析" },
            { name: "コーディング" },
            { name: "リサーチ" },
            { name: "翻訳" },
            { name: "要約" },
            { name: "その他" },
          ],
        },
      },
      impact_minutes_saved: { number: { format: "number" } },
      tool: {
        select: {
          options: [
            { name: "ChatGPT" },
            { name: "Claude" },
            { name: "Gemini" },
            { name: "GitHub Copilot" },
            { name: "その他" },
          ],
        },
      },
      prompt: { rich_text: {} },
      description: { rich_text: {} },
      tags: {
        multi_select: {
          options: [
            { name: "効率化" },
            { name: "品質向上" },
            { name: "自動化" },
            { name: "初心者向け" },
          ],
        },
      },
      updated_at: { last_edited_time: {} },
    },
  },
  {
    envKey: "NOTION_DB_ID_PROMPTS",
    title: "Prompts",
    icon: "📝",
    properties: {
      title: { title: {} },
      purpose: {
        select: {
          options: [
            { name: "文書作成" },
            { name: "要約" },
            { name: "翻訳" },
            { name: "コードレビュー" },
            { name: "データ分析" },
            { name: "アイデア出し" },
            { name: "メール作成" },
          ],
        },
      },
      prompt_text: { rich_text: {} },
      tags: {
        multi_select: {
          options: [
            { name: "GPT" },
            { name: "Claude" },
            { name: "汎用" },
            { name: "初心者向け" },
            { name: "上級者向け" },
          ],
        },
      },
      example: { rich_text: {} },
      updated_at: { last_edited_time: {} },
    },
  },
  {
    envKey: "NOTION_DB_ID_PLAYBOOK",
    title: "Playbook",
    icon: "📖",
    properties: {
      title: { title: {} },
      section: {
        select: {
          options: [
            { name: "はじめに" },
            { name: "利用ルール" },
            { name: "セキュリティ" },
            { name: "社内ポリシー" },
            { name: "ベストプラクティス" },
            { name: "禁止事項" },
          ],
        },
      },
      body: { rich_text: {} },
      tags: {
        multi_select: {
          options: [
            { name: "必読" },
            { name: "セキュリティ" },
            { name: "ガイドライン" },
          ],
        },
      },
      updated_at: { last_edited_time: {} },
    },
  },
  {
    envKey: "NOTION_DB_ID_FAQ",
    title: "FAQ",
    icon: "❓",
    properties: {
      question: { title: {} },
      answer: { rich_text: {} },
      tags: {
        multi_select: {
          options: [
            { name: "基本" },
            { name: "セキュリティ" },
            { name: "ツール" },
            { name: "コスト" },
            { name: "申請" },
          ],
        },
      },
      updated_at: { last_edited_time: {} },
    },
  },
  {
    envKey: "NOTION_DB_ID_EVENTS",
    title: "Events",
    icon: "📅",
    properties: {
      title: { title: {} },
      date: { date: {} },
      body: { rich_text: {} },
      tags: {
        multi_select: {
          options: [
            { name: "勉強会" },
            { name: "ハンズオン" },
            { name: "共有会" },
            { name: "募集" },
          ],
        },
      },
    },
  },
];

// ---------- Sample data ----------

const sampleData = {
  UseCases: [
    {
      title: "議事録の自動要約",
      team: "Engineering",
      category: "要約",
      impact_minutes_saved: 30,
      tool: "Claude",
      prompt:
        "以下の議事録を、決定事項・TODO・次回アジェンダの3つに分類して要約してください。",
      description:
        "週次定例の議事録をAIで要約し、Slackに共有するワークフロー。手動30分→5分に短縮。",
      tags: ["効率化", "初心者向け"],
    },
    {
      title: "営業メールのドラフト作成",
      team: "Sales",
      category: "文書作成",
      impact_minutes_saved: 20,
      tool: "ChatGPT",
      prompt:
        "以下の商談情報をもとに、フォローアップメールを作成してください。トーンは丁寧かつ簡潔に。",
      description:
        "商談後のフォローアップメールをAIで下書き。パーソナライズも含めて品質向上。",
      tags: ["効率化", "品質向上"],
    },
    {
      title: "コードレビューの自動チェック",
      team: "Engineering",
      category: "コーディング",
      impact_minutes_saved: 45,
      tool: "GitHub Copilot",
      prompt: "",
      description:
        "PR作成時にAIがセキュリティ・パフォーマンス観点でレビューコメントを自動生成。",
      tags: ["自動化", "品質向上"],
    },
  ],
  Prompts: [
    {
      title: "議事録要約プロンプト",
      purpose: "要約",
      prompt_text:
        "あなたは優秀なビジネスアシスタントです。以下の議事録を読み、次の形式で要約してください：\n\n## 決定事項\n- ...\n\n## TODO（担当者・期限）\n- ...\n\n## 次回アジェンダ\n- ...\n\n---\n議事録：\n{ここに議事録を貼り付け}",
      tags: ["汎用", "初心者向け"],
      example:
        "## 決定事項\n- Q3の目標KPIを売上120%に設定\n\n## TODO\n- 田中: 来週までに施策案を提出\n\n## 次回アジェンダ\n- 施策案レビュー",
    },
    {
      title: "メール作成プロンプト",
      purpose: "メール作成",
      prompt_text:
        "以下の条件でビジネスメールを作成してください：\n- 宛先: {相手の名前・役職}\n- 目的: {メールの目的}\n- トーン: {丁寧/カジュアル/フォーマル}\n- 含めるべき情報: {箇条書き}\n\n件名と本文を出力してください。",
      tags: ["汎用", "初心者向け"],
      example: "",
    },
    {
      title: "コードレビュープロンプト",
      purpose: "コードレビュー",
      prompt_text:
        "以下のコードをレビューしてください。以下の観点でフィードバックをお願いします：\n1. バグの可能性\n2. セキュリティリスク\n3. パフォーマンス改善\n4. 可読性・保守性\n\n各指摘には深刻度(高/中/低)を付けてください。\n\n```\n{コードを貼り付け}\n```",
      tags: ["Claude", "上級者向け"],
      example: "",
    },
  ],
  Playbook: [
    {
      title: "AI利用の基本方針",
      section: "はじめに",
      body: "当社では、業務効率化と品質向上を目的としてAIツールの積極的な活用を推進しています。本ガイドは、安全かつ効果的にAIを活用するための基本方針をまとめたものです。",
      tags: ["必読", "ガイドライン"],
    },
    {
      title: "機密情報の取り扱い",
      section: "セキュリティ",
      body: "【禁止】顧客の個人情報、未公開の財務情報、パスワード等をAIに入力すること。\n【推奨】機密レベルに応じて情報をマスキングしてから利用すること。不明な場合は情報セキュリティチームに相談。",
      tags: ["必読", "セキュリティ"],
    },
    {
      title: "利用可能なAIツール一覧",
      section: "利用ルール",
      body: "以下のツールが社内利用を承認されています：\n- ChatGPT (Business版)\n- Claude (Team版)\n- GitHub Copilot (Enterprise)\n- Google Gemini (Workspace統合)\n\n未承認ツールの業務利用は禁止です。新規ツール導入は申請が必要です。",
      tags: ["ガイドライン"],
    },
    {
      title: "AI出力の検証ルール",
      section: "ベストプラクティス",
      body: "AIの出力は必ず人間が検証してください。特に以下のケースでは慎重な確認が必要です：\n- 数値・統計データ\n- 法的・規制に関する記述\n- 顧客への提出物\n- 社外公開するコンテンツ",
      tags: ["必読", "ガイドライン"],
    },
  ],
  FAQ: [
    {
      question: "業務でAIを使ってもいいですか？",
      answer:
        "はい、承認されたツール（ChatGPT Business、Claude Team等）であれば業務利用可能です。ただし、機密情報の入力には制限があります。詳しくはPlaybookのセキュリティセクションを参照してください。",
      tags: ["基本"],
    },
    {
      question: "AIに顧客情報を入力していいですか？",
      answer:
        "個人を特定できる情報（氏名、メールアドレス等）の入力は禁止です。統計データや匿名化された情報は利用可能です。判断に迷う場合は情報セキュリティチームに相談してください。",
      tags: ["セキュリティ"],
    },
    {
      question: "AIツールの利用申請はどうすればいいですか？",
      answer:
        "社内ポータルの「AIツール利用申請」フォームから申請してください。承認まで通常3営業日かかります。緊急の場合はIT部門に直接連絡してください。",
      tags: ["申請"],
    },
    {
      question: "AIの利用コストは部署負担ですか？",
      answer:
        "ChatGPT BusinessとClaude Teamは全社ライセンスのため追加費用はかかりません。API利用やカスタムソリューション開発の費用は部署負担となります。",
      tags: ["コスト"],
    },
    {
      question: "AIが生成したコードをプロダクションに使えますか？",
      answer:
        "コードレビューを経た上で利用可能です。AI生成コードであることをPRに明記し、通常のレビュープロセスに従ってください。ライセンス上の問題がないかも確認が必要です。",
      tags: ["ツール"],
    },
  ],
  Events: [
    {
      title: "AI活用キックオフ勉強会",
      date: "2026-03-05",
      body: "全社員向けのAI活用入門セッション。ChatGPTとClaudeの基本的な使い方をハンズオンで学びます。\n\n場所: 大会議室 / Zoom配信あり\n時間: 14:00-16:00",
      tags: ["勉強会", "ハンズオン"],
    },
    {
      title: "プロンプトエンジニアリング入門",
      date: "2026-03-19",
      body: "効果的なプロンプトの書き方を実践的に学ぶワークショップ。自部署の業務に合わせたプロンプト作成を行います。",
      tags: ["勉強会", "ハンズオン"],
    },
    {
      title: "AI活用事例共有会 #1",
      date: "2026-04-02",
      body: "各部署のAI活用事例を共有するLT大会。発表者募集中！1人5分のライトニングトーク形式です。\n\n発表者エントリー: Slackの #ai-portal チャンネルまで",
      tags: ["共有会", "募集"],
    },
  ],
};

// ---------- Create DBs & sample data ----------

async function createDatabase(def) {
  console.log(`\nCreating "${def.title}" ...`);

  // Step 1: Create DB with default Name (title) property
  const { title: _titleProp, question: _questionProp, ...extraProps } = def.properties;

  const db = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    icon: { type: "emoji", emoji: def.icon },
    title: [{ type: "text", text: { content: def.title } }],
    properties: { Name: { title: {} } },
  });

  console.log(`  ✓ DB Created: ${db.id}`);

  // Step 2: Rename title prop if needed + add remaining properties via dataSources.update
  const dsId = db.data_sources[0].id;
  const propsToUpdate = { ...extraProps };

  // Rename "Name" to custom title property name (e.g. "question" for FAQ)
  const titleKey = def.properties.question ? "question" : "title";
  if (titleKey !== "Name") {
    propsToUpdate.Name = { name: titleKey, title: {} };
  }

  if (Object.keys(propsToUpdate).length > 0) {
    await notion.dataSources.update({
      data_source_id: dsId,
      properties: propsToUpdate,
    });
    console.log(`  ✓ Properties added via dataSource: ${dsId}`);
  }

  console.log(`  ${def.envKey}=${db.id}`);
  return { envKey: def.envKey, id: db.id, dsId, title: def.title };
}

function buildPageProperties(dbTitle, row) {
  const props = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "title" || key === "question") {
      props[key] = { title: [{ text: { content: value } }] };
    } else if (key === "tags") {
      props[key] = { multi_select: value.map((name) => ({ name })) };
    } else if (key === "date") {
      props[key] = { date: { start: value } };
    } else if (
      key === "team" ||
      key === "category" ||
      key === "tool" ||
      key === "purpose" ||
      key === "section"
    ) {
      props[key] = { select: { name: value } };
    } else if (key === "impact_minutes_saved") {
      props[key] = { number: value };
    } else {
      // rich_text fields
      props[key] = { rich_text: [{ text: { content: value } }] };
    }
  }
  return props;
}

async function run() {
  console.log("=== AI Portal Notion DB Setup ===\n");
  console.log(`Parent page: ${parentPageId}`);

  const results = [];

  for (const def of databases) {
    const result = await createDatabase(def);
    results.push(result);

    // Insert sample data
    const rows = sampleData[def.title];
    if (rows) {
      for (const row of rows) {
        await notion.pages.create({
          parent: { database_id: result.id },
          properties: buildPageProperties(def.title, row),
        });
      }
      console.log(`  ✓ Inserted ${rows.length} sample rows`);
    }
  }

  // Output .env.local snippet
  console.log("\n=== .env.local に以下を設定してください ===\n");
  for (const r of results) {
    console.log(`${r.envKey}=${r.id}`);
  }
  console.log(
    "\n完了! .env.local を更新後、dev サーバーを再起動してください。"
  );
}

run().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});

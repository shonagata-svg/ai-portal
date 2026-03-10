# AI Portal

社内AI推進情報を一元管理するポータルサイト。

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **CMS**: Notion API
- **Auth**: Basic認証 (middleware)
- **Deploy**: Vercel

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment Variables

`.env.local` を作成:

```env
# Notion Integration Token
NOTION_API_KEY=secret_xxxxx

# Notion Database IDs (各DBのURLから取得: notion.so/<workspace>/<DATABASE_ID>?v=...)
NOTION_DB_ID_USECASES=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_ID_PROMPTS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_ID_PLAYBOOK=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_ID_FAQ=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_ID_EVENTS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Basic Auth (パスワード未設定なら認証スキップ)
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=your-password-here
```

### 3. Run

```bash
npm run dev
```

http://localhost:3000 でアクセス。

## Notion DB プロパティ名（重要）

Notion側のプロパティ名は **小文字・スネークケース** で統一してください。

### UseCases DB

| プロパティ名 | 型 | 説明 |
|---|---|---|
| `title` | Title | 事例タイトル |
| `team` | Select | 部署名 |
| `category` | Select | 業務カテゴリ |
| `impact_minutes_saved` | Number | 削減時間（分） |
| `tool` | Select | 使用ツール |
| `prompt` | Rich text | 使用プロンプト |
| `description` | Rich text | 事例説明 |
| `tags` | Multi-select | タグ |
| `updated_at` | Last edited time | 更新日時 |

### Prompts DB

| プロパティ名 | 型 | 説明 |
|---|---|---|
| `title` | Title | プロンプト名 |
| `purpose` | Select | 用途 |
| `prompt_text` | Rich text | プロンプト本文 |
| `tags` | Multi-select | タグ |
| `example` | Rich text | 出力例 |
| `updated_at` | Last edited time | 更新日時 |

### Playbook DB

| プロパティ名 | 型 | 説明 |
|---|---|---|
| `title` | Title | ガイドタイトル |
| `section` | Select | セクション |
| `body` | Rich text | 本文 |
| `tags` | Multi-select | タグ |
| `updated_at` | Last edited time | 更新日時 |

### FAQ DB

| プロパティ名 | 型 | 説明 |
|---|---|---|
| `question` | Title | 質問 |
| `answer` | Rich text | 回答 |
| `tags` | Multi-select | タグ |
| `updated_at` | Last edited time | 更新日時 |

### Events DB

| プロパティ名 | 型 | 説明 |
|---|---|---|
| `title` | Title | イベント名 |
| `date` | Date | 開催日 |
| `body` | Rich text | 詳細 |
| `tags` | Multi-select | タグ |

## Deploy to Vercel

```bash
npx vercel
```

Vercelダッシュボードで上記の環境変数をすべて設定してください。

## ディレクトリ構成

```
ai-portal/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 共通レイアウト
│   │   ├── page.tsx            # トップページ
│   │   ├── globals.css
│   │   ├── playbook/page.tsx   # AIガイド
│   │   ├── use-cases/page.tsx  # 活用事例
│   │   ├── prompts/page.tsx    # プロンプトライブラリ
│   │   ├── faq/page.tsx        # FAQ
│   │   └── events/page.tsx     # イベント
│   ├── components/
│   │   ├── header.tsx          # ヘッダー・ナビ
│   │   ├── card.tsx            # Card, Tag, PageHeader
│   │   ├── copy-button.tsx     # コピーボタン
│   │   └── search-filter.tsx   # 検索・タグフィルタ
│   ├── lib/
│   │   ├── notion.ts           # Notion API取得層
│   │   ├── types.ts            # 型定義
│   │   └── search.ts           # 検索・フィルタユーティリティ
│   └── middleware.ts           # Basic認証
├── .env.local
└── README.md
```

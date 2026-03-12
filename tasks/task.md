# qwq-editor — 実装計画

## 概要

リッチMarkdownエディタをNPMライブラリとして実装する。
**インスタントモード**（Viteプラグイン経由でdev時のみ起動、ローカルファイル書き込み）と
**エンベデッドモード**（Reactコンポーネントとして組み込み、S3/DBへの保存）の2モードを設定ファイルで切り替える。

qwqb-web（Astro + Cloudflare Pages）への統合を最初のターゲットとする。

---

## TODO

### フェーズ1: 基盤

- [x] モノレポ初期化（pnpm-workspace.yaml, tsconfig.base.json, package.json, .gitignore）
- [x] `@qwq-net/core` 実装
  - [x] `defineConfig()` + Zod スキーマ
  - [x] `StorageAdapter` インターフェース
  - [x] `LocalStorageAdapter`（Node.js fs + gray-matter）
  - [x] `toMDX.ts` シリアライザ（named import方式、ユニットテスト付き）
  - [x] `toMarkdown.ts` シリアライザ
  - [x] `fromMarkdown.ts` デシリアライザ（MDX named import → image node変換含む）
  - [x] Vitest ユニットテスト（27テスト、全パス）
- [ ] `apps/playground` セットアップ（Vite React SPA）

### フェーズ2: エディタUI

- [ ] `@qwq-net/editor` 実装
  - [ ] Tiptap基本セットアップ（`useRichEditor`）
  - [ ] `Toolbar`（TextGroup / HeadingGroup / InsertGroup / HistoryGroup）
  - [ ] `BubbleMenu`（テキスト選択時フローティングメニュー）
  - [ ] `FrontmatterPanel`（折りたたみ可能なメタデータ欄）
  - [ ] `SlashMenu`（`/`コマンドパレット）
  - [ ] `ImageUploadExtension`（drag/drop/paste → StorageAdapter）
  - [ ] `useSave`（debounce + Ctrl+S）

### フェーズ3: インスタントモード

- [ ] `@qwq-net/instant` 実装
  - [ ] ローカルAPI（gray-matterでファイル読み書き）
    - [ ] `GET /__editor/api/content/:slug`
    - [ ] `POST /__editor/api/save`
    - [ ] `POST /__editor/api/upload`
  - [ ] Viteプラグイン（`apply: 'serve'`、本番ビルド影響ゼロ）
  - [ ] エディタSPA（一覧 / 新規作成 / 編集）のパッケージ同梱
  - [ ] AstroIntegration（`astro:config:setup` フック）

### フェーズ4: qwqb-webで動作確認

- [ ] `file:../qwq-editor/packages/instant` でローカルリンク
- [ ] `astro.config.mjs` に `qwqEditorIntegration()` を追加
- [ ] `editor.config.ts` を qwqb-web ルートに作成
- [ ] `npm run dev` → `/__editor` で動作確認
- [ ] `npm run build` でエディタコードが本番バンドルに含まれないことを確認

### フェーズ5: npm publish

- [ ] Changesets 設定
- [ ] GitHub Actions（CI / publish）
- [ ] `0.1.0` npm publish

---

## リポジトリ構成

```
qwq-editor/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── package.json
├── tasks/
│   └── task.md          ← このファイル
├── packages/
│   ├── core/            # @qwq-net/core
│   ├── editor/          # @qwq-net/editor
│   ├── instant/         # @qwq-net/instant
│   └── storage-adapters/ # @qwq-net/storage-adapters（フェーズ後半）
└── apps/
    └── playground/      # 開発用Vite React SPA
```

---

## 技術選定

| 役割 | 採用 | 理由 |
|---|---|---|
| エディタコア | **Tiptap** (ProseMirror) | `tiptap-markdown`でMarkdown直列化解決済み |
| ライブラリビルド | **tsup** | ESM/CJS二重出力 + .d.ts生成がゼロ設定 |
| モノレポ | **pnpm workspaces** | |
| バージョン管理 | **Changesets** | パッケージ間依存のバージョニング自動化 |
| config検証 | **Zod** | |
| テスト | Vitest (unit) + Playwright (E2E) | |

---

## パッケージ詳細

### `@qwq-net/core`

```
packages/core/src/
├── config/
│   ├── defineConfig.ts      # Zod検証付きconfig factory
│   └── schema.ts            # Zodスキーマ定義
├── storage/
│   ├── StorageAdapter.ts    # interface
│   └── LocalStorageAdapter.ts  # Node.js fs + gray-matter
└── serializer/
    ├── toMDX.ts             # Tiptap doc → MDX（named import方式）
    ├── toMarkdown.ts        # Tiptap doc → 純Markdown
    └── fromMarkdown.ts      # Markdown/MDX → Tiptap doc
```

#### StorageAdapter インターフェース

```typescript
export interface StorageAdapter {
  uploadImage(file: File, ctx: ContentContext): Promise<{ src: string; alt?: string }>;
  saveContent(content: string, frontmatter: Record<string, unknown>, ctx: ContentContext): Promise<{ location: string }>;
  loadContent(ctx: ContentContext): Promise<string | null>;
}
```

### `@qwq-net/editor` (Reactコンポーネント)

```
packages/editor/src/
├── components/
│   ├── RichEditor.tsx
│   ├── Toolbar/
│   │   └── groups/ (TextGroup, HeadingGroup, InsertGroup, HistoryGroup)
│   ├── BubbleMenu/BubbleMenu.tsx
│   ├── FrontmatterPanel/FrontmatterPanel.tsx
│   └── SlashMenu/SlashMenu.tsx
├── extensions/
│   ├── ImageUploadExtension.ts
│   └── FrontmatterExtension.ts
├── hooks/
│   ├── useRichEditor.ts
│   ├── useSave.ts
│   └── useImageUpload.ts
└── styles/ (editor.css, theme.css)
```

**API:**
```typescript
<RichEditor
  slug="my-post"
  config={editorConfig}
  initialContent={markdownString}
  onSave={(result) => {}}
/>
```

### `@qwq-net/instant` (Viteプラグイン)

```
packages/instant/src/
├── vite-plugin.ts          # apply: 'serve'
├── astro-integration.ts
├── dev-server/
│   ├── middleware.ts
│   └── api/ (content.ts, save.ts, upload.ts)
└── editor-app/             # 同梱React SPA
    ├── main.tsx
    ├── App.tsx             # / 一覧, /new, /:slug/edit
    └── LocalApiAdapter.ts
```

---

## 設定ファイル例

### インスタントモード（qwqb-web用）

```typescript
// editor.config.ts
import { defineConfig } from '@qwq-net/core';

export default defineConfig({
  mode: {
    type: 'instant',
    contentDir: './src/content/blog',
    fileLayout: 'directory',      // slug/index.mdx
    fileExtension: 'mdx',
    imageStyle: 'mdx-imports',    // named import方式
    editorPath: '/__editor',
  },
  frontmatter: {
    title:       { type: 'string',  label: 'Title',       required: true },
    description: { type: 'string',  label: 'Description', required: true },
    pubDate:     { type: 'date',    label: 'Publish Date', required: true },
    updatedDate: { type: 'date',    label: 'Updated Date' },
    heroImage:   { type: 'image',   label: 'Hero Image' },
    tags:        { type: 'tags',    label: 'Tags',
                   options: ['Blog','Review','Programming','Study',
                             'JavaScript','TypeScript','Golang','Rust',
                             'Kotlin','Scala','C#',
                             'Cloudflare','Blender','Unity','Docker','Marvelous Designer'] },
    draft:       { type: 'boolean', label: 'Draft', defaultValue: false },
  },
});
```

### qwqb-web への astro.config.mjs 変更

```javascript
import { qwqEditorIntegration } from '@qwq-net/instant';
import editorConfig from './editor.config.ts';

export default defineConfig({
  // ...既存設定...
  integrations: [
    mdx(), sitemap(), icon(...),
    qwqEditorIntegration(editorConfig),  // ← 追加
  ],
  // vite.plugins は変更不要（AstroIntegration経由で自動追加）
});
```

---

## エディタUX機能一覧

| 機能 | 実装方法 |
|---|---|
| `/` スラッシュコマンド | Tiptap `suggestion` API |
| テキスト選択BubbleMenu | Tiptap `<BubbleMenu>` |
| ブロックD&Dハンドル | `@tiptap/extension-drag-handle` |
| 画像D&D・ペースト | `handleDrop` / `handlePaste` → StorageAdapter |
| コードブロック | `@tiptap/extension-code-block-lowlight` + `lowlight` |
| テーブル | `@tiptap/extension-table` |
| フロントマターパネル | カスタムノード + 折りたたみUI |
| Ctrl+S 保存 | `useSave` hook |

### スラッシュコマンド項目

```
/見出し1  /見出し2  /見出し3
/画像  /コード  /テーブル  /区切り  /引用
```

---

## 注意点・リスク

| リスク | 対策 |
|---|---|
| CSS衝突（エンベデッドモード） | `[data-qwq-editor]` スコープ、必要時はShadow DOM |
| SPA同梱バンドル肥大化 | `apply: 'serve'` で本番除外 + コード分割 |
| toMDX.ts の named import 複雑さ | TDD（ユニットテスト先行） |
| Astroバージョン互換性 | `astro:config:setup` フックのみ使用 |
| `@mdxeditor/editor` との競合 | インスタントモード・ストレージアダプターが独自価値 |

---

## 先行調査メモ

- `@mdx-editor` npm スコープは取得済み（@mdxeditor/editor が存在）
- `@qwq-net` = GitHub: qwq-net の個人スコープ
- qwqb-webのMDXは **named import + JSX** スタイルで画像を扱う（`![](./img.jpg)` ではない）
- qwqb-webの `astro.config.mjs` の `vite.plugins` に TailwindCSS が既にある

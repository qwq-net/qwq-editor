# qwq-editor

Markdown/MDX コンテンツ向けのリッチエディタライブラリ。Tiptap (ProseMirror) ベースの WYSIWYG エディタを React コンポーネントとして提供し、**インスタントモード**（Vite dev server 上でローカルファイルを直接読み書き）と**エンベデッドモード**（任意の StorageAdapter 経由で S3/DB へ保存）の 2 モードで動作する。

## パッケージ構成

| パッケージ | 説明 |
|---|---|
| `@qwq-net/core` | 設定スキーマ (`defineConfig`)、シリアライザ (`toMDX` / `toMarkdown` / `fromMarkdown`)、StorageAdapter インターフェース |
| `@qwq-net/editor` | Tiptap ベースの React エディタコンポーネント (`<RichEditor />`) |
| `@qwq-net/instant` | Vite プラグイン + Astro Integration。dev 時のみエディタ SPA を `/__editor` に配信 |

```
qwq-editor/
├── packages/
│   ├── core/       # @qwq-net/core
│   ├── editor/     # @qwq-net/editor
│   └── instant/    # @qwq-net/instant
└── apps/
    └── playground/  # 開発用 Vite React SPA
```

## クイックスタート

### インスタントモード（Astro プロジェクト向け）

**1. インストール**

```bash
pnpm add @qwq-net/core @qwq-net/instant
```

**2. 設定ファイルを作成**

```typescript
// editor.config.ts
import { defineConfig } from '@qwq-net/core';

export default defineConfig({
  mode: {
    type: 'instant',
    contentDir: './src/content/blog',
    fileLayout: 'directory',   // slug/index.mdx
    fileExtension: 'mdx',
    imageStyle: 'mdx-imports', // named import 方式
  },
  frontmatter: {
    title:       { type: 'string',  label: 'Title',       required: true },
    description: { type: 'string',  label: 'Description', required: true },
    pubDate:     { type: 'date',    label: 'Publish Date', required: true },
    tags:        { type: 'tags',    label: 'Tags', options: ['Blog', 'TypeScript'] },
    draft:       { type: 'boolean', label: 'Draft', defaultValue: false },
  },
});
```

**3. Astro に統合**

```javascript
// astro.config.mjs
import { qwqEditorIntegration } from '@qwq-net/instant';
import editorConfig from './editor.config.ts';

export default defineConfig({
  integrations: [
    qwqEditorIntegration(editorConfig),
  ],
});
```

**4. 起動**

```bash
npm run dev
# → http://localhost:4321/__editor でエディタ SPA が開く
```

本番ビルド (`npm run build`) にはエディタのコードは一切含まれない (`apply: 'serve'`)。

### エンベデッドモード（React コンポーネント単体利用）

```bash
pnpm add @qwq-net/core @qwq-net/editor
```

```tsx
import { RichEditor } from '@qwq-net/editor';
import '@qwq-net/editor/styles';
import { defineConfig } from '@qwq-net/core';

const config = defineConfig({
  mode: { type: 'embedded' },
  frontmatter: {
    title: { type: 'string', label: 'Title', required: true },
  },
});

function Editor() {
  return (
    <RichEditor
      slug="my-post"
      config={config}
      initialContent="## Hello\n\nStart writing..."
      storageAdapter={myS3Adapter}
      onSave={(result) => console.log('Saved:', result.location)}
    />
  );
}
```

## エディタ機能

| 機能 | 詳細 |
|---|---|
| リッチテキスト | 太字・斜体・打ち消し線・インラインコード・リンク |
| 見出し | H1 / H2 / H3 |
| ブロック | コードブロック (シンタックスハイライト)、引用、水平線 |
| リスト | 箇条書き・番号付きリスト |
| テーブル | リサイズ可能な GFM テーブル |
| 画像 | ドラッグ&ドロップ / ペースト → StorageAdapter 経由でアップロード |
| スラッシュコマンド | `/` 入力でコマンドパレットを表示 (10 種類) |
| バブルメニュー | テキスト選択時にフローティングツールバーを表示 |
| フロントマター | 折りたたみ可能なメタデータパネル (string / date / boolean / image / tags) |
| 保存 | `Ctrl+S` でオンデマンド保存 + debounce による自動保存 |

## 開発

```bash
# 依存関係のインストール
pnpm install

# 全パッケージのビルド
pnpm build

# playground の起動
pnpm playground

# テスト
pnpm test

# 型チェック
pnpm typecheck
```

## 技術スタック

- **エディタ**: [Tiptap](https://tiptap.dev/) (ProseMirror)
- **ビルド**: tsup (ESM/CJS dual output)
- **モノレポ**: pnpm workspaces
- **設定バリデーション**: Zod
- **テスト**: Vitest
- **UI**: React 18/19

## ライセンス

MIT

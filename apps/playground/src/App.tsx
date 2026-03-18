import { useCallback, useState } from 'react';
import { toMDX, toMarkdown, defineConfig } from '@qwq-net/core';
import type { TiptapDoc } from '@qwq-net/core';
import { RichEditor } from '@qwq-net/editor';
import '@qwq-net/editor/styles';
import { DocInspector } from './components/DocInspector.js';
import { MdxPreview } from './components/MdxPreview.js';

const config = defineConfig({
  mode: {
    type: 'instant',
    contentDir: './src/content/blog',
    fileLayout: 'directory',
    fileExtension: 'mdx',
    imageStyle: 'mdx-imports',
    editorPath: '/__editor',
  },
  frontmatter: {
    title:       { type: 'string',  label: 'タイトル',    required: true },
    description: { type: 'string',  label: '概要',        required: true },
    pubDate:     { type: 'date',    label: '公開日',      required: true },
    heroImage:   { type: 'image',   label: 'ヒーロー画像' },
    tags:        { type: 'tags',    label: 'タグ', options: ['ブログ', 'プログラミング', 'TypeScript'] },
    draft:       { type: 'boolean', label: '下書き', defaultValue: false },
  },
});

const instantConfig = config.mode as import('@qwq-net/core').InstantModeConfig;

const SAMPLE_MDX = `---
title: 'サンプル記事'
description: 'qwq-editorの動作確認用サンプルです。'
pubDate: '2026-03-12'
tags: ['ブログ', 'プログラミング']
draft: false
---

## はじめに

これは**太字**と_斜体_を含む段落です。[リンク](https://astro.build/)も使えます。

![ヒーロー画像](data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23f7f6f3%22%2F%3E%3Crect%20x%3D%22300%22%20y%3D%22100%22%20width%3D%22200%22%20height%3D%22140%22%20rx%3D%228%22%20fill%3D%22%23e3e2de%22%2F%3E%3Ccircle%20cx%3D%22345%22%20cy%3D%22145%22%20r%3D%2220%22%20fill%3D%22%23d4d3d0%22%2F%3E%3Cpolygon%20points%3D%22300%2C240%20380%2C160%20500%2C240%22%20fill%3D%22%23d4d3d0%22%2F%3E%3Cpolygon%20points%3D%22400%2C240%20450%2C185%20500%2C240%22%20fill%3D%22%23c8c7c4%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22300%22%20text-anchor%3D%22middle%22%20fill%3D%22%239b9a97%22%20font-size%3D%2224%22%20font-family%3D%22system-ui%2Csans-serif%22%3EHero%20Image%3C%2Ftext%3E%3C%2Fsvg%3E)

## コード例

\`\`\`typescript
const greet = (name: string) => \`こんにちは、\${name}さん！\`;
console.log(greet('世界'));
\`\`\`

## リスト

- 項目その1
- 項目その2
- 項目その3

## テーブル

| 機能 | 状態 |
|---|---|
| toMDX | 完了 |
| fromMarkdown | 完了 |
`;

type InspectTab = 'doc' | 'mdx' | 'md';

export default function App() {
  const [editorDoc, setEditorDoc] = useState<TiptapDoc | null>(null);
  const [editorFrontmatter, setEditorFrontmatter] = useState<Record<string, unknown>>({});
  const [inspectTab, setInspectTab] = useState<InspectTab | null>(null);

  const handleEditorChange = useCallback(
    (data: { doc: TiptapDoc; frontmatter: Record<string, unknown> }) => {
      setEditorDoc(data.doc);
      setEditorFrontmatter(data.frontmatter);
    },
    [],
  );

  const mdxOutput = editorDoc ? toMDX(editorDoc, editorFrontmatter, instantConfig) : '';
  const mdOutput = editorDoc ? toMarkdown(editorDoc, editorFrontmatter) : '';

  const inspectTabs: { id: InspectTab; label: string }[] = [
    { id: 'doc', label: 'TiptapDoc' },
    { id: 'mdx', label: 'toMDX()' },
    { id: 'md',  label: 'toMarkdown()' },
  ];

  return (
    <div style={layoutStyle}>
      {/* Main: RichEditor (full width) */}
      <div style={editorAreaStyle}>
        <RichEditor
          slug="playground-post"
          config={config}
          initialContent={SAMPLE_MDX}
          onChange={handleEditorChange}
        />
      </div>

      {/* Bottom: Inspect panel (collapsible) */}
      <div style={inspectBarStyle}>
        <div style={inspectTabsStyle}>
          {inspectTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setInspectTab(inspectTab === tab.id ? null : tab.id)}
              style={{
                ...inspectTabBtnStyle,
                color: inspectTab === tab.id ? '#2eaadc' : '#787774',
                borderBottom: inspectTab === tab.id ? '2px solid #2eaadc' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {inspectTab && (
        <div style={inspectPanelStyle}>
          {inspectTab === 'doc' && editorDoc && (
            <DocInspector doc={editorDoc} frontmatter={editorFrontmatter} />
          )}
          {inspectTab === 'mdx' && (
            <MdxPreview content={mdxOutput} label="MDX output (toMDX)" />
          )}
          {inspectTab === 'md' && (
            <MdxPreview content={mdOutput} label="Markdown output (toMarkdown)" />
          )}
        </div>
      )}
    </div>
  );
}

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  background: '#e8e7e3',
};

const editorAreaStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
  minHeight: 0,
  maxWidth: 960,
  width: '100%',
  margin: '0 auto',
  background: '#ffffff',
  boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)',
};

const inspectBarStyle: React.CSSProperties = {
  borderTop: '1px solid #e3e2de',
  background: '#f7f6f3',
  flexShrink: 0,
};

const inspectTabsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 0,
  padding: '0 16px',
};

const inspectTabBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const inspectPanelStyle: React.CSSProperties = {
  height: '35vh',
  overflow: 'auto',
  borderTop: '1px solid #e3e2de',
  background: '#1e1e2e',
};

import { useCallback, useRef, useState } from 'react';
import { fromMarkdown, toMDX, toMarkdown, defineConfig } from '@qwq-net/core';
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
    title:       { type: 'string',  label: 'Title',       required: true },
    description: { type: 'string',  label: 'Description', required: true },
    pubDate:     { type: 'date',    label: 'Publish Date', required: true },
    heroImage:   { type: 'image',   label: 'Hero Image' },
    tags:        { type: 'tags',    label: 'Tags', options: ['Blog', 'Programming', 'TypeScript'] },
    draft:       { type: 'boolean', label: 'Draft', defaultValue: false },
  },
});

const instantConfig = config.mode as import('@qwq-net/core').InstantModeConfig;

const SAMPLE_MDX = `---
title: 'Sample Post'
description: 'A sample post for testing the playground.'
pubDate: '2026-03-12'
tags: ['Blog', 'Programming']
draft: false
---

## Introduction

This is a **bold** and _italic_ paragraph with a [link](https://astro.build/).

![Hero image](data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23f7f6f3%22%2F%3E%3Crect%20x%3D%22300%22%20y%3D%22100%22%20width%3D%22200%22%20height%3D%22140%22%20rx%3D%228%22%20fill%3D%22%23e3e2de%22%2F%3E%3Ccircle%20cx%3D%22345%22%20cy%3D%22145%22%20r%3D%2220%22%20fill%3D%22%23d4d3d0%22%2F%3E%3Cpolygon%20points%3D%22300%2C240%20380%2C160%20500%2C240%22%20fill%3D%22%23d4d3d0%22%2F%3E%3Cpolygon%20points%3D%22400%2C240%20450%2C185%20500%2C240%22%20fill%3D%22%23c8c7c4%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22300%22%20text-anchor%3D%22middle%22%20fill%3D%22%239b9a97%22%20font-size%3D%2224%22%20font-family%3D%22system-ui%2Csans-serif%22%3EHero%20Image%20Placeholder%3C%2Ftext%3E%3C%2Fsvg%3E)

## Code Example

\`\`\`typescript
const greeting = (name: string) => \`Hello, \${name}!\`;
console.log(greeting('world'));
\`\`\`

## List

- Item one
- Item two
- Item three

## Table

| Feature | Status |
|---|---|
| toMDX | Done |
| fromMarkdown | Done |
`;

// Data source: either from the textarea or from the RichEditor
type Source = 'textarea' | 'editor';

type Tab = 'editor' | 'doc' | 'mdx' | 'md';

export default function App() {
  const [input, setInput] = useState(SAMPLE_MDX);
  const [activeTab, setActiveTab] = useState<Tab>('editor');

  // Track the live editor state separately so edits in the RichEditor
  // are reflected in the other tabs without re-parsing the textarea.
  const [editorDoc, setEditorDoc] = useState<TiptapDoc | null>(null);
  const [editorFrontmatter, setEditorFrontmatter] = useState<Record<string, unknown>>({});
  const sourceRef = useRef<Source>('textarea');

  // Determine which data to show in the output tabs
  let doc: TiptapDoc | null = null;
  let frontmatter: Record<string, unknown> = {};
  let parseError: string | null = null;

  if (sourceRef.current === 'editor' && editorDoc) {
    doc = editorDoc;
    frontmatter = editorFrontmatter;
  } else {
    try {
      const parsed = fromMarkdown(input);
      doc = parsed.doc;
      frontmatter = parsed.frontmatter;
    } catch (e) {
      parseError = String(e);
    }
  }

  const mdxOutput = doc ? toMDX(doc, frontmatter, instantConfig) : '';
  const mdOutput = doc ? toMarkdown(doc, frontmatter) : '';

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    sourceRef.current = 'textarea';
    setInput(e.target.value);
  };

  const handleEditorChange = useCallback(
    (data: { doc: TiptapDoc; frontmatter: Record<string, unknown> }) => {
      sourceRef.current = 'editor';
      setEditorDoc(data.doc);
      setEditorFrontmatter(data.frontmatter);
    },
    [],
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'editor', label: 'RichEditor' },
    { id: 'doc',    label: 'TiptapDoc' },
    { id: 'mdx',    label: 'toMDX()' },
    { id: 'md',     label: 'toMarkdown()' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100vh', background: '#1e1e2e' }}>
      {/* Left: Input textarea */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
        <div style={headerStyle}>
          Input MDX
          {sourceRef.current === 'editor' && (
            <span style={{ marginLeft: 8, color: '#a6e3a1', fontSize: 11, fontWeight: 400 }}>
              (editor → output synced)
            </span>
          )}
        </div>
        <textarea
          value={input}
          onChange={handleTextareaChange}
          style={textareaStyle}
          spellCheck={false}
        />
      </div>

      {/* Right: Output tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', background: '#161616', borderBottom: '1px solid #333', flexShrink: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 20px',
                background: activeTab === tab.id ? '#1e1e2e' : 'transparent',
                color: activeTab === tab.id ? '#89b4fa' : '#888',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #89b4fa' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {parseError && (
            <div style={{ padding: '16px', color: '#f38ba8', fontFamily: 'monospace', fontSize: '13px' }}>
              Parse error: {parseError}
            </div>
          )}

          {/* RichEditor is always mounted but hidden when not active — prevents losing edits on tab switch */}
          <div style={{ height: '100%', display: activeTab === 'editor' ? 'block' : 'none' }}>
            <RichEditor
              slug="playground-post"
              config={config}
              initialContent={input}
              onChange={handleEditorChange}
            />
          </div>

          {activeTab === 'doc' && doc && (
            <DocInspector doc={doc} frontmatter={frontmatter} />
          )}
          {activeTab === 'mdx' && (
            <MdxPreview content={mdxOutput} label="MDX output (toMDX)" />
          )}
          {activeTab === 'md' && (
            <MdxPreview content={mdOutput} label="Markdown output (toMarkdown)" />
          )}
        </div>
      </div>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#888',
  background: '#161616',
  borderBottom: '1px solid #333',
  flexShrink: 0,
};

const textareaStyle: React.CSSProperties = {
  flex: 1,
  resize: 'none',
  background: '#1e1e2e',
  color: '#cdd6f4',
  fontFamily: '"Fira Code", "Cascadia Code", monospace',
  fontSize: '13px',
  lineHeight: 1.6,
  padding: '16px',
  border: 'none',
  outline: 'none',
};

import { useState } from 'react';
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
    tags:        { type: 'tags',    label: 'Tags', options: ['Blog', 'Programming', 'TypeScript'] },
    draft:       { type: 'boolean', label: 'Draft', defaultValue: false },
  },
});

const SAMPLE_MDX = `---
title: 'Sample Post'
description: 'A sample post for testing the playground.'
pubDate: '2026-03-12'
tags: ['Blog', 'Programming']
draft: false
---

import OptimizedImage from '@/components/OptimizedImage.astro';
import heroImage from './hero.jpg';

## Introduction

This is a **bold** and _italic_ paragraph with a [link](https://astro.build/).

<OptimizedImage src={heroImage} alt="Hero image" />

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

type Tab = 'editor' | 'doc' | 'mdx' | 'md';

export default function App() {
  const [input, setInput] = useState(SAMPLE_MDX);
  const [activeTab, setActiveTab] = useState<Tab>('editor');

  let parsed: { frontmatter: Record<string, unknown>; doc: TiptapDoc } | null = null;
  let parseError: string | null = null;
  try {
    parsed = fromMarkdown(input);
  } catch (e) {
    parseError = String(e);
  }

  const instantConfig = config.mode as import('@qwq-net/core').InstantModeConfig;
  const mdxOutput = parsed ? toMDX(parsed.doc, parsed.frontmatter, instantConfig) : '';
  const mdOutput = parsed ? toMarkdown(parsed.doc, parsed.frontmatter) : '';

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
        <div style={headerStyle}>Input MDX</div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
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

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {parseError ? (
            <div style={{ padding: '16px', color: '#f38ba8', fontFamily: 'monospace', fontSize: '13px' }}>
              Parse error: {parseError}
            </div>
          ) : activeTab === 'editor' ? (
            <div style={{ height: '100%' }}>
              <RichEditor
                slug="playground-post"
                config={config}
                initialContent={input}
              />
            </div>
          ) : activeTab === 'doc' && parsed ? (
            <DocInspector doc={parsed.doc} frontmatter={parsed.frontmatter} />
          ) : activeTab === 'mdx' ? (
            <MdxPreview content={mdxOutput} label="MDX output (toMDX)" />
          ) : (
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

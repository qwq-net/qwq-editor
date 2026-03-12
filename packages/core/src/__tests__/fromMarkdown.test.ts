import { describe, it, expect } from 'vitest';
import { fromMarkdown } from '../serializer/fromMarkdown.js';

const fm = (extra = '') => `---
title: 'Test Post'
draft: false
${extra}---

`;

describe('fromMarkdown', () => {
  it('parses frontmatter', () => {
    const { frontmatter } = fromMarkdown(`${fm()}Hello`);
    expect(frontmatter.title).toBe('Test Post');
    expect(frontmatter.draft).toBe(false);
  });

  it('parses a paragraph', () => {
    const { doc } = fromMarkdown(`${fm()}Hello world`);
    expect(doc.content[0]).toMatchObject({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello world' }],
    });
  });

  it('parses bold and italic', () => {
    const { doc } = fromMarkdown(`${fm()}**bold** and _italic_`);
    const content = doc.content[0].content ?? [];
    expect(content.some((n) => n.marks?.some((m) => m.type === 'bold'))).toBe(true);
    expect(content.some((n) => n.marks?.some((m) => m.type === 'italic'))).toBe(true);
  });

  it('parses a heading', () => {
    const { doc } = fromMarkdown(`${fm()}## Section Title`);
    expect(doc.content[0]).toMatchObject({
      type: 'heading',
      attrs: { level: 2 },
    });
  });

  it('parses a fenced code block', () => {
    const { doc } = fromMarkdown(`${fm()}\`\`\`typescript\nconst x = 1;\n\`\`\``);
    expect(doc.content[0]).toMatchObject({
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [{ type: 'text', text: 'const x = 1;' }],
    });
  });

  it('parses a bullet list', () => {
    const { doc } = fromMarkdown(`${fm()}- Item A\n- Item B`);
    expect(doc.content[0].type).toBe('bulletList');
    expect(doc.content[0].content).toHaveLength(2);
  });

  it('parses an ordered list', () => {
    const { doc } = fromMarkdown(`${fm()}1. First\n2. Second`);
    expect(doc.content[0].type).toBe('orderedList');
  });

  it('parses horizontal rule', () => {
    const { doc } = fromMarkdown(`${fm()}---`);
    expect(doc.content[0].type).toBe('horizontalRule');
  });

  it('parses a link', () => {
    const { doc } = fromMarkdown(`${fm()}[Astro](https://astro.build/)`);
    const content = doc.content[0].content ?? [];
    const linkNode = content.find((n) => n.marks?.some((m) => m.type === 'link'));
    expect(linkNode).toBeDefined();
    expect(linkNode?.marks?.[0].attrs?.href).toBe('https://astro.build/');
  });

  it('parses a plain markdown image', () => {
    const { doc } = fromMarkdown(`${fm()}![Hero](./hero.jpg)`);
    expect(doc.content[0]).toMatchObject({
      type: 'paragraph',
      content: [{ type: 'image', attrs: { src: './hero.jpg', alt: 'Hero' } }],
    });
  });

  it('converts MDX named import images back to image nodes', () => {
    const mdx = `---
title: Test
---

import OptimizedImage from '@/components/OptimizedImage.astro';
import heroImage from './hero.jpg';
import workersDeploy from './workers-deploy.jpg';

Body text.

<OptimizedImage src={heroImage} alt="Hero" />

<OptimizedImage src={workersDeploy} />
`;
    const { doc } = fromMarkdown(mdx);
    const imageNodes = doc.content.flatMap((n) =>
      (n.content ?? []).filter((c) => c.type === 'image'),
    ).concat(doc.content.filter((n) => n.type === 'image'));

    expect(imageNodes).toHaveLength(2);
    expect(imageNodes[0].attrs?.src).toBe('./hero.jpg');
    expect(imageNodes[0].attrs?.alt).toBe('Hero');
    expect(imageNodes[1].attrs?.src).toBe('./workers-deploy.jpg');
  });

  it('parses a GFM table', () => {
    const { doc } = fromMarkdown(`${fm()}| Name | Role |\n|---|---|\n| Alice | Dev |`);
    expect(doc.content[0].type).toBe('table');
    const firstRow = doc.content[0].content?.[0];
    expect(firstRow?.type).toBe('tableRow');
    expect(firstRow?.content?.[0].type).toBe('tableHeader');
  });

  it('parses strikethrough (GFM)', () => {
    const { doc } = fromMarkdown(`${fm()}~~deleted~~`);
    const content = doc.content[0].content ?? [];
    expect(content.some((n) => n.marks?.some((m) => m.type === 'strike'))).toBe(true);
  });
});

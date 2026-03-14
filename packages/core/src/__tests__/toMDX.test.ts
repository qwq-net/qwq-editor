import { describe, it, expect } from 'vitest';
import { toMDX } from '../serializer/toMDX.js';
import type { TiptapDoc } from '../types.js';
import type { InstantModeConfig } from '../config/schema.js';

const baseConfig: InstantModeConfig = {
  type: 'instant',
  contentDir: './src/content/blog',
  fileLayout: 'directory',
  fileExtension: 'mdx',
  imageStyle: 'mdx-imports',
  imageComponent: 'OptimizedImage',
  imageComponentImport: '@/components/OptimizedImage.astro',
  editorPath: '/__editor',
};

const plainConfig: InstantModeConfig = { ...baseConfig, imageStyle: 'plain' };

function doc(...content: TiptapDoc['content']): TiptapDoc {
  return { type: 'doc', content };
}

describe('toMDX', () => {
  it('serializes frontmatter', () => {
    const result = toMDX(doc(), { title: 'Hello', draft: false }, baseConfig);
    expect(result).toContain("title: Hello");
    expect(result).toContain('draft: false');
  });

  it('serializes a paragraph', () => {
    const d = doc({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello world' }],
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('Hello world');
  });

  it('serializes bold and italic text', () => {
    const d = doc({
      type: 'paragraph',
      content: [
        { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' and ' },
        { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
      ],
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('**bold**');
    expect(result).toContain('_italic_');
  });

  it('serializes headings', () => {
    const d = doc(
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Section' }] },
    );
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('## Section');
  });

  it('serializes local image with named import (mdx-imports)', () => {
    const d = doc({
      type: 'image',
      attrs: { src: './hero.jpg', alt: 'Hero' },
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain("import OptimizedImage from '@/components/OptimizedImage.astro';");
    expect(result).toContain("import hero from './hero.jpg';");
    expect(result).toContain('<OptimizedImage src={hero} alt="Hero" />');
  });

  it('serializes remote image as plain markdown even in mdx-imports mode', () => {
    const d = doc({
      type: 'image',
      attrs: { src: 'https://example.com/img.png', alt: 'Remote' },
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('![Remote](https://example.com/img.png)');
    expect(result).not.toContain('import OptimizedImage');
  });

  it('serializes image as plain markdown in plain mode', () => {
    const d = doc({
      type: 'image',
      attrs: { src: './hero.jpg', alt: 'Hero' },
    });
    const result = toMDX(d, {}, plainConfig);
    expect(result).toContain('![Hero](./hero.jpg)');
    expect(result).not.toContain('import OptimizedImage');
  });

  it('serializes code block with language', () => {
    const d = doc({
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [{ type: 'text', text: 'const x = 1;' }],
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('```typescript\nconst x = 1;\n```');
  });

  it('serializes bullet list', () => {
    const d = doc({
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item A' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item B' }] }] },
      ],
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('- Item A');
    expect(result).toContain('- Item B');
  });

  it('serializes ordered list', () => {
    const d = doc({
      type: 'orderedList',
      attrs: { start: 1 },
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second' }] }] },
      ],
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('1. First');
    expect(result).toContain('2. Second');
  });

  it('serializes horizontal rule', () => {
    const d = doc({ type: 'horizontalRule' });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('---');
  });

  it('serializes link', () => {
    const d = doc({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Astro',
          marks: [{ type: 'link', attrs: { href: 'https://astro.build/' } }],
        },
      ],
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('[Astro](https://astro.build/)');
  });

  it('serializes a table', () => {
    const d = doc({
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }] },
            { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Role' }] }] },
          ],
        },
        {
          type: 'tableRow',
          content: [
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Alice' }] }] },
            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Dev' }] }] },
          ],
        },
      ],
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('| Name | Role |');
    expect(result).toContain('| --- | --- |');
    expect(result).toContain('| Alice | Dev |');
  });

  it('deduplicates import for same image used twice', () => {
    const d = doc(
      { type: 'image', attrs: { src: './hero.jpg', alt: 'First' } },
      { type: 'image', attrs: { src: './hero.jpg', alt: 'Second' } },
    );
    const result = toMDX(d, {}, baseConfig);
    const importCount = (result.match(/import hero from/g) ?? []).length;
    expect(importCount).toBe(1);
  });

  it('serializes bold+code marks in correct nesting order', () => {
    const d = doc({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'code',
          marks: [{ type: 'bold' }, { type: 'code' }],
        },
      ],
    });
    const result = toMDX(d, {}, baseConfig);
    // code should be innermost: **`code`**
    expect(result).toContain('**`code`**');
  });

  it('serializes empty frontmatter', () => {
    const result = toMDX(doc(), {}, baseConfig);
    expect(result).toMatch(/^---\n---/);
  });

  it('serializes blockquote', () => {
    const d = doc({
      type: 'blockquote',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'quoted' }] }],
    });
    const result = toMDX(d, {}, baseConfig);
    expect(result).toContain('> quoted');
  });
});

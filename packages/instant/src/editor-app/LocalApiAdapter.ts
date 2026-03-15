import type { StorageAdapter, ContentContext } from '@qwq-net/core';

export class LocalApiAdapter implements StorageAdapter {
  async uploadImage(file: File, ctx: ContentContext): Promise<{ src: string; alt?: string }> {
    const params = new URLSearchParams({ slug: ctx.slug, filename: file.name });
    const res = await fetch(`/__editor/api/upload?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    return res.json() as Promise<{ src: string; alt?: string }>;
  }

  async saveContent(
    content: string,
    _frontmatter: Record<string, unknown>,
    ctx: ContentContext,
  ): Promise<{ location: string }> {
    const res = await fetch('/__editor/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, slug: ctx.slug }),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.statusText}`);
    return res.json() as Promise<{ location: string }>;
  }

  async loadContent(ctx: ContentContext): Promise<string | null> {
    const params = new URLSearchParams({ slug: ctx.slug });
    const res = await fetch(`/__editor/api/content?${params}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { content: string | null };
    return data.content;
  }
}

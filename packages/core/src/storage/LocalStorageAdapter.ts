import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import matter from 'gray-matter';
import type { StorageAdapter, ContentContext } from './StorageAdapter.js';
import type { InstantModeConfig } from '../config/schema.js';

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private config: InstantModeConfig) {}

  private resolveContentPath(ctx: ContentContext): string {
    const { contentDir, fileLayout, fileExtension } = this.config;
    if (fileLayout === 'directory') {
      return path.join(contentDir, ctx.slug, `index.${fileExtension}`);
    }
    return path.join(contentDir, `${ctx.slug}.${fileExtension}`);
  }

  async loadContent(ctx: ContentContext): Promise<string | null> {
    const filePath = this.resolveContentPath(ctx);
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  async saveContent(
    content: string,
    _frontmatter: Record<string, unknown>,
    ctx: ContentContext,
  ): Promise<{ location: string }> {
    // `content` is the fully serialized file (toMDX / toMarkdown already includes frontmatter).
    // `_frontmatter` is available for adapters that need metadata separately (e.g. S3/DB).
    const filePath = this.resolveContentPath(ctx);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return { location: filePath };
  }

  async uploadImage(file: File, ctx: ContentContext): Promise<{ src: string; alt?: string }> {
    const { fileLayout, contentDir } = this.config;
    const dir =
      fileLayout === 'directory' ? path.join(contentDir, ctx.slug) : contentDir;
    await fs.mkdir(dir, { recursive: true });
    const dest = path.join(dir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(dest, buffer);
    return { src: `./${file.name}` };
  }
}

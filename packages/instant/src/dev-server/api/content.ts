import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { InstantModeConfig } from '@qwq-net/core';

function resolveContentPath(config: InstantModeConfig, root: string, slug: string): string {
  const contentDir = path.resolve(root, config.contentDir);
  if (config.fileLayout === 'directory') {
    return path.join(contentDir, slug, `index.${config.fileExtension}`);
  }
  return path.join(contentDir, `${slug}.${config.fileExtension}`);
}

export async function handleContent(
  req: IncomingMessage,
  res: ServerResponse,
  config: InstantModeConfig,
  root: string,
): Promise<void> {
  const url = new URL(req.url!, 'http://localhost');
  const slug = url.searchParams.get('slug');

  if (!slug) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'slug is required' }));
    return;
  }

  const filePath = resolveContentPath(config, root, slug);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ content }));
  } catch {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ content: null }));
  }
}

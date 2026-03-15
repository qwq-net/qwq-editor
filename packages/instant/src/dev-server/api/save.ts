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

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export async function handleSave(
  req: IncomingMessage,
  res: ServerResponse,
  config: InstantModeConfig,
  root: string,
): Promise<void> {
  try {
    const body = await readBody(req);
    const { content, slug } = JSON.parse(body) as { content: string; slug: string };

    if (!slug || !content) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'content and slug are required' }));
      return;
    }

    const filePath = resolveContentPath(config, root, slug);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ location: filePath }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: String(err) }));
  }
}

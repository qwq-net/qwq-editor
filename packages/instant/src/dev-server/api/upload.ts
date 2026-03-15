import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { InstantModeConfig } from '@qwq-net/core';

async function readBinaryBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export async function handleUpload(
  req: IncomingMessage,
  res: ServerResponse,
  config: InstantModeConfig,
  root: string,
): Promise<void> {
  try {
    const url = new URL(req.url!, 'http://localhost');
    const slug = url.searchParams.get('slug');
    const filename = url.searchParams.get('filename');

    if (!slug || !filename) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'slug and filename are required' }));
      return;
    }

    const contentDir = path.resolve(root, config.contentDir);
    const imageDir =
      config.fileLayout === 'directory'
        ? path.join(contentDir, slug)
        : contentDir;

    await fs.mkdir(imageDir, { recursive: true });

    const safeFilename = path.basename(filename);
    const dest = path.join(imageDir, safeFilename);

    const buffer = await readBinaryBody(req);
    await fs.writeFile(dest, buffer);

    const src =
      config.fileLayout === 'directory' ? `./${safeFilename}` : `./${safeFilename}`;

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ src, alt: '' }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: String(err) }));
  }
}

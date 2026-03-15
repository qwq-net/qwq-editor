import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { InstantModeConfig } from '@qwq-net/core';

export async function handleList(
  _req: IncomingMessage,
  res: ServerResponse,
  config: InstantModeConfig,
  root: string,
): Promise<void> {
  const contentDir = path.resolve(root, config.contentDir);

  try {
    const entries = await fs.readdir(contentDir, { withFileTypes: true });
    const slugs: string[] = [];

    for (const entry of entries) {
      if (config.fileLayout === 'directory') {
        if (entry.isDirectory()) {
          // Check if index file exists
          const indexFile = path.join(contentDir, entry.name, `index.${config.fileExtension}`);
          try {
            await fs.access(indexFile);
            slugs.push(entry.name);
          } catch {
            // directory without index file — skip
          }
        }
      } else {
        // flat layout
        if (entry.isFile() && entry.name.endsWith(`.${config.fileExtension}`)) {
          slugs.push(entry.name.slice(0, -(config.fileExtension.length + 1)));
        }
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ slugs }));
  } catch {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ slugs: [] }));
  }
}

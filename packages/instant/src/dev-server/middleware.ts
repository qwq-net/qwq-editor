import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { EditorConfig, InstantModeConfig } from '@qwq-net/core';
import { handleList } from './api/list.js';
import { handleContent } from './api/content.js';
import { handleSave } from './api/save.js';
import { handleUpload } from './api/upload.js';

// __dirname is injected by tsup shims (works in both ESM and CJS)
declare const __dirname: string;
// Editor app is pre-built relative to this compiled file
const EDITOR_APP_DIR = path.join(__dirname, 'editor-app');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

async function serveStatic(pathname: string, res: ServerResponse): Promise<boolean> {
  // Strip /__editor prefix
  const relative = pathname.replace(/^\/__editor/, '') || '/index.html';
  // If no extension → serve SPA index (hash routing)
  const localPath = path.join(
    EDITOR_APP_DIR,
    path.extname(relative) ? relative : '/index.html',
  );

  try {
    const data = await fs.readFile(localPath);
    const ext = path.extname(localPath);
    res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

export function createMiddleware(config: EditorConfig, root: string) {
  if (config.mode.type !== 'instant') {
    throw new Error(
      `[qwq-editor] Instant mode middleware requires mode.type === 'instant', got '${config.mode.type}'`,
    );
  }
  const instantConfig = config.mode;

  return async function qwqEditorMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    const url = req.url ?? '/';
    if (!url.startsWith('/__editor')) {
      next();
      return;
    }

    // API routes
    if (url.startsWith('/__editor/api/')) {
      const apiPath = url.split('?')[0].replace('/__editor/api', '');

      try {
        if (apiPath === '/config' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(config));
          return;
        }
        if (apiPath === '/list' && req.method === 'GET') {
          await handleList(req, res, instantConfig, root);
          return;
        }
        if (apiPath === '/content' && req.method === 'GET') {
          await handleContent(req, res, instantConfig, root);
          return;
        }
        if (apiPath === '/save' && req.method === 'POST') {
          await handleSave(req, res, instantConfig, root);
          return;
        }
        if (apiPath === '/upload' && req.method === 'POST') {
          await handleUpload(req, res, instantConfig, root);
          return;
        }
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: String(err) }));
        return;
      }

      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    // SPA static assets
    const served = await serveStatic(url.split('?')[0], res);
    if (!served) {
      // Fallback to SPA index for unknown paths (hash routing)
      await serveStatic('/__editor/index.html', res);
    }
  };
}

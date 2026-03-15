import type { Plugin } from 'vite';
import type { EditorConfig } from '@qwq-net/core';
import { createMiddleware } from './dev-server/middleware.js';

export function qwqEditorVitePlugin(config: EditorConfig): Plugin {
  return {
    name: 'qwq-editor',
    apply: 'serve', // dev only — zero production impact

    configureServer(server) {
      const root = server.config.root;
      const middleware = createMiddleware(config, root);

      server.middlewares.use((req, res, next) => {
        middleware(req, res, next).catch((err) => {
          console.error('[qwq-editor] middleware error:', err);
          next();
        });
      });
    },
  };
}

import type { AstroIntegration } from 'astro';
import type { EditorConfig } from '@qwq-net/core';
import { qwqEditorVitePlugin } from './vite-plugin.js';

export function qwqEditorIntegration(config: EditorConfig): AstroIntegration {
  return {
    name: '@qwq-net/instant',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [qwqEditorVitePlugin(config)],
          },
        });
      },
    },
  };
}

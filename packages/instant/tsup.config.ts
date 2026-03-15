import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  external: ['vite', 'astro'],
  splitting: false,
  shims: true, // inject __dirname/__filename shims for ESM
  clean: false, // don't delete editor-app built by vite
  platform: 'node',
});

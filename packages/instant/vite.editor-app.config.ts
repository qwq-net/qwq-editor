import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(__dirname, 'src/editor-app'),
  base: '/__editor/',
  build: {
    outDir: path.resolve(__dirname, 'dist/editor-app'),
    emptyOutDir: true,
  },
  plugins: [react()],
});

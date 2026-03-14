import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // LocalStorageAdapter uses Node.js built-ins; externalize them in browser builds
  build: {
    rollupOptions: {
      external: ['node:fs/promises', 'node:path', 'fs/promises', 'path'],
    },
  },
});

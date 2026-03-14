import { type EditorConfig, EditorConfigSchema } from './schema.js';
import type { z } from 'zod';

// Accept the *input* type so Zod default values are treated as optional
export function defineConfig(config: z.input<typeof EditorConfigSchema>): EditorConfig {
  return EditorConfigSchema.parse(config);
}

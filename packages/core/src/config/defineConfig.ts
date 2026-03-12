import { type EditorConfig, EditorConfigSchema } from './schema.js';

export function defineConfig(config: EditorConfig): EditorConfig {
  return EditorConfigSchema.parse(config);
}

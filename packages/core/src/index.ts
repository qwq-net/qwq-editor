// Config
export { defineConfig } from './config/defineConfig.js';
export type { EditorConfig, InstantModeConfig, EmbeddedModeConfig, FrontmatterField } from './config/schema.js';
export { EditorConfigSchema, FrontmatterFieldSchema } from './config/schema.js';

// Storage (interface only — LocalStorageAdapter is in @qwq-net/core/node)
export type { StorageAdapter, ContentContext } from './storage/StorageAdapter.js';

// Serializers
export { toMDX } from './serializer/toMDX.js';
export { toMarkdown } from './serializer/toMarkdown.js';
export { fromMarkdown } from './serializer/fromMarkdown.js';
export type { ParsedContent } from './serializer/fromMarkdown.js';

// Types
export type { TiptapDoc, TiptapNode, TiptapMark } from './types.js';

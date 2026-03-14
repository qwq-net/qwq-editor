// Main component
export { RichEditor } from './components/RichEditor.js';
export type { RichEditorProps } from './components/RichEditor.js';

// Hooks (for advanced usage)
export { useRichEditor } from './hooks/useRichEditor.js';
export type { UseRichEditorOptions } from './hooks/useRichEditor.js';

export { useSave } from './hooks/useSave.js';
export type { UseSaveOptions } from './hooks/useSave.js';

export { useImageUpload } from './hooks/useImageUpload.js';

// Sub-components (for custom layouts)
export { Toolbar } from './components/Toolbar/index.js';
export { BubbleMenu } from './components/BubbleMenu/BubbleMenu.js';
export { FrontmatterPanel } from './components/FrontmatterPanel/FrontmatterPanel.js';
export { SlashMenu } from './components/SlashMenu/SlashMenu.js';
export type { SlashMenuRef } from './components/SlashMenu/SlashMenu.js';

// Extensions
export { ImageUploadExtension } from './extensions/ImageUploadExtension.js';
export type { ImageUploadOptions } from './extensions/ImageUploadExtension.js';

export { SlashExtension, defaultCommands } from './extensions/SlashExtension.js';
export type { SlashCommand } from './extensions/SlashExtension.js';

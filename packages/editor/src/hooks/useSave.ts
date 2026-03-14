import { useCallback, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { toMDX, toMarkdown } from '@qwq-net/core';
import type { EditorConfig, StorageAdapter, ContentContext } from '@qwq-net/core';

export interface UseSaveOptions {
  editor: Editor | null;
  frontmatter: Record<string, unknown>;
  config: EditorConfig;
  storageAdapter?: StorageAdapter;
  contentContext?: ContentContext;
  onSave?: (result: { location: string }) => void;
  debounceMs?: number;
}

export function useSave({
  editor,
  frontmatter,
  config,
  storageAdapter,
  contentContext,
  onSave,
  debounceMs = 2000,
}: UseSaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    if (!editor || !storageAdapter || !contentContext) return;

    const doc = editor.getJSON() as Parameters<typeof toMDX>[0];
    const content =
      config.mode.type === 'instant'
        ? toMDX(doc, frontmatter, config.mode)
        : toMarkdown(doc, frontmatter);

    const result = await storageAdapter.saveContent(content, frontmatter, contentContext);
    onSave?.(result);
  }, [editor, frontmatter, config, storageAdapter, contentContext, onSave]);

  // Debounced auto-save on editor update
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(save, debounceMs);
    };
    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [editor, save, debounceMs]);

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [save]);

  return { save };
}

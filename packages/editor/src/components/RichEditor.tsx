import { useState, useEffect, useCallback } from 'react';
import { EditorContent } from '@tiptap/react';
import type { EditorConfig, StorageAdapter, ContentContext, TiptapDoc } from '@qwq-net/core';
import { useRichEditor } from '../hooks/useRichEditor.js';
import { useSave } from '../hooks/useSave.js';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { Toolbar } from './Toolbar/index.js';
import { BubbleMenu } from './BubbleMenu/BubbleMenu.js';
import { FrontmatterPanel } from './FrontmatterPanel/FrontmatterPanel.js';

/** Get today's date in JST as yyyy-MM-dd */
function getJSTDateString(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}

export interface RichEditorProps {
  slug: string;
  config: EditorConfig;
  initialContent?: string;
  storageAdapter?: StorageAdapter;
  onSave?: (result: { location: string }) => void;
  onChange?: (data: { doc: TiptapDoc; frontmatter: Record<string, unknown> }) => void;
  className?: string;
}

export function RichEditor({
  slug,
  config,
  initialContent,
  storageAdapter,
  onSave,
  onChange,
  className,
}: RichEditorProps) {
  const contentContext: ContentContext = { slug };

  const { editor, frontmatter: initialFrontmatter } = useRichEditor({
    initialContent,
    config,
    storageAdapter,
    contentContext,
  });

  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>(() => {
    // For new content, apply default values from config (especially dates)
    if (!initialContent && config.frontmatter) {
      const defaults: Record<string, unknown> = { ...initialFrontmatter };
      for (const [key, field] of Object.entries(config.frontmatter)) {
        if (defaults[key] != null) continue;
        if (field.type === 'date') {
          // Default date fields to today in JST (yyyy-MM-dd)
          defaults[key] = getJSTDateString();
        } else if ('defaultValue' in field && field.defaultValue != null) {
          defaults[key] = field.defaultValue;
        }
      }
      return defaults;
    }
    return initialFrontmatter;
  });

  const { save } = useSave({
    editor,
    frontmatter,
    config,
    storageAdapter,
    contentContext,
    onSave,
  });

  const { uploadImage, isUploading } = useImageUpload(editor, storageAdapter, contentContext);

  // Emit onChange when editor content updates
  useEffect(() => {
    if (!editor || !onChange) return;
    const handler = () => {
      onChange({ doc: editor.getJSON() as TiptapDoc, frontmatter });
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); };
  }, [editor, onChange, frontmatter]);

  // Emit onChange when frontmatter updates
  const handleFrontmatterChange = useCallback(
    (updated: Record<string, unknown>) => {
      setFrontmatter(updated);
      if (editor && onChange) {
        onChange({ doc: editor.getJSON() as TiptapDoc, frontmatter: updated });
      }
    },
    [editor, onChange],
  );

  if (!editor) return null;

  return (
    <div data-qwq-editor className={`qwq-editor ${className ?? ''}`}>
      <FrontmatterPanel
        config={config}
        frontmatter={frontmatter}
        onChange={handleFrontmatterChange}
      />

      <div className="qwq-editor-main">
        <Toolbar editor={editor} onImageUpload={storageAdapter ? uploadImage : undefined} />

        <div className="qwq-editor-content-wrapper">
          <BubbleMenu editor={editor} />
          <EditorContent editor={editor} className="qwq-editor-content" />
        </div>

        <div className="qwq-editor-footer">
          {isUploading && <span className="qwq-uploading">画像をアップロード中...</span>}
          <button
            type="button"
            className="qwq-save-btn"
            onClick={save}
            disabled={!storageAdapter}
            title={storageAdapter ? '保存 (Ctrl+S)' : 'StorageAdapterが未設定です'}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

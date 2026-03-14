import type { Editor } from '@tiptap/core';

interface HistoryGroupProps {
  editor: Editor;
}

export function HistoryGroup({ editor }: HistoryGroupProps) {
  return (
    <div className="qwq-toolbar-group">
      <button
        type="button"
        className="qwq-toolbar-btn"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="元に戻す (Ctrl+Z)"
      >
        ↩
      </button>
      <button
        type="button"
        className="qwq-toolbar-btn"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="やり直し (Ctrl+Y)"
      >
        ↪
      </button>
    </div>
  );
}

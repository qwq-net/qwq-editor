import type { Editor } from '@tiptap/core';

interface InsertGroupProps {
  editor: Editor;
  onImageUpload?: (file: File) => void;
}

export function InsertGroup({ editor, onImageUpload }: InsertGroupProps) {
  const handleImageClick = () => {
    if (onImageUpload) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) onImageUpload(file);
      };
      input.click();
    } else {
      const url = window.prompt('画像URL:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="qwq-toolbar-group">
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="箇条書きリスト"
      >
        ≡
      </button>
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="番号付きリスト"
      >
        1.
      </button>
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="引用"
      >
        "
      </button>
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="コードブロック"
      >
        {'{ }'}
      </button>
      <button
        type="button"
        className="qwq-toolbar-btn"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="テーブル"
      >
        ⊞
      </button>
      <button
        type="button"
        className="qwq-toolbar-btn"
        onClick={handleImageClick}
        title="画像"
      >
        🖼
      </button>
      <button
        type="button"
        className="qwq-toolbar-btn"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="区切り線"
      >
        ─
      </button>
    </div>
  );
}

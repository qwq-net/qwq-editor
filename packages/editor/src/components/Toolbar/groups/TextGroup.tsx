import type { Editor } from '@tiptap/core';

interface TextGroupProps {
  editor: Editor;
}

export function TextGroup({ editor }: TextGroupProps) {
  return (
    <div className="qwq-toolbar-group">
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().toggleBold()}
        title="太字 (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().toggleItalic()}
        title="斜体 (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().toggleStrike()}
        title="打ち消し線"
      >
        <s>S</s>
      </button>
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().toggleCode()}
        title="インラインコード"
      >
        {'<>'}
      </button>
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
        onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt('URL:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        title="リンク"
      >
        🔗
      </button>
    </div>
  );
}

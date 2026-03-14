import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/core';

interface BubbleMenuProps {
  editor: Editor;
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: 'top' }}
      className="qwq-bubble-menu"
    >
      <button
        type="button"
        className={`qwq-bubble-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="太字"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className={`qwq-bubble-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="斜体"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        className={`qwq-bubble-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="打ち消し線"
      >
        <s>S</s>
      </button>
      <button
        type="button"
        className={`qwq-bubble-btn ${editor.isActive('code') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="インラインコード"
      >
        {'<>'}
      </button>
      <div className="qwq-bubble-separator" />
      <button
        type="button"
        className={`qwq-bubble-btn ${editor.isActive('link') ? 'is-active' : ''}`}
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
      {(['1', '2', '3'] as const).map((level) => (
        <button
          key={level}
          type="button"
          className={`qwq-bubble-btn ${editor.isActive('heading', { level: Number(level) }) ? 'is-active' : ''}`}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: Number(level) as 1 | 2 | 3 })
              .run()
          }
          title={`見出し${level}`}
        >
          H{level}
        </button>
      ))}
    </TiptapBubbleMenu>
  );
}

import type { Editor } from '@tiptap/core';

interface HeadingGroupProps {
  editor: Editor;
}

export function HeadingGroup({ editor }: HeadingGroupProps) {
  return (
    <div className="qwq-toolbar-group">
      {([1, 2, 3] as const).map((level) => (
        <button
          key={level}
          type="button"
          className={`qwq-toolbar-btn ${editor.isActive('heading', { level }) ? 'is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          title={`見出し${level}`}
        >
          H{level}
        </button>
      ))}
      <button
        type="button"
        className={`qwq-toolbar-btn ${editor.isActive('paragraph') ? 'is-active' : ''}`}
        onClick={() => editor.chain().focus().setParagraph().run()}
        title="段落"
      >
        ¶
      </button>
    </div>
  );
}

import type { Editor } from '@tiptap/core';
import { TextGroup } from './groups/TextGroup.js';
import { HeadingGroup } from './groups/HeadingGroup.js';
import { InsertGroup } from './groups/InsertGroup.js';
import { HistoryGroup } from './groups/HistoryGroup.js';

interface ToolbarProps {
  editor: Editor;
  onImageUpload?: (file: File) => void;
}

export function Toolbar({ editor, onImageUpload }: ToolbarProps) {
  return (
    <div className="qwq-toolbar" role="toolbar" aria-label="エディタツールバー">
      <HeadingGroup editor={editor} />
      <div className="qwq-toolbar-separator" />
      <TextGroup editor={editor} />
      <div className="qwq-toolbar-separator" />
      <InsertGroup editor={editor} onImageUpload={onImageUpload} />
      <div className="qwq-toolbar-separator" />
      <HistoryGroup editor={editor} />
    </div>
  );
}

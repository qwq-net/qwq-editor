import { Extension, type Editor, type Range } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';

export type SlashCommand = {
  title: string;
  description: string;
  command: (args: { editor: Editor; range: Range }) => void;
};

export const defaultCommands: SlashCommand[] = [
  {
    title: '見出し1',
    description: '大見出し (H1)',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    title: '見出し2',
    description: '中見出し (H2)',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    title: '見出し3',
    description: '小見出し (H3)',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    title: '画像',
    description: '画像の挿入',
    command: ({ editor, range }) => {
      const url = window.prompt('画像URL:');
      if (!url) return;
      editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
    },
  },
  {
    title: 'コードブロック',
    description: 'コードの挿入',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('codeBlock').run();
    },
  },
  {
    title: 'テーブル',
    description: '3×3テーブルの挿入',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: '区切り線',
    description: '水平区切り線',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: '引用',
    description: '引用ブロック',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  },
  {
    title: '箇条書き',
    description: '箇条書きリスト',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: '番号付きリスト',
    description: '番号付きリスト',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
];

export interface SlashExtensionOptions {
  suggestion: Partial<SuggestionOptions>;
}

export const SlashExtension = Extension.create<SlashExtensionOptions>({
  name: 'slashMenu',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: SlashCommand;
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

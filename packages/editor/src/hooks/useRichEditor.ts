import { useEditor } from '@tiptap/react';
import { type Editor, type Range } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { createLowlight, common } from 'lowlight';
import type { EditorConfig, StorageAdapter, ContentContext } from '@qwq-net/core';
import { fromMarkdown } from '@qwq-net/core';
import { ImageUploadExtension } from '../extensions/ImageUploadExtension.js';
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import {
  SlashExtension,
  defaultCommands,
  type SlashCommand,
} from '../extensions/SlashExtension.js';
import type { SlashMenuRef } from '../components/SlashMenu/SlashMenu.js';
import { ReactRenderer } from '@tiptap/react';

const lowlight = createLowlight(common);

export interface UseRichEditorOptions {
  initialContent?: string;
  config: EditorConfig;
  storageAdapter?: StorageAdapter;
  contentContext?: ContentContext;
}

export function useRichEditor({
  initialContent,
  config,
  storageAdapter,
  contentContext,
}: UseRichEditorOptions) {
  const parsed = initialContent ? fromMarkdown(initialContent) : null;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: '書き始めましょう... (/ でコマンドを表示)' }),
      ImageUploadExtension.configure({
        storageAdapter: storageAdapter ?? null,
        contentContext: contentContext ?? null,
      }),
      SlashExtension.configure({
        suggestion: {
          char: '/',
          items: ({ query }: { query: string }) =>
            defaultCommands.filter((cmd) =>
              cmd.title.toLowerCase().includes(query.toLowerCase()),
            ),
          command: ({
            editor: ed,
            range,
            props,
          }: {
            editor: Editor;
            range: Range;
            props: SlashCommand;
          }) => {
            props.command({ editor: ed, range });
          },
          render: () => {
            let component: ReactRenderer<SlashMenuRef>;
            let popupEl: HTMLDivElement;

            return {
              onStart(props: SuggestionProps<SlashCommand>) {
                popupEl = document.createElement('div');
                popupEl.className = 'qwq-slash-popup';
                document.body.appendChild(popupEl);

                import('../components/SlashMenu/SlashMenu.js').then(({ SlashMenu }) => {
                  component = new ReactRenderer(SlashMenu, {
                    props,
                    editor: props.editor,
                  });
                  popupEl.appendChild(component.element);
                  positionPopup(popupEl, props);
                });
              },

              onUpdate(props: SuggestionProps<SlashCommand>) {
                component?.updateProps(props);
                positionPopup(popupEl, props);
              },

              onKeyDown(props: SuggestionKeyDownProps) {
                if (props.event.key === 'Escape') {
                  popupEl?.remove();
                  return true;
                }
                return (
                  (component?.ref as SlashMenuRef | null)?.onKeyDown(props.event) ?? false
                );
              },

              onExit() {
                component?.destroy();
                popupEl?.remove();
              },
            };
          },
        },
      }),
    ],
    content: parsed?.doc ?? { type: 'doc', content: [{ type: 'paragraph' }] },
  });

  return {
    editor,
    frontmatter: parsed?.frontmatter ?? {},
  };
}

function positionPopup(el: HTMLDivElement, props: SuggestionProps<SlashCommand>) {
  const rect = props.clientRect?.();
  if (!rect || !el) return;
  el.style.position = 'fixed';
  el.style.top = `${rect.bottom + 6}px`;
  el.style.left = `${rect.left}px`;
  el.style.zIndex = '9999';
}

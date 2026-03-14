import { useEffect } from 'react';
import { useEditor } from '@tiptap/react';
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
import { SlashExtension, defaultCommands } from '../extensions/SlashExtension.js';
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
          command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
            props.command({ editor, range });
          },
          render: () => {
            let component: ReactRenderer<SlashMenuRef>;
            let popupEl: HTMLDivElement;

            return {
              onStart(props: any) {
                popupEl = document.createElement('div');
                popupEl.className = 'qwq-slash-popup';
                document.body.appendChild(popupEl);

                // Dynamically import to avoid circular deps at module load time
                import('../components/SlashMenu/SlashMenu.js').then(({ SlashMenu }) => {
                  component = new ReactRenderer(SlashMenu, {
                    props,
                    editor: props.editor,
                  });
                  popupEl.appendChild(component.element);
                  positionPopup(popupEl, props);
                });
              },

              onUpdate(props: any) {
                component?.updateProps(props);
                positionPopup(popupEl, props);
              },

              onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                  popupEl?.remove();
                  return true;
                }
                return (component?.ref as SlashMenuRef | null)?.onKeyDown(props.event) ?? false;
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

  // Update content when initialContent changes externally
  useEffect(() => {
    if (!editor || !initialContent) return;
    const newParsed = fromMarkdown(initialContent);
    editor.commands.setContent(newParsed.doc);
  }, [initialContent]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    editor,
    frontmatter: parsed?.frontmatter ?? {},
  };
}

function positionPopup(el: HTMLDivElement, props: any) {
  const rect = props.clientRect?.();
  if (!rect || !el) return;
  el.style.position = 'fixed';
  el.style.top = `${rect.bottom + 6}px`;
  el.style.left = `${rect.left}px`;
  el.style.zIndex = '9999';
}

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { StorageAdapter, ContentContext } from '@qwq-net/core';

export interface ImageUploadOptions {
  storageAdapter: StorageAdapter | null;
  contentContext: ContentContext | null;
}

async function handleImageFiles(
  files: File[],
  storageAdapter: StorageAdapter,
  contentContext: ContentContext,
  insertImage: (src: string, alt: string) => void,
) {
  for (const file of files) {
    try {
      const { src, alt } = await storageAdapter.uploadImage(file, contentContext);
      insertImage(src, alt ?? file.name);
    } catch (err) {
      console.error('[qwq-editor] Image upload failed:', err);
    }
  }
}

export const ImageUploadExtension = Extension.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      storageAdapter: null,
      contentContext: null,
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          handleDrop(view, event, _slice, moved) {
            if (moved || !event.dataTransfer?.files.length) return false;
            const { storageAdapter, contentContext } = options;
            if (!storageAdapter || !contentContext) return false;

            const files = Array.from(event.dataTransfer.files).filter((f) =>
              f.type.startsWith('image/'),
            );
            if (!files.length) return false;

            event.preventDefault();
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (!coordinates) return false;

            handleImageFiles(files, storageAdapter, contentContext, (src, alt) => {
              const { schema } = view.state;
              const node = schema.nodes.image?.create({ src, alt });
              if (!node) return;
              const tr = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(tr);
            });

            return true;
          },

          handlePaste(view, event) {
            if (!event.clipboardData?.files.length) return false;
            const { storageAdapter, contentContext } = options;
            if (!storageAdapter || !contentContext) return false;

            const files = Array.from(event.clipboardData.files).filter((f) =>
              f.type.startsWith('image/'),
            );
            if (!files.length) return false;

            event.preventDefault();

            handleImageFiles(files, storageAdapter, contentContext, (src, alt) => {
              const { schema } = view.state;
              const node = schema.nodes.image?.create({ src, alt });
              if (!node) return;
              const tr = view.state.tr.replaceSelectionWith(node);
              view.dispatch(tr);
            });

            return true;
          },
        },
      }),
    ];
  },
});

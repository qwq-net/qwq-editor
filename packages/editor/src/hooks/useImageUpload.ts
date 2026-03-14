import { useCallback, useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { StorageAdapter, ContentContext } from '@qwq-net/core';

export function useImageUpload(
  editor: Editor | null,
  storageAdapter: StorageAdapter | undefined,
  contentContext: ContentContext | undefined,
) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor || !storageAdapter || !contentContext) return;
      setIsUploading(true);
      setUploadError(null);
      try {
        const { src, alt } = await storageAdapter.uploadImage(file, contentContext);
        editor.chain().focus().setImage({ src, alt: alt ?? '' }).run();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setUploadError(error);
        console.error('[qwq-editor] Image upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [editor, storageAdapter, contentContext],
  );

  return { uploadImage, isUploading, uploadError };
}

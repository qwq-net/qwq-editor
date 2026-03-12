export type ContentContext = {
  slug: string;
  collection?: string;
};

export interface StorageAdapter {
  uploadImage(file: File, ctx: ContentContext): Promise<{ src: string; alt?: string }>;
  saveContent(
    content: string,
    frontmatter: Record<string, unknown>,
    ctx: ContentContext,
  ): Promise<{ location: string }>;
  loadContent(ctx: ContentContext): Promise<string | null>;
}

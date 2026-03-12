import { z } from 'zod';

export const FrontmatterFieldSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('string'),
    label: z.string(),
    required: z.boolean().optional(),
    defaultValue: z.string().optional(),
  }),
  z.object({
    type: z.literal('date'),
    label: z.string(),
    required: z.boolean().optional(),
    defaultValue: z.string().optional(),
  }),
  z.object({
    type: z.literal('boolean'),
    label: z.string(),
    required: z.boolean().optional(),
    defaultValue: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('image'),
    label: z.string(),
    required: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('tags'),
    label: z.string(),
    required: z.boolean().optional(),
    options: z.array(z.string()),
  }),
]);

export type FrontmatterField = z.infer<typeof FrontmatterFieldSchema>;

const InstantModeSchema = z.object({
  type: z.literal('instant'),
  contentDir: z.string(),
  fileLayout: z.enum(['directory', 'flat']).default('directory'),
  fileExtension: z.enum(['md', 'mdx']).default('mdx'),
  imageStyle: z.enum(['mdx-imports', 'plain']).default('mdx-imports'),
  imageComponent: z.string().default('OptimizedImage'),
  imageComponentImport: z.string().default('@/components/OptimizedImage.astro'),
  editorPath: z.string().default('/__editor'),
});

const EmbeddedModeSchema = z.object({
  type: z.literal('embedded'),
});

export const EditorConfigSchema = z.object({
  mode: z.discriminatedUnion('type', [InstantModeSchema, EmbeddedModeSchema]),
  frontmatter: z.record(z.string(), FrontmatterFieldSchema).optional(),
});

export type EditorConfig = z.infer<typeof EditorConfigSchema>;
export type InstantModeConfig = z.infer<typeof InstantModeSchema>;
export type EmbeddedModeConfig = z.infer<typeof EmbeddedModeSchema>;

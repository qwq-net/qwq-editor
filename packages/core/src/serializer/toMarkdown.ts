import { stringifyFrontmatter } from '../utils/frontmatter.js';
import { serializeBody } from './serializeDoc.js';
import type { TiptapDoc } from '../types.js';

export function toMarkdown(
  doc: TiptapDoc,
  frontmatter: Record<string, unknown>,
): string {
  const body = serializeBody(doc, (src, alt) => `![${alt}](${src})`);
  const frontmatterStr = stringifyFrontmatter(frontmatter);
  return `${frontmatterStr}\n\n${body}\n`;
}

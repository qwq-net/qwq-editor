/**
 * Shared Tiptap JSON → Markdown serializer engine.
 * toMDX.ts and toMarkdown.ts both delegate here, differing only in
 * how images are rendered (via the ImageRenderer callback).
 */
import type { TiptapDoc, TiptapNode, TiptapMark } from '../types.js';

export type ImageRenderer = (src: string, alt: string) => string;

/**
 * Apply Tiptap marks to a text span.
 *
 * Order matters: marks are applied inside-out so that the rendered
 * Markdown nests correctly.  The canonical ordering is:
 *   innermost → code → strike → italic → bold → link → outermost
 *
 * "code" is innermost because backtick-delimited code cannot contain
 * other inline formatting in CommonMark.
 */
function applyMarks(text: string, marks: TiptapMark[]): string {
  // Sort marks into a deterministic inside-out order.
  const order: Record<string, number> = { code: 0, strike: 1, italic: 2, bold: 3, link: 4 };
  const sorted = [...marks].sort(
    (a, b) => (order[a.type] ?? 99) - (order[b.type] ?? 99),
  );

  let result = text;
  for (const mark of sorted) {
    switch (mark.type) {
      case 'code':
        result = `\`${result}\``;
        break;
      case 'bold':
        result = `**${result}**`;
        break;
      case 'italic':
        result = `_${result}_`;
        break;
      case 'strike':
        result = `~~${result}~~`;
        break;
      case 'link': {
        const href = (mark.attrs?.href as string) ?? '#';
        result = `[${result}](${href})`;
        break;
      }
    }
  }
  return result;
}

function serializeInline(
  nodes: TiptapNode[],
  renderImage: ImageRenderer,
): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return applyMarks(node.text ?? '', node.marks ?? []);
        case 'hardBreak':
          return '\\\n';
        case 'image': {
          const src = (node.attrs?.src as string) ?? '';
          const alt = (node.attrs?.alt as string) ?? '';
          return renderImage(src, alt);
        }
        default:
          return serializeInline(node.content ?? [], renderImage);
      }
    })
    .join('');
}

function serializeListItem(
  node: TiptapNode,
  depth: number,
  ordered: boolean,
  index: number,
  renderImage: ImageRenderer,
): string {
  const indent = '  '.repeat(depth);
  const bullet = ordered ? `${index}.` : '-';
  const parts: string[] = [];

  for (const child of node.content ?? []) {
    if (child.type === 'paragraph') {
      parts.push(serializeInline(child.content ?? [], renderImage));
    } else if (child.type === 'bulletList' || child.type === 'orderedList') {
      parts.push(serializeBlock(child, renderImage, depth + 1));
    }
  }

  const firstLine = `${indent}${bullet} ${parts[0] ?? ''}`;
  const rest = parts.slice(1).join('\n');
  return rest ? `${firstLine}\n${rest}` : firstLine;
}

function serializeTable(
  node: TiptapNode,
  renderImage: ImageRenderer,
): string {
  const rows = node.content ?? [];
  if (rows.length === 0) return '';
  const lines: string[] = [];
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const cells = (row.content ?? []).map((cell) =>
      serializeInline(cell.content?.[0]?.content ?? [], renderImage).trim(),
    );
    lines.push(`| ${cells.join(' | ')} |`);
    if (rowIdx === 0) {
      lines.push(`| ${cells.map(() => '---').join(' | ')} |`);
    }
  }
  return lines.join('\n');
}

export function serializeBlock(
  node: TiptapNode,
  renderImage: ImageRenderer,
  depth: number = 0,
): string {
  switch (node.type) {
    case 'paragraph':
      return serializeInline(node.content ?? [], renderImage);
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      return `${'#'.repeat(level)} ${serializeInline(node.content ?? [], renderImage)}`;
    }
    case 'blockquote': {
      const inner = (node.content ?? [])
        .map((n) => serializeBlock(n, renderImage))
        .join('\n\n');
      return inner
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
    }
    case 'codeBlock': {
      const lang = (node.attrs?.language as string) ?? '';
      const code = (node.content ?? []).map((n) => n.text ?? '').join('');
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }
    case 'bulletList':
      return (node.content ?? [])
        .map((item, i) => serializeListItem(item, depth, false, i + 1, renderImage))
        .join('\n');
    case 'orderedList': {
      const start = (node.attrs?.start as number) ?? 1;
      return (node.content ?? [])
        .map((item, i) => serializeListItem(item, depth, true, start + i, renderImage))
        .join('\n');
    }
    case 'horizontalRule':
      return '---';
    case 'image': {
      const src = (node.attrs?.src as string) ?? '';
      const alt = (node.attrs?.alt as string) ?? '';
      return renderImage(src, alt);
    }
    case 'table':
      return serializeTable(node, renderImage);
    default:
      return serializeInline(node.content ?? [], renderImage);
  }
}

export function serializeBody(
  doc: TiptapDoc,
  renderImage: ImageRenderer,
): string {
  return (doc.content ?? [])
    .map((node) => serializeBlock(node, renderImage))
    .filter(Boolean)
    .join('\n\n');
}

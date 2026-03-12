import matter from 'gray-matter';
import type { TiptapDoc, TiptapNode, TiptapMark } from '../types.js';
import type { InstantModeConfig } from '../config/schema.js';

type ImageImport = { varName: string; path: string };

function pathToVarName(src: string, index: number): string {
  const filename =
    src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? `img${index}`;
  // kebab-case / underscores → camelCase, strip invalid chars
  return filename
    .replace(/[-_]([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9$]/g, '_')
    .replace(/^(\d)/, '_$1');
}

function isLocalPath(src: string): boolean {
  return !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//');
}

function applyMarks(text: string, marks: TiptapMark[]): string {
  let result = text;
  for (const mark of marks) {
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

export function toMDX(
  doc: TiptapDoc,
  frontmatter: Record<string, unknown>,
  config: InstantModeConfig,
): string {
  const imageImports: ImageImport[] = [];
  const imagePathToVar = new Map<string, string>();

  function getImageVar(src: string): string {
    if (imagePathToVar.has(src)) return imagePathToVar.get(src)!;
    const varName = pathToVarName(src, imageImports.length);
    // Deduplicate var names
    const unique = imageImports.some((i) => i.varName === varName)
      ? `${varName}${imageImports.length}`
      : varName;
    imageImports.push({ varName: unique, path: src });
    imagePathToVar.set(src, unique);
    return unique;
  }

  function serializeImage(src: string, alt: string): string {
    if (config.imageStyle === 'mdx-imports' && isLocalPath(src)) {
      const varName = getImageVar(src);
      const altProp = alt ? ` alt="${alt}"` : '';
      return `<${config.imageComponent} src={${varName}}${altProp} />`;
    }
    return `![${alt}](${src})`;
  }

  function serializeInline(nodes: TiptapNode[]): string {
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
            return serializeImage(src, alt);
          }
          default:
            return serializeInline(node.content ?? []);
        }
      })
      .join('');
  }

  function serializeListItem(
    node: TiptapNode,
    depth: number,
    ordered: boolean,
    index: number,
  ): string {
    const indent = '  '.repeat(depth);
    const bullet = ordered ? `${index}.` : '-';
    const parts: string[] = [];

    for (const child of node.content ?? []) {
      if (child.type === 'paragraph') {
        parts.push(serializeInline(child.content ?? []));
      } else if (child.type === 'bulletList' || child.type === 'orderedList') {
        parts.push(serializeBlock(child, depth + 1));
      }
    }

    const firstLine = `${indent}${bullet} ${parts[0] ?? ''}`;
    const rest = parts.slice(1).join('\n');
    return rest ? `${firstLine}\n${rest}` : firstLine;
  }

  function serializeTable(node: TiptapNode): string {
    const rows = node.content ?? [];
    if (rows.length === 0) return '';
    const lines: string[] = [];
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      const cells = (row.content ?? []).map((cell) =>
        serializeInline(cell.content?.[0]?.content ?? []).trim(),
      );
      lines.push(`| ${cells.join(' | ')} |`);
      if (rowIdx === 0) {
        lines.push(`| ${cells.map(() => '---').join(' | ')} |`);
      }
    }
    return lines.join('\n');
  }

  function serializeBlock(node: TiptapNode, depth: number = 0): string {
    switch (node.type) {
      case 'paragraph':
        return serializeInline(node.content ?? []);
      case 'heading': {
        const level = (node.attrs?.level as number) ?? 1;
        return `${'#'.repeat(level)} ${serializeInline(node.content ?? [])}`;
      }
      case 'blockquote': {
        const inner = (node.content ?? [])
          .map((n) => serializeBlock(n))
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
          .map((item, i) => serializeListItem(item, depth, false, i + 1))
          .join('\n');
      case 'orderedList': {
        const start = (node.attrs?.start as number) ?? 1;
        return (node.content ?? [])
          .map((item, i) => serializeListItem(item, depth, true, start + i))
          .join('\n');
      }
      case 'horizontalRule':
        return '---';
      case 'image': {
        const src = (node.attrs?.src as string) ?? '';
        const alt = (node.attrs?.alt as string) ?? '';
        return serializeImage(src, alt);
      }
      case 'table':
        return serializeTable(node);
      default:
        return serializeInline(node.content ?? []);
    }
  }

  // Serialize body
  const body = (doc.content ?? [])
    .map((node) => serializeBlock(node))
    .filter(Boolean)
    .join('\n\n');

  // Build frontmatter string via gray-matter
  // matter.stringify prepends ---\n...\n---\n<content>
  const frontmatterStr = matter.stringify('', frontmatter).trimEnd();

  // Build import section (only after body is serialized so imageImports is populated)
  const importLines: string[] = [];
  if (config.imageStyle === 'mdx-imports' && imageImports.length > 0) {
    importLines.push(
      `import ${config.imageComponent} from '${config.imageComponentImport}';`,
    );
    for (const { varName, path: imgPath } of imageImports) {
      importLines.push(`import ${varName} from '${imgPath}';`);
    }
  }

  const parts: string[] = [frontmatterStr];
  if (importLines.length > 0) {
    parts.push(importLines.join('\n'));
  }
  parts.push(body);

  return parts.join('\n\n') + '\n';
}

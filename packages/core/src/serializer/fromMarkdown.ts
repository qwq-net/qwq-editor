import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type {
  Root,
  BlockContent,
  Paragraph,
  Heading,
  Blockquote,
  Code,
  List,
  ListItem,
  ThematicBreak,
  Table,
  TableRow,
  TableCell,
  PhrasingContent,
  Text,
  Strong,
  Emphasis,
  Delete,
  InlineCode,
  Link,
  Image,
  Break,
  Html,
} from 'mdast';
import type { TiptapDoc, TiptapNode, TiptapMark } from '../types.js';

// ---------------------------------------------------------------------------
// MDX preprocessing
// ---------------------------------------------------------------------------

/**
 * Extract `import varName from './relative/path'` statements.
 * Returns a map of varName → resolved path and the body with imports removed.
 */
function extractImports(content: string): {
  importMap: Map<string, string>;
  body: string;
} {
  const importMap = new Map<string, string>();
  const lines = content.split('\n');
  const bodyLines: string[] = [];
  let inImportBlock = true;

  for (const line of lines) {
    const trimmed = line.trim();
    if (inImportBlock) {
      // Match: import X from './path' or import X from "../path"
      const m = trimmed.match(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?$/);
      if (m) {
        const [, varName, importPath] = m;
        // Only record relative paths (image imports)
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          importMap.set(varName, importPath);
        }
        // Skip this line (don't include in body)
        continue;
      }
      // Once we hit a non-import non-blank line, exit import block
      if (trimmed !== '') {
        inImportBlock = false;
      }
    }
    bodyLines.push(line);
  }

  return { importMap, body: bodyLines.join('\n') };
}

/**
 * Replace JSX image component usage with standard markdown images.
 * Handles: <Component src={varName} alt="..." /> and <Component src={varName} />
 */
function replaceJsxImages(
  body: string,
  importMap: Map<string, string>,
): string {
  return body.replace(
    /<\w[\w.]*\s+src=\{(\w+)\}(?:\s+alt="([^"]*)")?\s*\/>/g,
    (_, varName: string, alt: string = '') => {
      const imgPath = importMap.get(varName);
      if (!imgPath) return _;
      return `![${alt}](${imgPath})`;
    },
  );
}

// ---------------------------------------------------------------------------
// mdast → Tiptap JSON conversion
// ---------------------------------------------------------------------------

function convertInline(
  nodes: PhrasingContent[],
  inheritedMarks: TiptapMark[] = [],
): TiptapNode[] {
  const result: TiptapNode[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'text': {
        const n = node as Text;
        if (n.value === '') continue;
        result.push({
          type: 'text',
          text: n.value,
          ...(inheritedMarks.length > 0 ? { marks: inheritedMarks } : {}),
        });
        break;
      }
      case 'inlineCode': {
        const n = node as InlineCode;
        const marks: TiptapMark[] = [...inheritedMarks, { type: 'code' }];
        result.push({ type: 'text', text: n.value, marks });
        break;
      }
      case 'strong': {
        const n = node as Strong;
        result.push(
          ...convertInline(n.children, [...inheritedMarks, { type: 'bold' }]),
        );
        break;
      }
      case 'emphasis': {
        const n = node as Emphasis;
        result.push(
          ...convertInline(n.children, [...inheritedMarks, { type: 'italic' }]),
        );
        break;
      }
      case 'delete': {
        const n = node as Delete;
        result.push(
          ...convertInline(n.children, [
            ...inheritedMarks,
            { type: 'strike' },
          ]),
        );
        break;
      }
      case 'link': {
        const n = node as Link;
        const linkMark: TiptapMark = {
          type: 'link',
          attrs: { href: n.url, target: '_blank' },
        };
        result.push(
          ...convertInline(n.children, [...inheritedMarks, linkMark]),
        );
        break;
      }
      case 'image': {
        const n = node as Image;
        result.push({
          type: 'image',
          attrs: { src: n.url, alt: n.alt ?? '' },
        });
        break;
      }
      case 'break': {
        result.push({ type: 'hardBreak' });
        break;
      }
      case 'html': {
        // Ignore raw HTML inline nodes
        break;
      }
      default:
        break;
    }
  }

  return result;
}

function convertBlock(node: BlockContent): TiptapNode | null {
  switch (node.type) {
    case 'paragraph': {
      const n = node as Paragraph;
      return {
        type: 'paragraph',
        content: convertInline(n.children),
      };
    }
    case 'heading': {
      const n = node as Heading;
      return {
        type: 'heading',
        attrs: { level: n.depth },
        content: convertInline(n.children),
      };
    }
    case 'blockquote': {
      const n = node as Blockquote;
      return {
        type: 'blockquote',
        content: n.children
          .map((child) => convertBlock(child as BlockContent))
          .filter((c): c is TiptapNode => c !== null),
      };
    }
    case 'code': {
      const n = node as Code;
      return {
        type: 'codeBlock',
        attrs: { language: n.lang ?? '' },
        content: [{ type: 'text', text: n.value }],
      };
    }
    case 'list': {
      const n = node as List;
      const tiptapType = n.ordered ? 'orderedList' : 'bulletList';
      const attrs = n.ordered && n.start != null ? { start: n.start } : undefined;
      return {
        type: tiptapType,
        ...(attrs ? { attrs } : {}),
        content: n.children.map((item) => convertListItem(item)),
      };
    }
    case 'thematicBreak':
      return { type: 'horizontalRule' };
    case 'table': {
      const n = node as Table;
      return {
        type: 'table',
        content: n.children.map((row, rowIdx) =>
          convertTableRow(row, rowIdx === 0),
        ),
      };
    }
    case 'html':
      // Ignore raw HTML block nodes
      return null;
    default:
      return null;
  }
}

function convertListItem(node: ListItem): TiptapNode {
  return {
    type: 'listItem',
    content: node.children
      .map((child) => convertBlock(child as BlockContent))
      .filter((c): c is TiptapNode => c !== null),
  };
}

function convertTableRow(node: TableRow, isHeader: boolean): TiptapNode {
  return {
    type: 'tableRow',
    content: node.children.map((cell) => convertTableCell(cell, isHeader)),
  };
}

function convertTableCell(node: TableCell, isHeader: boolean): TiptapNode {
  return {
    type: isHeader ? 'tableHeader' : 'tableCell',
    content: [
      {
        type: 'paragraph',
        content: convertInline(node.children),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type ParsedContent = {
  frontmatter: Record<string, unknown>;
  doc: TiptapDoc;
};

export function fromMarkdown(mdxString: string): ParsedContent {
  // 1. Extract YAML frontmatter
  const { data: frontmatter, content: rawContent } = matter(mdxString);

  // 2. Preprocess MDX: extract imports, replace JSX image components
  const { importMap, body: processedBody } = extractImports(rawContent);
  const markdownBody = replaceJsxImages(processedBody, importMap);

  // 3. Parse markdown → mdast
  const processor = unified().use(remarkParse).use(remarkGfm);
  const tree = processor.parse(markdownBody) as Root;

  // 4. Convert mdast → Tiptap JSON
  const content = tree.children
    .map((child) => convertBlock(child as BlockContent))
    .filter((node): node is TiptapNode => node !== null);

  const doc: TiptapDoc = { type: 'doc', content };
  return { frontmatter: frontmatter as Record<string, unknown>, doc };
}

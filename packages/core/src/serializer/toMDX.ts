import { stringifyFrontmatter } from '../utils/frontmatter.js';
import { serializeBody } from './serializeDoc.js';
import type { TiptapDoc } from '../types.js';
import type { InstantModeConfig } from '../config/schema.js';

type ImageImport = { varName: string; path: string };

function pathToVarName(src: string, index: number): string {
  const filename =
    src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? `img${index}`;
  return filename
    .replace(/[-_]([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9$]/g, '_')
    .replace(/^(\d)/, '_$1');
}

function isLocalPath(src: string): boolean {
  return (
    !src.startsWith('http://') &&
    !src.startsWith('https://') &&
    !src.startsWith('//')
  );
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
    const unique = imageImports.some((i) => i.varName === varName)
      ? `${varName}${imageImports.length}`
      : varName;
    imageImports.push({ varName: unique, path: src });
    imagePathToVar.set(src, unique);
    return unique;
  }

  // Serialize body (populates imageImports as a side-effect)
  const body = serializeBody(doc, (src, alt) => {
    if (config.imageStyle === 'mdx-imports' && isLocalPath(src)) {
      const varName = getImageVar(src);
      const altProp = alt ? ` alt="${alt}"` : '';
      return `<${config.imageComponent} src={${varName}}${altProp} />`;
    }
    return `![${alt}](${src})`;
  });

  const frontmatterStr = stringifyFrontmatter(frontmatter);

  // Build import section (must come after body serialization)
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

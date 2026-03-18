/**
 * Browser-compatible frontmatter utilities using js-yaml (no Buffer dependency).
 * gray-matter is Node.js-only; use these helpers in serializers that run in the browser.
 */
import { load, dump } from 'js-yaml';

// Matches ---\n<yaml>\n--- with optional trailing content.
// The YAML block can be empty (---\n---\n is valid).
// Two patterns joined by |:
//   1. Non-empty yaml: ---\n<one-or-more-chars>\n---
//   2. Empty yaml:     ---\n---
const FENCE_RE = /^---\r?\n([\s\S]+?)\r?\n---(?:\r?\n([\s\S]*))?$|^---\r?\n---(?:\r?\n([\s\S]*))?$/;

/**
 * Convert Date objects in frontmatter to yyyy-MM-dd strings.
 * js-yaml's load() auto-converts date-like strings to Date objects,
 * but we want to keep them as plain strings for consistent formatting.
 */
function normalizeDates(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      result[key] = value.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = raw.match(FENCE_RE);
  if (!match) {
    return { data: {}, content: raw };
  }
  // match[1]/[2] come from the non-empty branch; match[3] from the empty branch
  const yamlStr = match[1] ?? '';
  const content = match[2] ?? match[3] ?? '';
  const data = yamlStr ? ((load(yamlStr) as Record<string, unknown>) ?? {}) : {};
  return { data: normalizeDates(data), content };
}

export function stringifyFrontmatter(data: Record<string, unknown>): string {
  if (Object.keys(data).length === 0) return '---\n---';
  const yaml = dump(data, { lineWidth: -1, quotingType: "'", forceQuotes: false }).trimEnd();
  return `---\n${yaml}\n---`;
}

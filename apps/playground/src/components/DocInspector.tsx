import type { TiptapDoc } from '@qwq-net/core';

type Props = {
  doc: TiptapDoc;
  frontmatter: Record<string, unknown>;
};

export function DocInspector({ doc, frontmatter }: Props) {
  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={sectionHeaderStyle}>Frontmatter</div>
      <pre style={preStyle}>{JSON.stringify(frontmatter, null, 2)}</pre>
      <div style={sectionHeaderStyle}>TiptapDoc</div>
      <pre style={preStyle}>{JSON.stringify(doc, null, 2)}</pre>
    </div>
  );
}

const sectionHeaderStyle: React.CSSProperties = {
  padding: '6px 16px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#6c7086',
  background: '#161622',
  borderBottom: '1px solid #2a2a3e',
};

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: '16px',
  fontFamily: '"Fira Code", "Cascadia Code", monospace',
  fontSize: '12px',
  lineHeight: 1.6,
  color: '#a6e3a1',
  background: '#1e1e2e',
  overflowX: 'auto',
};

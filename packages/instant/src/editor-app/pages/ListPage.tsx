import { useEffect, useState } from 'react';
import type { EditorConfig } from '@qwq-net/core';

interface ListPageProps {
  config: EditorConfig;
}

export function ListPage({ config }: ListPageProps) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/__editor/api/list')
      .then((r) => r.json())
      .then((data: { slugs: string[] }) => setSlugs(data.slugs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const contentDir =
    config.mode.type === 'instant' ? config.mode.contentDir : '(embedded mode)';

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>qwq Editor</h1>
          <p style={styles.subtitle}>{contentDir}</p>
        </div>
        <a href="#/new" style={styles.newBtn}>
          + 新規作成
        </a>
      </header>

      <main style={styles.main}>
        {loading ? (
          <p style={styles.muted}>読み込み中...</p>
        ) : slugs.length === 0 ? (
          <div style={styles.empty}>
            <p>コンテンツがありません</p>
            <a href="#/new" style={{ ...styles.newBtn, marginTop: 16 }}>
              最初の記事を作成する
            </a>
          </div>
        ) : (
          <ul style={styles.list}>
            {slugs.map((slug) => (
              <li key={slug} style={styles.item}>
                <a href={`#/${slug}/edit`} style={styles.itemLink}>
                  <span style={styles.itemSlug}>{slug}</span>
                  <span style={styles.itemEdit}>編集 →</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 720,
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '1px solid #e3e2de',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#37352f',
  },
  subtitle: {
    fontSize: 13,
    color: '#9b9a97',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  newBtn: {
    background: '#37352f',
    color: '#ffffff',
    padding: '8px 18px',
    borderRadius: 4,
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 14,
    display: 'inline-block',
  },
  main: { minHeight: 200 },
  muted: { color: '#9b9a97', fontSize: 14 },
  empty: {
    textAlign: 'center',
    padding: '48px 0',
    color: '#9b9a97',
  },
  list: { listStyle: 'none', padding: 0 },
  item: {
    borderBottom: '1px solid #e3e2de',
  },
  itemLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    textDecoration: 'none',
    color: '#37352f',
    transition: 'color 0.15s',
  },
  itemSlug: { fontSize: 15 },
  itemEdit: { fontSize: 13, color: '#9b9a97' },
};

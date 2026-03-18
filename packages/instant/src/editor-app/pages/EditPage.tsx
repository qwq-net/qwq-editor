import { useEffect, useState } from 'react';
import { RichEditor } from '@qwq-net/editor';
import type { EditorConfig } from '@qwq-net/core';
import { LocalApiAdapter } from '../LocalApiAdapter.js';

interface EditPageProps {
  slug: string;
  config: EditorConfig;
}

const adapter = new LocalApiAdapter();

export function EditPage({ slug, config }: EditPageProps) {
  const [initialContent, setInitialContent] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  useEffect(() => {
    adapter
      .loadContent({ slug })
      .then((content) => setInitialContent(content ?? undefined))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <a href="#/" style={styles.back}>
          ← 一覧に戻る
        </a>
        <span style={styles.slug}>{slug}</span>
        {saveResult && <span style={styles.saved}>保存済</span>}
      </header>

      <div style={styles.editorWrapper}>
        <RichEditor
          slug={slug}
          config={config}
          initialContent={initialContent}
          storageAdapter={adapter}
          onSave={(result) => setSaveResult(result.location)}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '10px 24px',
    background: '#ffffff',
    borderBottom: '1px solid #e3e2de',
    flexShrink: 0,
  },
  back: {
    color: '#9b9a97',
    textDecoration: 'none',
    fontSize: 13,
  },
  slug: {
    fontSize: 14,
    color: '#787774',
    flex: 1,
  },
  saved: {
    fontSize: 12,
    color: '#4dab6f',
    fontWeight: 500,
  },
  editorWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#9b9a97',
  },
};

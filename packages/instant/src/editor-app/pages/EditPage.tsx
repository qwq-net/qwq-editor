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
        {saveResult && <span style={styles.saved}>保存済: {saveResult}</span>}
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
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '10px 20px',
    background: '#181825',
    borderBottom: '1px solid #313244',
    flexShrink: 0,
  },
  back: {
    color: '#89b4fa',
    textDecoration: 'none',
    fontSize: 13,
  },
  slug: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#a6adc8',
    flex: 1,
  },
  saved: {
    fontSize: 12,
    color: '#a6e3a1',
    fontFamily: 'monospace',
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
    color: '#6c7086',
  },
};

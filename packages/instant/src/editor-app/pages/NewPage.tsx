import { useState } from 'react';

export function NewPage() {
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = slug.trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
    if (!trimmed) {
      setError('スラッグを入力してください');
      return;
    }
    window.location.hash = `#/${trimmed}/edit`;
  };

  return (
    <div style={styles.page}>
      <a href="#/" style={styles.back}>← 一覧に戻る</a>

      <h1 style={styles.title}>新規記事を作成</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          スラッグ（URL）
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setError('');
            }}
            placeholder="my-new-post"
            style={styles.input}
            autoFocus
          />
        </label>
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.hint}>
          英数字とハイフンのみ使用できます。例: <code style={styles.code}>my-awesome-post</code>
        </p>
        <button type="submit" style={styles.btn}>
          作成して編集 →
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  back: {
    color: '#9b9a97',
    textDecoration: 'none',
    fontSize: 14,
    display: 'inline-block',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#37352f',
    marginBottom: 32,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 13,
    color: '#787774',
    fontWeight: 500,
  },
  input: {
    background: '#ffffff',
    border: '1px solid #e3e2de',
    borderRadius: 4,
    color: '#37352f',
    fontFamily: 'monospace',
    fontSize: 15,
    padding: '10px 12px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  error: {
    color: '#eb5757',
    fontSize: 13,
  },
  hint: {
    color: '#9b9a97',
    fontSize: 12,
  },
  code: {
    background: '#f7f6f3',
    padding: '2px 5px',
    borderRadius: 3,
    fontSize: 12,
  },
  btn: {
    background: '#37352f',
    border: 'none',
    borderRadius: 4,
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 14,
    padding: '10px 20px',
    alignSelf: 'flex-start',
  },
};

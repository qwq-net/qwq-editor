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
          英数字とハイフンのみ使用できます。例: <code>my-awesome-post</code>
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
  },
  back: {
    color: '#89b4fa',
    textDecoration: 'none',
    fontSize: 14,
    display: 'inline-block',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#cdd6f4',
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
    color: '#a6adc8',
  },
  input: {
    background: '#313244',
    border: '1px solid #45475a',
    borderRadius: 6,
    color: '#cdd6f4',
    fontFamily: 'monospace',
    fontSize: 15,
    padding: '10px 12px',
    outline: 'none',
    width: '100%',
  },
  error: {
    color: '#f38ba8',
    fontSize: 13,
  },
  hint: {
    color: '#6c7086',
    fontSize: 12,
  },
  btn: {
    background: '#89b4fa',
    border: 'none',
    borderRadius: 6,
    color: '#1e1e2e',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 14,
    padding: '10px 20px',
    alignSelf: 'flex-start',
  },
};

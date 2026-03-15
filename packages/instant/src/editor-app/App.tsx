import { useEffect, useState } from 'react';
import type { EditorConfig } from '@qwq-net/core';
import { ListPage } from './pages/ListPage.js';
import { NewPage } from './pages/NewPage.js';
import { EditPage } from './pages/EditPage.js';

type Route =
  | { type: 'list' }
  | { type: 'new' }
  | { type: 'edit'; slug: string };

function parseHash(hash: string): Route {
  if (!hash || hash === '#' || hash === '#/') return { type: 'list' };
  if (hash === '#/new') return { type: 'new' };
  const m = hash.match(/^#\/(.+)\/edit$/);
  if (m) return { type: 'edit', slug: m[1] };
  return { type: 'list' };
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [config, setConfig] = useState<EditorConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);

    fetch('/__editor/api/config')
      .then((r) => r.json())
      .then((data: EditorConfig) => setConfig(data))
      .catch((err) => setConfigError(String(err)));

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (configError) {
    return (
      <div style={errorStyle}>
        <h2>設定の読み込みに失敗しました</h2>
        <pre>{configError}</pre>
      </div>
    );
  }

  if (!config) {
    return <div style={loadingStyle}>読み込み中...</div>;
  }

  const route = parseHash(hash);

  return (
    <>
      {route.type === 'list' && <ListPage config={config} />}
      {route.type === 'new' && <NewPage />}
      {route.type === 'edit' && <EditPage slug={route.slug} config={config} />}
    </>
  );
}

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  color: '#6c7086',
  fontSize: 14,
};

const errorStyle: React.CSSProperties = {
  padding: 32,
  color: '#f38ba8',
};

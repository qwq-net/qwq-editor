import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@qwq-net/editor/styles';
import App from './App.js';

const root = document.getElementById('root')!;
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

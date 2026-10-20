import { readFile, writeFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

// Reuse the actual components and Vite's configured BASE_URL. The published
// portfolio stays readable and natively scrollable even without JavaScript.
const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
});

try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const markup = renderToString(createElement(App));
  const path = new URL('../dist/index.html', import.meta.url);
  const html = await readFile(path, 'utf8');
  const root = '<div id="root"></div>';
  if (!html.includes(root)) throw new Error('Prerender root placeholder was not found.');
  await writeFile(path, html.replace(root, () => `<div id="root">${markup}</div>`));
} finally {
  await server.close();
}

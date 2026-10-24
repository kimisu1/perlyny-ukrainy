import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // Демоверсія на GitHub Pages відкривається з підкаталогу /<назва репозиторію>/
  base: mode === 'pages' ? (process.env.PAGES_BASE ?? '/perlyny-ukrainy/') : '/',
  plugins: [react()],
  server: {
    port: 5173,
    // У режимі розробки запити до REST API передаються серверу Express.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 ще використовує @import і застарілі функції Sass — приховуємо ці попередження.
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
}));

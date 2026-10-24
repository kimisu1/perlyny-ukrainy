import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { readJson } from './lib/jsonStore.js';
import { galleryRouter } from './routes/gallery.js';
import { messagesRouter } from './routes/messages.js';
import { newsRouter } from './routes/news.js';

export async function createApp({ dataDir, messagesFile, distDir }) {
  const [categories, news, gallery, slides] = await Promise.all(
    ['categories', 'news', 'gallery', 'slides'].map((name) => readJson(path.join(dataDir, `${name}.json`))),
  );

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  const api = express.Router();
  api.get('/health', (req, res) => res.json({ status: 'ok' }));
  api.get('/categories', (req, res) => res.json(categories));
  api.get('/slides', (req, res) => res.json(slides));
  api.use('/news', newsRouter({ news, categories }));
  api.use('/gallery', galleryRouter({ gallery, categories }));
  api.use('/messages', messagesRouter({ messagesFile }));
  api.use((req, res) => res.status(404).json({ error: 'Ресурс не знайдено' }));
  app.use('/api', api);

  // У продакшені той самий сервер віддає зібраний React-застосунок.
  if (distDir && existsSync(distDir)) {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      const wantsPage = req.method === 'GET' && req.headers.accept?.includes('text/html');
      if (!wantsPage) return next();
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.use(handleError);
  return app;
}

function handleError(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некоректний JSON у тілі запиту' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Занадто великий запит' });
  }
  console.error(error);
  res.status(500).json({ error: 'Внутрішня помилка сервера' });
}

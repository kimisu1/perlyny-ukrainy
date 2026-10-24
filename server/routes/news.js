import { Router } from 'express';
import { findNews, queryNews } from '../../shared/newsQuery.js';

export function newsRouter({ news, categories }) {
  const router = Router();

  // GET /api/news?page=&limit=&category=&q= — пагінація, фільтр і пошук (shared/newsQuery.js)
  router.get('/', (req, res) => {
    const { error, data } = queryNews(news, categories, req.query);
    if (error) return res.status(400).json({ error });
    res.json(data);
  });

  router.get('/:id', (req, res) => {
    const item = findNews(news, req.params.id);
    if (!item) return res.status(404).json({ error: 'Новину не знайдено' });
    res.json(item);
  });

  return router;
}

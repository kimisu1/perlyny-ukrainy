import { Router } from 'express';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Ціле додатне число з рядка запиту; NaN — якщо значення некоректне.
function parseCount(value, fallback) {
  if (value === undefined) return fallback;
  return typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : Number.NaN;
}

// Пошук не залежить від регістру та виду апострофа (’ ʼ ‘ ` ').
const normalize = (value) => value.toLocaleLowerCase('uk').replace(/[’ʼ‘`]/g, "'");

export function newsRouter({ news, categories }) {
  const router = Router();
  const categoryIds = new Set(categories.map((category) => category.id));
  const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const searchIndex = new Map(sorted.map((item) => [item.id, normalize(`${item.title} ${item.excerpt}`)]));

  router.get('/', (req, res) => {
    const page = parseCount(req.query.page, 1);
    const limit = parseCount(req.query.limit, DEFAULT_LIMIT);
    const category = req.query.category || undefined;
    const q = typeof req.query.q === 'string' ? normalize(req.query.q.trim()).slice(0, 100) : '';

    if (!(page >= 1)) {
      return res.status(400).json({ error: 'Параметр page має бути цілим числом від 1' });
    }
    if (!(limit >= 1 && limit <= MAX_LIMIT)) {
      return res.status(400).json({ error: `Параметр limit має бути цілим числом від 1 до ${MAX_LIMIT}` });
    }
    if (category !== undefined && !categoryIds.has(category)) {
      return res.status(400).json({ error: 'Невідома категорія' });
    }

    const filtered = sorted.filter(
      (item) => (!category || item.category === category) && (!q || searchIndex.get(item.id).includes(q)),
    );
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit).map(({ content, ...summary }) => summary);

    res.json({ items, total: filtered.length, page, limit, pages: Math.ceil(filtered.length / limit) });
  });

  router.get('/:id', (req, res) => {
    const item = news.find((entry) => String(entry.id) === req.params.id);
    if (!item) return res.status(404).json({ error: 'Новину не знайдено' });
    res.json(item);
  });

  return router;
}

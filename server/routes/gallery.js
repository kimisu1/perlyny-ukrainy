import { Router } from 'express';

export function galleryRouter({ gallery, categories }) {
  const router = Router();
  const categoryIds = new Set(categories.map((category) => category.id));

  router.get('/', (req, res) => {
    const category = req.query.category || undefined;
    if (category !== undefined && !categoryIds.has(category)) {
      return res.status(400).json({ error: 'Невідома категорія' });
    }
    res.json(category ? gallery.filter((item) => item.category === category) : gallery);
  });

  return router;
}

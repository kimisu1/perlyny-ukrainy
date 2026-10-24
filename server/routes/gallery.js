import { Router } from 'express';
import { filterGallery } from '../../shared/newsQuery.js';

export function galleryRouter({ gallery, categories }) {
  const router = Router();

  router.get('/', (req, res) => {
    const { error, data } = filterGallery(gallery, categories, req.query.category);
    if (error) return res.status(400).json({ error });
    res.json(data);
  });

  return router;
}

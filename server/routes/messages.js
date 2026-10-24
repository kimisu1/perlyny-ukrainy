import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { validateMessage } from '../../shared/validation.js';
import { appendJson, StoreFullError } from '../lib/jsonStore.js';

export function messagesRouter({ messagesFile, maxMessages }) {
  const router = Router();

  router.post('/', async (req, res) => {
    const { valid, errors, data } = validateMessage(req.body ?? {});
    if (!valid) {
      return res.status(400).json({ error: 'Перевірте правильність заповнення форми', fields: errors });
    }

    try {
      const saved = await appendJson(
        messagesFile,
        { id: randomUUID(), ...data, createdAt: new Date().toISOString() },
        { maxItems: maxMessages },
      );
      res.status(201).json({ id: saved.id, createdAt: saved.createdAt });
    } catch (error) {
      if (!(error instanceof StoreFullError)) throw error;
      res.status(503).json({ error: 'Сервіс тимчасово не приймає звернення. Спробуйте пізніше.' });
    }
  });

  return router;
}

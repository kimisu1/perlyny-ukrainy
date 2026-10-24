import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { validateMessage } from '../../shared/validation.js';
import { appendJson } from '../lib/jsonStore.js';

export function messagesRouter({ messagesFile }) {
  const router = Router();

  router.post('/', async (req, res) => {
    const { valid, errors, data } = validateMessage(req.body ?? {});
    if (!valid) {
      return res.status(400).json({ error: 'Перевірте правильність заповнення форми', fields: errors });
    }

    const saved = await appendJson(messagesFile, {
      id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: saved.id, createdAt: saved.createdAt });
  });

  return router;
}

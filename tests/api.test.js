import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.js';

const CATEGORIES = [
  { id: 'castles', name: 'Замки та фортеці' },
  { id: 'nature', name: 'Природа' },
  { id: 'cities', name: 'Міста' },
  { id: 'sacred', name: 'Святині' },
];

// 13 новин з датами 2026-09-01 … 2026-09-13; категорії по колу.
const NEWS = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  title: i === 4 ? 'Кам’янець-Подільський за один день' : `Публікація ${i + 1}`,
  date: `2026-09-${String(i + 1).padStart(2, '0')}`,
  category: CATEGORIES[i % 4].id,
  region: 'Тестова область',
  image: `/images/places/large/p${i + 1}.jpg`,
  thumb: `/images/places/thumbs/p${i + 1}.jpg`,
  excerpt: `Анонс ${i + 1}`,
  content: [`Абзац ${i + 1}`],
}));

const GALLERY = [
  { id: 1, title: 'Фортеця', category: 'castles' },
  { id: 2, title: 'Озеро', category: 'nature' },
  { id: 3, title: 'Замок', category: 'castles' },
];

const SLIDES = [
  { id: 1, title: 'Слайд 1', newsId: 1 },
  { id: 2, title: 'Слайд 2', newsId: 2 },
];

let tmp;
let server;
let base;

async function get(url, headers) {
  const response = await fetch(`${base}${url}`, { headers });
  const body = response.headers.get('content-type')?.includes('json') ? await response.json() : await response.text();
  return { status: response.status, body };
}

async function post(url, body, rawBody) {
  const response = await fetch(`${base}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawBody ?? JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

before(async () => {
  tmp = await mkdtemp(path.join(os.tmpdir(), 'perlyny-api-'));
  const dataDir = path.join(tmp, 'data');
  const distDir = path.join(tmp, 'dist');
  await mkdir(dataDir);
  await mkdir(distDir);
  const files = { categories: CATEGORIES, news: NEWS, gallery: GALLERY, slides: SLIDES };
  for (const [name, value] of Object.entries(files)) {
    await writeFile(path.join(dataDir, `${name}.json`), JSON.stringify(value));
  }
  await writeFile(path.join(distDir, 'index.html'), '<!doctype html><title>SPA</title>');

  const app = await createApp({ dataDir, distDir, messagesFile: path.join(tmp, 'messages.json') });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(tmp, { recursive: true, force: true });
});

test('GET /api/health повідомляє про роботу сервера', async () => {
  const { status, body } = await get('/api/health');
  assert.equal(status, 200);
  assert.deepEqual(body, { status: 'ok' });
});

test('GET /api/categories і /api/slides повертають довідники', async () => {
  assert.deepEqual((await get('/api/categories')).body, CATEGORIES);
  assert.deepEqual((await get('/api/slides')).body, SLIDES);
});

describe('GET /api/news', () => {
  test('за замовчуванням — 10 найновіших без повного тексту', async () => {
    const { status, body } = await get('/api/news');
    assert.equal(status, 200);
    assert.equal(body.items.length, 10);
    assert.equal(body.total, 13);
    assert.equal(body.page, 1);
    assert.equal(body.limit, 10);
    assert.equal(body.pages, 2);
    assert.deepEqual(body.items.map((item) => item.id).slice(0, 3), [13, 12, 11]);
    assert.ok(body.items.every((item) => !('content' in item)));
  });

  test('пагінація: друга сторінка по 5 і сторінка за межами списку', async () => {
    const second = await get('/api/news?page=2&limit=5');
    assert.deepEqual(second.body.items.map((item) => item.id), [8, 7, 6, 5, 4]);
    assert.equal(second.body.pages, 3);

    const beyond = await get('/api/news?page=9');
    assert.equal(beyond.status, 200);
    assert.deepEqual(beyond.body.items, []);
  });

  test('некоректні page і limit — 400', async () => {
    for (const query of ['limit=0', 'limit=51', 'page=0', 'page=abc', 'limit=2.5']) {
      const { status, body } = await get(`/api/news?${query}`);
      assert.equal(status, 400, query);
      assert.ok(body.error, query);
    }
  });

  test('фільтр за категорією; невідома категорія — 400', async () => {
    const { body } = await get('/api/news?category=nature&limit=50');
    assert.equal(body.total, 3);
    assert.ok(body.items.every((item) => item.category === 'nature'));

    assert.equal((await get('/api/news?category=unknown')).status, 400);
    assert.equal((await get('/api/news?category=')).body.total, 13);
  });

  test('пошук не залежить від регістру та виду апострофа', async () => {
    const { body } = await get(`/api/news?q=${encodeURIComponent("кам'янець")}`);
    assert.deepEqual(body.items.map((item) => item.id), [5]);
  });
});

test('GET /api/news/:id — повна новина або 404', async () => {
  const found = await get('/api/news/5');
  assert.equal(found.status, 200);
  assert.deepEqual(found.body.content, ['Абзац 5']);

  const missing = await get('/api/news/999');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error, 'Новину не знайдено');
});

test('GET /api/gallery з фільтром категорії', async () => {
  assert.equal((await get('/api/gallery')).body.length, 3);
  assert.deepEqual((await get('/api/gallery?category=castles')).body.map((item) => item.id), [1, 3]);
  assert.equal((await get('/api/gallery?category=x')).status, 400);
});

describe('POST /api/messages', () => {
  const message = {
    name: 'Олена',
    email: 'olena@example.com',
    topic: 'route',
    tripDate: '2099-05-01',
    message: 'Порадьте маршрут Карпатами на три дні.',
  };

  test('зберігає коректне звернення', async () => {
    const { status, body } = await post('/api/messages', message);
    assert.equal(status, 201);
    assert.ok(body.id);
    assert.ok(body.createdAt);

    const saved = JSON.parse(await readFile(path.join(tmp, 'messages.json'), 'utf8'));
    assert.equal(saved.length, 1);
    assert.equal(saved[0].id, body.id);
    assert.equal(saved[0].email, 'olena@example.com');
  });

  test('повертає помилки полів', async () => {
    const { status, body } = await post('/api/messages', { ...message, email: 'olena', message: 'коротко' });
    assert.equal(status, 400);
    assert.deepEqual(Object.keys(body.fields).sort(), ['email', 'message']);
  });

  test('некоректний JSON — 400', async () => {
    const { status, body } = await post('/api/messages', null, '{"name": ');
    assert.equal(status, 400);
    assert.ok(body.error);
  });

  test('після досягнення ліміту сховища — 503', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'perlyny-cap-'));
    const dataDir = path.join(dir, 'data');
    await mkdir(dataDir);
    const files = { categories: CATEGORIES, news: NEWS, gallery: GALLERY, slides: SLIDES };
    for (const [name, value] of Object.entries(files)) {
      await writeFile(path.join(dataDir, `${name}.json`), JSON.stringify(value));
    }
    const app = await createApp({ dataDir, messagesFile: path.join(dir, 'messages.json'), maxMessages: 1 });
    const capped = app.listen(0);
    await new Promise((resolve) => capped.once('listening', resolve));
    const url = `http://127.0.0.1:${capped.address().port}/api/messages`;
    const send = () =>
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
    try {
      assert.equal((await send()).status, 201);
      const full = await send();
      assert.equal(full.status, 503);
      assert.ok((await full.json()).error);
    } finally {
      await new Promise((resolve) => capped.close(resolve));
      await rm(dir, { recursive: true, force: true });
    }
  });
});

test('невідомий ресурс API — 404 у форматі JSON', async () => {
  const { status, body } = await get('/api/unknown');
  assert.equal(status, 404);
  assert.equal(body.error, 'Ресурс не знайдено');
});

test('некоректна адреса запиту — 400 у форматі JSON, а не 500', async () => {
  const { status, body } = await get('/api/news/%E0%A4%A');
  assert.equal(status, 400);
  assert.ok(body.error);
});

test('маршрути клієнта віддають index.html зібраного застосунку', async () => {
  const { status, body } = await get('/news/3', { Accept: 'text/html' });
  assert.equal(status, 200);
  assert.match(body, /<title>SPA<\/title>/);
});

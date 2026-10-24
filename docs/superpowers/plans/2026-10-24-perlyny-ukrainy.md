# «Перлини України» — план імплементації

> **Для виконавців:** використовувати superpowers:executing-plans (або superpowers:subagent-driven-development) і проходити задачі по черзі. Кроки позначені чекбоксами (`- [ ]`).

**Мета:** адаптивний інформаційний портал «Перлини України» (варіант №20, ступінь складності 2): React SPA + Bootstrap/SCSS + jQuery/jQuery UI на клієнті, REST API на Node.js/Express з JSON-сховищем.

**Архітектура:** клієнт (Vite + React Router) звертається лише до `/api/*` через модуль `src/api/client.js`. Сервер Express віддає контент з `server/data/*.json`, приймає звернення з форми й у продакшені роздає зібраний клієнт з `dist/`. Валідація форми — один модуль `shared/validation.js` для клієнта і сервера.

**Технології:** React 19, React Router 7, react-bootstrap 2 / Bootstrap 5.3 (SCSS), jQuery 3.7, jQuery UI 1.14, Sass, Vite 8, Node.js ≥ 22, Express 5, `node:test`.

Специфікація: `docs/superpowers/specs/2026-10-24-perlyny-ukrainy-design.md` (контракт API — розділ 5.1, моделі — 5.2, дизайн-система — 7).

---

## Структура файлів

| Файл | Відповідальність |
|---|---|
| `package.json`, `vite.config.js`, `index.html` | залежності, скрипти, проксі `/api` у режимі розробки, точка входу |
| `shared/validation.js` | `TOPICS`, `LIMITS`, `validateMessage()` |
| `server/lib/jsonStore.js` | `readJson`, `writeJson` (атомарний запис), `appendJson` (послідовна черга) |
| `server/routes/news.js` | список новин: пагінація, фільтр, пошук; одна новина |
| `server/routes/gallery.js` | галерея з фільтром категорії |
| `server/routes/messages.js` | прийом звернень (`POST`) |
| `server/app.js` | `createApp({ dataDir, messagesFile, distDir })`, обробка помилок, роздача SPA |
| `server/index.js` | запуск на `PORT` (типово 3001) |
| `server/data/*.json`, `public/images/places/**` | контент і фото (з атрибуцією) |
| `src/api/client.js` | `api.*`, `ApiError` |
| `src/hooks/useApi.js` | стан `data / error / loading`, скасування запиту, `retry()` |
| `src/lib/jquery.js`, `src/lib/jqueryUi.js` | глобальний jQuery + віджети jQuery UI (accordion, autocomplete, datepicker, локаль uk) |
| `src/styles/*.scss` | токени, міксини, кастомізація Bootstrap, базові стилі, тема jQuery UI |
| `src/components/*/*` | `Header`, `Footer`, `Logo`, `Ornament`, `ScrollTopButton`, `HeroSlider`, `NewsGrid`, `NewsCard`, `CategoryTag`, `CategoryFilter`, `GalleryGrid`, `Lightbox`, `FaqAccordion`, `NewsSearch`, `ContactForm`, `MapEmbed`, `PageHeader`, `StatusMessage` |
| `src/pages/*` | `HomePage`, `AboutPage`, `GalleryPage`, `NewsPage`, `NewsArticlePage`, `ContactsPage`, `NotFoundPage` |
| `tests/validation.test.js`, `tests/api.test.js` | автотести |
| `render.yaml`, `README.md` | деплой і документація |

---

### Задача 1: Каркас проєкту

**Файли:** створити `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `public/favicon.svg`.

- [ ] **Крок 1:** встановити залежності

```bash
npm init -y
npm i react@19 react-dom@19 react-router-dom@7 react-bootstrap@2 bootstrap@5.3 jquery@3.7 jquery-ui@1.14 express@5 \
      @fontsource-variable/unbounded @fontsource-variable/literata
npm i -D vite@8 @vitejs/plugin-react sass concurrently
```

- [ ] **Крок 2:** `package.json` — `"type": "module"`, `"engines": { "node": ">=22.12" }` і скрипти:

```json
{
  "dev": "concurrently -n api,web -c blue,magenta \"node --watch server/index.js\" \"vite\"",
  "build": "vite build",
  "start": "node server/index.js",
  "test": "node --test tests/"
}
```

- [ ] **Крок 3:** `vite.config.js` — плагін React, проксі `/api → http://localhost:3001`, `css.preprocessorOptions.scss.quietDeps: true` і `silenceDeprecations` для попереджень Bootstrap (`import`, `global-builtin`, `color-functions`, `mixed-decls`, `if-function`).
- [ ] **Крок 4:** `npm run build` → очікувано: `dist/index.html` створено без помилок.
- [ ] **Крок 5:** коміт `chore: каркас Vite + React + Express`.

### Задача 2: Спільна валідація форми (TDD)

**Файли:** тест `tests/validation.test.js`, код `shared/validation.js`.

- [ ] **Крок 1: тест, що падає**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateMessage } from '../shared/validation.js';

const TODAY = '2026-10-24';
const VALID = { name: 'Олена', email: 'olena@example.com', topic: 'route', tripDate: '2026-11-15', message: 'Порадьте маршрут на два дні.' };
const check = (patch) => validateMessage({ ...VALID, ...patch }, { today: TODAY });

test('приймає повне звернення і нормалізує пробіли та регістр пошти', () => {
  const r = check({ name: '  Олена ', email: ' Olena@Example.COM ' });
  assert.equal(r.valid, true);
  assert.deepEqual(r.errors, {});
  assert.equal(r.data.name, 'Олена');
  assert.equal(r.data.email, 'olena@example.com');
});

test('дата поїздки необов’язкова', () => {
  const r = check({ tripDate: '   ' });
  assert.equal(r.valid, true);
  assert.equal(r.data.tripDate, null);
});

test('повідомляє про всі порожні обов’язкові поля', () => {
  const r = validateMessage({}, { today: TODAY });
  assert.equal(r.valid, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'message', 'name', 'topic']);
});

test('відхиляє некоректну пошту і невідому тему', () => {
  assert.ok(check({ email: 'olena@' }).errors.email);
  assert.ok(check({ topic: 'spam' }).errors.topic);
});

test('межі довжини повідомлення: 10 і 2000 символів', () => {
  assert.ok(check({ message: 'а'.repeat(9) }).errors.message);
  assert.equal(check({ message: 'а'.repeat(10) }).valid, true);
  assert.equal(check({ message: 'а'.repeat(2000) }).valid, true);
  assert.ok(check({ message: 'а'.repeat(2001) }).errors.message);
});

test('дата: неіснуюча і минула відхиляються, сьогоднішня приймається', () => {
  assert.ok(check({ tripDate: '2026-02-30' }).errors.tripDate);
  assert.ok(check({ tripDate: '15.11.2026' }).errors.tripDate);
  assert.ok(check({ tripDate: '2026-10-23' }).errors.tripDate);
  assert.equal(check({ tripDate: TODAY }).valid, true);
});
```

- [ ] **Крок 2:** `npm test` → очікувано FAIL: `Cannot find module '../shared/validation.js'`.
- [ ] **Крок 3: реалізація**

```js
export const TOPICS = [
  { id: 'route', name: 'Допомога з маршрутом' },
  { id: 'place', name: 'Запропонувати місце' },
  { id: 'cooperation', name: 'Співпраця' },
  { id: 'other', name: 'Інше' },
];
export const LIMITS = { name: { min: 2, max: 80 }, message: { min: 10, max: 2000 } };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const text = (value) => (typeof value === 'string' ? value.trim() : '');

function isRealDate(iso) {
  const match = ISO_DATE_RE.exec(iso);
  if (!match) return false;
  const [y, m, d] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function todayIso(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function validateMessage(input = {}, { today = todayIso() } = {}) {
  const data = {
    name: text(input.name),
    email: text(input.email).toLowerCase(),
    topic: text(input.topic),
    tripDate: text(input.tripDate) || null,
    message: text(input.message),
  };
  const errors = {};
  if (data.name.length < LIMITS.name.min) errors.name = 'Вкажіть ім’я (щонайменше 2 символи)';
  else if (data.name.length > LIMITS.name.max) errors.name = 'Ім’я задовге (до 80 символів)';
  if (!data.email) errors.email = 'Вкажіть електронну пошту';
  else if (!EMAIL_RE.test(data.email)) errors.email = 'Перевірте адресу пошти, наприклад name@example.com';
  if (!TOPICS.some((topic) => topic.id === data.topic)) errors.topic = 'Оберіть тему звернення';
  if (data.tripDate !== null) {
    if (!isRealDate(data.tripDate)) errors.tripDate = 'Оберіть дату в календарі або введіть її у форматі ДД.ММ.РРРР';
    else if (data.tripDate < today) errors.tripDate = 'Дата поїздки не може бути в минулому';
  }
  if (data.message.length < LIMITS.message.min) errors.message = 'Напишіть щонайменше 10 символів';
  else if (data.message.length > LIMITS.message.max) errors.message = 'Повідомлення задовге (до 2000 символів)';
  return { valid: Object.keys(errors).length === 0, errors, data };
}
```

- [ ] **Крок 4:** `npm test` → очікувано: усі тести валідації PASS.
- [ ] **Крок 5:** коміт `feat: спільна валідація форми звернення`.

### Задача 3: REST API (TDD)

**Файли:** тест `tests/api.test.js`; код `server/lib/jsonStore.js`, `server/routes/{news,gallery,messages}.js`, `server/app.js`, `server/index.js`.

- [ ] **Крок 1: тести, що падають.** Фікстури створюються в `os.tmpdir()`: 4 категорії, 13 новин з датами `2026-09-01…2026-09-13` (категорії по колу, новина 5 має заголовок «Кам’янець…» з типографським апострофом), 3 фото, 2 слайди, `dist/index.html`. Сервер: `createApp(...)` + `listen(0)`. Сценарії:
  - `GET /api/health` → `200 { status: 'ok' }`;
  - `GET /api/news` → 10 елементів, `total 13`, `pages 2`, дати за спаданням, без поля `content`;
  - `?page=2&limit=5` → 5 елементів (6-та…10-та за датою); `?page=9` → `items: []`;
  - `?limit=0`, `?limit=51`, `?page=0`, `?page=abc` → `400`;
  - `?category=nature` → лише `nature`; `?category=unknown` → `400`;
  - `?q=кам'янець` (ASCII-апостроф, нижній регістр) знаходить «Кам’янець…»;
  - `GET /api/news/5` → `200` з `content`; `GET /api/news/999` → `404 { error: 'Новину не знайдено' }`;
  - `GET /api/gallery`, `?category=castles`, `?category=x` → 3 / відфільтровані / `400`;
  - `GET /api/slides`, `GET /api/categories` → масиви з фікстур;
  - `POST /api/messages` з коректними даними → `201 { id, createdAt }`, запис з'явився у `messages.json`;
  - `POST` з помилками → `400`, `fields` містить `email` і `message`; некоректний JSON → `400`;
  - `GET /api/unknown` → `404` JSON; `GET /news/3` з `Accept: text/html` → `dist/index.html`.
- [ ] **Крок 2:** `npm test` → FAIL: `Cannot find module '../server/app.js'`.
- [ ] **Крок 3: сховище**

```js
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw error;
  }
}

export async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(tmp, file);
}

let queue = Promise.resolve();
export function appendJson(file, item) {
  const run = queue.then(async () => {
    const list = await readJson(file, []);
    list.push(item);
    await writeJson(file, list);
    return item;
  });
  queue = run.catch(() => {});
  return run;
}
```

- [ ] **Крок 4: маршрути новин** — сортування `date ↓, id ↓`; `page`/`limit` лише цілі (`/^\d+$/`), `limit ≤ 50`; порожній `category` = без фільтра; пошук: `toLocaleLowerCase('uk')` + заміна `’ ʼ ‘ \`` на `'` в запиті й тексті (`title + excerpt`); відповідь `{ items, total, page, limit, pages }`, `items` без `content`.
- [ ] **Крок 5: галерея і звернення** — галерея з тією ж перевіркою категорії; `POST /messages` → `validateMessage(req.body ?? {})`, при успіху `appendJson(messagesFile, { id: randomUUID(), ...data, createdAt })` → `201`.
- [ ] **Крок 6: `createApp`** — `express.json({ limit: '10kb' })`, роутер `/api` (+ `health`, `categories`, `slides`, JSON-404), роздача `distDir` (`express.static` + `index.html` для GET-запитів з `Accept: text/html`), обробник помилок: `entity.parse.failed → 400`, `entity.too.large → 413`, інше → `500`.
- [ ] **Крок 7:** `npm test` → очікувано: усі тести PASS.
- [ ] **Крок 8:** коміт `feat: REST API порталу`.

### Задача 4: Контент і фото

- [ ] 16 місць, 16 новин-публікацій, 5 слайдів, 4 категорії у `server/data/*.json` за моделями зі специфікації (розділ 5.2).
- [ ] Фото з Wikimedia Commons (CC0 / PD / CC BY / CC BY-SA), `large` 1600 px і `thumbs` 800 px, автор/ліцензія/джерело в `gallery.json`.
- [ ] Перевірка: усі JSON парсяться, усі шляхи до зображень існують, `newsId` слайдів існують. Коміт `content: місця, новини, фото`.

### Задача 5: Стилі та інтеграція бібліотек

**Файли:** `src/styles/_tokens.scss`, `_mixins.scss`, `bootstrap.scss`, `global.scss`, `jquery-ui.scss`; `src/lib/jquery.js`, `src/lib/jqueryUi.js`.

- [ ] **Крок 1:** токени зі специфікації (кольори, шрифти Unbounded/Literata, шкала 1.25, брейкпоінти Bootstrap) і міксини `media-up($bp)`, `media-down($bp)`, `ornament-band($height)`, `focus-ring`.
- [ ] **Крок 2:** `bootstrap.scss` — перевизначення `$primary: $cherry`, `$body-color: $ink`, `$font-family-base`, `$headings-font-family`, `$border-radius: .25rem`, потім `@import "bootstrap/scss/bootstrap"`.
- [ ] **Крок 3:** jQuery як глобальний об'єкт для jQuery UI:

```js
// src/lib/jquery.js
import $ from 'jquery';
window.jQuery = window.$ = $;
export default $;

// src/lib/jqueryUi.js
import $ from './jquery.js';
import 'jquery-ui/dist/jquery-ui.js';
import 'jquery-ui/ui/i18n/datepicker-uk.js';
export default $;
```

- [ ] **Крок 4:** `jquery-ui.scss` — тема віджетів у кольорах порталу (accordion, autocomplete menu, datepicker).

### Задача 6: Клієнт API і хук завантаження

**Файли:** `src/api/client.js`, `src/hooks/useApi.js`.

- [ ] `request(path, { method, body, signal })`: базова адреса `import.meta.env.VITE_API_URL ?? '/api'`; мережевий збій → `ApiError('Немає з’єднання із сервером…', 0)`; статус ≠ 2xx → `ApiError(payload.error, status, payload.fields)`.
- [ ] `api.getCategories`, `getSlides`, `getNews({ page, limit, category, q })`, `getNewsItem(id)`, `getGallery({ category })`, `sendMessage(data)`; порожні параметри не потрапляють у рядок запиту.
- [ ] `useApi(load, deps)` → `{ data, error, loading, retry }`; `AbortController` скасовує попередній запит; під час перезавантаження попередні дані лишаються на екрані.

### Задача 7: Каркас інтерфейсу

**Файли:** `src/App.jsx` (`createBrowserRouter`), `src/components/{Layout,Header,Footer,Logo,Ornament,ScrollTopButton,PageHeader,StatusMessage}`.

- [ ] Маршрути: `/`, `/about`, `/gallery`, `/news`, `/news/:id`, `/contacts`, `*`; `ScrollRestoration` у `Layout`; `document.title` для кожної сторінки.
- [ ] `Header`: орнаментальна смуга, логотип (SVG: перлина з восьмипелюстковою зіркою), `Navbar` з `expand="lg"`, `NavLink` з активним станом, бургер з `aria-label`.
- [ ] `Footer`: CSS Grid `1fr` → `2fr 1fr 1fr` від `md`, логотип і опис, навігація, контакти, рядок з ©, приміткою про навчальний проєкт і джерело фото.
- [ ] `ScrollTopButton`: jQuery — `$(window).on('scroll.top')`, `fadeIn/fadeOut` лише при зміні стану, `$('html, body').animate({ scrollTop: 0 })` (0 мс при `prefers-reduced-motion`), відписка в очищенні ефекту.
- [ ] `StatusMessage`: спінер Bootstrap під час завантаження; `Alert` з текстом помилки та кнопкою «Спробувати ще раз».
- [ ] Перевірка: `npm run dev`, відкрити `http://localhost:5173`, меню працює на 1440 і 390 px. Коміт.

### Задача 8: Головна сторінка

- [ ] `HeroSlider`: `Carousel` (fade), дані `api.getSlides()`, фото на всю ширину (`object-fit: cover`, 70vh, мінімум 420 px), підпис зліва знизу на градієнті, кнопка «Читати публікацію» → `/news/:newsId`, індикатори-ромби; `interval={null}` при `prefers-reduced-motion`.
- [ ] `NewsGrid` + `NewsCard`: `api.getNews({ limit: 10 })`; CSS Grid `repeat(auto-fill, minmax(260px, 1fr))`, перша новина `span 2 / span 2` від `lg`; картка — фото `thumb`, `CategoryTag` (хрестик кольору категорії + назва), дата `toLocaleDateString('uk-UA')`, заголовок-посилання, анонс.
- [ ] Вступний абзац про портал між слайдером і новинами. Коміт.

### Задача 9: Про сайт

- [ ] Вступ (місія, принципи відбору місць), що є на порталі, `FaqAccordion` (jQuery UI `accordion({ heightStyle: 'content', collapsible: true, icons: false })`, знищення в очищенні ефекту), «Звідки фото» — список з `api.getGallery()`: назва, автор, ліцензія з посиланнями. Коміт.

### Задача 10: Галерея

- [ ] `CategoryFilter` (спільний для галереї й новин): кнопки «Усі» + категорії з `api.getCategories()`, `aria-pressed`.
- [ ] `GalleryGrid`: CSS Grid з `grid-auto-flow: dense`, кожен 5-й елемент `span 2` від `md`; `<button>` з `<img loading="lazy">` і підписом.
- [ ] `Lightbox`: `Modal` (`size="xl"`, `centered`), велике фото, назва, область, автор і ліцензія з посиланням на джерело, кнопки «Попереднє/Наступне» та стрілки клавіатури.
- [ ] Дані: `api.getGallery({ category })` — фільтр виконує сервер. Коміт.

### Задача 11: Новини

- [ ] `NewsPage`: стан у `useSearchParams` (`page`, `category`, `q`), 6 новин на сторінку, `CategoryFilter`, `NewsSearch`, `Pagination` (react-bootstrap) з `aria-label`, порожній результат з кнопкою «Скинути фільтри».
- [ ] `NewsSearch`: jQuery UI `autocomplete({ minLength: 2, delay: 250, source })`, де `source` викликає `api.getNews({ q, limit: 5 })` і скасовує попередній запит; вибір підказки відкриває новину; Enter застосовує пошук до списку.
- [ ] `NewsArticlePage`: `api.getNewsItem(id)`, 404 → повідомлення з посиланням на список; фото, категорія, дата, область, абзаци `content`, посилання «Усі новини». Коміт.

### Задача 12: Контакти

- [ ] `ContactInfo`: адреса «м. Київ, Майдан Незалежності», пошта, графік відповіді.
- [ ] `MapEmbed`: `<iframe src="https://www.google.com/maps?q=50.4501,30.5234&z=15&hl=uk&output=embed" loading="lazy" title="…">` у контейнері з `aspect-ratio`.
- [ ] `ContactForm`: поля ім'я, пошта, тема (`TOPICS`), дата поїздки (jQuery UI `datepicker` з `regional.uk`, `minDate: 0`, формат `dd.mm.yy` → перетворення в `YYYY-MM-DD`), повідомлення з лічильником символів; `validateMessage` після втрати фокуса і при відправленні; `api.sendMessage`; помилки сервера з `fields` показуються біля полів; успіх → `Alert` «Звернення надіслано…» і очищення форми; кнопка блокується під час відправлення. Коміт.

### Задача 13: Адаптивність і перевірка

- [ ] Переглянути всі сторінки на 390, 768, 1440 px (скриншоти), перевірити фокус клавіатури, alt-тексти, відсутність горизонтальної прокрутки, роботу при вимкненому сервері (повідомлення про помилку).
- [ ] `npm test` і `npm run build` без помилок. Коміт `fix: адаптивність`.

### Задача 14: Деплой і документація

- [ ] `render.yaml`: web-сервіс `runtime: node`, `plan: free`, `buildCommand: npm ci --include=dev && npm run build`, `startCommand: npm start`, `healthCheckPath: /api/health`, `NODE_VERSION=22`.
- [ ] `README.md`: опис, функції, технології, запуск (`npm install`, `npm run dev`), тести, API, деплой на Render з GitHub, джерела фото.
- [ ] Перевірка продакшен-збірки локально: `npm run build && PORT=4000 npm start`, відкрити `http://localhost:4000/news/1` напряму. Коміт.

### Задача 15: Пояснювальна записка

- [ ] Скриншоти сторінок (десктоп і мобільна версія), структури проєкту та фрагментів коду у світлій темі редактора.
- [ ] Тексти: вступ, розділ 1 (аналіз предметної області), розділ 2 (вибір технологій, ініціалізація, архітектура, залежності), розділ 3 (реалізація сторінок + керівництво користувача), висновки, список джерел.
- [ ] Збірка DOCX на основі стилів прикладу (поля 30/15/20/20 мм, Times New Roman 14, інтервал 1.5, абзац 1.25 см, нумерація рисунків «Рисунок N.M – …»), перевірка відкриттям і експортом у PDF.

---

## Самоперевірка плану

- Покриття специфікації: вимоги з таблиці розділу 4 специфікації → задачі 7–12 (сторінки), 3 (REST API), 5 (SCSS, Bootstrap, jQuery UI), 14 (хостинг, git), 15 (записка).
- Узгодженість назв: `validateMessage`, `TOPICS`, `createApp`, `api.getNews` і `useApi` однакові в усіх задачах.

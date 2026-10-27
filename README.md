# Перлини України

Інформаційний портал про найвідоміші туристичні місця України: фортеці й замки, гори та озера, старовинні міста і святині. Контрольна робота з дисципліни «Веб-програмування», тема «Розробка інформаційного порталу «Найвідоміші туристичні місця України» на основі web-технологій», ступінь складності 2.

- Повна версія з REST API (Render): https://perlyny-ukrainy.onrender.com — перше відкриття після простою може тривати до хвилини
- Демоверсія без сервера (GitHub Pages): https://kimisu1.github.io/perlyny-ukrainy/
- Вихідний код: https://github.com/kimisu1/perlyny-ukrainy

![Головна сторінка](docs/screenshots/home-desktop.jpg)

## Можливості

- **Головна** — шапка з логотипом і меню, слайдер найвідоміших місць, 10 головних новин, футер.
- **Про сайт** — опис порталу, критерії відбору місць, питання та відповіді (jQuery UI Accordion), автори та ліцензії фото.
- **Галерея** — сітка фото на CSS Grid, фільтр за категоріями, перегляд у великому розмірі з навігацією стрілками.
- **Новини** — пошук з підказками (jQuery UI Autocomplete), фільтр за категоріями, пагінація, окрема сторінка кожної публікації.
- **Контакти** — карта Google, форма звернення з календарем (jQuery UI Datepicker) і перевіркою полів на клієнті та сервері.
- Адаптивний дизайн від 360 px, клавіатурна навігація, повага до налаштування «зменшити рух».

## Технології

| Частина | Технології |
|---|---|
| Розмітка і стилі | HTML5, CSS3, SCSS (змінні, міксини, модулі), Bootstrap 5.3, Flexbox, CSS Grid, медіазапити |
| Клієнт | JavaScript (ES2023), React 19, React Router 7, react-bootstrap, jQuery 3.7, jQuery UI 1.14, Vite |
| Сервер | Node.js 22+, Express 5, REST API, зберігання даних у JSON-файлах |
| Тести | вбудований модуль `node:test` |

## Запуск

Потрібен Node.js 22.12 або новіший.

```bash
npm install
npm run dev        # API на http://localhost:3001, сайт на http://localhost:5173
npm test           # автотести API та валідації
npm run build      # збірка клієнта в dist/
npm start          # продакшен: сайт і API на http://localhost:3001 (порт — змінна PORT)
npm run build:pages  # статична демоверсія для GitHub Pages у dist/ (дані API — dist/api/*.json)
```

## Структура

```
server/            REST API (Express): app.js, routes/, lib/jsonStore.js, data/*.json
shared/            спільне для клієнта і сервера: валідація форми, вибірка новин і фото
src/               клієнт (React)
  api/             звернення до REST API (client.js) і статичне джерело для GitHub Pages (staticApi.js)
  components/      компоненти інтерфейсу (компонент + власний .scss)
  pages/           сторінки
  hooks/           useApi, useCategories, usePageTitle, useReducedMotion
  lib/             підключення jQuery та віджетів jQuery UI
  styles/          токени, міксини, кастомізація Bootstrap, тема jQuery UI
public/images/     фото місць (large — 1600 px, thumbs — 800 px)
tests/             автотести
scripts/           експорт даних API у статичні JSON-файли для GitHub Pages
.github/workflows/ публікація на GitHub Pages
docs/superpowers/  специфікація і план імплементації
```

## REST API

| Метод і шлях | Опис |
|---|---|
| `GET /api/health` | стан сервера |
| `GET /api/categories` | категорії місць |
| `GET /api/slides` | слайди для головної сторінки |
| `GET /api/news?page=1&limit=10&category=nature&q=озеро` | новини: пагінація (`limit` 1–50), фільтр, пошук; відповідь `{ items, total, page, limit, pages }` |
| `GET /api/news/:id` | повний текст новини; `404`, якщо не знайдено |
| `GET /api/gallery?category=castles` | фото галереї з автором і ліцензією |
| `POST /api/messages` | звернення з форми; `201` або `400` з описом помилок у `fields` |

## Публікація

### GitHub Pages (демоверсія)

Після кожного push у гілку `main` робочий процес `.github/workflows/pages.yml` запускає тести, збирає клієнт командою `npm run build:pages` і публікує його на GitHub Pages.

GitHub Pages віддає лише статичні файли, тому в демоверсії:

- ресурси REST API експортуються у статичні JSON-файли `dist/api/*.json`, а пагінацію, фільтр і пошук виконує той самий модуль `shared/newsQuery.js`, що й сервер;
- `404.html` повторює `index.html`, тож прямі посилання на сторінки (наприклад, `/news/3`) відкриваються коректно;
- форма звернення перевіряє дані, але не надсилає їх — для цього потрібен сервер.

### Повна версія з REST API (Render)

Портал працює як безкоштовний вебсервіс Render (регіон Frankfurt): https://perlyny-ukrainy.onrender.com. Сервіс створено через Render API з тими самими параметрами, що й у `render.yaml` (збірка `npm ci --include=dev && npm run build`, запуск `npm start`, перевірка `/api/health`, `NODE_VERSION=22`); після кожного push у `main` Render розгортає нову версію автоматично. Відтворити сервіс можна і через **New → Blueprint** на [render.com](https://render.com) з цього репозиторію.

На безкоштовному плані сервіс «засинає» після 15 хвилин без запитів, а звернення з форми зберігаються лише до перезапуску (файлова система тимчасова).

## Фото

Усі фото — з [Wikimedia Commons](https://commons.wikimedia.org) під ліцензіями CC BY / CC BY-SA. Автор, ліцензія і посилання на джерело кожного фото наведені в `server/data/gallery.json`, у галереї та на сторінці «Про сайт».

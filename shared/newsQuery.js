// Вибірка новин і фото галереї. Спільний модуль: його використовують REST API на Express
// і статична демоверсія на GitHub Pages, тому правила пагінації, фільтра й пошуку однакові.

export const NEWS_DEFAULT_LIMIT = 10;
export const NEWS_MAX_LIMIT = 50;

// Ціле додатне число з параметра запиту; NaN — якщо значення некоректне.
function parseCount(value, fallback) {
  if (value === undefined || value === null) return fallback;
  const text = typeof value === 'number' ? String(value) : value;
  return typeof text === 'string' && /^\d+$/.test(text) ? Number(text) : Number.NaN;
}

// Пошук не залежить від регістру та виду апострофа (’ ʼ ‘ ` ').
const normalize = (value) => value.toLocaleLowerCase('uk').replace(/[’ʼ‘`]/g, "'");

const isKnownCategory = (categories, id) => categories.some((category) => category.id === id);

// Повертає { error } або { data: { items, total, page, limit, pages } }; items — без повного тексту.
export function queryNews(news, categories, params = {}) {
  const page = parseCount(params.page, 1);
  const limit = parseCount(params.limit, NEWS_DEFAULT_LIMIT);
  const category = params.category || undefined;
  const q = typeof params.q === 'string' ? normalize(params.q.trim()).slice(0, 100) : '';

  if (!(page >= 1)) return { error: 'Параметр page має бути цілим числом від 1' };
  if (!(limit >= 1 && limit <= NEWS_MAX_LIMIT)) {
    return { error: `Параметр limit має бути цілим числом від 1 до ${NEWS_MAX_LIMIT}` };
  }
  if (category !== undefined && !isKnownCategory(categories, category)) return { error: 'Невідома категорія' };

  const filtered = news
    .filter((item) => !category || item.category === category)
    .filter((item) => !q || normalize(`${item.title} ${item.excerpt}`).includes(q))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit).map(({ content, ...summary }) => summary);

  return { data: { items, total: filtered.length, page, limit, pages: Math.ceil(filtered.length / limit) } };
}

export function findNews(news, id) {
  return news.find((item) => String(item.id) === String(id)) ?? null;
}

export function filterGallery(gallery, categories, category) {
  const id = category || undefined;
  if (id !== undefined && !isKnownCategory(categories, id)) return { error: 'Невідома категорія' };
  return { data: id ? gallery.filter((item) => item.category === id) : gallery };
}

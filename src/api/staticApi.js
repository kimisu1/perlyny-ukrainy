// Демоверсія без сервера (GitHub Pages). Під час збирання ресурси REST API експортуються
// у статичні JSON-файли (scripts/export-static-api.mjs), а пагінацію, фільтр і пошук
// виконує той самий модуль shared/newsQuery.js, що й сервер Express.
import { filterGallery, findNews, queryNews } from '../../shared/newsQuery.js';
import { ApiError } from './ApiError.js';

const BASE = `${import.meta.env.BASE_URL}api/`;
const cache = new Map();

function load(name) {
  if (!cache.has(name)) {
    const request = fetch(`${BASE}${name}.json`)
      .then((response) => {
        if (!response.ok) throw new ApiError(`Не вдалося завантажити дані (${response.status})`, response.status);
        return response.json();
      })
      .catch((error) => {
        cache.delete(name);
        if (error instanceof ApiError) throw error;
        throw new ApiError('Немає з’єднання із сервером. Перевірте інтернет і спробуйте ще раз.', 0);
      });
    cache.set(name, request);
  }
  return cache.get(name);
}

function unwrap({ error, data }) {
  if (error) throw new ApiError(error, 400);
  return data;
}

export const staticApi = {
  // Звернення з форми зберігає лише сервер, тому в демоверсії форма їх не надсилає
  canSendMessages: false,
  getCategories: () => load('categories'),
  getSlides: () => load('slides'),
  getNews: async (params = {}) => {
    const [news, categories] = await Promise.all([load('news'), load('categories')]);
    return unwrap(queryNews(news, categories, params));
  },
  getNewsItem: async (id) => {
    const item = findNews(await load('news'), id);
    if (!item) throw new ApiError('Новину не знайдено', 404);
    return item;
  },
  getGallery: async ({ category } = {}) => {
    const [gallery, categories] = await Promise.all([load('gallery'), load('categories')]);
    return unwrap(filterGallery(gallery, categories, category));
  },
  sendMessage: async () => {
    throw new ApiError('Демоверсія працює без сервера, тому звернення не надсилається.', 503);
  },
};

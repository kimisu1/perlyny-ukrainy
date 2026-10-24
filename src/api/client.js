// Єдина точка звернення клієнта до REST API порталу.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Немає з’єднання із сервером. Перевірте інтернет і спробуйте ще раз.', 0);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(payload?.error ?? `Сервер відповів помилкою ${response.status}`, response.status, payload?.fields);
  }
  return payload;
}

// Формує рядок запиту, пропускаючи порожні параметри.
function toQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const api = {
  getCategories: (options) => request('/categories', options),
  getSlides: (options) => request('/slides', options),
  getNews: ({ page, limit, category, q } = {}, options) =>
    request(`/news${toQuery({ page, limit, category, q })}`, options),
  getNewsItem: (id, options) => request(`/news/${encodeURIComponent(id)}`, options),
  getGallery: ({ category } = {}, options) => request(`/gallery${toQuery({ category })}`, options),
  sendMessage: (message) => request('/messages', { method: 'POST', body: message }),
};

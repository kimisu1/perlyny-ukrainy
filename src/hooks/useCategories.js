import { useMemo } from 'react';
import { api } from '../api/client.js';
import { useApi } from './useApi.js';

// Категорії потрібні багатьом компонентам — завантажуємо їх один раз і кешуємо.
let cached;

function loadCategories() {
  cached ??= api.getCategories().catch((error) => {
    cached = undefined;
    throw error;
  });
  return cached;
}

export function useCategories() {
  const { data, error, loading, retry } = useApi(loadCategories, []);
  const categories = useMemo(() => data ?? [], [data]);
  const names = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  return { categories, names, error, loading, retry };
}

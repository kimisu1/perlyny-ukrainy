import { Button, Container } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter.jsx';
import NewsGrid from '../../components/NewsGrid/NewsGrid.jsx';
import NewsPagination from '../../components/NewsPagination/NewsPagination.jsx';
import NewsSearch from '../../components/NewsSearch/NewsSearch.jsx';
import PageHeader from '../../components/PageHeader/PageHeader.jsx';
import { ErrorMessage, Loading } from '../../components/Status/Status.jsx';
import { useApi } from '../../hooks/useApi.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import './NewsPage.scss';

const PAGE_SIZE = 6;

export default function NewsPage() {
  usePageTitle('Новини');
  // Стан фільтрів зберігається в адресі сторінки: /news?page=2&category=nature&q=озеро
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
  const category = params.get('category') ?? '';
  const q = params.get('q') ?? '';

  const news = useApi((options) => api.getNews({ page, limit: PAGE_SIZE, category, q }, options), [page, category, q]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === '' || (key === 'page' && value === 1)) next.delete(key);
      else next.set(key, String(value));
    }
    setParams(next);
  };
  const resetFilters = () => setParams({});

  return (
    <>
      <PageHeader title="Новини" lead="Путівники, огляди та поради для подорожей Україною." />
      <section className="section">
        <Container>
          <div className="news-toolbar">
            <NewsSearch value={q} onSearch={(value) => update({ q: value, page: 1 })} />
            <CategoryFilter
              value={category}
              onChange={(value) => update({ category: value, page: 1 })}
              label="Фільтр новин за категорією"
            />
          </div>

          <p className="news-summary" aria-live="polite">
            {news.data && `Знайдено публікацій: ${news.data.total}${q ? ` за запитом «${q}»` : ''}`}
          </p>

          {news.error ? (
            <ErrorMessage
              error={news.error}
              onRetry={news.error.status === 400 ? resetFilters : news.retry}
              retryLabel={news.error.status === 400 ? 'Скинути фільтри' : undefined}
            />
          ) : !news.data ? (
            <Loading label="Завантажуємо новини…" />
          ) : news.data.items.length === 0 ? (
            <div className="news-empty">
              <p>За цими умовами публікацій немає. Змініть запит або перегляньте всі новини.</p>
              <Button variant="outline-ink" onClick={resetFilters}>
                Скинути фільтри
              </Button>
            </div>
          ) : (
            <>
              <NewsGrid items={news.data.items} />
              <NewsPagination page={page} pages={news.data.pages} onChange={(number) => update({ page: number })} />
            </>
          )}
        </Container>
      </section>
    </>
  );
}

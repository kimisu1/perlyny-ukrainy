import { Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import CategoryTag from '../../components/CategoryTag/CategoryTag.jsx';
import { ErrorMessage, Loading } from '../../components/Status/Status.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useCategories } from '../../hooks/useCategories.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { assetUrl } from '../../utils/assets.js';
import { formatDate } from '../../utils/dates.js';
import './NewsArticlePage.scss';

function BackLink() {
  return (
    <Link to="/news" className="article__back">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      Усі новини
    </Link>
  );
}

export default function NewsArticlePage() {
  const { id } = useParams();
  const article = useApi((options) => api.getNewsItem(id, options), [id]);
  const { names } = useCategories();
  usePageTitle(article.data?.title ?? (article.error ? 'Новину не знайдено' : 'Новина'));

  if (article.error) {
    return (
      <Container className="section article">
        <BackLink />
        {article.error.status === 404 ? (
          <div className="article__missing">
            <h1 className="article__title">Новину не знайдено</h1>
            <p>Можливо, посилання застаріло. Перегляньте список усіх публікацій.</p>
          </div>
        ) : (
          <ErrorMessage error={article.error} onRetry={article.retry} />
        )}
      </Container>
    );
  }

  if (!article.data) {
    return (
      <Container className="section">
        <Loading label="Завантажуємо публікацію…" />
      </Container>
    );
  }

  const news = article.data;
  return (
    <article className="article">
      <header className="article__header">
        <Container>
          <BackLink />
          <div className="article__meta">
            <CategoryTag id={news.category} name={names.get(news.category) ?? ''} />
            <time dateTime={news.date}>{formatDate(news.date)}</time>
            <span>{news.region}</span>
          </div>
          <h1 className="article__title">{news.title}</h1>
          <p className="article__lead">{news.excerpt}</p>
        </Container>
      </header>
      <Container>
        <figure className="article__figure">
          <img src={assetUrl(news.image)} alt="" width="1600" height="1067" />
        </figure>
        <div className="article__body prose">
          {news.content.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        <p className="article__credit">
          Автор і ліцензія фото — у <Link to="/gallery">галереї</Link> та на сторінці{' '}
          <Link to="/about#photo-credits">«Про сайт»</Link>.
        </p>
      </Container>
    </article>
  );
}

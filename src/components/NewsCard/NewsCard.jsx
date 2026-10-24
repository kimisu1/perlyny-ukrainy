import { Link } from 'react-router-dom';
import { assetUrl } from '../../utils/assets.js';
import { formatDate } from '../../utils/dates.js';
import CategoryTag from '../CategoryTag/CategoryTag.jsx';
import './NewsCard.scss';

// Картка новини. Уся картка клікабельна завдяки stretched-link на заголовку.
export default function NewsCard({ news, categoryName, feature = false }) {
  return (
    <article className={feature ? 'news-card news-card--feature' : 'news-card'}>
      <div className="news-card__media">
        <img
          src={assetUrl(feature ? news.image : news.thumb)}
          alt=""
          loading="lazy"
          width="800"
          height="533"
        />
      </div>
      <div className="news-card__body">
        <div className="news-card__meta">
          <CategoryTag id={news.category} name={categoryName} />
          <time dateTime={news.date}>{formatDate(news.date)}</time>
        </div>
        <h3 className="news-card__title">
          <Link to={`/news/${news.id}`} className="stretched-link">
            {news.title}
          </Link>
        </h3>
        <p className="news-card__excerpt">{news.excerpt}</p>
      </div>
    </article>
  );
}

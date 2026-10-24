import { useCategories } from '../../hooks/useCategories.js';
import NewsCard from '../NewsCard/NewsCard.jsx';
import './NewsGrid.scss';

// Сітка новин (CSS Grid). Якщо withFeature — перша новина займає 2×2 клітинки.
export default function NewsGrid({ items, withFeature = false }) {
  const { names } = useCategories();

  return (
    <div className={withFeature ? 'news-grid news-grid--feature' : 'news-grid'}>
      {items.map((news, index) => (
        <NewsCard
          key={news.id}
          news={news}
          categoryName={names.get(news.category) ?? ''}
          feature={withFeature && index === 0}
        />
      ))}
    </div>
  );
}

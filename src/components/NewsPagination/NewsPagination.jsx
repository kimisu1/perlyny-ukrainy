import { Pagination } from 'react-bootstrap';
import './NewsPagination.scss';

export default function NewsPagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const numbers = Array.from({ length: pages }, (_, index) => index + 1);

  return (
    <nav aria-label="Сторінки новин" className="news-pagination">
      <Pagination className="mb-0">
        <Pagination.Prev disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <span aria-hidden="true">‹</span>
          <span className="visually-hidden">Попередня сторінка</span>
        </Pagination.Prev>
        {numbers.map((number) => (
          <Pagination.Item key={number} active={number === page} onClick={() => onChange(number)}>
            {number}
          </Pagination.Item>
        ))}
        <Pagination.Next disabled={page >= pages} onClick={() => onChange(page + 1)}>
          <span aria-hidden="true">›</span>
          <span className="visually-hidden">Наступна сторінка</span>
        </Pagination.Next>
      </Pagination>
    </nav>
  );
}

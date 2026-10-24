import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle.js';

export default function NotFoundPage() {
  usePageTitle('Сторінку не знайдено');

  return (
    <section className="section">
      <Container className="prose">
        <h1 className="section__title">Сторінку не знайдено</h1>
        <p>Можливо, адресу введено з помилкою або сторінку перенесено. Почніть з головної або перегляньте новини.</p>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/" className="btn btn-primary">
            На головну
          </Link>
          <Link to="/news" className="btn btn-outline-ink">
            До новин
          </Link>
        </div>
      </Container>
    </section>
  );
}

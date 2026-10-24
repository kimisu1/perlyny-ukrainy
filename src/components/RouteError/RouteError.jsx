import { Button, Container } from 'react-bootstrap';
import { useRouteError } from 'react-router-dom';

// Помилка відображення сторінки (найчастіше — не вдалося завантажити її код після оновлення сайту
// або без інтернету). Шапка і футер лишаються на місці, а користувач може перезавантажити сторінку.
export default function RouteError() {
  const error = useRouteError();
  console.error(error);

  return (
    <section className="section">
      <Container className="prose">
        <h1 className="section__title">Не вдалося відкрити сторінку</h1>
        <p>Перевірте з’єднання з інтернетом і оновіть сторінку. Якщо сайт щойно оновився, оновлення завантажить його нову версію.</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Оновити сторінку
        </Button>
      </Container>
    </section>
  );
}

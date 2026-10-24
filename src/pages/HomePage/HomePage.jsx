import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import HeroSlider from '../../components/HeroSlider/HeroSlider.jsx';
import NewsGrid from '../../components/NewsGrid/NewsGrid.jsx';
import { ErrorMessage, Loading } from '../../components/Status/Status.jsx';
import { useApi } from '../../hooks/useApi.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import './HomePage.scss';

export default function HomePage() {
  usePageTitle();
  const slides = useApi((options) => api.getSlides(options), []);
  const news = useApi((options) => api.getNews({ limit: 10 }, options), []);

  return (
    <>
      {slides.error ? (
        <Container>
          <ErrorMessage error={slides.error} onRetry={slides.retry} />
        </Container>
      ) : slides.data ? (
        <HeroSlider slides={slides.data} />
      ) : (
        <div className="hero-placeholder" aria-hidden="true" />
      )}

      <section className="section home-intro">
        <Container className="home-intro__grid">
          <h1 className="home-intro__title">Найвідоміші туристичні місця України</h1>
          <div>
            <p className="home-intro__lead">
              Фортеці над каньйонами, гірські озера, старовинні міста і святині зі списку ЮНЕСКО. Ми зібрали
              місця, які варто побачити, — з фото, коротким описом і порадами для поїздки.
            </p>
            <div className="home-intro__actions">
              <Link to="/gallery" className="btn btn-primary">
                Переглянути галерею
              </Link>
              <Link to="/about" className="btn btn-outline-ink">
                Про портал
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="section section--mist" aria-labelledby="home-news-title">
        <Container>
          <div className="home-news__head">
            <h2 id="home-news-title" className="section__title">
              Головні новини
            </h2>
            <Link to="/news" className="home-news__all">
              Усі новини
            </Link>
          </div>
          {news.error ? (
            <ErrorMessage error={news.error} onRetry={news.retry} />
          ) : news.data ? (
            <NewsGrid items={news.data.items} withFeature />
          ) : (
            <Loading label="Завантажуємо новини…" />
          )}
        </Container>
      </section>
    </>
  );
}

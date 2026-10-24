import { Carousel, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import './HeroSlider.scss';

// Слайдер на основі Bootstrap Carousel. Слайди надходять з REST API (/api/slides).
export default function HeroSlider({ slides }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero" aria-label="Найвідоміші місця України">
      <Carousel
        fade
        interval={reduceMotion ? null : 6500}
        pause="hover"
        prevLabel="Попередній слайд"
        nextLabel="Наступний слайд"
        indicatorLabels={slides.map((slide) => slide.title)}
      >
        {slides.map((slide, index) => (
          <Carousel.Item key={slide.id} className="hero__item">
            <img
              className="hero__image"
              src={slide.image}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
            <Carousel.Caption className="hero__caption">
              <Container>
                <h2 className="hero__title">{slide.title}</h2>
                <p className="hero__region">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" />
                    <circle cx="12" cy="9.8" r="2.3" />
                  </svg>
                  {slide.subtitle}
                </p>
                <p className="hero__text">{slide.text}</p>
                <Link to={`/news/${slide.newsId}`} className="btn btn-light hero__link">
                  Читати публікацію
                </Link>
              </Container>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
}

import { useState } from 'react';
import { Carousel, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { assetUrl } from '../../utils/assets.js';
import './HeroSlider.scss';

// Слайдер на основі Bootstrap Carousel. Слайди надходять з REST API (/api/slides).
// Автопрокрутка зупиняється кнопкою «Пауза», коли фокус усередині слайдера, і при «зменшенні руху».
export default function HeroSlider({ slides }) {
  const reduceMotion = useReducedMotion();
  const [userPaused, setUserPaused] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const autoplay = !reduceMotion && !userPaused && !focusWithin;

  return (
    <section className="hero" aria-label="Найвідоміші місця України">
      <div
        onFocus={() => setFocusWithin(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
        }}
      >
        <Carousel
          fade
          interval={autoplay ? 6500 : null}
          pause="hover"
          prevLabel="Попередній слайд"
          nextLabel="Наступний слайд"
          indicatorLabels={slides.map((slide) => slide.title)}
        >
          {slides.map((slide, index) => (
            <Carousel.Item key={slide.id} className="hero__item">
              <img
                className="hero__image"
                src={assetUrl(slide.image)}
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
      </div>

      {!reduceMotion && (
        <button
          type="button"
          className="hero__toggle"
          aria-pressed={userPaused}
          title={userPaused ? 'Відновити зміну слайдів' : 'Зупинити зміну слайдів'}
          onClick={() => setUserPaused((paused) => !paused)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {userPaused ? <path d="M8 5.5v13l10.5-6.5z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
          </svg>
          <span className="visually-hidden">Пауза автоматичної зміни слайдів</span>
        </button>
      )}
    </section>
  );
}

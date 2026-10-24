import { Container } from 'react-bootstrap';
import { api } from '../../api/client.js';
import FaqAccordion from '../../components/FaqAccordion/FaqAccordion.jsx';
import PageHeader from '../../components/PageHeader/PageHeader.jsx';
import { ErrorMessage, Loading } from '../../components/Status/Status.jsx';
import { useApi } from '../../hooks/useApi.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { CRITERIA, FAQ } from './aboutContent.js';
import './AboutPage.scss';

export default function AboutPage() {
  usePageTitle('Про сайт');
  const gallery = useApi((options) => api.getGallery({}, options), []);

  return (
    <>
      <PageHeader
        title="Про сайт"
        lead="«Перлини України» — інформаційний портал про найвідоміші туристичні місця країни: що варто побачити, чим цікаве кожне місце і як підготуватися до поїздки."
      />

      <section className="section">
        <Container className="about-intro">
          <div className="prose">
            <h2 className="section__title">Навіщо цей портал</h2>
            <p>
              Відомості про туристичні місця розпорошені між сайтами громад, енциклопедіями, соцмережами та
              відгуками. Ми зводимо головне в одне місце: короткий опис, фото й практичні поради, щоб мандрівник
              міг швидко обрати напрямок і спланувати поїздку.
            </p>
            <p>
              На порталі зібрано шістнадцять місць у чотирьох категоріях: замки та фортеці, природа, міста і
              святині. На головній сторінці — слайдер з найвідомішими з них і десять свіжих публікацій, у
              галереї — фото всіх місць, у новинах — путівники та огляди з пошуком і фільтрами.
            </p>
            <p>
              Портал створено як навчальний проєкт з дисципліни «Веб-програмування». Тексти спираються на
              загальновідомі факти з відкритих джерел, фото — на вільні ліцензії Wikimedia Commons.
            </p>
          </div>
          <figure className="about-intro__figure">
            <img
              src="/images/places/thumbs/lviv-rynok.jpg"
              alt="Площа Ринок у Львові з ратушею та кам’яницями"
              width="800"
              height="533"
              loading="lazy"
            />
            <figcaption>Площа Ринок у Львові — серце історичного центру, внесеного до списку ЮНЕСКО.</figcaption>
          </figure>
        </Container>
      </section>

      <section className="section section--mist">
        <Container>
          <h2 className="section__title">Як ми обираємо місця</h2>
          <dl className="criteria">
            {CRITERIA.map((criterion) => (
              <div key={criterion.title} className="criteria__item">
                <dt>{criterion.title}</dt>
                <dd>{criterion.text}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="section">
        <Container className="about-faq">
          <h2 className="section__title">Питання та відповіді</h2>
          <FaqAccordion items={FAQ} />
        </Container>
      </section>

      <section className="section section--mist" aria-labelledby="photo-credits">
        <Container>
          <h2 id="photo-credits" className="section__title">
            Звідки фото
          </h2>
          <p className="section__lead">
            Усі фотографії взято з Wikimedia Commons. Дякуємо авторам, які поширюють свої роботи під вільними
            ліцензіями.
          </p>
          {gallery.error ? (
            <ErrorMessage error={gallery.error} onRetry={gallery.retry} />
          ) : gallery.data ? (
            <ul className="credits">
              {gallery.data.map((photo) => (
                <li key={photo.id} className="credits__item">
                  <span className="credits__title">{photo.title}</span>
                  <span>Автор: {photo.author}</span>
                  <span>
                    Ліцензія:{' '}
                    <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                      {photo.license}
                    </a>
                    .{' '}
                    <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                      Сторінка фото на Wikimedia Commons
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Loading />
          )}
        </Container>
      </section>
    </>
  );
}

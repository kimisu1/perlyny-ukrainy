import { useCallback, useState } from 'react';
import { Container } from 'react-bootstrap';
import { api } from '../../api/client.js';
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter.jsx';
import GalleryGrid from '../../components/GalleryGrid/GalleryGrid.jsx';
import Lightbox from '../../components/Lightbox/Lightbox.jsx';
import PageHeader from '../../components/PageHeader/PageHeader.jsx';
import { ErrorMessage, Loading } from '../../components/Status/Status.jsx';
import { useApi } from '../../hooks/useApi.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import './GalleryPage.scss';

export default function GalleryPage() {
  usePageTitle('Галерея');
  const [category, setCategory] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  // Фільтрацію за категорією виконує сервер: GET /api/gallery?category=...
  const gallery = useApi((options) => api.getGallery({ category }, options), [category]);
  const photos = gallery.data ?? [];

  const changeCategory = (value) => {
    setOpenIndex(null);
    setCategory(value);
  };

  const navigate = useCallback(
    (step) => setOpenIndex((current) => (current + step + photos.length) % photos.length),
    [photos.length],
  );

  return (
    <>
      <PageHeader
        title="Галерея"
        lead="Фото найвідоміших місць України — від фортець Поділля до карпатських озер. Натисніть на фото, щоб переглянути його у великому розмірі."
      />
      <section className="section">
        <Container>
          <div className="gallery-toolbar">
            <CategoryFilter value={category} onChange={changeCategory} label="Фільтр фото за категорією" />
            <p className="gallery-toolbar__count" aria-live="polite">
              {gallery.data && `Фото: ${photos.length}`}
            </p>
          </div>
          {gallery.error ? (
            <ErrorMessage error={gallery.error} onRetry={gallery.retry} />
          ) : gallery.data ? (
            <GalleryGrid photos={photos} onOpen={setOpenIndex} />
          ) : (
            <Loading label="Завантажуємо фото…" />
          )}
        </Container>
      </section>
      <Lightbox photos={photos} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={navigate} />
    </>
  );
}

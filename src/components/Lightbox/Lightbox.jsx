import { useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './Lightbox.scss';

// Перегляд фото у великому розмірі (Bootstrap Modal) з навігацією кнопками та стрілками клавіатури.
export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const photo = index === null ? null : photos[index];

  useEffect(() => {
    if (!photo) return undefined;
    const handleKey = (event) => {
      if (event.key === 'ArrowLeft') onNavigate(-1);
      if (event.key === 'ArrowRight') onNavigate(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [photo, onNavigate]);

  return (
    <Modal
      show={Boolean(photo)}
      onHide={onClose}
      size="xl"
      centered
      className="lightbox"
      contentClassName="lightbox__content"
      aria-labelledby="lightbox-title"
    >
      {photo && (
        <>
          <Modal.Header closeButton closeVariant="white" closeLabel="Закрити">
            <Modal.Title id="lightbox-title" className="lightbox__title">
              {photo.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="lightbox__body">
            <img src={photo.image} alt={photo.alt} className="lightbox__image" />
          </Modal.Body>
          <Modal.Footer className="lightbox__footer">
            <p className="lightbox__credit">
              {photo.region}. Фото: {photo.author},{' '}
              <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                {photo.license}
              </a>
              ,{' '}
              <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                Wikimedia Commons
              </a>
            </p>
            <div className="lightbox__nav">
              <Button variant="outline-light" onClick={() => onNavigate(-1)}>
                Попереднє
              </Button>
              <span className="lightbox__counter">
                {index + 1} з {photos.length}
              </span>
              <Button variant="outline-light" onClick={() => onNavigate(1)}>
                Наступне
              </Button>
            </div>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}

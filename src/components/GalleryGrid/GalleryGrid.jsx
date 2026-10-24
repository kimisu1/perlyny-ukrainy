import './GalleryGrid.scss';

// Сітка фото на CSS Grid: кожне п'яте фото — збільшене (2×2), grid-auto-flow: dense заповнює проміжки.
export default function GalleryGrid({ photos, onOpen }) {
  return (
    <ul className="gallery-grid">
      {photos.map((photo, index) => (
        <li
          key={photo.id}
          className={index % 5 === 0 ? 'gallery-grid__item gallery-grid__item--wide' : 'gallery-grid__item'}
        >
          <button type="button" className="gallery-grid__button" onClick={() => onOpen(index)}>
            <img src={photo.thumb} alt={photo.alt} loading="lazy" width="800" height="533" />
            <span className="gallery-grid__caption">
              <span className="gallery-grid__title">{photo.title}</span>
              <span className="gallery-grid__region">{photo.region}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

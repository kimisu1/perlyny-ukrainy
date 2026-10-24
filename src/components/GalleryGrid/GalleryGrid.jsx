import { assetUrl } from '../../utils/assets.js';
import './GalleryGrid.scss';

// Кожне п'яте фото робимо широким (2 колонки), але лише тоді, коли так усі рядки
// сітки з 4 колонок заповнюються повністю: n фото + ⌈n/5⌉ додаткових клітинок кратні 4.
function canUseWideItems(count) {
  return (count + Math.ceil(count / 5)) % 4 === 0;
}

export default function GalleryGrid({ photos, onOpen }) {
  const wide = canUseWideItems(photos.length);

  return (
    <ul className="gallery-grid">
      {photos.map((photo, index) => (
        <li
          key={photo.id}
          className={wide && index % 5 === 0 ? 'gallery-grid__item gallery-grid__item--wide' : 'gallery-grid__item'}
        >
          <button type="button" className="gallery-grid__button" onClick={() => onOpen(index)}>
            <img src={assetUrl(photo.thumb)} alt={photo.alt} loading="lazy" width="800" height="533" />
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

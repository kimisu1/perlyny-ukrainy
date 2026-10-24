import './CategoryTag.scss';

// Хрестик-стібок кольору категорії: колір кодує категорію, назва дублює його текстом.
export function Stitch() {
  return (
    <svg className="stitch" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
    </svg>
  );
}

export default function CategoryTag({ id, name }) {
  return (
    <span className={`category-tag category-tag--${id}`}>
      <Stitch />
      {name}
    </span>
  );
}

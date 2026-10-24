import { useCategories } from '../../hooks/useCategories.js';
import { Stitch } from '../CategoryTag/CategoryTag.jsx';
import './CategoryFilter.scss';

// Кнопки-фільтри за категоріями (спільні для галереї та новин). value '' — «Усі».
export default function CategoryFilter({ value, onChange, label }) {
  const { categories } = useCategories();
  const options = [{ id: '', name: 'Усі' }, ...categories];

  return (
    <div className="category-filter" role="group" aria-label={label}>
      {options.map((option) => {
        const active = value === option.id;
        const classes = ['category-filter__button'];
        if (option.id) classes.push(`category-filter__button--${option.id}`);
        if (active) classes.push('is-active');

        return (
          <button
            key={option.id || 'all'}
            type="button"
            className={classes.join(' ')}
            aria-pressed={active}
            onClick={() => onChange(option.id)}
          >
            {option.id && <Stitch />}
            {option.name}
          </button>
        );
      })}
    </div>
  );
}

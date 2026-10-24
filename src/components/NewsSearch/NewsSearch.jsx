import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import $ from '../../lib/jqueryUi.js';
import './NewsSearch.scss';

// Пошук новин. Підказки — віджет jQuery UI Autocomplete, який бере дані з REST API.
export default function NewsSearch({ value, onSearch }) {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [text, setText] = useState(value);

  useEffect(() => setText(value), [value]);

  useEffect(() => {
    const $input = $(inputRef.current);
    let controller = null;

    $input.autocomplete({
      minLength: 2,
      delay: 250,
      source(request, respond) {
        controller?.abort();
        controller = new AbortController();
        api
          .getNews({ q: request.term, limit: 5 }, { signal: controller.signal })
          .then(({ items }) => respond(items.map((item) => ({ label: item.title, value: item.title, id: item.id }))))
          .catch(() => respond([]));
      },
      select(event, ui) {
        event.preventDefault();
        navigate(`/news/${ui.item.id}`);
      },
    });

    return () => {
      controller?.abort();
      $input.autocomplete('destroy');
    };
  }, [navigate]);

  const handleChange = (event) => {
    setText(event.target.value);
    // Очищення поля (наприклад, хрестиком) одразу скидає пошук
    if (event.target.value === '' && value) onSearch('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    $(inputRef.current).autocomplete('close');
    onSearch(text.trim());
  };

  return (
    <form className="news-search" role="search" onSubmit={handleSubmit}>
      <label htmlFor="news-search-input" className="visually-hidden">
        Пошук новин
      </label>
      <input
        id="news-search-input"
        ref={inputRef}
        type="search"
        className="form-control news-search__input"
        placeholder="Назва місця або тема"
        value={text}
        onChange={handleChange}
        autoComplete="off"
      />
      <button type="submit" className="btn btn-primary">
        Знайти
      </button>
    </form>
  );
}

import { useEffect, useRef } from 'react';
import $ from '../../lib/jquery.js';
import './ScrollTopButton.scss';

const SHOW_AFTER = 600;

// Кнопка «Нагору»: поява, зникнення та прокрутка виконуються засобами jQuery.
export default function ScrollTopButton() {
  const buttonRef = useRef(null);

  useEffect(() => {
    const $button = $(buttonRef.current);
    const $window = $(window);
    let visible = false;

    const toggle = () => {
      const shouldShow = $window.scrollTop() > SHOW_AFTER;
      if (shouldShow === visible) return;
      visible = shouldShow;
      $button.stop(true, true)[shouldShow ? 'fadeIn' : 'fadeOut'](200);
    };

    $window.on('scroll.scrollTop', toggle);
    toggle();
    return () => $window.off('scroll.scrollTop');
  }, []);

  const scrollUp = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('html, body').stop().animate({ scrollTop: 0 }, reduceMotion ? 0 : 500);
  };

  return (
    <button ref={buttonRef} type="button" className="scroll-top" onClick={scrollUp} aria-label="Повернутися нагору">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 14l6-6 6 6" />
      </svg>
    </button>
  );
}

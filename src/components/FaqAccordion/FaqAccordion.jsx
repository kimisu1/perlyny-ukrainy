import { Fragment, useEffect, useRef } from 'react';
import $ from '../../lib/jqueryUi.js';

// Питання й відповіді на віджеті jQuery UI Accordion.
// React створює розмітку, jQuery UI керує розкриттям; при демонтажі віджет знищується.
export default function FaqAccordion({ items }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const $accordion = $(containerRef.current);
    $accordion.accordion({
      heightStyle: 'content',
      collapsible: true,
      active: 0,
      icons: false,
      animate: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : 200,
    });
    return () => $accordion.accordion('destroy');
  }, [items]);

  return (
    <div ref={containerRef} className="faq">
      {items.map((item) => (
        <Fragment key={item.question}>
          <h3>{item.question}</h3>
          <div>
            <p>{item.answer}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

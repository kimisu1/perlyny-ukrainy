import { useEffect } from 'react';

const SITE = 'Перлини України';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE}` : `${SITE} — найвідоміші туристичні місця України`;
  }, [title]);
}

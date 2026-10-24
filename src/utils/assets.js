// Адреса файлу з public/ з урахуванням базового шляху сайту
// (локально — «/», на GitHub Pages — «/perlyny-ukrainy/»).
export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

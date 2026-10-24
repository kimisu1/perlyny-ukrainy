const longDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

// '2026-10-20' → '20 жовтня 2026'
export function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return longDate.format(new Date(year, month - 1, day)).replace(/\s?р\.$/, '');
}

// Дата з календаря jQuery UI ('15.11.2026') → формат API ('2026-11-15').
// Рядок іншого формату повертається без змін — його відхилить валідація.
export function uaDateToIso(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value.trim();
}

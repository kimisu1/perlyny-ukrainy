// Валідація звернення з форми «Контакти».
// Модуль спільний: його імпортують і React-форма (підказки біля полів), і сервер (остаточна перевірка).

export const TOPICS = [
  { id: 'route', name: 'Допомога з маршрутом' },
  { id: 'place', name: 'Запропонувати місце' },
  { id: 'cooperation', name: 'Співпраця' },
  { id: 'other', name: 'Інше' },
];

export const LIMITS = {
  name: { min: 2, max: 80 },
  message: { min: 10, max: 2000 },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

function isRealDate(iso) {
  const match = ISO_DATE_RE.exec(iso);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function todayIso(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function validateMessage(input = {}, { today = todayIso() } = {}) {
  const data = {
    name: text(input.name),
    email: text(input.email).toLowerCase(),
    topic: text(input.topic),
    tripDate: text(input.tripDate) || null,
    message: text(input.message),
  };
  const errors = {};

  if (data.name.length < LIMITS.name.min) errors.name = 'Вкажіть ім’я (щонайменше 2 символи)';
  else if (data.name.length > LIMITS.name.max) errors.name = 'Ім’я задовге (до 80 символів)';

  if (!data.email) errors.email = 'Вкажіть електронну пошту';
  else if (!EMAIL_RE.test(data.email)) errors.email = 'Перевірте адресу пошти, наприклад name@example.com';

  if (!TOPICS.some((topic) => topic.id === data.topic)) errors.topic = 'Оберіть тему звернення';

  if (data.tripDate !== null) {
    if (!isRealDate(data.tripDate)) {
      errors.tripDate = 'Оберіть дату в календарі або введіть її у форматі ДД.ММ.РРРР';
    } else if (data.tripDate < today) {
      errors.tripDate = 'Дата поїздки не може бути в минулому';
    }
  }

  if (data.message.length < LIMITS.message.min) errors.message = 'Напишіть щонайменше 10 символів';
  else if (data.message.length > LIMITS.message.max) errors.message = 'Повідомлення задовге (до 2000 символів)';

  return { valid: Object.keys(errors).length === 0, errors, data };
}

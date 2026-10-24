// Виконується після `vite build --mode pages`:
// 1) експортує ресурси REST API у статичні JSON-файли dist/api/*.json;
// 2) створює dist/404.html — GitHub Pages віддає його для невідомих адрес,
//    тож маршрути SPA (наприклад, /news/3) відкриваються і за прямим посиланням.
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

await mkdir(path.join(dist, 'api'), { recursive: true });
for (const name of ['categories', 'slides', 'news', 'gallery']) {
  await copyFile(path.join(root, 'server', 'data', `${name}.json`), path.join(dist, 'api', `${name}.json`));
}
await copyFile(path.join(dist, 'index.html'), path.join(dist, '404.html'));

console.log('dist/api/*.json і dist/404.html створено');

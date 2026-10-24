import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 3001;

const app = await createApp({
  dataDir: path.join(root, 'server', 'data'),
  messagesFile: process.env.MESSAGES_FILE ?? path.join(root, 'server', 'data', 'messages.json'),
  distDir: path.join(root, 'dist'),
});

app.listen(port, () => {
  console.log(`«Перлини України»: http://localhost:${port}`);
});

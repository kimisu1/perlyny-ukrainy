import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw error;
  }
}

// Запис через тимчасовий файл і перейменування: файл ніколи не лишається записаним наполовину.
export async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(tmp, file);
}

export class StoreFullError extends Error {
  constructor() {
    super('Сховище заповнене');
    this.name = 'StoreFullError';
  }
}

// Дописування виконується послідовно, щоб одночасні запити не перезаписали один одного.
// maxItems обмежує розмір файлу: після ліміту запис відхиляється з StoreFullError.
let queue = Promise.resolve();

export function appendJson(file, item, { maxItems = Infinity } = {}) {
  const run = queue.then(async () => {
    const list = await readJson(file, []);
    if (list.length >= maxItems) throw new StoreFullError();
    list.push(item);
    await writeJson(file, list);
    return item;
  });
  queue = run.catch(() => {});
  return run;
}

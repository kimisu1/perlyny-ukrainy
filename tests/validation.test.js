import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateMessage } from '../shared/validation.js';

const TODAY = '2026-10-24';
const VALID = {
  name: 'Олена',
  email: 'olena@example.com',
  topic: 'route',
  tripDate: '2026-11-15',
  message: 'Порадьте маршрут на два дні.',
};
const check = (patch) => validateMessage({ ...VALID, ...patch }, { today: TODAY });

test('приймає повне звернення і нормалізує пробіли та регістр пошти', () => {
  const result = check({ name: '  Олена ', email: ' Olena@Example.COM ' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.data.name, 'Олена');
  assert.equal(result.data.email, 'olena@example.com');
});

test('дата поїздки необов’язкова', () => {
  const result = check({ tripDate: '   ' });
  assert.equal(result.valid, true);
  assert.equal(result.data.tripDate, null);
});

test('повідомляє про всі порожні обов’язкові поля', () => {
  const result = validateMessage({}, { today: TODAY });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['email', 'message', 'name', 'topic']);
});

test('нерядкові значення вважаються порожніми', () => {
  const result = check({ name: 42, message: ['Порадьте маршрут на два дні.'] });
  assert.ok(result.errors.name);
  assert.ok(result.errors.message);
});

test('відхиляє некоректну пошту і невідому тему', () => {
  assert.ok(check({ email: 'olena@' }).errors.email);
  assert.ok(check({ email: 'olena example.com' }).errors.email);
  assert.ok(check({ topic: 'spam' }).errors.topic);
});

test('межі довжини імені: 2 і 80 символів', () => {
  assert.ok(check({ name: 'О' }).errors.name);
  assert.equal(check({ name: 'Ол' }).valid, true);
  assert.equal(check({ name: 'О'.repeat(80) }).valid, true);
  assert.ok(check({ name: 'О'.repeat(81) }).errors.name);
});

test('межі довжини повідомлення: 10 і 2000 символів', () => {
  assert.ok(check({ message: 'а'.repeat(9) }).errors.message);
  assert.equal(check({ message: 'а'.repeat(10) }).valid, true);
  assert.equal(check({ message: 'а'.repeat(2000) }).valid, true);
  assert.ok(check({ message: 'а'.repeat(2001) }).errors.message);
});

test('дата: неіснуюча, у чужому форматі та минула відхиляються, сьогоднішня приймається', () => {
  assert.ok(check({ tripDate: '2026-02-30' }).errors.tripDate);
  assert.ok(check({ tripDate: '15.11.2026' }).errors.tripDate);
  assert.ok(check({ tripDate: '2026-10-23' }).errors.tripDate);
  assert.equal(check({ tripDate: TODAY }).valid, true);
});

// Помилка звернення до API: текст для користувача, HTTP-статус і помилки окремих полів форми.
export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

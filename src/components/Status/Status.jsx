import { Alert, Button, Spinner } from 'react-bootstrap';
import './Status.scss';

export function Loading({ label = 'Завантаження…' }) {
  return (
    <div className="status-loading" role="status">
      <Spinner animation="border" size="sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorMessage({ error, onRetry, retryLabel = 'Спробувати ще раз' }) {
  return (
    <Alert variant="danger" className="status-error">
      <p className="mb-0">{error.message}</p>
      {onRetry && (
        <Button variant="outline-danger" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </Alert>
  );
}

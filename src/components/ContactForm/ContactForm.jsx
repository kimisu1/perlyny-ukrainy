import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { api } from '../../api/client.js';
import $ from '../../lib/jqueryUi.js';
import { LIMITS, TOPICS, validateMessage } from '../../../shared/validation.js';
import { uaDateToIso } from '../../utils/dates.js';
import './ContactForm.scss';

const EMPTY = { name: '', email: '', topic: '', tripDate: '', message: '' };
const FIELD_ORDER = ['name', 'email', 'topic', 'tripDate', 'message'];

// Дата з календаря (ДД.ММ.РРРР) перетворюється у формат API (РРРР-ММ-ДД).
const toPayload = (values) => ({ ...values, tripDate: uaDateToIso(values.tripDate) });

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const dateRef = useRef(null);

  // Та сама функція валідації, що й на сервері (shared/validation.js)
  const clientErrors = useMemo(() => validateMessage(toPayload(values)).errors, [values]);
  const errorFor = (name) => serverErrors[name] ?? (touched[name] || submitted ? clientErrors[name] : undefined);

  const setField = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setServerErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  // Календар jQuery UI Datepicker з українською локалізацією; минулі дати недоступні.
  useEffect(() => {
    const $date = $(dateRef.current);
    // Enter без вибору дня клавішами Ctrl + стрілки має надсилати форму, а не вставляти сьогоднішню дату:
    // обробник підключено раніше за віджет, тож він ховає календар до того, як віджет обробить Enter.
    let navigated = false;
    $date.on('keydown.tripDate', (event) => {
      if (event.key === 'Enter') {
        if (!navigated) $date.datepicker('hide');
        navigated = false;
      } else if ((event.ctrlKey || event.metaKey) && event.key.startsWith('Arrow')) {
        navigated = true;
      }
    });
    $date.datepicker({
      ...$.datepicker.regional.uk,
      minDate: 0,
      showOtherMonths: true,
      selectOtherMonths: true,
      onSelect(dateText) {
        setField('tripDate', dateText);
        setTouched((previous) => ({ ...previous, tripDate: true }));
      },
    });
    return () => {
      $date.off('.tripDate');
      $date.datepicker('destroy');
    };
  }, []);

  const handleChange = (event) => setField(event.target.name, event.target.value);
  const handleBlur = (event) => setTouched((previous) => ({ ...previous, [event.target.name]: true }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitted(true);

    const { valid, errors, data } = validateMessage(toPayload(values));
    if (!valid) {
      const firstInvalid = FIELD_ORDER.find((name) => errors[name]);
      form.elements[firstInvalid]?.focus();
      setStatus({ state: 'idle', message: '' });
      return;
    }

    // Демоверсія на GitHub Pages не має сервера: дані перевірено, але не надіслано
    if (!api.canSendMessages) {
      setStatus({
        state: 'demo',
        message:
          'Форму заповнено правильно. Демоверсія на GitHub Pages працює без сервера, тому звернення не надсилається; у повній версії порталу його приймає REST API (POST /api/messages).',
      });
      return;
    }

    setStatus({ state: 'sending', message: '' });
    try {
      await api.sendMessage(data);
      setValues(EMPTY);
      setTouched({});
      setSubmitted(false);
      setServerErrors({});
      setStatus({
        state: 'success',
        message: 'Звернення надіслано. Ми відповімо на вказану пошту протягом кількох робочих днів.',
      });
    } catch (error) {
      setServerErrors(error.fields ?? {});
      setStatus({ state: 'error', message: error.message });
    }
  };

  // Властивості поля: помилка позначається aria-invalid і пов’язується з полем через aria-describedby
  const errorId = (name) => `contact-${name}-error`;
  const field = (name, hintIds = []) => {
    const error = errorFor(name);
    const describedBy = [error && errorId(name), ...hintIds].filter(Boolean).join(' ');
    return {
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      isInvalid: Boolean(error),
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy || undefined,
    };
  };

  const sending = status.state === 'sending';
  const messageLength = values.message.trim().length;

  return (
    <Form noValidate onSubmit={handleSubmit} className="contact-form">
      <Row className="g-3">
        {!api.canSendMessages && (
          <Col xs={12}>
            <Alert variant="secondary" className="mb-0">
              Це демоверсія без сервера: форма перевіряє дані, але звернення не надсилає.
            </Alert>
          </Col>
        )}
        <Col md={6}>
          <Form.Group controlId="contact-name">
            <Form.Label>Ім’я</Form.Label>
            <Form.Control {...field('name')} autoComplete="name" required />
            <Form.Control.Feedback type="invalid" id={errorId('name')}>
              {errorFor('name')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="contact-email">
            <Form.Label>Електронна пошта</Form.Label>
            <Form.Control {...field('email')} type="email" autoComplete="email" required />
            <Form.Control.Feedback type="invalid" id={errorId('email')}>
              {errorFor('email')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="contact-topic">
            <Form.Label>Тема звернення</Form.Label>
            <Form.Select {...field('topic')} required>
              <option value="">Оберіть тему</option>
              {TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid" id={errorId('topic')}>
              {errorFor('topic')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="contact-trip-date">
            <Form.Label>Орієнтовна дата поїздки</Form.Label>
            <Form.Control
              {...field('tripDate', ['contact-trip-date-hint'])}
              ref={dateRef}
              placeholder="ДД.ММ.РРРР"
              inputMode="numeric"
            />
            <Form.Control.Feedback type="invalid" id={errorId('tripDate')}>
              {errorFor('tripDate')}
            </Form.Control.Feedback>
            <Form.Text id="contact-trip-date-hint">Необов’язково. Оберіть день у календарі.</Form.Text>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="contact-message">
            <Form.Label>Повідомлення</Form.Label>
            <Form.Control {...field('message', ['contact-message-count'])} as="textarea" rows={6} required />
            <Form.Control.Feedback type="invalid" id={errorId('message')}>
              {errorFor('message')}
            </Form.Control.Feedback>
            <Form.Text id="contact-message-count" className="contact-form__counter">
              {messageLength} / {LIMITS.message.max} символів
            </Form.Text>
          </Form.Group>
        </Col>

        <Col xs={12} aria-live="polite">
          {status.state === 'success' && <Alert variant="success">{status.message}</Alert>}
          {status.state === 'error' && <Alert variant="danger">{status.message}</Alert>}
          {status.state === 'demo' && <Alert variant="info">{status.message}</Alert>}
        </Col>

        <Col xs={12}>
          <Button type="submit" variant="primary" disabled={sending}>
            {sending ? 'Надсилаємо…' : 'Надіслати звернення'}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

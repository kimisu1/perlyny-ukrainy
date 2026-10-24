import { Container } from 'react-bootstrap';
import ContactForm from '../../components/ContactForm/ContactForm.jsx';
import MapEmbed from '../../components/MapEmbed/MapEmbed.jsx';
import PageHeader from '../../components/PageHeader/PageHeader.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { CONTACTS } from '../../navigation.js';
import './ContactsPage.scss';

export default function ContactsPage() {
  usePageTitle('Контакти');

  return (
    <>
      <PageHeader
        title="Контакти"
        lead="Маєте питання про поїздку, хочете запропонувати місце чи співпрацювати? Напишіть нам."
      />
      <section className="section">
        <Container className="contacts">
          <div className="contacts__info">
            <h2 className="section__title">Як з нами зв’язатися</h2>
            <dl className="contacts__list">
              <div>
                <dt>Адреса</dt>
                <dd>{CONTACTS.address}</dd>
              </div>
              <div>
                <dt>Електронна пошта</dt>
                <dd>
                  <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
                </dd>
              </div>
              <div>
                <dt>Графік</dt>
                <dd>{CONTACTS.hours}</dd>
              </div>
            </dl>
            <MapEmbed />
          </div>
          <div className="contacts__form">
            <h2 className="section__title">Напишіть нам</h2>
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}

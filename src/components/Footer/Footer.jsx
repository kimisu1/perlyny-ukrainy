import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CONTACTS, NAV_ITEMS } from '../../navigation.js';
import Logo from '../Logo/Logo.jsx';
import Ornament from '../Ornament/Ornament.jsx';
import './Footer.scss';

export default function Footer() {
  return (
    <footer className="site-footer">
      <Ornament light />
      <Container>
        <div className="site-footer__grid">
          <div className="site-footer__about">
            <Logo inverted />
            <p>
              Інформаційний портал про найвідоміші туристичні місця України: фортеці й замки, гори та озера,
              старовинні міста і святині.
            </p>
          </div>

          <nav className="site-footer__nav" aria-label="Розділи сайту">
            <h2 className="site-footer__heading">Розділи</h2>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__contacts">
            <h2 className="site-footer__heading">Контакти</h2>
            <address>
              {CONTACTS.address}
              <br />
              <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
            </address>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} «Перлини України». Навчальний проєкт з дисципліни «Веб-програмування».</p>
          <p>
            Фото — Wikimedia Commons, автори та ліцензії вказані на сторінці{' '}
            <Link to="/about#photo-credits">«Про сайт»</Link>.
          </p>
        </div>
      </Container>
    </footer>
  );
}

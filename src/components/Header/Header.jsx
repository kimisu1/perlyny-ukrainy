import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../navigation.js';
import Logo from '../Logo/Logo.jsx';
import './Header.scss';

export default function Header() {
  return (
    <Navbar as="header" expand="lg" sticky="top" collapseOnSelect className="site-header">
      <Container>
        <Navbar.Brand as={Link} to="/" className="site-header__brand" aria-label="Перлини України — на головну">
          <Logo />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="site-nav" aria-label="Меню" className="site-header__toggle" />
        <Navbar.Collapse id="site-nav">
          <Nav as="nav" aria-label="Головне меню" className="ms-auto site-header__nav">
            {NAV_ITEMS.map((item) => (
              <Nav.Link
                key={item.to}
                as={NavLink}
                to={item.to}
                end={item.end}
                eventKey={item.to}
                className="site-header__link"
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

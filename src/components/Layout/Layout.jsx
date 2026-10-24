import { Suspense } from 'react';
import { Container } from 'react-bootstrap';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Footer from '../Footer/Footer.jsx';
import Header from '../Header/Header.jsx';
import Ornament from '../Ornament/Ornament.jsx';
import ScrollTopButton from '../ScrollTopButton/ScrollTopButton.jsx';
import { Loading } from '../Status/Status.jsx';

// Обгортка всіх сторінок: орнамент, шапка, вміст сторінки, футер.
export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Перейти до вмісту
      </a>
      <Ornament />
      <Header />
      <main id="main" className="site-main" tabIndex={-1}>
        <Suspense
          fallback={
            <Container>
              <Loading />
            </Container>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollTopButton />
      <ScrollRestoration />
    </>
  );
}

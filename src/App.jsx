import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';

// Головна завантажується одразу, решта сторінок — окремими частинами (code splitting).
const AboutPage = lazy(() => import('./pages/AboutPage/AboutPage.jsx'));
const GalleryPage = lazy(() => import('./pages/GalleryPage/GalleryPage.jsx'));
const NewsPage = lazy(() => import('./pages/NewsPage/NewsPage.jsx'));
const NewsArticlePage = lazy(() => import('./pages/NewsArticlePage/NewsArticlePage.jsx'));
const ContactsPage = lazy(() => import('./pages/ContactsPage/ContactsPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage/NotFoundPage.jsx'));

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'news', element: <NewsPage /> },
      { path: 'news/:id', element: <NewsArticlePage /> },
      { path: 'contacts', element: <ContactsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

// На GitHub Pages сайт відкривається з підкаталогу (/perlyny-ukrainy/), тому маршрути відраховуються від BASE_URL.
const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

export default function App() {
  return <RouterProvider router={router} />;
}

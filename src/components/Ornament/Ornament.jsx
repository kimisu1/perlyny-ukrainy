import './Ornament.scss';

// Смуга-вишивка: геометричний мотив з ромбів і хрестиків.
export default function Ornament({ light = false }) {
  return <div className={light ? 'ornament ornament--light' : 'ornament'} aria-hidden="true" />;
}

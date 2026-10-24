import { useId } from 'react';
import './Logo.scss';

// Знак — перлина з восьмипелюстковою зіркою, поширеним мотивом української вишивки.
export default function Logo({ inverted = false }) {
  const gradientId = useId();

  return (
    <span className={inverted ? 'logo logo--inverted' : 'logo'}>
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".55" stopColor="#e7ebf2" />
            <stop offset="1" stopColor="#b9c3d6" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="19" fill={`url(#${gradientId})`} className="logo__pearl" />
        <path d="M13 13h14v14H13z" fill="#b01e2f" />
        <path d="M20 10.1 29.9 20 20 29.9 10.1 20z" fill="#b01e2f" />
        <circle cx="20" cy="20" r="3.2" fill="#fff" />
        <circle cx="20" cy="20" r="1.4" fill="#1d2b53" />
      </svg>
      <span className="logo__text">
        <span>Перлини</span>
        <span>України</span>
      </span>
    </span>
  );
}

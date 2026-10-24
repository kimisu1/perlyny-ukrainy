import './MapEmbed.scss';

// Карта Google без ключа API: вбудовування за координатами.
const MAP_URL = 'https://www.google.com/maps?q=50.4501,30.5234&z=15&hl=uk&output=embed';

export default function MapEmbed() {
  return (
    <div className="map-embed">
      <iframe
        title="Карта Google: Майдан Незалежності, Київ"
        src={MAP_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}

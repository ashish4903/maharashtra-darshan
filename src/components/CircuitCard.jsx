import Photo from './Photo';
import useLang from '../lib/useLang';
import { circuitPlaces } from '../lib/catalogue';

export default function CircuitCard({ circuit }) {
  const { t, name, otherName, lang } = useLang();
  const stops = circuitPlaces(circuit);
  const cover = stops.find((p) => p.image)?.image;
  return (
    <a href={`#/circuit/${circuit.id}`} className="card circuit-card">
      <div className="card-media">
        <Photo image={cover} alt="" icon="🧭" />
        <span className="card-badge">
          <span aria-hidden="true">🧭</span> {t('circuit.kicker', { stops: t('count.stop', { n: stops.length }) })}
        </span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{name(circuit)}</h3>
        <p className="card-mr" lang={lang === 'mr' ? 'en' : 'mr'}>
          {otherName(circuit)}
        </p>
        <p className="card-text" lang="en">
          {circuit.about}
        </p>
      </div>
    </a>
  );
}

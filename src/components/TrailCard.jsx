import Photo from './Photo';
import useLang from '../lib/useLang';
import { trailStops } from '../lib/catalogue';

export default function TrailCard({ trail }) {
  const { t, name, otherName, lang } = useLang();
  const stops = trailStops(trail);
  const cover = stops.find((s) => s.place.image)?.place.image;
  const when = (s) => (lang === 'mr' && s.whenMr) || s.when;
  return (
    <a href={`#/trail/${trail.id}`} className="card trail-card">
      <div className="card-media">
        <Photo image={cover} alt="" icon={trail.icon} />
        <span className="card-badge">
          <span aria-hidden="true">{trail.icon}</span> {t('trail.kicker', { stops: t('count.stop', { n: stops.length }) })}
        </span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{name(trail)}</h3>
        <p className="card-mr" lang={lang === 'mr' ? 'en' : 'mr'}>
          {otherName(trail)}
        </p>
        <p className="card-season">
          {when(stops[0])} → {when(stops[stops.length - 1])}
        </p>
        <p className="card-text">{(lang === 'mr' && trail.aboutMr) || trail.about}</p>
      </div>
    </a>
  );
}

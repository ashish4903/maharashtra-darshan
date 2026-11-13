import useLang from '../lib/useLang';
import { getHub } from '../lib/catalogue';
import { directionsUrl } from '../lib/trip';

/**
 * The nearest railway station and airport (with scheduled flights) to a place,
 * by straight-line distance, each with Google Maps directions from there.
 * Stations and airports come from Wikidata; see scripts/transport.mjs.
 */
export default function GettingThere({ place }) {
  const { t, name } = useLang();
  const rows = [
    { key: 'station', icon: '🚆', label: t('getThere.station'), ...place.station },
    { key: 'airport', icon: '✈️', label: t('getThere.airport'), ...place.airport },
  ]
    .map((r) => ({ ...r, hub: r.id && getHub(r.id) }))
    .filter((r) => r.hub);
  if (rows.length === 0) return null;

  return (
    <section className="getting-there" aria-labelledby="getting-there-title">
      <h2 id="getting-there-title" className="getting-there-title">
        {t('getThere.title')}
      </h2>
      <ul>
        {rows.map(({ key, icon, label, hub, km }) => (
          <li key={key}>
            <span className="getting-there-icon" aria-hidden="true">
              {icon}
            </span>
            <span className="getting-there-text">
              <span className="getting-there-label">{label}</span>
              <a href={hub.wikipedia} target="_blank" rel="noreferrer">
                {name(hub)}
                {hub.code && ` (${hub.code})`}
              </a>
              <span className="muted">{t('getThere.km', { km: km < 1 ? '<1' : km })}</span>
            </span>
            <a
              className="button button-ghost getting-there-go"
              href={directionsUrl([hub, place])}
              target="_blank"
              rel="noreferrer"
              aria-label={t('getThere.directionsFrom', { from: name(hub) })}
            >
              {t('trip.directions')}
            </a>
          </li>
        ))}
      </ul>
      <p className="source-note">{t('getThere.note')}</p>
    </section>
  );
}

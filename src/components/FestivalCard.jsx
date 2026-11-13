import Photo from './Photo';
import useLang from '../lib/useLang';
import { getPlace, getRegion, monthsUntil } from '../lib/catalogue';

export default function FestivalCard({ festival, month = new Date().getMonth() + 1 }) {
  const { t, name, otherName, lang } = useLang();
  const region = getRegion(festival.region);
  const soon = monthsUntil(festival, month);
  const places = festival.places.map(getPlace).filter(Boolean);
  let badge = festival.when;
  if (soon === 0) badge = t('festival.thisMonth');
  else if (soon === 1) badge = t('festival.nextMonth');

  return (
    <div className={`card festival-card region-${festival.region}`}>
      <a href={festival.wikipedia} target="_blank" rel="noreferrer" className="card-link">
        <div className="card-media">
          <Photo image={festival.image} alt={name(festival)} icon="🪔" />
          <span className={`card-badge${soon <= 1 ? ' is-soon' : ''}`}>
            <span aria-hidden="true">📅</span> {badge}
          </span>
        </div>
        <div className="card-body">
          <h3 className="card-title">{name(festival)}</h3>
          {otherName(festival) && (
            <p className="card-mr" lang={lang === 'mr' ? 'en' : 'mr'}>
              {otherName(festival)}
            </p>
          )}
          <p className="card-text festival-when" lang="en">
            {festival.when}
          </p>
          <p className="card-meta">
            <span>{region ? name(region) : t('food.statewide')}</span>
            <span>{t('card.readWikipedia')}</span>
          </p>
        </div>
      </a>
      {places.length > 0 && (
        <p className="festival-places">
          {t('festival.where')}{' '}
          {places.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ', '}
              <a href={`#/place/${p.id}`}>{name(p)}</a>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

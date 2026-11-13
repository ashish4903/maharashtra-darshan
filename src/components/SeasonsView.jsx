import { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import PlaceCard from './PlaceCard';
import FoodCard from './FoodCard';
import FestivalCard from './FestivalCard';
import useLang from '../lib/useLang';
import { bestIn } from '../lib/catalogue';
import { currentMonth, monthName } from '../lib/months';

/** "Where should I go, and when?" Pick a month and see what's at its best. */
export default function SeasonsView({ initialMonth = currentMonth() }) {
  const { t, lang } = useLang();
  const [month, setMonth] = useState(initialMonth);
  const best = bestIn(month);
  const empty = best.places.length + best.foods.length + best.festivals.length === 0;

  return (
    <article className="level seasons-page">
      <Breadcrumbs current={t('season.title')} />
      <header className="trip-head">
        <div>
          <h1>{t('season.title')}</h1>
          <p className="muted">{t('season.intro')}</p>
        </div>
      </header>

      <div className="month-picker" role="group" aria-label={t('season.pick')}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <button
            key={m}
            type="button"
            className="chip"
            aria-pressed={m === month}
            onClick={() => setMonth(m)}
          >
            {monthName(m, lang, 'short')}
            {m === currentMonth() && <span className="month-now" aria-hidden="true"> •</span>}
          </button>
        ))}
      </div>

      <h2 className="season-month">{t('season.homeTitle', { month: monthName(month, lang) })}</h2>
      {empty && <p className="empty">{t('season.none')}</p>}

      {best.places.length > 0 && (
        <section aria-label={t('season.places')}>
          <h3 className="intro-heading">{t('season.places')}</h3>
          <ul className="card-grid">
            {best.places.map((p) => (
              <li key={p.id}>
                <PlaceCard place={p} showDistrict showSeason />
              </li>
            ))}
          </ul>
        </section>
      )}
      {best.foods.length > 0 && (
        <section aria-label={t('season.foods')}>
          <h3 className="intro-heading">{t('season.foods')}</h3>
          <ul className="card-grid">
            {best.foods.map((f) => (
              <li key={f.id}>
                <FoodCard food={f} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {best.festivals.length > 0 && (
        <section aria-label={t('season.festivals')}>
          <h3 className="intro-heading">{t('season.festivals')}</h3>
          <ul className="card-grid">
            {best.festivals.map((f) => (
              <li key={f.id}>
                <FestivalCard festival={f} month={month} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="source-note">{t('season.note')}</p>
    </article>
  );
}

import { useState } from 'react';
import MaharashtraMap from './MaharashtraMap';
import TripStop from './TripStop';
import useLang from '../lib/useLang';
import { directionsUrl, routeKm, shortestRoute, splitDays } from '../lib/trip';
import { formatKm } from '../lib/geo';

/**
 * A list of places as a route: shortest order (or as given), split into
 * days, with a map and Google Maps directions for each day.
 */
export default function TripPlan({
  places,
  removable = false,
  keepOrder = false,
  givenLabel = 'trip.asSaved',
  orderName,
  initialPerDay = 3,
}) {
  const { t } = useLang();
  const [order, setOrder] = useState(keepOrder ? 'given' : 'shortest');
  const [perDay, setPerDay] = useState(initialPerDay);

  const mapped = places.filter((p) => p.coords);
  const unmapped = places.filter((p) => !p.coords);
  const route = order === 'shortest' ? shortestRoute(mapped) : mapped;
  const days = splitDays(route, { perDay });
  const whole = route.length <= 11 ? directionsUrl(route) : null;
  let number = 0;

  return (
    <div className="trip-plan">
      <div className="trip-summary">
        <p>
          {t('trip.summary', {
            stops: t('count.stop', { n: route.length }),
            km: formatKm(routeKm(route)),
            days: t('count.day', { n: days.length }),
          })}
        </p>
        <div className="trip-controls">
          <label>
            {t('trip.order')}{' '}
            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="shortest">{t('trip.shortest')}</option>
              <option value="given">{t(orderName ?? (keepOrder ? 'trip.traditional' : givenLabel))}</option>
            </select>
          </label>
          <label>
            {t('trip.perDay')}{' '}
            <select value={perDay} onChange={(e) => setPerDay(Number(e.target.value))}>
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          {whole && (
            <a className="button button-primary" href={whole} target="_blank" rel="noreferrer">
              {t('trip.whole')}
            </a>
          )}
        </div>
      </div>

      <div className="level-layout">
        <div className="level-main">
          {days.map((day, i) => (
            <section key={i} className="trip-day" aria-label={t('trip.day', { n: i + 1 })}>
              <header className="trip-day-head">
                <h2>{t('trip.day', { n: i + 1 })}</h2>
                <span className="muted">
                  {t('count.stop', { n: day.stops.length })}
                  {day.km > 0 && ` · ${formatKm(day.km)}`}
                </span>
                <a href={directionsUrl(day.stops.map((s) => s.place))} target="_blank" rel="noreferrer">
                  {t('trip.directions')}
                </a>
              </header>
              <ol className="trip-stops">
                {day.stops.map((s, j) => (
                  <TripStop
                    key={s.place.id}
                    place={s.place}
                    number={++number}
                    hopKm={j === 0 ? 0 : s.hopKm}
                    removable={removable}
                  />
                ))}
              </ol>
            </section>
          ))}
          {unmapped.length > 0 && (
            <section className="trip-day" aria-label={t('trip.offRoute')}>
              <header className="trip-day-head">
                <h2>{t('trip.offRoute')}</h2>
                <span className="muted">{t('trip.offRouteNote')}</span>
              </header>
              <ol className="trip-stops">
                {unmapped.map((p) => (
                  <TripStop key={p.id} place={p} number="•" removable={removable} />
                ))}
              </ol>
            </section>
          )}
          <p className="source-note">{t('trip.note')}</p>
        </div>
        <aside className="level-aside">
          <MaharashtraMap route={route} label={t('map.trip')} />
        </aside>
      </div>
    </div>
  );
}

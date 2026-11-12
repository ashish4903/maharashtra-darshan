import { useState } from 'react';
import MaharashtraMap from './MaharashtraMap';
import TripStop from './TripStop';
import { directionsUrl, routeKm, shortestRoute, splitDays } from '../lib/trip';
import { formatKm } from '../lib/geo';
import { plural } from '../lib/catalogue';

/**
 * A list of places as a route: shortest order (or as given), split into
 * days, with a map and Google Maps directions for each day.
 */
export default function TripPlan({ places, removable = false, keepOrder = false }) {
  const [order, setOrder] = useState(keepOrder ? 'given' : 'shortest');
  const [perDay, setPerDay] = useState(3);

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
          <strong>{plural(route.length, 'stop')}</strong> · about <strong>{formatKm(routeKm(route))}</strong> in a
          straight line · <strong>{plural(days.length, 'day')}</strong>
        </p>
        <div className="trip-controls">
          <label>
            Order{' '}
            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="shortest">Shortest route</option>
              <option value="given">{keepOrder ? 'Traditional order' : 'As saved'}</option>
            </select>
          </label>
          <label>
            Stops a day{' '}
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
              🧭 Whole route in Google Maps
            </a>
          )}
        </div>
      </div>

      <div className="level-layout">
        <div className="level-main">
          {days.map((day, i) => (
            <section key={i} className="trip-day" aria-label={`Day ${i + 1}`}>
              <header className="trip-day-head">
                <h2>Day {i + 1}</h2>
                <span className="muted">
                  {plural(day.stops.length, 'stop')}
                  {day.km > 0 && ` · ${formatKm(day.km)}`}
                </span>
                <a href={directionsUrl(day.stops.map((s) => s.place))} target="_blank" rel="noreferrer">
                  Directions ↗
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
            <section className="trip-day" aria-label="Not on the route">
              <header className="trip-day-head">
                <h2>Not on the route</h2>
                <span className="muted">No coordinates on Wikipedia yet</span>
              </header>
              <ol className="trip-stops">
                {unmapped.map((p) => (
                  <TripStop key={p.id} place={p} number="•" removable={removable} />
                ))}
              </ol>
            </section>
          )}
          <p className="source-note">
            Distances are straight-line; roads are longer. Directions open in Google Maps.
          </p>
        </div>
        <aside className="level-aside">
          <MaharashtraMap route={route} label="Map of this trip" />
        </aside>
      </div>
    </div>
  );
}

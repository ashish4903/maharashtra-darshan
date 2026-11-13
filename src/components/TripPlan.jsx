import { useEffect, useState } from 'react';
import MaharashtraMap from './MaharashtraMap';
import TripStop from './TripStop';
import DayWeather from './DayWeather';
import ListenButton from './ListenButton';
import useLang from '../lib/useLang';
import { directionsUrl, routeKm, shortestRoute, splitDays } from '../lib/trip';
import { formatKm } from '../lib/geo';
import { getDistrict } from '../lib/catalogue';
import { dayScript } from '../lib/speech';
import {
  FORECAST_DAYS,
  OUTDOOR_KINDS,
  addDays,
  assessDay,
  dayForecast,
  daysBetween,
  isoDate,
  suggestSwap,
  tripForecastUrl,
} from '../lib/tripWeather';

/**
 * A list of places as a route: shortest order (or as given), split into
 * days, with a map and Google Maps directions for each day. With a start
 * date in the next 16 days, each day shows its forecast, warns about rain
 * or heat on outdoor days, and can swap a rainy outdoor day with a drier one.
 */
export default function TripPlan({
  places,
  removable = false,
  keepOrder = false,
  givenLabel = 'trip.asSaved',
  orderName,
  initialPerDay = 3,
}) {
  const { t, lang } = useLang();
  const [order, setOrder] = useState(keepOrder ? 'given' : 'shortest');
  const [perDay, setPerDay] = useState(initialPerDay);
  const today = isoDate(new Date());
  const [startDate, setStartDate] = useState(today);

  const mapped = places.filter((p) => p.coords);
  const unmapped = places.filter((p) => !p.coords);
  const route = order === 'shortest' ? shortestRoute(mapped) : mapped;
  const baseDays = splitDays(route, { perDay });

  // Swapped days are kept only while the plan stays the same
  const planKey = `${baseDays.map((d) => d.stops.map((s) => s.place.id).join('+')).join('|')}`;
  const [swap, setSwap] = useState({ key: '', order: null });
  const dayOrder = swap.key === planKey && swap.order ? swap.order : baseDays.map((_, i) => i);
  const days = dayOrder.map((i) => baseDays[i]);
  const orderedRoute = days.flatMap((d) => d.stops.map((s) => s.place));

  // Forecasts, for trips that start within Open-Meteo's 16-day window
  const ahead = daysBetween(today, startDate);
  const inWindow = ahead >= 0 && ahead < FORECAST_DAYS;
  const lastDay = addDays(startDate, Math.min(days.length, FORECAST_DAYS - ahead) - 1);
  const points = days.map((d) => d.stops[0].place.coords);
  const forecastKey = inWindow && days.length ? `${startDate}|${lastDay}|${points.map((p) => p.join(',')).join(';')}` : '';
  const [forecast, setForecast] = useState({ key: '', response: null });
  useEffect(() => {
    if (!forecastKey) return undefined;
    const controller = new AbortController();
    fetch(tripForecastUrl(points, startDate, lastDay), { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((response) => setForecast({ key: forecastKey, response }))
      .catch(() => {});
    return () => controller.abort();
    // points/startDate/lastDay are all captured in forecastKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecastKey]);
  const response = forecast.key === forecastKey ? forecast.response : null;
  const forecasts = days.map((_, i) => (response ? dayForecast(response, i) : null));
  const assessments = days.map((d, i) => assessDay(forecasts[i], d.stops));
  const suggestion = suggestSwap(assessments);

  const swapDays = (a, b) => {
    const next = [...dayOrder];
    [next[a], next[b]] = [next[b], next[a]];
    setSwap({ key: planKey, order: next });
  };

  const whole = orderedRoute.length <= 11 ? directionsUrl(orderedRoute) : null;
  const dateLabel = (i) =>
    new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(
      new Date(`${addDays(startDate, i)}T12:00:00`),
    );
  const month = Number(startDate.slice(5, 7));
  const monsoonOutdoor =
    !inWindow && month >= 6 && month <= 9 && route.some((p) => OUTDOOR_KINDS.has(p.kind));
  let number = 0;

  return (
    <div className="trip-plan">
      <div className="trip-summary">
        <p>
          {t('trip.summary', {
            stops: t('count.stop', { n: route.length }),
            km: formatKm(routeKm(orderedRoute)),
            days: t('count.day', { n: days.length }),
          })}
        </p>
        <div className="trip-controls">
          <label>
            {t('trip.startOn')}{' '}
            <input type="date" value={startDate} min={today} onChange={(e) => e.target.value && setStartDate(e.target.value)} />
          </label>
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

      {!inWindow && days.length > 0 && (
        <p className="trip-weather-note">
          {t('trip.forecastLater', { days: FORECAST_DAYS })}
          {monsoonOutdoor && ` ${t('trip.monsoonNote')}`}
        </p>
      )}

      <div className="level-layout">
        <div className="level-main">
          {days.map((day, i) => (
            <section key={dayOrder[i]} className="trip-day" aria-label={t('trip.day', { n: i + 1 })}>
              <header className="trip-day-head">
                <h2>{t('trip.day', { n: i + 1 })}</h2>
                <span className="muted">
                  {dateLabel(i)} · {t('count.stop', { n: day.stops.length })}
                  {day.km > 0 && ` · ${formatKm(day.km)}`}
                </span>
                <a href={directionsUrl(day.stops.map((s) => s.place))} target="_blank" rel="noreferrer">
                  {t('trip.directions')}
                </a>
                <ListenButton
                  compact
                  label={t('listen.dayLabel', { n: i + 1 })}
                  script={(l) =>
                    dayScript(l, { n: i + 1, stops: day.stops.map((s) => s.place), districtOf: (p) => getDistrict(p.district) })
                  }
                />
              </header>
              {forecasts[i] && <DayWeather forecast={forecasts[i]} />}
              {(assessments[i].rain || assessments[i].heat) && (
                <div className="trip-warning" role="status">
                  {assessments[i].rain && <p>🌧️ {t('trip.rainWarning')}</p>}
                  {assessments[i].heat && <p>🥵 {t('trip.heatWarning')}</p>}
                  {suggestion?.from === i && (
                    <button type="button" className="chip" onClick={() => swapDays(suggestion.from, suggestion.to)}>
                      {t('trip.swapWith', { n: suggestion.to + 1 })}
                    </button>
                  )}
                </div>
              )}
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
          <p className="source-note">
            {t('trip.note')} {response && t('trip.weatherCredit')}
          </p>
        </div>
        <aside className="level-aside">
          <MaharashtraMap route={orderedRoute} label={t('map.trip')} />
        </aside>
      </div>
    </div>
  );
}

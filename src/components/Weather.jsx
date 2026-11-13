import { useEffect, useState } from 'react';
import useLang from '../lib/useLang';
import { forecastUrl, weatherKind } from '../lib/weather';

/**
 * A short forecast for a place, from Open-Meteo (free, no API key). Only the
 * place's coordinates are sent; if the forecast can't load, nothing is shown.
 */
export default function Weather({ coords }) {
  const { t, lang } = useLang();
  const [state, setState] = useState({ key: null, days: null });
  const key = coords?.join(',');

  useEffect(() => {
    if (!coords) return undefined;
    const controller = new AbortController();
    fetch(forecastUrl(coords), { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const d = json?.daily;
        const days = d?.time?.map((date, i) => ({
          date,
          code: d.weather_code[i],
          max: Math.round(d.temperature_2m_max[i]),
          min: Math.round(d.temperature_2m_min[i]),
          rain: d.precipitation_probability_max?.[i],
        }));
        setState({ key: coords.join(','), days: days ?? [] });
      })
      .catch(() => setState({ key: coords.join(','), days: [] }));
    return () => controller.abort();
  }, [coords]);

  if (!coords || state.key !== key || !state.days?.length) return null;
  const dayName = (date, i) =>
    i === 0
      ? t('weather.today')
      : new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-IN', { weekday: 'short' }).format(new Date(date));

  return (
    <section className="weather" aria-label={t('weather.title')}>
      <h2 className="intro-heading">{t('weather.title')}</h2>
      <ul className="weather-days">
        {state.days.map((day, i) => {
          const kind = weatherKind(day.code);
          return (
            <li key={day.date}>
              <span className="weather-day">{dayName(day.date, i)}</span>
              <span className="weather-icon" aria-hidden="true">
                {kind.icon}
              </span>
              <span className="weather-label">{t(`weather.${kind.id}`)}</span>
              <span className="weather-temp">
                {day.max}° / {day.min}°
              </span>
              {day.rain != null && <span className="weather-rain">💧 {day.rain}%</span>}
            </li>
          );
        })}
      </ul>
      <p className="source-note">
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          {t('weather.credit')}
        </a>
      </p>
    </section>
  );
}

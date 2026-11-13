// Weather-aware trips: a forecast for each day of a trip (Open-Meteo, free,
// no key; only the coordinates of each day's first stop are sent), warnings
// for rain or heat on outdoor days, and a suggested swap to a drier day.

export const FORECAST_DAYS = 16; // how far ahead Open-Meteo forecasts
export const OUTDOOR_KINDS = new Set(['fort', 'nature', 'hill-station', 'beach']);
export const HEAVY_RAIN_MM = 15;
export const LIKELY_RAIN_PERCENT = 70;
export const HOT_C = 38;

/** "2026-11-14" in local time. */
export const isoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return isoDate(new Date(y, m - 1, d + n));
}

export function daysBetween(fromIso, toIso) {
  const [a, b] = [fromIso, toIso].map((iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((b - a) / 86400000);
}

/** One request for several places over a date range. */
export function tripForecastUrl(points, startIso, endIso) {
  return (
    'https://api.open-meteo.com/v1/forecast?' +
    new URLSearchParams({
      latitude: points.map((p) => p[0]).join(','),
      longitude: points.map((p) => p[1]).join(','),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
      timezone: 'Asia/Kolkata',
      start_date: startIso,
      end_date: endIso,
    })
  );
}

/** The forecast for day `index` of a multi-location response, or null. */
export function dayForecast(response, index) {
  const location = Array.isArray(response) ? response[index] : index === 0 ? response : null;
  const d = location?.daily;
  if (!d?.time?.[index]) return null;
  return {
    code: d.weather_code[index],
    max: Math.round(d.temperature_2m_max[index]),
    min: Math.round(d.temperature_2m_min[index]),
    rainMm: d.precipitation_sum?.[index] ?? 0,
    rainChance: d.precipitation_probability_max?.[index] ?? 0,
  };
}

/** What a day's forecast means for its stops. */
export function assessDay(forecast, stops) {
  const outdoor = stops.filter((s) => OUTDOOR_KINDS.has(s.place.kind)).length;
  if (!forecast) return { known: false, outdoor, wet: false, rain: false, heat: false };
  const wet = forecast.rainMm >= HEAVY_RAIN_MM || forecast.rainChance >= LIKELY_RAIN_PERCENT;
  return { known: true, outdoor, wet, rain: wet && outdoor > 0, heat: forecast.max >= HOT_C && outdoor > 0 };
}

/**
 * For the first rainy outdoor day, a drier day with fewer outdoor stops to
 * swap it with: { from, to } (day indexes), or null.
 */
export function suggestSwap(assessments) {
  const from = assessments.findIndex((a) => a.rain);
  if (from < 0) return null;
  const options = assessments
    .map((a, to) => ({ a, to }))
    .filter(({ a, to }) => to !== from && a.known && !a.wet && a.outdoor < assessments[from].outdoor)
    .sort((x, y) => x.a.outdoor - y.a.outdoor);
  return options.length ? { from, to: options[0].to } : null;
}

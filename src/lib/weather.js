// Weather forecasts from Open-Meteo (https://open-meteo.com): free, no API
// key, data under CC BY 4.0 (credited on the page). Only coordinates are sent.

export const forecastUrl = ([lat, lon], days = 4) =>
  'https://api.open-meteo.com/v1/forecast?' +
  new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Kolkata',
    forecast_days: String(days),
  });

// WMO weather codes, grouped (https://open-meteo.com/en/docs)
const KINDS = [
  [[0], 'clear', '☀️'],
  [[1, 2], 'partly', '⛅'],
  [[3], 'cloudy', '☁️'],
  [[45, 48], 'fog', '🌫️'],
  [[51, 53, 55, 56, 57], 'drizzle', '🌦️'],
  [[61, 63, 65, 66, 67], 'rain', '🌧️'],
  [[80, 81, 82], 'showers', '🌦️'],
  [[71, 73, 75, 77, 85, 86], 'snow', '❄️'],
  [[95, 96, 99], 'storm', '⛈️'],
];

export function weatherKind(code) {
  const hit = KINDS.find(([codes]) => codes.includes(code));
  return hit ? { id: hit[1], icon: hit[2] } : { id: 'unknown', icon: '🌡️' };
}

import useLang from '../lib/useLang';
import { weatherKind } from '../lib/weather';

/** One day's forecast on a trip: sky, high/low, rain. */
export default function DayWeather({ forecast }) {
  const { t } = useLang();
  const kind = weatherKind(forecast.code);
  return (
    <p className="day-weather">
      <span aria-hidden="true">{kind.icon}</span> {t(`weather.${kind.id}`)} · {forecast.max}° / {forecast.min}° ·{' '}
      <span aria-label={t('trip.rainChance')}>💧 {forecast.rainChance}%</span>
      {forecast.rainMm >= 1 && ` · ${Math.round(forecast.rainMm)} mm`}
    </p>
  );
}

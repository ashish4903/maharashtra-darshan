import useLang from '../lib/useLang';
import { SEASON_ICONS, monthRange } from '../lib/catalogue';
import { monthName } from '../lib/months';

/** "🌧️ Monsoon waterfalls · Jul–Nov" for a place or dish with a sourced season. */
export default function SeasonNote({ item, className = 'card-season' }) {
  const { t, lang } = useLang();
  if (!item.best) return null;
  return (
    <p className={className}>
      <span aria-hidden="true">{SEASON_ICONS[item.best.reason]}</span> {t(`season.${item.best.reason}`)} ·{' '}
      {monthRange(item.best.months, (m) => monthName(m, lang, 'short'))}
    </p>
  );
}

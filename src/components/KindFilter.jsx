import useLang from '../lib/useLang';
import { KINDS } from '../lib/catalogue';

export default function KindFilter({ counts, active, onChange }) {
  const { t, kind } = useLang();
  const kinds = Object.keys(KINDS).filter((k) => counts[k]);
  if (kinds.length < 2) return null;
  return (
    <div className="chips" role="group" aria-label={t('filter.kind')}>
      <button type="button" className="chip" aria-pressed={!active} onClick={() => onChange(null)}>
        {t('filter.all')}
      </button>
      {kinds.map((k) => (
        <button key={k} type="button" className="chip" aria-pressed={active === k} onClick={() => onChange(k)}>
          <span aria-hidden="true">{KINDS[k].icon}</span> {kind(k, true)} ({counts[k]})
        </button>
      ))}
    </div>
  );
}

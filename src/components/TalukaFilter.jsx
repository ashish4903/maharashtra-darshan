import useLang from '../lib/useLang';
import { shortName } from '../lib/catalogue';

export default function TalukaFilter({ talukas, counts, active, onChange }) {
  const { t, name } = useLang();
  const withPlaces = talukas.filter((tk) => counts.get(tk.id));
  if (withPlaces.length === 0) return null;
  return (
    <div className="chips" role="group" aria-label={t('filter.taluka')}>
      <button type="button" className="chip" aria-pressed={!active} onClick={() => onChange(null)}>
        {t('filter.allTalukas')}
      </button>
      {withPlaces.map((tk) => (
        <button
          key={tk.id}
          type="button"
          className="chip"
          aria-pressed={active === tk.id}
          onClick={() => onChange(tk.id)}
        >
          {shortName(name(tk))} ({counts.get(tk.id)})
        </button>
      ))}
    </div>
  );
}

import useLang from '../lib/useLang';
import { shortName } from '../lib/catalogue';

/** All talukas of a district; those with places can be opened to show them. */
export default function TalukaList({ talukas, counts, onOpen }) {
  const { t, name, otherName, lang } = useLang();
  if (talukas.length === 0) {
    return <p className="empty">{t('taluka.none')}</p>;
  }
  const sorted = [...talukas].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
  return (
    <>
      <ul className="taluka-list">
        {sorted.map((tk) => {
          const count = counts.get(tk.id) ?? 0;
          const other = otherName(tk);
          const label = (
            <>
              <span className="taluka-name">{shortName(name(tk))}</span>
              {other && <span lang={lang === 'mr' ? 'en' : 'mr'}>{shortName(other)}</span>}
            </>
          );
          return (
            <li key={tk.id}>
              {count > 0 ? (
                <button type="button" className="taluka-item has-places" onClick={() => onOpen(tk.id)}>
                  {label}
                  <span className="taluka-count">{t('count.place', { n: count })} →</span>
                </button>
              ) : (
                <span className="taluka-item">{label}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="source-note">{t('taluka.source')}</p>
    </>
  );
}

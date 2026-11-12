import { KINDS } from '../lib/catalogue';

export default function KindFilter({ counts, active, onChange }) {
  const kinds = Object.keys(KINDS).filter((k) => counts[k]);
  if (kinds.length < 2) return null;
  return (
    <div className="chips" role="group" aria-label="Filter places by type">
      <button type="button" className="chip" aria-pressed={!active} onClick={() => onChange(null)}>
        All
      </button>
      {kinds.map((k) => (
        <button key={k} type="button" className="chip" aria-pressed={active === k} onClick={() => onChange(k)}>
          <span aria-hidden="true">{KINDS[k].icon}</span> {KINDS[k].label} ({counts[k]})
        </button>
      ))}
    </div>
  );
}

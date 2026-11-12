import { shortName } from '../lib/catalogue';

export default function TalukaFilter({ talukas, counts, active, onChange }) {
  const withPlaces = talukas.filter((t) => counts.get(t.id));
  if (withPlaces.length === 0) return null;
  return (
    <div className="chips" role="group" aria-label="Filter places by taluka">
      <button type="button" className="chip" aria-pressed={!active} onClick={() => onChange(null)}>
        All talukas
      </button>
      {withPlaces.map((t) => (
        <button
          key={t.id}
          type="button"
          className="chip"
          aria-pressed={active === t.id}
          onClick={() => onChange(t.id)}
        >
          {shortName(t.name)} ({counts.get(t.id)})
        </button>
      ))}
    </div>
  );
}

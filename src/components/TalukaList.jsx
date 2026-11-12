import { plural, shortName } from '../lib/catalogue';

/** All talukas of a district; those with places can be opened to show them. */
export default function TalukaList({ talukas, counts, onOpen }) {
  if (talukas.length === 0) {
    return <p className="empty">Wikidata lists no talukas for this district.</p>;
  }
  const sorted = [...talukas].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
  return (
    <>
      <ul className="taluka-list">
        {sorted.map((t) => {
          const count = counts.get(t.id) ?? 0;
          const name = (
            <>
              <span className="taluka-name">{shortName(t.name)}</span>
              {t.nameMr && <span lang="mr">{t.nameMr.replace(/\s*तालुका$/, '')}</span>}
            </>
          );
          return (
            <li key={t.id}>
              {count > 0 ? (
                <button type="button" className="taluka-item has-places" onClick={() => onOpen(t.id)}>
                  {name}
                  <span className="taluka-count">{plural(count, 'place')} →</span>
                </button>
              ) : (
                <span className="taluka-item">{name}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="source-note">Talukas from Wikidata. A place is linked to a taluka when Wikidata or its Wikipedia article says so.</p>
    </>
  );
}

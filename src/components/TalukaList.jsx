import { shortName } from '../lib/catalogue';

export default function TalukaList({ talukas }) {
  if (talukas.length === 0) {
    return <p className="empty">Wikidata lists no talukas for this district.</p>;
  }
  return (
    <>
      <ul className="taluka-list">
        {talukas.map((t) => (
          <li key={t.id}>
            <a href={`https://www.wikidata.org/wiki/${t.id}`} target="_blank" rel="noreferrer">
              {shortName(t.name)}
            </a>
            {t.nameMr && <span lang="mr"> · {t.nameMr.replace(/\s*तालुका$/, '')}</span>}
          </li>
        ))}
      </ul>
      <p className="source-note">Talukas from Wikidata.</p>
    </>
  );
}

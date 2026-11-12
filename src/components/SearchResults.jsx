import PlaceCard from './PlaceCard';
import FoodCard from './FoodCard';
import { getDistrict, search, shortName } from '../lib/catalogue';

export default function SearchResults({ query }) {
  const r = search(query);
  const areas = r.regions.length + r.districts.length + r.talukas.length;
  if (areas + r.places.length + r.foods.length === 0) {
    return <p className="empty">Nothing matches “{query.trim()}”.</p>;
  }

  return (
    <section aria-label="Search results" className="results">
      {areas > 0 && (
        <>
          <h2>Regions, districts and talukas</h2>
          <ul className="result-links">
            {r.regions.map((x) => (
              <li key={x.id}>
                <a href={`#/region/${x.id}`}>{x.name}</a> <span className="muted">region</span>
              </li>
            ))}
            {r.districts.map((x) => (
              <li key={x.id}>
                <a href={`#/district/${x.id}`}>{x.name}</a>
                {x.knownFor?.length > 0 && <span className="muted"> · known for {x.knownFor.map((k) => k.label).join(', ')}</span>}
              </li>
            ))}
            {r.talukas.map((x) => (
              <li key={x.id}>
                <a href={`#/district/${x.district}`}>{x.name}</a>{' '}
                <span className="muted">in {shortName(getDistrict(x.district).name)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {r.places.length > 0 && (
        <>
          <h2>Places</h2>
          <ul className="card-grid">
            {r.places.map((p) => (
              <li key={p.id}>
                <PlaceCard place={p} showDistrict />
              </li>
            ))}
          </ul>
        </>
      )}
      {r.foods.length > 0 && (
        <>
          <h2>Food</h2>
          <ul className="card-grid">
            {r.foods.map((f) => (
              <li key={f.id}>
                <FoodCard food={f} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

import PlaceCard from './PlaceCard';
import useTrip from '../lib/useTrip';
import { getPlace, regions } from '../lib/catalogue';

export default function TripView() {
  const { ids, clear } = useTrip();
  const saved = ids.map(getPlace).filter(Boolean);

  return (
    <article className="level trip-page">
      <header className="trip-head">
        <div>
          <h1>My trip</h1>
          <p className="muted">Places you saved. They stay in this browser only.</p>
        </div>
        {saved.length > 0 && (
          <button type="button" className="button button-ghost" onClick={clear}>
            Clear all
          </button>
        )}
      </header>

      {saved.length === 0 ? (
        <div className="empty">
          <p>Nothing saved yet. Tap ♡ on any place to add it here.</p>
          <a href="#/" className="button button-primary">
            Start exploring
          </a>
        </div>
      ) : (
        regions
          .map((r) => [r, saved.filter((p) => p.region === r.id)])
          .filter(([, list]) => list.length > 0)
          .map(([r, list]) => (
            <section key={r.id} className={`region-${r.id}`}>
              <h2 className="trip-region">{r.name}</h2>
              <ul className="card-grid">
                {list.map((p) => (
                  <li key={p.id}>
                    <PlaceCard place={p} showDistrict />
                  </li>
                ))}
              </ul>
            </section>
          ))
      )}
    </article>
  );
}

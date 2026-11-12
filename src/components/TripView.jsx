import TripPlan from './TripPlan';
import ShareButton from './ShareButton';
import useTrip from '../lib/useTrip';
import { getPlace } from '../lib/catalogue';
import { tripLink } from '../lib/route';

/** My saved places as a day-by-day plan, or a trip someone shared (`sharedIds`). */
export default function TripView({ sharedIds }) {
  const { ids, clear, addMany } = useTrip();
  const shared = Boolean(sharedIds);
  const list = (sharedIds ?? ids).map(getPlace).filter(Boolean);
  const allSaved = shared && sharedIds.every((id) => ids.includes(id));

  return (
    <article className="level trip-page">
      <header className="trip-head">
        <div>
          <h1>{shared ? 'A shared trip' : 'My trip'}</h1>
          <p className="muted">
            {shared
              ? 'Someone shared this plan with you. Save it to make it your own.'
              : 'Places you saved, planned into days. They stay in this browser only.'}
          </p>
        </div>
        {list.length > 0 && (
          <div className="trip-actions">
            {shared ? (
              <button type="button" className="button button-primary" onClick={() => addMany(sharedIds)} disabled={allSaved}>
                {allSaved ? '✓ Saved to my trip' : '♥ Save all to my trip'}
              </button>
            ) : (
              <ShareButton title="My Maharashtra trip" url={tripLink(ids)} label="↗ Share this trip" />
            )}
            {!shared && (
              <button type="button" className="button button-ghost" onClick={clear}>
                Clear all
              </button>
            )}
            {shared && (
              <a href="#/trip" className="button button-ghost">
                My trip
              </a>
            )}
          </div>
        )}
      </header>

      {list.length === 0 ? (
        <div className="empty">
          <p>Nothing saved yet. Tap ♡ on any place to add it here, and it will be planned into days.</p>
          <a href="#/" className="button button-primary">
            Start exploring
          </a>
        </div>
      ) : (
        <TripPlan places={list} removable={!shared} />
      )}
    </article>
  );
}

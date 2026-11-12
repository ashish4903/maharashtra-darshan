import { useState } from 'react';
import PlaceCard from './PlaceCard';
import { places } from '../lib/catalogue';
import { nearest } from '../lib/geo';

/**
 * Lists the places closest to the visitor. The browser asks for permission
 * first; the location is used on this page only and never stored or sent.
 */
export default function NearMe() {
  const [state, setState] = useState({ status: 'idle' });

  const locate = () => {
    if (!navigator.geolocation) {
      setState({ status: 'error', message: 'Your browser can’t share its location.' });
      return;
    }
    setState({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setState({ status: 'done', list: nearest([coords.latitude, coords.longitude], places, 6) }),
      () => setState({ status: 'error', message: 'Location wasn’t shared, so nearby places can’t be shown.' }),
      { maximumAge: 600000, timeout: 15000 },
    );
  };

  return (
    <section className="near-me" aria-labelledby="near-me-heading">
      <div className="near-me-head">
        <div>
          <h2 id="near-me-heading">Near me</h2>
          <p className="muted">Your location stays on your device.</p>
        </div>
        <button type="button" className="button button-primary" onClick={locate} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Finding you…' : '📍 Show places near me'}
        </button>
      </div>
      {state.status === 'error' && <p className="empty">{state.message}</p>}
      {state.status === 'done' && (
        <ul className="card-grid">
          {state.list.map(({ place, km }) => (
            <li key={place.id}>
              <PlaceCard place={place} km={km} showDistrict />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

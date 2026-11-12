import { useState } from 'react';
import PlaceCard from './PlaceCard';
import useLang from '../lib/useLang';
import { places } from '../lib/catalogue';
import { nearest } from '../lib/geo';

/**
 * Lists the places closest to the visitor. The browser asks for permission
 * first; the location is used on this page only and never stored or sent.
 */
export default function NearMe() {
  const { t } = useLang();
  const [state, setState] = useState({ status: 'idle' });

  const locate = () => {
    if (!navigator.geolocation) {
      setState({ status: 'error', message: 'near.unsupported' });
      return;
    }
    setState({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setState({ status: 'done', list: nearest([coords.latitude, coords.longitude], places, 6) }),
      () => setState({ status: 'error', message: 'near.denied' }),
      { maximumAge: 600000, timeout: 15000 },
    );
  };

  return (
    <section className="near-me" aria-labelledby="near-me-heading">
      <div className="near-me-head">
        <div>
          <h2 id="near-me-heading">{t('near.title')}</h2>
          <p className="muted">{t('near.note')}</p>
        </div>
        <button type="button" className="button button-primary" onClick={locate} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? t('near.finding') : t('near.button')}
        </button>
      </div>
      {state.status === 'error' && <p className="empty">{t(state.message)}</p>}
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

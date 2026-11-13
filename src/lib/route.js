// The current view lives in the URL hash so every page can be shared:
//   #/                       home
//   #/region/vidarbha        one region
//   #/district/Q1797367      one district (Wikidata id)
//   #/place/Q4386            one place (Wikidata id)
//   #/circuit/ashtavinayak   a themed circuit
//   #/trail/shivaji/4        a history trail, at its 4th stop (optional)
//   #/festivals              festivals and fairs, month by month
//   #/seasons                what's at its best in each month
//   #/plan                   plan a getaway from a starting point
//   #/trip                   my saved places
//   #/trip/Q1,Q2,Q3          a trip someone shared
import { getCircuit, getDistrict, getPlace, getRegion, getTrail } from './catalogue';

const HOME = { view: 'home' };
const exists = { region: getRegion, district: getDistrict, place: getPlace, circuit: getCircuit, trail: getTrail };

export function parseHash(hash) {
  const [, view, id, extra] = hash.replace(/^#/, '').split('/');
  if (view === 'trail' && getTrail(id)) {
    const stop = Number(extra);
    return Number.isInteger(stop) && stop > 0 ? { view, id, stop } : { view, id };
  }
  if (['festivals', 'seasons', 'plan'].includes(view)) return { view };
  if (view === 'trip') {
    const ids = (id ?? '').split(',').filter((x) => getPlace(x));
    return ids.length ? { view, ids } : { view };
  }
  if (exists[view]?.(id)) return { view, id };
  return HOME;
}

export function toHash({ view, id, ids, stop }) {
  if (view === 'trail' && stop) return `#/trail/${id}/${stop}`;
  if (view === 'home') return '#/';
  if (['festivals', 'seasons', 'plan'].includes(view)) return `#/${view}`;
  if (view === 'trip') return ids?.length ? `#/trip/${ids.join(',')}` : '#/trip';
  return `#/${view}/${id}`;
}

/** A full link to a shared trip, for copying or the share sheet. */
export const tripLink = (ids) =>
  `${window.location.origin}${window.location.pathname}${toHash({ view: 'trip', ids })}`;

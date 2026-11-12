// The current view lives in the URL hash so every page can be shared:
//   #/                       home
//   #/region/vidarbha        one region
//   #/district/Q1797367      one district (Wikidata id)
//   #/place/Q4386            one place (Wikidata id)
//   #/trip                   saved places
import { getDistrict, getPlace, getRegion } from './catalogue';

const HOME = { view: 'home' };
const exists = { region: getRegion, district: getDistrict, place: getPlace };

export function parseHash(hash) {
  const [, view, id] = hash.replace(/^#/, '').split('/');
  if (view === 'trip') return { view };
  if (exists[view]?.(id)) return { view, id };
  return HOME;
}

export function toHash({ view, id }) {
  if (view === 'home') return '#/';
  if (view === 'trip') return '#/trip';
  return `#/${view}/${id}`;
}

// The current view lives in the URL hash so every page can be shared:
//   #/                       all regions
//   #/region/vidarbha        one region
//   #/district/Q1797367      one district (Wikidata id)
import { getDistrict, getRegion } from './catalogue';

const HOME = { view: 'home' };

export function parseHash(hash) {
  const [, view, id] = hash.replace(/^#/, '').split('/');
  if (view === 'region' && getRegion(id)) return { view, id };
  if (view === 'district' && getDistrict(id)) return { view, id };
  return HOME;
}

export const toHash = ({ view, id }) => (view === 'home' ? '#/' : `#/${view}/${id}`);

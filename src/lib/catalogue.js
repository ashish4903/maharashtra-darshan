// Read-only helpers over the generated data. Components use these instead of
// reading src/data/maharashtra.json directly.
import data from '../data/maharashtra.json';

// `one` labels a single card, `label` a filter button
export const KINDS = {
  fort: { one: 'Fort', label: 'Forts', icon: '🏰' },
  temple: { one: 'Place of worship', label: 'Places of worship', icon: '🛕' },
  pilgrimage: { one: 'Pilgrim town', label: 'Pilgrim towns', icon: '🙏' },
  heritage: { one: 'Heritage', label: 'Heritage', icon: '🏛️' },
  nature: { one: 'Nature & wildlife', label: 'Nature & wildlife', icon: '🌿' },
  'hill-station': { one: 'Hill station', label: 'Hill stations', icon: '⛰️' },
  beach: { one: 'Beach', label: 'Beaches', icon: '🏖️' },
  village: { one: 'Village', label: 'Villages', icon: '🏡' },
};

/** plural(1, 'place') -> "1 place", plural(3, 'dish', 'dishes') -> "3 dishes" */
export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

export const STATEWIDE = 'statewide';

export const regions = data.regions;
export const districts = data.districts;
export const places = data.places;
export const foods = data.foods;
export const generated = data.generated;

const regionIndex = new Map(regions.map((r) => [r.id, r]));
const districtIndex = new Map(districts.map((d) => [d.id, d]));

export const getRegion = (id) => regionIndex.get(id);
export const getDistrict = (id) => districtIndex.get(id);

export const districtsOf = (regionId) =>
  getRegion(regionId)?.districts.map(getDistrict).sort((a, b) => a.name.localeCompare(b.name)) ?? [];

/** "Nagpur district" -> "Nagpur", "Haveli taluka" -> "Haveli" */
export const shortName = (name) => name.replace(/\s+(district|taluka)$/i, '');

export function placesIn({ region, district } = {}) {
  if (district) return places.filter((p) => p.district === district);
  if (region) return places.filter((p) => p.region === region);
  return places;
}

/** Dishes for a district come first, then the rest of its region's dishes. */
export function foodsIn({ region, district } = {}) {
  if (district) {
    const d = getDistrict(district);
    return [
      ...foods.filter((f) => f.district === district),
      ...foods.filter((f) => f.region === d?.region && f.district !== district),
    ];
  }
  if (region) return foods.filter((f) => f.region === region);
  return foods;
}

export const countKinds = (list) =>
  list.reduce((counts, p) => ({ ...counts, [p.kind]: (counts[p.kind] ?? 0) + 1 }), {});

const matches = (item, q) => item.name.toLowerCase().includes(q) || (item.nameMr ?? '').includes(q);

/** Searches regions, districts, talukas, places and dishes in English or Marathi. */
export function search(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { regions: [], districts: [], talukas: [], places: [], foods: [] };
  return {
    regions: regions.filter((r) => matches(r, q)),
    districts: districts.filter((d) => matches(d, q)),
    talukas: districts.flatMap((d) =>
      d.talukas.filter((t) => matches(t, q)).map((t) => ({ ...t, district: d.id })),
    ),
    places: places.filter((p) => matches(p, q)),
    foods: foods.filter((f) => matches(f, q)),
  };
}

export const mapUrl = ([lat, lon]) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;

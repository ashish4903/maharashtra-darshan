// Read-only helpers over the generated data. Components use these instead of
// reading src/data/maharashtra.json directly.
import data from '../data/maharashtra.json';
import { score } from './fuzzy';

// `one` labels a single card, `label` a filter button
export const KINDS = {
  fort: { one: 'Fort', label: 'Forts', icon: '🏰' },
  temple: { one: 'Place of worship', label: 'Places of worship', icon: '🛕' },
  pilgrimage: { one: 'Pilgrim town', label: 'Pilgrim towns', icon: '🙏' },
  heritage: { one: 'Heritage', label: 'Heritage', icon: '🏛️' },
  nature: { one: 'Nature & wildlife', label: 'Nature & wildlife', icon: '🌿' },
  'hill-station': { one: 'Hill station', label: 'Hill stations', icon: '⛰️' },
  beach: { one: 'Beach', label: 'Beaches', icon: '🏖️' },
  town: { one: 'Town', label: 'Towns', icon: '🏘️' },
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
const placeIndex = new Map(places.map((p) => [p.id, p]));

export const getRegion = (id) => regionIndex.get(id);
export const getDistrict = (id) => districtIndex.get(id);
export const getPlace = (id) => placeIndex.get(id);

/** Themed routes such as Ashtavinayak; each lists place ids, in order when `ordered`. */
export const circuits = data.circuits ?? [];
export const getCircuit = (id) => circuits.find((c) => c.id === id);
export const circuitPlaces = (circuit) => circuit.places.map(getPlace).filter(Boolean);
export const circuitsWith = (placeId) => circuits.filter((c) => c.places.includes(placeId));

/** Why a place or dish is best in some months (see data/curated.json "seasons"). */
export const SEASON_ICONS = { waterfall: '🌧️', flowers: '🌸', birds: '🦩', monsoon: '🌿', summer: '🏔️', fruit: '🍊' };

export const inSeason = (item, month) => Boolean(item.best?.months.includes(month));

/** Places at their best, food in season and festivals in a month (1–12). */
export const bestIn = (month) => ({
  places: places.filter((p) => inSeason(p, month)),
  foods: foods.filter((f) => inSeason(f, month)),
  festivals: (data.festivals ?? []).filter((f) => f.months.includes(month)),
});

/** "Jul–Nov", "Dec–Mar" or "Sep": a run of months, wrapping round the year. */
export function monthRange(months, monthName) {
  if (!months?.length) return '';
  const set = new Set(months);
  const start = months.find((m) => !set.has(m === 1 ? 12 : m - 1)) ?? months[0];
  let end = start;
  while (set.has(end === 12 ? 1 : end + 1) && (end === 12 ? 1 : end + 1) !== start) end = end === 12 ? 1 : end + 1;
  return start === end ? monthName(start) : `${monthName(start)}–${monthName(end)}`;
}

/** Festivals and fairs; `months` are 1–12 (empty for ones held every few years). */
export const festivals = data.festivals ?? [];
export const festivalsAt = (placeId) => festivals.filter((f) => f.places.includes(placeId));

/** How many months until a festival next comes round (0 = this month). */
export const monthsUntil = (festival, month) =>
  festival.months.length ? Math.min(...festival.months.map((m) => (m - month + 12) % 12)) : Infinity;

/** Festivals in order of when they next come round, from `month` (1–12). */
export const upcomingFestivals = (month = new Date().getMonth() + 1) =>
  [...festivals].sort((a, b) => monthsUntil(a, month) - monthsUntil(b, month));

/**
 * Places with photos, a few from each region. data/curated.json lists the
 * best-known places of each district first, so the first ones are used.
 */
export function featuredPlaces(perRegion = 3) {
  return regions.flatMap((r) => places.filter((p) => p.region === r.id && p.image).slice(0, perRegion));
}

/** A photo to represent a region or district. */
export const coverImage = ({ region, district }) =>
  places.find((p) => p.image && (district ? p.district === district : p.region === region))?.image;

export const randomPlace = (random = Math.random) => places[Math.floor(random() * places.length)];

/**
 * The same Wikimedia thumbnail at another standard width (250, 330, 500, 960…):
 * ".../960px-Ajanta.jpg" -> ".../500px-Ajanta.jpg". Other URLs are left alone.
 */
export const thumbAt = (src, width) => src.replace(/\/\d+px-([^/]+)$/, `/${width}px-$1`);

export const commonsUrl = (file) => 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file);

export const districtsOf = (regionId) =>
  getRegion(regionId)?.districts.map(getDistrict).sort((a, b) => a.name.localeCompare(b.name)) ?? [];

/** "Nagpur district" -> "Nagpur", "Haveli taluka" -> "Haveli" */
export const shortName = (name) =>
  name
    .replace(/\s*\([^)]*\)/g, '') // "कळंब (यवतमाळ)" -> "कळंब"
    .replace(/\s+(district|taluka|जिल्हा|तालुका)$/i, '');

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

const namesOf = (item) =>
  [item.name, item.nameMr, item.highlight, ...(item.knownFor ?? []).map((k) => k.label)].filter(Boolean).join(' · ');

/** Items matching the query, best first (see lib/fuzzy.js). */
function ranked(list, query, extra = () => '', limit = 40) {
  return list
    .map((item) => ({ item, s: score(query, namesOf(item), extra(item)) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.item);
}

/** Places in each taluka of a district: Map(talukaId -> count) */
export const talukaCounts = (districtId) =>
  placesIn({ district: districtId }).reduce((m, p) => (p.taluka ? m.set(p.taluka, (m.get(p.taluka) ?? 0) + 1) : m), new Map());

/**
 * Searches regions, districts, talukas, places and dishes in English or
 * Marathi, forgiving spelling variants and small typos. Places also match on
 * their district, region and type, so "fort pune" lists Pune's forts.
 */
export function search(query) {
  if (query.trim().length < 2) return { regions: [], districts: [], talukas: [], places: [], foods: [] };
  const placeContext = (p) =>
    [getDistrict(p.district)?.name, getRegion(p.region)?.name, KINDS[p.kind]?.one, KINDS[p.kind]?.label, p.kind].join(' ');
  return {
    regions: ranked(regions, query),
    districts: ranked(districts, query),
    talukas: ranked(
      districts.flatMap((d) => d.talukas.map((t) => ({ ...t, district: d.id }))),
      query,
      (t) => getDistrict(t.district)?.name ?? '',
      15,
    ),
    places: ranked(places, query, placeContext),
    foods: ranked(foods, query, (f) => [getDistrict(f.district)?.name, getRegion(f.region)?.name].join(' ')),
  };
}

/** The GitHub issue form for suggestions (.github/ISSUE_TEMPLATE/suggest-a-place.yml), pre-filled with a district. */
export const SUGGEST_URL = 'https://github.com/ashish4903/maharashtra-darshan/issues/new?template=suggest-a-place.yml';
export const suggestUrl = (districtId) => {
  const district = districtId && getDistrict(districtId);
  return district ? `${SUGGEST_URL}&district=${encodeURIComponent(shortName(district.name))}` : SUGGEST_URL;
};

export const mapUrl = ([lat, lon]) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;

/**
 * A Google Maps search (official "Maps URLs": no API key, nothing stored).
 * Google shows its own, current ratings there; we never copy them.
 */
export const mapsSearchUrl = (query) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);

/** The name people search Maps with: "Nagpur district" -> "Nagpur", both Mumbai districts -> "Mumbai". */
export const areaName = (districtId) => {
  const name = shortName(getDistrict(districtId)?.name ?? '');
  return name.startsWith('Mumbai') ? 'Mumbai' : name;
};

/** Where to look for a dish: near a place, in a district, or near the visitor. */
export function foodSpotQuery(food, { districtId, near } = {}) {
  if (near) return `${food.name} near ${near}`;
  const district = districtId ?? food.district;
  return district ? `${food.name} in ${areaName(district)}` : `${food.name} near me`;
}

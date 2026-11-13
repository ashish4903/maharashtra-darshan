// "I'm in Pune, I have 2 days, I like forts": picks places within reach that
// match, favours ones at their best that month, keeps the trip compact, and
// orders it from the starting point.
import { circuits, foods, festivals, inSeason, places } from './catalogue';
import { distanceKm } from './geo';

export const INTERESTS = {
  forts: ['fort'],
  temples: ['temple', 'pilgrimage'],
  nature: ['nature', 'beach', 'hill-station'],
  heritage: ['heritage', 'village', 'town'],
};

// How far (straight line) a trip of n days reaches from the start
const RADIUS_KM = { 1: 80, 2: 150, 3: 200, 4: 250 };
// Each new stop must be this close to a stop already picked, so the trip
// stays in one area instead of zig-zagging across the state
const CLUSTER_KM = 90;

const circuitStops = new Set(circuits.flatMap((c) => c.places));

/** Higher is better: matches the interests, in season, photographed, well known, close. */
export function scorePlace(place, { kinds, month, km, radius }) {
  const match = kinds.size === 0 || kinds.has(place.kind);
  const season = Boolean(month) && inSeason(place, month);
  if (!match && !season) return null;
  return (
    (kinds.size && match ? 3 : 1) +
    (season ? 3 : 0) +
    (place.image ? 1 : 0) +
    (place.highlight ? 0.5 : 0) +
    (circuitStops.has(place.id) ? 1 : 0) +
    (place.wikipedia ? 0.5 : 0) -
    km / radius
  );
}

/**
 * Orders places starting from `start` ([lat, lon], not itself a stop):
 * nearest-neighbour, then 2-opt with the start fixed.
 */
export function routeFrom(start, list) {
  const route = [];
  const left = [...list];
  let here = start;
  while (left.length) {
    let next = 0;
    for (let i = 1; i < left.length; i++) {
      if (distanceKm(here, left[i].coords) < distanceKm(here, left[next].coords)) next = i;
    }
    const [p] = left.splice(next, 1);
    route.push(p);
    here = p.coords;
  }
  const point = (i) => (i < 0 ? start : route[i].coords);
  for (let improved = true; improved; ) {
    improved = false;
    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const before =
          distanceKm(point(i - 1), route[i].coords) + (j + 1 < route.length ? distanceKm(route[j].coords, route[j + 1].coords) : 0);
        const after =
          distanceKm(point(i - 1), route[j].coords) + (j + 1 < route.length ? distanceKm(route[i].coords, route[j + 1].coords) : 0);
        if (after < before - 0.01) {
          route.splice(i, j - i + 1, ...route.slice(i, j + 1).reverse());
          improved = true;
        }
      }
    }
  }
  return route;
}

/**
 * A getaway: { places (in order from the start), foods, festivals }.
 * `interests` are keys of INTERESTS; `month` is 1–12.
 */
export function planGetaway({ start, days = 2, interests = [], month, perDay = 3 }) {
  const radius = RADIUS_KM[days] ?? 250;
  const kinds = new Set(interests.flatMap((i) => INTERESTS[i] ?? []));
  const scored = places
    .filter((p) => p.coords)
    .map((p) => {
      const km = distanceKm(start, p.coords);
      if (km > radius) return null;
      const score = scorePlace(p, { kinds, month, km, radius });
      return score == null ? null : { place: p, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const picked = [];
  for (const { place } of scored) {
    if (picked.length >= days * perDay) break;
    if (picked.length === 0 || picked.some((p) => distanceKm(p.coords, place.coords) <= CLUSTER_KM)) picked.push(place);
  }
  const route = routeFrom(start, picked);

  const districts = new Set(route.map((p) => p.district));
  const regionIds = new Set(route.map((p) => p.region));
  const ids = new Set(route.map((p) => p.id));
  return {
    places: route,
    foods: foods
      .filter((f) => districts.has(f.district) || (!f.district && regionIds.has(f.region)))
      .sort((a, b) => Number(inSeason(b, month)) - Number(inSeason(a, month))),
    festivals: month
      ? festivals.filter(
          (f) => f.months.includes(month) && (f.places.some((id) => ids.has(id)) || regionIds.has(f.region) || f.region === 'statewide'),
        )
      : [],
  };
}

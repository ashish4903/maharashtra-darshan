// Trip planning: order places into a short route, split it into days, and
// build free Google Maps directions links. Distances are straight-line
// ("as the crow flies"); road distances are longer.
import { distanceKm } from './geo';

const legKm = (a, b) => distanceKm(a.coords, b.coords);

export const routeKm = (route) => route.slice(1).reduce((km, p, i) => km + legKm(route[i], p), 0);

/**
 * A short route through the places that have coordinates: nearest-neighbour
 * from every possible start, then 2-opt clean-up. Good enough for the few
 * dozen stops a trip has.
 */
export function shortestRoute(places) {
  const stops = places.filter((p) => p.coords);
  if (stops.length < 3) return stops;

  let best = null;
  for (const start of stops) {
    const left = stops.filter((p) => p !== start);
    const route = [start];
    while (left.length) {
      const last = route[route.length - 1];
      let next = 0;
      for (let i = 1; i < left.length; i++) if (legKm(last, left[i]) < legKm(last, left[next])) next = i;
      route.push(left.splice(next, 1)[0]);
    }
    if (!best || routeKm(route) < routeKm(best)) best = route;
  }

  // 2-opt: reverse any stretch that makes the route shorter
  for (let improved = true; improved; ) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const before = legKm(best[i - 1], best[i]) + (j + 1 < best.length ? legKm(best[j], best[j + 1]) : 0);
        const after = legKm(best[i - 1], best[j]) + (j + 1 < best.length ? legKm(best[i], best[j + 1]) : 0);
        if (after < before - 0.01) {
          best = [...best.slice(0, i), ...best.slice(i, j + 1).reverse(), ...best.slice(j + 1)];
          improved = true;
        }
      }
    }
  }
  return best;
}

/**
 * Splits a route into days: at most `perDay` stops a day, and a new day
 * starts before any single hop longer than `maxHopKm`.
 */
export function splitDays(route, { perDay = 3, maxHopKm = 150 } = {}) {
  const days = [];
  for (const [i, place] of route.entries()) {
    const day = days[days.length - 1];
    const hop = i > 0 && place.coords && route[i - 1].coords ? legKm(route[i - 1], place) : 0;
    if (!day || day.stops.length >= perDay || hop > maxHopKm) days.push({ stops: [{ place, hopKm: hop }] });
    else day.stops.push({ place, hopKm: hop });
  }
  return days.map((d) => ({ ...d, km: d.stops.slice(1).reduce((km, s) => km + s.hopKm, 0) }));
}

const point = (p) => p.coords.join(',');

/**
 * Google Maps directions through the places, in order (official Maps URLs:
 * no API key). Maps accepts up to 9 stops between start and end.
 */
export function directionsUrl(places) {
  const stops = places.filter((p) => p.coords).slice(0, 11);
  if (stops.length === 0) return null;
  if (stops.length === 1) return 'https://www.google.com/maps/search/?api=1&query=' + point(stops[0]);
  const params = new URLSearchParams({
    api: '1',
    origin: point(stops[0]),
    destination: point(stops[stops.length - 1]),
    travelmode: 'driving',
  });
  if (stops.length > 2) params.set('waypoints', stops.slice(1, -1).map(point).join('|'));
  return 'https://www.google.com/maps/dir/?' + params.toString();
}

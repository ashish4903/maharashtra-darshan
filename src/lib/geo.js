// Map projection and distances. The map is a simple equirectangular
// projection, scaled by cos(latitude) so Maharashtra keeps its real shape.
import outline from '../data/outline.json';

const [minLon, minLat, maxLon, maxLat] = outline.bbox;
const K = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const SCALE = 100; // SVG units per degree of latitude
const PAD = 14;

export const MAP_WIDTH = Math.round((maxLon - minLon) * K * SCALE + PAD * 2);
export const MAP_HEIGHT = Math.round((maxLat - minLat) * SCALE + PAD * 2);

/** [lat, lon] -> [x, y] in the map's SVG coordinates */
export const project = ([lat, lon]) => [
  Math.round(((lon - minLon) * K * SCALE + PAD) * 10) / 10,
  Math.round(((maxLat - lat) * SCALE + PAD) * 10) / 10,
];

export const outlinePath = outline.rings
  .map((ring) => 'M' + ring.map(([lon, lat]) => project([lat, lon]).join(',')).join('L') + 'Z')
  .join('');

/** Great-circle distance in kilometres. */
export function distanceKm([lat1, lon1], [lat2, lon2]) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

/** The `count` places closest to `from`, as [{ place, km }]. */
export function nearest(from, places, count, excludeId) {
  return places
    .filter((p) => p.coords && p.id !== excludeId)
    .map((place) => ({ place, km: distanceKm(from, place.coords) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}

export const formatKm = (km) => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`);

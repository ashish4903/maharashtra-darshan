// Builds src/data/outline.json: Maharashtra's border as a small SVG path.
//
// Source: Natural Earth 1:10m admin-1 boundaries (public domain),
// https://www.naturalearthdata.com/. The file (~40 MB) is read in memory and
// never saved. Usage: npm run outline

import { writeFile } from 'node:fs/promises';

const SOURCE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson';
const OUT = new URL('../src/data/outline.json', import.meta.url);
const TOLERANCE = 0.012; // degrees; ~1.3 km, invisible at the sizes the map is drawn

/** Ramer–Douglas–Peucker simplification of a list of [lon, lat] points. */
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const len = Math.hypot(bx - ax, by - ay) || 1;
  let worst = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const d = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / len;
    if (d > worst) [worst, index] = [d, i];
  }
  if (worst <= tolerance) return [points[0], points[points.length - 1]];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

const res = await fetch(SOURCE, { headers: { 'User-Agent': 'maharashtra-darshan-data-script/1.0' } });
if (!res.ok) throw new Error(`${res.status} for ${SOURCE}`);
const geo = await res.json();
const feature = geo.features.find((f) => f.properties.iso_3166_2 === 'IN-MH');
if (!feature) throw new Error('Maharashtra (IN-MH) not found');

const rings = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
// A closed ring starts and ends on the same point, so simplify each half.
const simplifyRing = (ring) => {
  const mid = Math.floor(ring.length / 2);
  return [...simplify(ring.slice(0, mid + 1), TOLERANCE).slice(0, -1), ...simplify(ring.slice(mid), TOLERANCE)];
};
const outer = rings.map((poly) => simplifyRing(poly[0])).filter((ring) => ring.length > 3);
const all = outer.flat();
const bbox = [
  Math.min(...all.map((p) => p[0])),
  Math.min(...all.map((p) => p[1])),
  Math.max(...all.map((p) => p[0])),
  Math.max(...all.map((p) => p[1])),
].map((n) => +n.toFixed(3));

await writeFile(
  OUT,
  JSON.stringify({
    source: 'Natural Earth 1:10m admin-1 states and provinces, v5.1.2 (public domain)',
    bbox,
    rings: outer.map((ring) => ring.map(([lon, lat]) => [+lon.toFixed(3), +lat.toFixed(3)])),
  }) + '\n',
);
console.log(`Wrote ${outer.length} ring(s), ${all.length} points, bbox ${bbox.join(', ')}`);

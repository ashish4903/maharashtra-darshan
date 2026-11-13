// Draws the link-preview image (1200×630) as public/og-image.svg, from our
// own data: the Natural Earth outline (public domain) and a dot per district
// in its region's colour. No photos, so no licence questions.
//
// Usage: npm run og-image
// Then convert it to PNG (WhatsApp, X and LinkedIn need PNG), e.g. with Chrome:
//   chrome --headless=new --window-size=1200,630 --screenshot=public/og-image.png public/og-image.svg

import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const outline = JSON.parse(await readFile(new URL('src/data/outline.json', ROOT), 'utf8'));
const data = JSON.parse(await readFile(new URL('src/data/maharashtra.json', ROOT), 'utf8'));

const COLORS = {
  konkan: '#22d3ee',
  'western-maharashtra': '#fbbf24',
  'north-maharashtra': '#a3e635',
  marathwada: '#c4b5fd',
  vidarbha: '#fb7185',
};

// Fit the state into a box on the right of the image
const [minLon, minLat, maxLon, maxLat] = outline.bbox;
const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const box = { x: 640, y: 70, w: 520, h: 490 };
const scale = Math.min(box.w / ((maxLon - minLon) * k), box.h / (maxLat - minLat));
const project = (lat, lon) => [
  (box.x + (lon - minLon) * k * scale).toFixed(1),
  (box.y + (maxLat - lat) * scale).toFixed(1),
];
const path = outline.rings
  .map((ring) => 'M' + ring.map(([lon, lat]) => project(lat, lon).join(',')).join('L') + 'Z')
  .join('');
const dots = data.districts
  .filter((d) => d.coords)
  .map((d) => {
    const [x, y] = project(...d.coords);
    return `<circle cx="${x}" cy="${y}" r="11" fill="${COLORS[d.region]}" fill-opacity="0.9" stroke="#431407" stroke-width="2"/>`;
  })
  .join('');

const talukas = data.districts.reduce((n, d) => n + d.talukas.length, 0);
const stats = `${data.districts.length} districts · ${talukas} talukas · ${data.places.length} places · ${data.foods.length} dishes`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c2d12"/>
      <stop offset="1" stop-color="#c2410c"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <path d="M0 630 L0 560 L150 500 L260 545 L400 470 L540 540 L640 505 L760 560 L900 490 L1050 550 L1200 500 L1200 630 Z" fill="#ffffff" fill-opacity="0.07"/>
  <path d="${path}" fill="#fff7ed" fill-opacity="0.16" stroke="#fff7ed" stroke-width="3" stroke-linejoin="round"/>
  ${dots}
  <g font-family="'Segoe UI', 'Noto Sans', 'Nirmala UI', 'Noto Sans Devanagari', sans-serif" fill="#fff7ed">
    <text x="64" y="150" font-size="34" font-weight="600" opacity="0.9">चला, महाराष्ट्र पाहूया</text>
    <text x="64" y="245" font-size="76" font-weight="800">Maharashtra</text>
    <text x="64" y="330" font-size="76" font-weight="800">Darshan</text>
    <text x="64" y="405" font-size="46" font-weight="700">महाराष्ट्र दर्शन</text>
    <text x="64" y="470" font-size="27" opacity="0.92">Places, food, festivals and trips, region by region</text>
    <text x="64" y="520" font-size="23" opacity="0.8">${stats}</text>
  </g>
</svg>
`;

await writeFile(new URL('public/og-image.svg', ROOT), svg);
console.log('Wrote public/og-image.svg —', stats);

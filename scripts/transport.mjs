// "Getting there": each place's nearest railway station and nearest airport
// with scheduled flights, by straight-line distance.
//
//  - Stations: Wikidata items that are railway stations (or a kind of one) in
//    a box around Maharashtra, with an English Wikipedia article and not
//    closed (no Wikidata end date, and the article's short description or
//    first sentence doesn't call it defunct, former, proposed or "was a
//    station"). Metro, monorail, high-speed and goods stations are left out.
//  - Airports: Wikidata items with an IATA code in the same box, kept only
//    when their Wikipedia article's "Airlines and destinations" section has an
//    airline/destination list (so airports without scheduled flights, closed
//    ones and air bases are left out).
//  - The box reaches past the state border, so a place near Goa can get
//    Goa's airport.
//
// `npm run data` runs this too; `npm run transport` updates only these fields.
// Needs network access (Wikidata, Wikipedia). No keys or accounts are used.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const USER_AGENT = 'maharashtra-darshan-data-script/1.0 (https://github.com/ashish4903/maharashtra-darshan)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BOX = `bd:serviceParam wikibase:cornerSouthWest "Point(72.0 15.0)"^^geo:wktLiteral .
      bd:serviceParam wikibase:cornerNorthEast "Point(81.5 22.8)"^^geo:wktLiteral .`;
const NOT_RAIL = /metro|monorail|high-speed|goods|airport railway/i;
const NOT_OPEN = /\b(defunct|former|closed|abandoned|disused|demolished|proposed|planned|under construction)\b/i;
const WAS_STATION = /\b(was|were) an? [\w\s-]{0,30}\b(station|halt|terminus)\b/i;
const DEST_LIST = /\{\{\s*Airport[- ]dest(ination)?[- ]list/i;

async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(90000),
      });
      if (res.ok) return await res.json();
      if (attempt >= 4) throw new Error(`${res.status} for ${url.slice(0, 120)}`);
    } catch (err) {
      if (attempt >= 4) throw err;
    }
    await sleep(5000 * attempt);
  }
}

const sparql = async (query) =>
  (await getJson('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query))).results.bindings;

const qid = (uri) => uri.replace('http://www.wikidata.org/entity/', '');
/** "Point(73.85 18.52)" -> [18.52, 73.85], rounded to ~100 m */
const point = (wkt) => {
  const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(wkt);
  return [+(+m[2]).toFixed(3), +(+m[1]).toFixed(3)];
};

/** Great-circle distance in km (same as src/lib/geo.js). */
export function distanceKm([lat1, lon1], [lat2, lon2]) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

/** Titles whose Wikipedia short description or first sentence says the station is not open. */
async function notOpen(titles) {
  const out = new Set();
  for (let i = 0; i < titles.length; i += 20) {
    const url =
      'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1' +
      '&prop=description|extracts&exintro=1&explaintext=1&exsentences=1&exlimit=20&titles=' +
      encodeURIComponent(titles.slice(i, i + 20).join('|'));
    const json = await getJson(url);
    await sleep(300);
    const asked = new Map((json.query.redirects ?? []).map((r) => [r.to, r.from]));
    for (const page of json.query.pages ?? []) {
      if (page.missing || NOT_OPEN.test(page.description ?? '') || WAS_STATION.test(page.extract ?? '')) {
        out.add(asked.get(page.title) ?? page.title);
      }
    }
  }
  return out;
}

async function stations() {
  const rows = await sparql(`SELECT ?s ?title ?mr ?c (GROUP_CONCAT(DISTINCT ?typeLabel; separator=",") AS ?types) WHERE {
    SERVICE wikibase:box { ?s wdt:P625 ?c . ${BOX} }
    ?s wdt:P31 ?type . ?type wdt:P279* wd:Q55488 .
    ?type rdfs:label ?typeLabel FILTER(lang(?typeLabel) = "en")
    ?article schema:about ?s ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title .
    FILTER NOT EXISTS { ?s wdt:P576 ?closed }
    OPTIONAL { ?s rdfs:label ?mr FILTER(lang(?mr) = "mr") }
  } GROUP BY ?s ?title ?mr ?c`);
  const rail = rows.filter((r) => !NOT_RAIL.test(r.types.value) && !NOT_RAIL.test(r.title.value));
  const closed = await notOpen(rail.map((r) => r.title.value));
  return rail
    .filter((r) => !closed.has(r.title.value))
    .map((r) => ({
      id: qid(r.s.value),
      kind: 'station',
      name: r.title.value,
      nameMr: r.mr?.value,
      coords: point(r.c.value),
    }));
}

/** True when the article's "Airlines and destinations" section lists airlines. */
async function hasScheduledFlights(title) {
  const base = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&redirects=1&page=' + encodeURIComponent(title);
  const sections = (await getJson(base + '&prop=sections')).parse?.sections ?? [];
  await sleep(300);
  const section = sections.find((s) => /^airlines and destinations$/i.test(s.line));
  if (!section) return false;
  const text = (await getJson(base + '&prop=wikitext&section=' + section.index)).parse?.wikitext ?? '';
  await sleep(300);
  return DEST_LIST.test(text);
}

async function airports() {
  const rows = await sparql(`SELECT ?a ?title ?mr ?c (SAMPLE(?code) AS ?iata) WHERE {
    SERVICE wikibase:box { ?a wdt:P625 ?c . ${BOX} }
    ?a wdt:P238 ?code .
    ?article schema:about ?a ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title .
    OPTIONAL { ?a rdfs:label ?mr FILTER(lang(?mr) = "mr") }
  } GROUP BY ?a ?title ?mr ?c`);
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const id = qid(r.a.value);
    if (seen.has(id) || !(await hasScheduledFlights(r.title.value))) continue;
    seen.add(id);
    out.push({
      id,
      kind: 'airport',
      name: r.title.value,
      nameMr: r.mr?.value,
      code: r.iata.value,
      coords: point(r.c.value),
    });
  }
  return out;
}

const nearestOf = (coords, list) =>
  list.reduce(
    (best, hub) => {
      const km = distanceKm(coords, hub.coords);
      return km < best.km ? { hub, km } : best;
    },
    { hub: null, km: Infinity },
  );

/**
 * Adds `station` and `airport` ({ id, km }) to every place with coordinates,
 * and `hubs` (only the stations and airports used) to the data. Returns notes.
 */
export async function addTransport(data) {
  const [rail, air] = [await stations(), await airports()];
  if (rail.length < 200 || air.length < 10) {
    throw new Error(`Only ${rail.length} stations and ${air.length} airports found; Wikidata may be incomplete right now.`);
  }
  const used = new Map();
  data.places = data.places.map((p) => {
    const { station: _s, airport: _a, ...place } = p;
    if (!p.coords) return place;
    const s = nearestOf(p.coords, rail);
    const a = nearestOf(p.coords, air);
    used.set(s.hub.id, s.hub).set(a.hub.id, a.hub);
    return { ...place, station: { id: s.hub.id, km: Math.round(s.km) }, airport: { id: a.hub.id, km: Math.round(a.km) } };
  });
  data.hubs = [...used.values()].sort((x, y) => x.kind.localeCompare(y.kind) || x.name.localeCompare(y.name));
  return `Getting there: ${rail.length} stations and ${air.length} airports with scheduled flights; ${data.hubs.length} are nearest to a place.`;
}

// `npm run transport`: update only the getting-there fields.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outFile = new URL('../src/data/maharashtra.json', import.meta.url);
  const data = JSON.parse(await readFile(outFile, 'utf8'));
  console.log(await addTransport(data));
  await writeFile(outFile, JSON.stringify(data, null, 1) + '\n');
}

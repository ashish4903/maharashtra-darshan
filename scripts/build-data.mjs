// Builds src/data/maharashtra.json from open data.
//
//  - Districts and talukas come from Wikidata (CC0).
//  - Places and dishes are listed by Wikipedia title in data/curated.json; their
//    names, descriptions and coordinates come from Wikidata and Wikipedia.
//  - Every curated claim is checked against a source, and the build fails if a
//    check fails:
//      * a district belongs to its region: the region's source page names it
//      * a place is in its district: Wikidata's "located in" chain reaches the
//        district, or else the place's Wikipedia article names the district
//      * a dish belongs to its region: its Wikipedia article contains `evidence`
//      * a rename: the source article contains `evidence`
//  - Photos are the article's lead image, only when it is freely licensed
//    (pageimages' default). The app links each photo to its Commons file page.
//
// Usage: npm run data
// Needs network access. No keys or accounts are used.

import { readFile, writeFile } from 'node:fs/promises';
import { commonsImage, geocode, slug, sourceText } from './extras.mjs';

/** Great-circle distance in km (same as src/lib/geo.js). */
function distanceKm([lat1, lon1], [lat2, lon2]) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

const ROOT = new URL('../', import.meta.url);
const OUT = new URL('src/data/maharashtra.json', ROOT);
const USER_AGENT = 'maharashtra-darshan-data-script/1.0 (https://github.com/ashish4903/maharashtra-darshan)';
const MAHARASHTRA = 'Q1191';
const DISTRICT_OF_INDIA = 'Q1149652';
const TALUKA_OF_MAHARASHTRA = 'Q13119795';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qid = (uri) => uri.replace('http://www.wikidata.org/entity/', '');
const base = (name) => name.replace(/,.*$/, '').replace(/\s+(district|taluka|tehsil)$/i, '').trim();
const wikiUrl = (title) => 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));

// Retries both error responses and dropped connections (ECONNRESET etc.)
async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
      if (res.ok) return await res.json();
      if (attempt >= 4) throw new Error(`${res.status} for ${url}`);
    } catch (err) {
      if (attempt >= 4) throw err;
    }
    await sleep(5000 * attempt);
  }
}

const sparql = async (query) =>
  (await getJson('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query))).results.bindings;

const wikiCache = new Map();
async function wikipedia(title) {
  if (wikiCache.has(title)) return wikiCache.get(title);
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1' +
    '&prop=extracts|pageprops|coordinates|pageimages&explaintext=1&ppprop=wikibase_item' +
    '&piprop=thumbnail|name&pithumbsize=640&titles=' +
    encodeURIComponent(title);
  const page = (await getJson(url)).query.pages[0];
  await sleep(400); // stay well under Wikipedia's rate limit
  const result = page.missing
    ? null
    : {
        title: page.title,
        text: page.extract ?? '',
        wikidata: page.pageprops?.wikibase_item,
        coords: page.coordinates?.[0] ? [page.coordinates[0].lat, page.coordinates[0].lon].map((n) => +n.toFixed(4)) : undefined,
        image: page.thumbnail && page.pageimage ? { src: page.thumbnail.source.split('?')[0], file: page.pageimage } : undefined,
      };
  wikiCache.set(title, result);
  return result;
}

/** "Point(73.85 18.52)" -> [18.52, 73.85] (lat, lon), rounded to ~100 m */
const point = (wkt) => {
  const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(wkt ?? '');
  return m ? [+(+m[2]).toFixed(3), +(+m[1]).toFixed(3)] : undefined;
};

/**
 * The taluka a place is in, when Wikidata doesn't say:
 *  - the place is the taluka's headquarters town ("Kalamb, Yavatmal" -> Kalamb), or
 *  - its article names exactly one of the district's talukas as "<name> taluka/tehsil".
 */
function talukaFromText(district, page) {
  const placeBase = base(page.title).toLowerCase();
  const own = district.talukas.find((t) => base(t.name).toLowerCase() === placeBase);
  if (own) return own;
  const text = page.text.toLowerCase();
  const named = district.talukas.filter((t) =>
    ['taluka', 'tehsil', 'taluk'].some((w) => text.includes(`${base(t.name).toLowerCase()} ${w}`)),
  );
  return named.length === 1 ? named[0] : undefined;
}

const mentions = (text, names) => names.some((n) => text.toLowerCase().includes(n.toLowerCase()));

async function loadDistricts(curated) {
  const rows = await sparql(`
    SELECT ?d ?en ?mr ?title (SAMPLE(?c) AS ?coord) (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases) WHERE {
      ?d wdt:P31 wd:${DISTRICT_OF_INDIA}; wdt:P131/wdt:P131* wd:${MAHARASHTRA}; rdfs:label ?en .
      FILTER(lang(?en) = "en")
      FILTER NOT EXISTS { ?d wdt:P576 [] }
      FILTER NOT EXISTS { ?d wdt:P131 wd:${MAHARASHTRA} }  # skips proposed districts
      OPTIONAL { ?d rdfs:label ?mr FILTER(lang(?mr) = "mr") }
      OPTIONAL { ?a schema:about ?d; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?title }
      OPTIONAL { ?d skos:altLabel ?alias FILTER(lang(?alias) = "en") }
      OPTIONAL { ?d wdt:P625 ?c }
    } GROUP BY ?d ?en ?mr ?title`);
  const districts = rows.map((r) => {
    const id = qid(r.d.value);
    const rename = curated.renames.find((x) => x.wikidata === id);
    const names = [r.en.value, r.title?.value, ...(r.aliases?.value ? r.aliases.value.split('|') : [])]
      .filter(Boolean)
      .map(base);
    if (rename) names.unshift(base(rename.name));
    return {
      id,
      name: rename?.name ?? r.en.value,
      nameMr: rename?.nameMr ?? r.mr?.value,
      wikipedia: r.title ? wikiUrl(r.title.value) : undefined,
      coords: point(r.coord?.value),
      names: [...new Set(names)],
      talukas: [],
    };
  });
  if (districts.length !== 36) throw new Error(`Expected 36 districts, Wikidata returned ${districts.length}`);

  const talukaRows = await sparql(`
    SELECT ?t ?en ?mr ?d WHERE {
      ?t wdt:P31 wd:${TALUKA_OF_MAHARASHTRA}; wdt:P131 ?d; rdfs:label ?en .
      ?d wdt:P31 wd:${DISTRICT_OF_INDIA} .
      FILTER(lang(?en) = "en")
      FILTER NOT EXISTS { ?t wdt:P576 [] }
      OPTIONAL { ?t rdfs:label ?mr FILTER(lang(?mr) = "mr") }
    }`);
  const byId = new Map(districts.map((d) => [d.id, d]));
  for (const r of talukaRows) {
    const d = byId.get(qid(r.d.value));
    if (d && !d.talukas.some((t) => t.id === qid(r.t.value))) {
      // Marathi labels sometimes carry a disambiguation suffix: "कर्जत तालुका, अहमदनगर जिल्हा"
      d.talukas.push({ id: qid(r.t.value), name: r.en.value, nameMr: r.mr?.value.replace(/,.*$/, '') });
    }
  }
  for (const d of districts) d.talukas.sort((a, b) => a.name.localeCompare(b.name));
  return districts;
}

function districtFinder(districts) {
  return (name) => {
    const hit = districts.find((d) => d.names.some((n) => n.toLowerCase() === base(name).toLowerCase()));
    if (!hit) throw new Error(`Unknown district "${name}"`);
    return hit;
  };
}

// Separate small queries in batches: one combined query multiplies rows
// (labels × districts × talukas) and can grow to many megabytes.
async function wikidataDetails(ids) {
  const out = new Map(ids.map((id) => [id, { districts: new Set(), talukas: new Set() }]));
  for (let i = 0; i < ids.length; i += 60) {
    const values = `VALUES ?p { ${ids.slice(i, i + 60).map((id) => 'wd:' + id).join(' ')} }`;
    const labels = await sparql(`SELECT ?p ?mr ?desc ?coord WHERE { ${values}
      OPTIONAL { ?p rdfs:label ?mr FILTER(lang(?mr) = "mr") }
      OPTIONAL { ?p schema:description ?desc FILTER(lang(?desc) = "en") }
      OPTIONAL { ?p wdt:P625 ?coord } }`);
    const areas = await sparql(`SELECT DISTINCT ?p ?a ?kind WHERE { ${values}
      ?p wdt:P131+ ?a . VALUES ?kind { wd:${DISTRICT_OF_INDIA} wd:${TALUKA_OF_MAHARASHTRA} } ?a wdt:P31 ?kind . }`);
    for (const r of labels) {
      const e = out.get(qid(r.p.value));
      e.nameMr ??= r.mr?.value;
      e.description ??= r.desc?.value;
      e.coords ??= point(r.coord?.value);
    }
    for (const r of areas) {
      const e = out.get(qid(r.p.value));
      (qid(r.kind.value) === DISTRICT_OF_INDIA ? e.districts : e.talukas).add(qid(r.a.value));
    }
  }
  return out;
}

async function main() {
  const curated = JSON.parse(await readFile(new URL('data/curated.json', ROOT), 'utf8'));
  const problems = [];
  const notes = [];

  const districts = await loadDistricts(curated);
  const findDistrict = districtFinder(districts);

  for (const r of curated.renames) {
    const page = await wikipedia(r.source);
    if (!page || !mentions(page.text, [r.evidence])) problems.push(`Rename ${r.name}: "${r.evidence}" not found in ${r.source}`);
  }

  const regions = [];
  const assigned = new Map();
  for (const r of curated.regions) {
    const page = await wikipedia(r.source);
    if (!page) problems.push(`Region ${r.id}: no Wikipedia page "${r.source}"`);
    const ids = [];
    for (const name of r.districts) {
      const d = findDistrict(name);
      if (assigned.has(d.id)) problems.push(`${d.name} is in both ${assigned.get(d.id)} and ${r.id}`);
      assigned.set(d.id, r.id);
      if (page && !mentions(page.text, d.names)) problems.push(`Region ${r.id}: "${r.source}" does not name ${d.name}`);
      ids.push(d.id);
    }
    regions.push({ id: r.id, name: r.name, nameMr: r.nameMr, source: wikiUrl(page?.title ?? r.source), districts: ids });
  }
  for (const d of districts) {
    if (!assigned.has(d.id)) problems.push(`${d.name} is not in any region`);
    d.region = assigned.get(d.id);
  }

  // "Known for": each label must be backed by its evidence, in the district's
  // article or in the article named by `source` (e.g. a GI product's page)
  for (const [name, facts] of Object.entries(curated.knownFor ?? {})) {
    const d = findDistrict(name);
    const districtTitle = d.wikipedia && decodeURIComponent(d.wikipedia.split('/wiki/')[1]).replace(/_/g, ' ');
    d.knownFor = [];
    for (const f of facts) {
      const page = await wikipedia(f.source ?? districtTitle);
      if (page && mentions(page.text, [f.evidence])) d.knownFor.push({ label: f.label, source: wikiUrl(page.title) });
      else problems.push(`Known for "${f.label}" in ${d.name}: "${f.evidence}" not found in "${f.source ?? districtTitle}"`);
    }
  }

  async function resolve(entries, label) {
    const pages = [];
    for (const e of entries) {
      const page = await wikipedia(e.wiki);
      if (!page?.wikidata) problems.push(`${label} "${e.wiki}": no Wikipedia page with a Wikidata item`);
      pages.push(page);
    }
    const details = await wikidataDetails(pages.filter((p) => p?.wikidata).map((p) => p.wikidata));
    return entries.map((e, i) => ({ e, page: pages[i], wd: pages[i]?.wikidata && details.get(pages[i].wikidata) }));
  }

  const places = [];
  for (const { e, page, wd } of await resolve(curated.places, 'Place')) {
    if (!page?.wikidata) continue;
    const d = findDistrict(e.district);
    let verifiedBy = 'wikidata';
    if (!wd?.districts.has(d.id)) {
      if (mentions(page.text, d.names)) verifiedBy = 'wikipedia';
      else {
        problems.push(`Place "${page.title}": neither Wikidata nor Wikipedia places it in ${d.name}`);
        continue;
      }
    }
    if (e.highlight && !mentions(page.text, [e.evidence])) {
      problems.push(`Place "${page.title}": highlight evidence "${e.evidence}" not found in its article`);
      continue;
    }
    const taluka = d.talukas.find((t) => wd?.talukas.has(t.id)) ?? talukaFromText(d, page);
    places.push({
      id: page.wikidata,
      name: page.title,
      nameMr: wd?.nameMr,
      description: wd?.description,
      kind: e.kind,
      highlight: e.highlight,
      region: d.region,
      district: d.id,
      taluka: taluka?.id,
      // Wikipedia's coordinates, or Wikidata's when the article has none
      coords: page.coords ?? wd?.coords,
      image: page.image,
      wikipedia: wikiUrl(page.title),
      verifiedBy,
    });
    if (verifiedBy === 'wikipedia') notes.push(`Place "${page.title}" district checked via Wikipedia text`);
  }

  const regionIds = new Set([...regions.map((r) => r.id), 'statewide']);
  const foods = [];
  for (const { e, page, wd } of await resolve(curated.foods, 'Food')) {
    if (!page?.wikidata) continue;
    if (!regionIds.has(e.region)) problems.push(`Food "${page.title}": unknown region ${e.region}`);
    if (!mentions(page.text, [e.evidence])) {
      problems.push(`Food "${page.title}": "${e.evidence}" not found in its Wikipedia article`);
      continue;
    }
    const d = e.district ? findDistrict(e.district) : undefined;
    if (d && d.region !== e.region) problems.push(`Food "${page.title}": ${d.name} is not in ${e.region}`);
    foods.push({
      id: page.wikidata,
      name: page.title,
      nameMr: wd?.nameMr,
      description: wd?.description,
      type: e.type === 'produce' ? 'produce' : 'dish',
      region: e.region,
      district: d?.id,
      image: page.image,
      wikipedia: wikiUrl(page.title),
    });
  }

  // Extras: places and dishes with no Wikipedia article of their own. Each cites
  // a source page (an official district website, or a Wikipedia article that
  // mentions it) that must contain its evidence; photos only from Commons with
  // a free licence; coordinates from the source or OpenStreetMap, checked to
  // lie near the district.
  const textOf = async (url) =>
    url.startsWith('https://en.wikipedia.org/wiki/')
      ? (await wikipedia(decodeURIComponent(url.split('/wiki/')[1]).replace(/_/g, ' ')))?.text
      : sourceText(url);
  async function extraCommon(e, label) {
    const text = await textOf(e.source);
    if (!text) {
      problems.push(`${label} "${e.name}": source ${e.source} could not be read`);
      return null;
    }
    const missing = [e.evidence].flat().filter((ev) => !mentions(text, [ev]));
    if (missing.length) {
      problems.push(`${label} "${e.name}": ${missing.map((m) => `"${m}"`).join(', ')} not found on ${e.source}`);
      return null;
    }
    let image;
    if (e.photo) {
      image = await commonsImage(e.photo);
      if (!image) problems.push(`${label} "${e.name}": photo ${e.photo} is missing or not freely licensed`);
    }
    return { image };
  }

  for (const e of curated.extras?.places ?? []) {
    const d = findDistrict(e.district);
    const common = await extraCommon(e, 'Extra place');
    if (!common) continue;
    let coords = e.coords;
    let coordsFrom = coords ? 'source' : undefined;
    if (!coords && e.geocode) {
      // Try the full search, then just the town after the comma ("Rajur, Bhokardan" -> "Bhokardan")
      const queries = [...new Set([e.geocode, e.geocode.split(',').pop().trim()])];
      for (const q of queries) {
        const hit = await geocode(q);
        // Accept it when OpenStreetMap's own address names the district, or it lies within 150 km
        const inDistrict =
          hit && (mentions(hit.address, d.names) || (d.coords && distanceKm(hit.coords, d.coords) <= 150));
        if (inDistrict) {
          coords = hit.coords;
          coordsFrom = 'openstreetmap';
          break;
        }
      }
      if (!coords) notes.push(`Extra place "${e.name}": no OpenStreetMap location in ${d.name} for "${e.geocode}"`);
    }
    places.push({
      id: `x-${slug(e.name)}`,
      name: e.name,
      nameMr: e.nameMr,
      description: e.about,
      kind: e.kind,
      region: d.region,
      district: d.id,
      coords,
      coordsFrom,
      image: common.image,
      source: e.source,
      sourceName: new URL(e.source).hostname.replace(/^www\./, ''),
    });
  }

  for (const e of curated.extras?.foods ?? []) {
    if (!regionIds.has(e.region)) problems.push(`Extra food "${e.name}": unknown region ${e.region}`);
    const d = e.district ? findDistrict(e.district) : undefined;
    if (d && d.region !== e.region) problems.push(`Extra food "${e.name}": ${d.name} is not in ${e.region}`);
    const common = await extraCommon(e, 'Extra food');
    if (!common) continue;
    foods.push({
      id: `x-${slug(e.name)}`,
      name: e.name,
      nameMr: e.nameMr,
      description: e.about,
      type: e.type === 'produce' ? 'produce' : 'dish',
      region: e.region,
      district: d?.id,
      image: common.image,
      source: e.source,
      sourceName: new URL(e.source).hostname.replace(/^www\./, ''),
    });
  }

  for (const list of [places, foods]) {
    const seen = new Set();
    for (const item of list) {
      if (seen.has(item.id)) problems.push(`"${item.name}" is listed twice (check for Wikipedia redirects)`);
      seen.add(item.id);
    }
  }

  // Circuits: every stop must be a listed place, and its evidence must appear in
  // the circuit's source article or in the stop's own article.
  const circuits = [];
  const placeIds = new Set(places.map((p) => p.id));
  for (const c of curated.circuits ?? []) {
    const source = await wikipedia(c.source);
    if (!source) problems.push(`Circuit ${c.id}: no Wikipedia page "${c.source}"`);
    const ids = [];
    for (const stop of c.stops) {
      const page = await wikipedia(stop.wiki);
      if (!page?.wikidata || !placeIds.has(page.wikidata)) {
        problems.push(`Circuit ${c.id}: "${stop.wiki}" is not one of the listed places`);
        continue;
      }
      if (!mentions(source?.text ?? '', [stop.evidence]) && !mentions(page.text, [stop.evidence]))
        problems.push(`Circuit ${c.id}: "${stop.evidence}" not found for "${stop.wiki}"`);
      ids.push(page.wikidata);
    }
    circuits.push({
      id: c.id,
      name: c.name,
      nameMr: c.nameMr,
      about: c.about,
      source: wikiUrl(source?.title ?? c.source),
      ordered: Boolean(c.ordered),
      places: ids,
    });
  }

  // Festivals: every `whenEvidence` word must be in the festival's article, and
  // each place's evidence in the festival article or the place's own article.
  const festivals = [];
  const festivalPages = [];
  for (const f of curated.festivals ?? []) {
    const page = await wikipedia(f.wiki);
    if (!page?.wikidata) {
      problems.push(`Festival "${f.wiki}": no Wikipedia page with a Wikidata item`);
      continue;
    }
    for (const w of f.whenEvidence) {
      if (!mentions(page.text, [w])) problems.push(`Festival "${page.title}": "${w}" not found in its article`);
    }
    if (!regionIds.has(f.region)) problems.push(`Festival "${page.title}": unknown region ${f.region}`);
    const ids = [];
    for (const stop of f.places) {
      const placePage = await wikipedia(stop.wiki);
      if (!placePage?.wikidata || !placeIds.has(placePage.wikidata)) {
        problems.push(`Festival "${page.title}": "${stop.wiki}" is not one of the listed places`);
        continue;
      }
      if (!mentions(page.text, [stop.evidence]) && !mentions(placePage.text, [stop.evidence]))
        problems.push(`Festival "${page.title}": "${stop.evidence}" not found for "${stop.wiki}"`);
      ids.push(placePage.wikidata);
    }
    festivalPages.push(page.wikidata);
    festivals.push({
      id: page.wikidata,
      name: page.title,
      when: f.when,
      months: f.months,
      region: f.region,
      places: ids,
      image: page.image,
      wikipedia: wikiUrl(page.title),
    });
  }
  const festivalDetails = await wikidataDetails(festivalPages);
  for (const f of festivals) {
    f.nameMr = festivalDetails.get(f.id)?.nameMr;
    f.description = festivalDetails.get(f.id)?.description;
  }

  // Maharashtra's bounding box (see src/data/outline.json), with a small margin
  const inState = ([lat, lon]) => lat > 15.5 && lat < 22.2 && lon > 72.5 && lon < 81;
  for (const item of [...districts, ...places]) {
    if (item.coords && !inState(item.coords)) problems.push(`"${item.name}": coordinates ${item.coords} are outside Maharashtra`);
  }

  for (const n of notes) console.log('note:', n);
  if (problems.length) {
    for (const p of problems) console.error('problem:', p);
    console.error(`\n${problems.length} problem(s); ${OUT.pathname} was not written.`);
    process.exit(1);
  }

  const data = {
    generated: new Date().toISOString().slice(0, 10),
    licence: 'Data from Wikidata (CC0). Links point to Wikipedia articles (CC BY-SA 4.0).',
    regions,
    districts: districts
      .map(({ names, ...d }) => d)
      .sort((a, b) => a.name.localeCompare(b.name)),
    places,
    foods,
    circuits,
    festivals,
  };
  await writeFile(OUT, JSON.stringify(data, null, 1) + '\n');
  const talukas = districts.reduce((n, d) => n + d.talukas.length, 0);
  console.log(
    `Wrote ${regions.length} regions, ${districts.length} districts, ${talukas} talukas, ${places.length} places, ${foods.length} foods, ${circuits.length} circuits, ${festivals.length} festivals.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

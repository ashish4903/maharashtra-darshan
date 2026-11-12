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
//
// Usage: npm run data
// Needs network access. No keys or accounts are used.

import { readFile, writeFile } from 'node:fs/promises';

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

async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
    if (res.ok) return res.json();
    if (attempt === 3) throw new Error(`${res.status} for ${url}`);
    await sleep(2000 * attempt);
  }
}

const sparql = async (query) =>
  (await getJson('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query))).results.bindings;

const wikiCache = new Map();
async function wikipedia(title) {
  if (wikiCache.has(title)) return wikiCache.get(title);
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1' +
    '&prop=extracts|pageprops|coordinates&explaintext=1&ppprop=wikibase_item&titles=' +
    encodeURIComponent(title);
  const page = (await getJson(url)).query.pages[0];
  await sleep(150);
  const result = page.missing
    ? null
    : {
        title: page.title,
        text: page.extract ?? '',
        wikidata: page.pageprops?.wikibase_item,
        coords: page.coordinates?.[0] ? [page.coordinates[0].lat, page.coordinates[0].lon] : undefined,
      };
  wikiCache.set(title, result);
  return result;
}

const mentions = (text, names) => names.some((n) => text.toLowerCase().includes(n.toLowerCase()));

async function loadDistricts(curated) {
  const rows = await sparql(`
    SELECT ?d ?en ?mr ?title (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases) WHERE {
      ?d wdt:P31 wd:${DISTRICT_OF_INDIA}; wdt:P131/wdt:P131* wd:${MAHARASHTRA}; rdfs:label ?en .
      FILTER(lang(?en) = "en")
      FILTER NOT EXISTS { ?d wdt:P576 [] }
      FILTER NOT EXISTS { ?d wdt:P131 wd:${MAHARASHTRA} }  # skips proposed districts
      OPTIONAL { ?d rdfs:label ?mr FILTER(lang(?mr) = "mr") }
      OPTIONAL { ?a schema:about ?d; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?title }
      OPTIONAL { ?d skos:altLabel ?alias FILTER(lang(?alias) = "en") }
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

async function wikidataDetails(ids) {
  const rows = await sparql(`
    SELECT ?p ?mr ?desc ?d ?t WHERE {
      VALUES ?p { ${ids.map((id) => 'wd:' + id).join(' ')} }
      OPTIONAL { ?p rdfs:label ?mr FILTER(lang(?mr) = "mr") }
      OPTIONAL { ?p schema:description ?desc FILTER(lang(?desc) = "en") }
      OPTIONAL { ?p wdt:P131+ ?d . ?d wdt:P31 wd:${DISTRICT_OF_INDIA} . }
      OPTIONAL { ?p wdt:P131+ ?t . ?t wdt:P31 wd:${TALUKA_OF_MAHARASHTRA} . }
    }`);
  const out = new Map();
  for (const r of rows) {
    const id = qid(r.p.value);
    const e = out.get(id) ?? { districts: new Set(), talukas: new Set() };
    e.nameMr ??= r.mr?.value;
    e.description ??= r.desc?.value;
    if (r.d) e.districts.add(qid(r.d.value));
    if (r.t) e.talukas.add(qid(r.t.value));
    out.set(id, e);
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
    const taluka = d.talukas.find((t) => wd?.talukas.has(t.id));
    places.push({
      id: page.wikidata,
      name: page.title,
      nameMr: wd?.nameMr,
      description: wd?.description,
      kind: e.kind,
      region: d.region,
      district: d.id,
      taluka: taluka?.id,
      coords: page.coords,
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
      region: e.region,
      district: d?.id,
      wikipedia: wikiUrl(page.title),
    });
  }

  for (const list of [places, foods]) {
    const seen = new Set();
    for (const item of list) {
      if (seen.has(item.id)) problems.push(`"${item.name}" is listed twice (check for Wikipedia redirects)`);
      seen.add(item.id);
    }
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
  };
  await writeFile(OUT, JSON.stringify(data, null, 1) + '\n');
  const talukas = districts.reduce((n, d) => n + d.talukas.length, 0);
  console.log(
    `Wrote ${regions.length} regions, ${districts.length} districts, ${talukas} talukas, ${places.length} places, ${foods.length} foods.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

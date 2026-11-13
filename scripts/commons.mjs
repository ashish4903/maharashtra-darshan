// Adds each place's Wikimedia Commons category (Wikidata P373) to
// src/data/maharashtra.json, for the photo gallery on place pages, without
// rebuilding everything else. `npm run data` adds it too; this is the quick
// path when only the galleries need updating (or a source site is down).
//
// Usage: npm run commons
// Needs network access (Wikidata only). No keys or accounts are used.

import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/maharashtra.json', import.meta.url);
const USER_AGENT = 'maharashtra-darshan-data-script/1.0 (https://github.com/ashish4903/maharashtra-darshan)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sparql(query) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query), {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' },
        signal: AbortSignal.timeout(60000),
      });
      if (res.ok) return (await res.json()).results.bindings;
      if (attempt >= 4) throw new Error(`Wikidata answered ${res.status}`);
    } catch (err) {
      if (attempt >= 4) throw err;
    }
    await sleep(5000 * attempt);
  }
}

/** Puts `commons` just before `wikipedia`, where `npm run data` puts it, so diffs stay small. */
function withCommons(place, commons) {
  const out = {};
  for (const [k, v] of Object.entries(place)) {
    if (k === 'commons') continue;
    if (k === 'wikipedia' && commons) out.commons = commons;
    out[k] = v;
  }
  return out;
}

const data = JSON.parse(await readFile(OUT, 'utf8'));
const ids = data.places.map((p) => p.id).filter((id) => /^Q\d+$/.test(id));
const found = new Map();
for (let i = 0; i < ids.length; i += 100) {
  const values = ids.slice(i, i + 100).map((id) => 'wd:' + id).join(' ');
  const rows = await sparql(`SELECT ?p (SAMPLE(?c) AS ?commons) WHERE { VALUES ?p { ${values} } ?p wdt:P373 ?c } GROUP BY ?p`);
  for (const r of rows) found.set(r.p.value.replace('http://www.wikidata.org/entity/', ''), r.commons.value);
  await sleep(1000);
}

data.places = data.places.map((p) => withCommons(p, found.get(p.id)));
await writeFile(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(`Commons categories: ${found.size} of ${ids.length} places with a Wikidata item.`);

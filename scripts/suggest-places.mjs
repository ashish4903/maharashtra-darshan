// Suggests places to add, from Wikipedia's categories for each district
// (e.g. "Category:Hindu temples in Yavatmal district"). It only prints
// suggestions; add the ones you want to data/curated.json and run
// `npm run data`, which checks each one.
//
// Usage: npm run suggest              (all districts)
//        npm run suggest -- Yavatmal  (one district)
// Writes the full list to suggestions.json (ignored by git).

import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const USER_AGENT = 'maharashtra-darshan-data-script/1.0 (https://github.com/ashish4903/maharashtra-darshan)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Sub-categories worth looking in, and the place type they suggest
const KIND_BY_CATEGORY = [
  [/forts?\b/i, 'fort'],
  [/temples|mosques|churches|gurdwaras|dargahs|religious|jain|buddhist|shrines/i, 'temple'],
  [/caves|monuments|museums|palaces|buildings and structures|archaeological|heritage/i, 'heritage'],
  [/lakes|waterfalls|rivers|dams|reservoirs|protected areas|wildlife|national parks|sanctuar|forests|geography|hills|mountains|parks/i, 'nature'],
  [/beaches/i, 'beach'],
  [/hill stations/i, 'hill-station'],
  [/tourist attractions|visitor attractions/i, null],
];
const SKIP_PAGE = /^(List of|Category:|Template:)|railway station|airport|\b(school|college|university|hospital|constituency|company|limited)\b/i;

async function api(params) {
  const url = 'https://en.wikipedia.org/w/api.php?format=json&formatversion=2&' + new URLSearchParams(params);
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.ok) {
      await sleep(400);
      return res.json();
    }
    if (attempt === 4) throw new Error(`${res.status} for ${url}`);
    await sleep(5000 * attempt);
  }
}

async function members(category, type) {
  const out = [];
  let cont;
  do {
    const json = await api({
      action: 'query',
      list: 'categorymembers',
      cmtitle: category,
      cmtype: type,
      cmlimit: '500',
      ...(cont ? { cmcontinue: cont } : {}),
    });
    out.push(...json.query.categorymembers.map((m) => m.title));
    cont = json.continue?.cmcontinue;
  } while (cont);
  return out;
}

const kindFor = (category) => KIND_BY_CATEGORY.find(([re]) => re.test(category));

const TOURISM_SECTION = /touris|places of interest|attractions|religious|pilgrim|landmarks|places to visit|sightseeing|temples|forts/i;

/** Links from the district article's tourism-like sections. */
async function sectionLinks(title) {
  const { parse } = await api({ action: 'parse', page: title, prop: 'sections', redirects: '1' });
  const links = [];
  for (const s of parse?.sections ?? []) {
    if (!TOURISM_SECTION.test(s.line)) continue;
    const json = await api({ action: 'parse', page: title, prop: 'links', section: s.index, redirects: '1' });
    for (const l of json.parse?.links ?? []) if (l.ns === 0 && l.exists) links.push({ title: l.title, section: s.line });
  }
  return links;
}

async function suggest(district, known) {
  const title = decodeURIComponent(district.wikipedia.split('/wiki/')[1]).replace(/_/g, ' ');
  const found = new Map();
  const seen = new Set();
  // Breadth-first through the district's category, two levels deep
  let level = [`Category:${title}`];
  for (let depth = 0; depth < 3 && level.length; depth++) {
    const next = [];
    for (const cat of level) {
      if (seen.has(cat)) continue;
      seen.add(cat);
      const rule = depth === 0 ? [null, null] : kindFor(cat);
      if (!rule) continue;
      for (const page of await members(cat, 'page')) {
        if (SKIP_PAGE.test(page) || known.has(page) || found.has(page)) continue;
        if (depth > 0) found.set(page, { title: page, kind: rule[1], category: cat.replace('Category:', '') });
      }
      for (const sub of await members(cat, 'subcat')) if (kindFor(sub)) next.push(sub);
    }
    level = next;
  }
  for (const link of await sectionLinks(title)) {
    if (SKIP_PAGE.test(link.title) || known.has(link.title) || found.has(link.title)) continue;
    found.set(link.title, { title: link.title, kind: null, category: `article section "${link.section}"` });
  }
  return [...found.values()];
}

const data = JSON.parse(await readFile(new URL('src/data/maharashtra.json', ROOT), 'utf8'));
const known = new Set(data.places.map((p) => p.name));
const only = process.argv[2]?.toLowerCase();
const result = {};
for (const d of data.districts) {
  if (!d.wikipedia || (only && !d.name.toLowerCase().startsWith(only))) continue;
  result[d.name] = await suggest(d, known);
  console.log(`\n${d.name}: ${result[d.name].length} suggestions`);
  for (const s of result[d.name]) console.log(`  ${s.title}  [${s.kind ?? '?'}; ${s.category}]`);
}
await writeFile(new URL('suggestions.json', ROOT), JSON.stringify(result, null, 1) + '\n');

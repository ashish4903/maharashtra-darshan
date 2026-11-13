// History trails (data/curated.json "trails"): a story walked in time order,
// one place per stop. Each stop's wording is our own, and every fact in it is
// backed by `evidence`: groups of phrases that must all appear in ONE
// sentence of the place's Wikipedia article, one of the stop's `sources`, or
// the trail's source article. Every year shown in `when` must appear in one
// of those matched sentences.
//
// Used by build-data.mjs. Run on its own (`npm run trails`) to re-check the
// trails and update only them in src/data/maharashtra.json.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const wikiUrl = (title) => 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));

const normalise = (s) =>
  s
    .toLowerCase()
    .replace(/[‐-―]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, '-');

// "c. 1533", "(r. c. 756 – 773)", "B. R. Ambedkar", "Dr. ..." don't end a sentence
const ABBREVIATION = /(?:^|[\s(])(?:c|ca|r|b|d|fl|St|Dr|Mr|Mrs|Sr|Jr|No|vs|[A-Z])\.$/;

/** An article's plain text as sentences (section headings dropped). */
export function sentences(text) {
  const out = [];
  for (const line of (text ?? '').replace(/^=+[^=\n]*=+\s*$/gm, '\n').split(/\n+/)) {
    let current = '';
    for (const piece of line.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)) {
      current = current ? `${current} ${piece}` : piece;
      if (!ABBREVIATION.test(current)) {
        out.push(current.trim());
        current = '';
      }
    }
    if (current.trim()) out.push(current.trim());
  }
  return out.filter(Boolean);
}

/** The first sentence that contains every phrase, or undefined. */
export function sentenceWith(text, phrases) {
  const want = phrases.map(normalise);
  return sentences(text).find((s) => {
    const n = normalise(s);
    return want.every((p) => n.includes(p));
  });
}

/** Years (3–4 digit numbers) that a `when` label shows. */
export const yearsIn = (when) => when.match(/\d{3,4}/g) ?? [];

/**
 * Checks curated trails. `wikipedia(title)` returns { title, text, wikidata }
 * or null; `placeIds` is the set of listed places.
 */
export async function buildTrails(curatedTrails, { wikipedia, placeIds }) {
  const problems = [];
  const trails = [];
  for (const trail of curatedTrails ?? []) {
    const main = await wikipedia(trail.source);
    if (!main) problems.push(`Trail ${trail.id}: no Wikipedia page "${trail.source}"`);
    const stops = [];
    for (const stop of trail.stops) {
      const label = `Trail ${trail.id}, "${stop.wiki}"`;
      const page = await wikipedia(stop.wiki);
      if (!page?.wikidata || !placeIds.has(page.wikidata)) {
        problems.push(`${label}: not one of the listed places`);
        continue;
      }
      const articles = [page];
      for (const title of stop.sources ?? []) {
        const extra = await wikipedia(title);
        if (extra) articles.push(extra);
        else problems.push(`${label}: no Wikipedia page "${title}"`);
      }
      if (main) articles.push(main);

      const matched = [];
      let ok = true;
      for (const group of stop.evidence) {
        const hit = articles
          .map((a) => ({ article: a, sentence: sentenceWith(a.text, group) }))
          .find((h) => h.sentence);
        if (!hit) {
          problems.push(`${label}: no sentence has all of ${group.map((g) => `"${g}"`).join(', ')}`);
          ok = false;
        } else matched.push(hit);
      }
      for (const year of yearsIn(stop.when)) {
        if (!matched.some((h) => h.sentence.includes(year))) {
          problems.push(`${label}: the year ${year} is not in any matched sentence`);
          ok = false;
        }
      }
      if (!ok) continue;
      const cited = [...new Set(matched.map((h) => h.article.title))];
      stops.push({
        place: page.wikidata,
        when: stop.when,
        whenMr: stop.whenMr,
        event: stop.event,
        eventMr: stop.eventMr,
        sources: cited.map((title) => ({ title, url: wikiUrl(title) })),
      });
    }
    trails.push({
      id: trail.id,
      name: trail.name,
      nameMr: trail.nameMr,
      icon: trail.icon,
      about: trail.about,
      aboutMr: trail.aboutMr,
      source: wikiUrl(main?.title ?? trail.source),
      stops,
    });
  }
  return { trails, problems };
}

// `npm run trails`: re-check only the trails, against live Wikipedia.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const USER_AGENT = 'maharashtra-darshan-data-script/1.0 (https://github.com/ashish4903/maharashtra-darshan)';
  const cache = new Map();
  const wikipedia = async (title) => {
    if (cache.has(title)) return cache.get(title);
    const url =
      'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1' +
      '&prop=extracts|pageprops&explaintext=1&ppprop=wikibase_item&titles=' +
      encodeURIComponent(title);
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
    const page = (await res.json()).query.pages[0];
    await new Promise((r) => setTimeout(r, 400));
    const result = page.missing
      ? null
      : { title: page.title, text: page.extract ?? '', wikidata: page.pageprops?.wikibase_item };
    cache.set(title, result);
    return result;
  };
  const root = new URL('..', import.meta.url);
  const curated = JSON.parse(await readFile(new URL('data/curated.json', root), 'utf8'));
  const outFile = new URL('src/data/maharashtra.json', root);
  const data = JSON.parse(await readFile(outFile, 'utf8'));
  const { trails, problems } = await buildTrails(curated.trails, {
    wikipedia,
    placeIds: new Set(data.places.map((p) => p.id)),
  });
  if (problems.length) {
    console.error(problems.map((p) => `- ${p}`).join('\n'));
    process.exit(1);
  }
  data.trails = trails;
  await writeFile(outFile, JSON.stringify(data, null, 1) + '\n');
  console.log(`Wrote ${trails.length} trails, ${trails.reduce((n, t) => n + t.stops.length, 0)} stops.`);
}

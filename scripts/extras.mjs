// Helpers for entries that have no Wikipedia article of their own
// (data/curated.json "extras"): each still cites a source page, which must
// contain its evidence text; photos come only from Wikimedia Commons with a
// free licence; coordinates can come from OpenStreetMap.

const USER_AGENT = 'maharashtra-darshan-data-script/1.0 (https://github.com/ashish4903/maharashtra-darshan)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, accept) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: accept },
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) return res;
      if (res.status === 404 || attempt >= 3) return null;
    } catch (err) {
      if (attempt >= 3) throw err;
    }
    await sleep(4000 * attempt);
  }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ndash: '–', mdash: '—' };
const htmlToText = (html) =>
  html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ');

const pageCache = new Map();
/** The readable text of a source page (cached). Null when it can't be fetched. */
export async function sourceText(url) {
  if (pageCache.has(url)) return pageCache.get(url);
  const res = await fetchWithRetry(url, 'text/html');
  const text = res ? htmlToText(await res.text()) : null;
  pageCache.set(url, text);
  await sleep(800);
  return text;
}

const FREE_LICENCE = /^(cc[ -]?by|cc0|cc[ -]?zero|public domain|pd\b|gfdl)/i;
/**
 * A Commons file as { src, file, licence } when its licence is free,
 * otherwise null. `width` is the thumbnail width.
 */
export async function commonsImage(file, width = 960) {
  const title = file.startsWith('File:') ? file : `File:${file}`;
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo' +
    `&iiprop=url|extmetadata&iiurlwidth=${width}&titles=${encodeURIComponent(title)}`;
  const res = await fetchWithRetry(url, 'application/json');
  await sleep(500);
  const page = res && (await res.json()).query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  const licence = info?.extmetadata?.LicenseShortName?.value ?? '';
  if (!info || !FREE_LICENCE.test(licence)) return null;
  return { src: (info.thumburl ?? info.url).split('?')[0], file: page.title.replace(/^File:/, ''), licence };
}

/**
 * { coords: [lat, lon], address } for a search in OpenStreetMap's Nominatim
 * (one request a second, as its usage policy asks), or null.
 */
export async function geocode(query) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=' +
    encodeURIComponent(`${query}, Maharashtra`);
  const res = await fetchWithRetry(url, 'application/json');
  await sleep(1100);
  const [hit] = res ? await res.json() : [];
  return hit ? { coords: [+(+hit.lat).toFixed(4), +(+hit.lon).toFixed(4)], address: hit.display_name ?? '' } : null;
}

export const slug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

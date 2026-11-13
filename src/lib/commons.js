// Photo galleries from a Wikimedia Commons category.
// Only the category name is sent; no keys, no cookies (origin=* is anonymous CORS).

/** Same rule as the data build (scripts/extras.mjs): CC BY / CC BY-SA, CC0, public domain, GFDL. */
export const FREE_LICENCE = /^(cc[ -]?by|cc0|cc[ -]?zero|public domain|pd\b|gfdl)/i;

/**
 * Commons API request for up to `limit` JPEG photos in a category, with licence
 * and author. Search (rather than listing the category) ranks featured and
 * quality images first and skips maps, logos and badges.
 */
export function galleryUrl(category, { limit = 24, width = 400 } = {}) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    origin: '*',
    generator: 'search',
    gsrsearch: `incategory:"${category.replace(/ /g, '_').replace(/"/g, '')}" filemime:image/jpeg`,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: String(width),
    iiextmetadatafilter: 'LicenseShortName|Artist',
  });
  return `https://commons.wikimedia.org/w/api.php?${params}`;
}

export const categoryUrl = (category) =>
  'https://commons.wikimedia.org/wiki/Category:' + encodeURIComponent(category.replace(/ /g, '_'));

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

/** Commons gives the author as HTML (often a link); keep only its text. Never rendered as HTML. */
export const plainText = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENTITIES[e])
    .replace(/\s+/g, ' ')
    .trim();

/** "Gateway_of_India_2019.jpg" -> "Gateway of India 2019" */
export const fileCaption = (file) => file.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ');

/**
 * Photos from a Commons API response, in search order: freely licensed JPEG
 * photos only, leaving out `skipFile` (the photo already shown), at most
 * `max`. Commons' tracking parameters (utm_*) are dropped from image links.
 */
export function parseGallery(json, { skipFile, max = 12 } = {}) {
  const pages = json?.query?.pages ?? [];
  return pages
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((page) => {
      const info = page.imageinfo?.[0];
      const meta = info?.extmetadata ?? {};
      return {
        file: (page.title ?? '').replace(/^File:/, ''),
        src: info?.thumburl?.split('?')[0],
        mime: info?.mime,
        licence: meta.LicenseShortName?.value ?? '',
        author: plainText(meta.Artist?.value),
      };
    })
    .filter((p) => p.src && p.mime === 'image/jpeg' && FREE_LICENCE.test(p.licence))
    .filter((p) => p.file.replace(/ /g, '_') !== skipFile?.replace(/ /g, '_'))
    .slice(0, max)
    .map(({ file, src, licence, author }) => ({ file, src, licence, author }));
}

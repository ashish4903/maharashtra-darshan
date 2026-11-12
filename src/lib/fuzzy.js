// Forgiving search: spelling variants ("Kolhapoor"), small typos ("ajnta"),
// and Marathi words typed in English letters ("Shivneri killa", "ganpati").

// Common Marathi/Hindi words people type, mapped to the English words in names
const SYNONYMS = [
  [/\b(ganpati|ganapati|ganapathi|ganpatee|vinayak|vinayaka|ganesha)\b/g, 'ganesh'],
  [/\b(killa|qila|kila|durg)\b/g, 'fort'],
  [/\b(mandir|mandira|devasthan|devalay|deul)\b/g, 'temple'],
  [/\b(leni|lene|lenya|gufa|gumpha)\b/g, 'caves'],
  [/\b(talav|talao|talaav|sarovar)\b/g, 'lake'],
  [/\b(dhabdhaba|dhabdhabe|prapat)\b/g, 'waterfall'],
  [/\b(kinara|kinare|chowpatty)\b/g, 'beach'],
  [/\b(abhayaranya|abhayaranya)\b/g, 'sanctuary'],
];

// Built from escape strings on purpose: only Latin combining accents
// (U+0300–U+036F) are removed, never Devanagari vowel signs, and letters
// outside a–z, 0–9 and Devanagari (U+0900–U+097F) become spaces.
const LATIN_ACCENTS = new RegExp('[\\u0300-\\u036f]', 'g');
// eslint-disable-next-line no-misleading-character-class -- a code-point range (the Devanagari block), not a combined character
const NOT_WORD = new RegExp('[^a-z0-9\\u0900-\\u097f]+', 'g');

/** A loose spelling key: lowercase, no accents, folded vowels and aspirates. */
export function phonetic(text) {
  let s = text.toLowerCase().normalize('NFD').replace(LATIN_ACCENTS, '');
  for (const [re, word] of SYNONYMS) s = s.replace(re, word);
  return s
    .replace(NOT_WORD, ' ')
    .replace(/aa/g, 'a')
    .replace(/ee|ii/g, 'i')
    .replace(/oo|uu/g, 'u')
    .replace(/w/g, 'v')
    .replace(/z/g, 'j')
    .replace(/ph/g, 'f')
    .replace(/([kgcjtdpbs])h/g, '$1') // aspirated consonants: kh->k, sh->s, dh->d …
    .replace(/([a-z])\1+/g, '$1') // doubled letters
    .trim();
}

/** Levenshtein distance, stopping early once it exceeds `max`. */
function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, row[j]);
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

const allowedTypos = (token) => (token.length >= 8 ? 2 : token.length >= 5 ? 1 : 0);

/**
 * How well `query` matches an item, 0 for no match. `primary` is the item's
 * names; `extra` is context such as its district or type ("fort pune").
 * Every query word must match somewhere; matches in the names score highest.
 */
export function score(query, primary, extra = '') {
  const raw = query.trim().toLowerCase();
  if (raw.length < 2) return 0;
  const names = primary.toLowerCase();
  if (names.includes(raw)) return 100 - Math.min(names.indexOf(raw), 50) / 10;

  const tokens = phonetic(raw).split(' ').filter(Boolean);
  const nameWords = phonetic(primary).split(' ');
  const extraWords = phonetic(extra).split(' ');
  let total = 0;
  for (const t of tokens) {
    const inName = nameWords.some((w) => w.startsWith(t) || (t.length >= 4 && w.includes(t)));
    const typoName = !inName && nameWords.some((w) => distance(w, t, allowedTypos(t)) <= allowedTypos(t));
    const inExtra = extraWords.some((w) => w.startsWith(t));
    if (inName) total += 10;
    else if (typoName) total += 6;
    else if (inExtra) total += 3;
    else return 0;
  }
  return total / tokens.length;
}

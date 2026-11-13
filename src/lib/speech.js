// Listen mode: the browser's own speech (Web Speech API) reads a page aloud.
// Nothing is recorded or sent anywhere; voices come from the device.
import { kindText, translate } from './i18n';
import { SEASON_ICONS, monthRange } from './catalogue';
import { monthName } from './months';

export const RATES = [0.75, 1, 1.25];

// A Marathi page without a Marathi voice falls back to Hindi (same script),
// then to English.
const VOICE_PREFS = { mr: ['mr', 'hi'], en: ['en-IN', 'en'] };

/** The best voice for a language: { voice, lang } or null if there is none. */
export function pickVoice(voices, lang) {
  for (const want of VOICE_PREFS[lang] ?? [lang]) {
    const voice = voices.find((v) => v.lang?.replace('_', '-').toLowerCase().startsWith(want.toLowerCase()));
    if (voice) return { voice, lang: voice.lang };
  }
  return null;
}

/**
 * Short pieces for speaking: whole sentences where possible. Some browsers
 * stop reading a long utterance after about 15 seconds.
 */
export function chunks(text, max = 200) {
  const sentences = (text ?? '').replace(/\s+/g, ' ').trim().match(/[^.!?।]+[.!?।]*\s*/g) ?? [];
  const out = [];
  for (const raw of sentences) {
    let s = raw.trim();
    while (s.length > max) {
      const cut = Math.max(s.lastIndexOf(', ', max), s.lastIndexOf(' ', max));
      const at = cut > 0 ? cut + 1 : max;
      out.push(s.slice(0, at).trim());
      s = s.slice(at).trim();
    }
    if (s) out.push(s);
  }
  return out;
}

const nameIn = (lang, item) => (lang === 'mr' && item?.nameMr ? item.nameMr : item?.name);
const short = (name) => name?.replace(/ (district|जिल्हा)$/i, '');

/** What a place page reads: [{ lang, text }] in the given language. */
export function placeScript(lang, { place, district, taluka, summary }) {
  const say = (key, vars) => translate(lang, key, vars);
  const parts = [
    {
      lang,
      text: say('listen.placeIntro', {
        name: nameIn(lang, place),
        kind: kindText(lang, place.kind),
        district: short(nameIn(lang, district)),
      }),
    },
  ];
  if (taluka) parts.push({ lang, text: say('listen.taluka', { taluka: short(nameIn(lang, taluka)) }) });
  if (place.best && SEASON_ICONS[place.best.reason]) {
    parts.push({
      lang,
      text: say('listen.best', {
        reason: say(`season.${place.best.reason}`),
        months: monthRange(place.best.months, (m) => monthName(m, lang, 'long')).replace('–', ` ${say('listen.to')} `),
      }),
    });
  }
  // Descriptions and Wikipedia summaries are in English
  if (place.description) parts.push({ lang: 'en', text: `${place.description}.` });
  if (summary) parts.push({ lang: 'en', text: summary });
  return parts;
}

/** What a trip day reads: the day, then each stop in order. */
export function dayScript(lang, { n, stops, districtOf }) {
  const say = (key, vars) => translate(lang, key, vars);
  const parts = [{ lang, text: `${say('trip.day', { n })}. ${say('count.stop', { n: stops.length })}.` }];
  stops.forEach((place, i) => {
    parts.push({
      lang,
      text: say('listen.stop.n', {
        n: i + 1,
        name: nameIn(lang, place),
        kind: kindText(lang, place.kind),
        district: short(nameIn(lang, districtOf(place))),
      }),
    });
    if (place.description) parts.push({ lang: 'en', text: `${place.description}.` });
  });
  return parts;
}

// One player for the whole app: starting one Listen button stops any other.
let state = { owner: null, status: 'idle' };
let runs = 0;
const listeners = new Set();
const set = (next) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};
export const subscribe = (l) => (listeners.add(l), () => listeners.delete(l));
export const getState = () => state;

export const speechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';

/** Speak [{ lang, text }] at `rate`; `owner` identifies the button playing. */
export function speak(owner, parts, rate = 1) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = synth.getVoices();
  const queue = parts.flatMap(({ lang, text }) => {
    const picked = pickVoice(voices, lang);
    return chunks(text).map((piece) => {
      const u = new window.SpeechSynthesisUtterance(piece);
      u.rate = rate;
      u.lang = picked?.lang ?? (lang === 'mr' ? 'mr-IN' : 'en-IN');
      if (picked) u.voice = picked.voice;
      return u;
    });
  });
  if (!queue.length) return;
  // Cancelling fires late events from the old reading; only this run's count
  const run = ++runs;
  const done = () => run === runs && set({ owner: null, status: 'idle' });
  queue.forEach((u) => {
    u.onerror = done;
  });
  queue[queue.length - 1].onend = done;
  set({ owner, status: 'speaking' });
  queue.forEach((u) => synth.speak(u));
}

export function pause() {
  window.speechSynthesis.pause();
  set({ status: 'paused' });
}

export function resume() {
  window.speechSynthesis.resume();
  set({ status: 'speaking' });
}

export function stop() {
  runs += 1;
  window.speechSynthesis.cancel();
  set({ owner: null, status: 'idle' });
}

import { describe, expect, it } from 'vitest';
import { chunks, dayScript, pickVoice, placeScript } from './speech';
import { getDistrict, places } from './catalogue';

const voice = (lang) => ({ lang, name: lang });

describe('listen mode', () => {
  it('picks a Marathi voice, then Hindi, and none if neither is on the device', () => {
    expect(pickVoice([voice('en-US'), voice('mr-IN')], 'mr').lang).toBe('mr-IN');
    expect(pickVoice([voice('en-US'), voice('hi_IN')], 'mr').lang).toBe('hi_IN');
    expect(pickVoice([voice('en-US')], 'mr')).toBeNull();
    expect(pickVoice([voice('en-US'), voice('en-IN')], 'en').lang).toBe('en-IN');
  });

  it('splits long text into short sentences for speaking', () => {
    expect(chunks('One. Two!  Three')).toEqual(['One.', 'Two!', 'Three']);
    expect(chunks('पहिले वाक्य। दुसरे')).toEqual(['पहिले वाक्य।', 'दुसरे']);
    const long = chunks(`${'word '.repeat(100)}end.`, 50);
    expect(long.every((c) => c.length <= 50)).toBe(true);
    expect(long.join(' ')).toBe(`${'word '.repeat(100)}end.`);
  });

  it('reads a place: name, type, district and best season, then the English text', () => {
    const falls = places.find((p) => p.name === 'Dabhosa Waterfalls');
    const district = getDistrict(falls.district);
    const en = placeScript('en', { place: falls, district, summary: 'A summary.' });
    expect(en[0].text).toContain('Dabhosa Waterfalls.');
    expect(en[0].text).toContain(`${district.name.replace(/ district$/i, '')} district`);
    expect(en.map((p) => p.text).join(' ')).toMatch(/Best time: Monsoon waterfalls, June to September\./);
    expect(en.at(-1)).toEqual({ lang: 'en', text: 'A summary.' });

    const mr = placeScript('mr', { place: falls, district, summary: 'A summary.' });
    expect(mr[0].lang).toBe('mr');
    expect(mr[0].text).toContain('जिल्ह्यातील');
    // The Wikipedia summary is English, so it is read with an English voice
    expect(mr.at(-1).lang).toBe('en');
  });

  it('reads a trip day stop by stop', () => {
    const stops = places.filter((p) => p.coords).slice(0, 2);
    const parts = dayScript('en', { n: 2, stops, districtOf: (p) => getDistrict(p.district) });
    expect(parts[0].text).toBe('Day 2. 2 stops.');
    expect(parts.map((p) => p.text).join(' ')).toContain(`Stop 2: ${stops[1].name}.`);
  });
});

import { describe, expect, it } from 'vitest';
import { kindText, missingMarathi, translate } from './i18n';
import { KINDS } from './catalogue';

describe('i18n', () => {
  it('has a Marathi translation for every English message', () => {
    expect(missingMarathi()).toEqual([]);
  });

  it('fills placeholders and picks singular or plural', () => {
    expect(translate('en', 'count.place', { n: 1 })).toBe('1 place');
    expect(translate('en', 'count.place', { n: 4 })).toBe('4 places');
    expect(translate('mr', 'count.place', { n: 1 })).toBe('1 ठिकाण');
    expect(translate('mr', 'count.place', { n: 4 })).toBe('4 ठिकाणे');
    expect(translate('mr', 'trip.day', { n: 2 })).toBe('दिवस 2');
    expect(translate('en', 'search.none', { q: 'xyz' })).toBe('Nothing matches “xyz”.');
  });

  it('names every place type in both languages', () => {
    for (const k of Object.keys(KINDS)) {
      expect(kindText('en', k)).not.toBe(k);
      expect(kindText('mr', k)).not.toBe(k);
      expect(kindText('mr', k, true)).toBeTruthy();
    }
  });

  it('falls back to English, then to the key', () => {
    expect(translate('xx', 'nav.trip')).toBe('My trip');
    expect(translate('mr', 'no.such.key')).toBe('no.such.key');
  });
});

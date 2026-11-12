import { describe, expect, it } from 'vitest';
import { parseHash, toHash } from './route';

describe('route', () => {
  it('reads regions and districts from the hash', () => {
    expect(parseHash('#/region/vidarbha')).toEqual({ view: 'region', id: 'vidarbha' });
    expect(parseHash('#/district/Q1797367')).toEqual({ view: 'district', id: 'Q1797367' });
  });

  it('falls back to the home view for anything unknown', () => {
    for (const hash of ['', '#/', '#/region/nowhere', '#/district/Q1', '#/other/x']) {
      expect(parseHash(hash)).toEqual({ view: 'home' });
    }
  });

  it('round-trips', () => {
    for (const route of [{ view: 'home' }, { view: 'region', id: 'konkan' }]) {
      expect(parseHash(toHash(route))).toEqual(route);
    }
  });
});

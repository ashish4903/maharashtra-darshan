import { describe, expect, it } from 'vitest';
import { parseHash, toHash } from './route';
import { places } from './catalogue';

describe('route', () => {
  it('reads regions, districts, places and the trip from the hash', () => {
    expect(parseHash('#/region/vidarbha')).toEqual({ view: 'region', id: 'vidarbha' });
    expect(parseHash('#/district/Q1797367')).toEqual({ view: 'district', id: 'Q1797367' });
    expect(parseHash(`#/place/${places[0].id}`)).toEqual({ view: 'place', id: places[0].id });
    expect(parseHash('#/trip')).toEqual({ view: 'trip' });
  });

  it('reads a shared trip, ignoring unknown ids', () => {
    const ids = places.slice(0, 2).map((p) => p.id);
    expect(parseHash(`#/trip/${ids.join(',')},Q1`)).toEqual({ view: 'trip', ids });
    expect(parseHash('#/trip/Q1')).toEqual({ view: 'trip' });
    expect(toHash({ view: 'trip', ids })).toBe(`#/trip/${ids.join(',')}`);
  });

  it('falls back to the home view for anything unknown', () => {
    for (const hash of ['', '#/', '#/region/nowhere', '#/district/Q1', '#/place/Q1', '#/other/x']) {
      expect(parseHash(hash)).toEqual({ view: 'home' });
    }
  });

  it('round-trips', () => {
    for (const route of [{ view: 'home' }, { view: 'trip' }, { view: 'region', id: 'konkan' }]) {
      expect(parseHash(toHash(route))).toEqual(route);
    }
  });
});

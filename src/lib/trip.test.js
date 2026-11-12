import { describe, expect, it } from 'vitest';
import { directionsUrl, routeKm, shortestRoute, splitDays } from './trip';

const at = (id, lat, lon) => ({ id, name: id, coords: [lat, lon] });
// Four points on a line, given out of order
const line = [at('C', 19, 75), at('A', 19, 73), at('D', 19, 76), at('B', 19, 74)];

describe('trip', () => {
  it('orders places into a short route', () => {
    const ids = shortestRoute(line).map((p) => p.id).join('');
    expect(['ABCD', 'DCBA']).toContain(ids);
    expect(routeKm(shortestRoute(line))).toBeLessThan(routeKm(line));
  });

  it('leaves out places without coordinates', () => {
    expect(shortestRoute([...line, { id: 'X' }]).map((p) => p.id)).not.toContain('X');
  });

  it('splits a route into days by stops and by long hops', () => {
    const route = shortestRoute(line);
    expect(splitDays(route, { perDay: 2 }).map((d) => d.stops.length)).toEqual([2, 2]);
    // ~105 km between neighbours, so a 100 km limit gives one stop a day
    expect(splitDays(route, { perDay: 9, maxHopKm: 100 })).toHaveLength(4);
    const [day] = splitDays(route, { perDay: 9 });
    expect(day.km).toBeCloseTo(routeKm(route), 5);
  });

  it('builds a keyless Google Maps directions link', () => {
    const url = directionsUrl(shortestRoute(line));
    expect(url).toMatch(/^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&/);
    const params = new URL(url).searchParams;
    expect(params.get('waypoints').split('|')).toHaveLength(2);
    expect(params.get('key')).toBeNull();
    expect(directionsUrl([])).toBeNull();
  });
});

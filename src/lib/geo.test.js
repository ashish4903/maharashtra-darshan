import { describe, expect, it } from 'vitest';
import { MAP_HEIGHT, MAP_WIDTH, distanceKm, formatKm, nearest, outlinePath, project } from './geo';
import { districts, places } from './catalogue';

describe('geo', () => {
  it('projects every district and place inside the map', () => {
    for (const item of [...districts, ...places].filter((x) => x.coords)) {
      const [x, y] = project(item.coords);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(MAP_WIDTH);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(MAP_HEIGHT);
    }
    expect(outlinePath).toMatch(/^M[\d.]+,[\d.]+L/);
  });

  it('measures distances', () => {
    // Pune to Mumbai is about 120 km in a straight line
    expect(distanceKm([18.52, 73.86], [19.08, 72.88])).toBeGreaterThan(110);
    expect(distanceKm([18.52, 73.86], [19.08, 72.88])).toBeLessThan(130);
    expect(formatKm(3.14)).toBe('3.1 km');
    expect(formatKm(123.4)).toBe('123 km');
  });

  it('finds the nearest places, excluding the one you are at', () => {
    const ajanta = places.find((p) => p.name === 'Ajanta Caves');
    const near = nearest(ajanta.coords, places, 3, ajanta.id);
    expect(near).toHaveLength(3);
    expect(near.map((n) => n.place.id)).not.toContain(ajanta.id);
    expect(near[0].km).toBeLessThanOrEqual(near[1].km);
  });
});

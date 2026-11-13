import { describe, expect, it } from 'vitest';
import { INTERESTS, planGetaway, routeFrom } from './planner';
import { districts } from './catalogue';
import { distanceKm } from './geo';

const PUNE = [18.52, 73.86];

describe('weekend planner', () => {
  it('plans a compact fort trip from Pune', () => {
    const plan = planGetaway({ start: PUNE, days: 2, interests: ['forts'] });
    expect(plan.places.length).toBeGreaterThan(2);
    expect(plan.places.length).toBeLessThanOrEqual(6);
    expect(plan.places.every((p) => INTERESTS.forts.includes(p.kind))).toBe(true);
    expect(plan.places.every((p) => distanceKm(PUNE, p.coords) <= 150)).toBe(true);
  });

  it('favours places at their best that month', () => {
    const winter = planGetaway({ start: PUNE, days: 2, interests: ['nature'], month: 1 });
    expect(winter.places.map((p) => p.name)).toContain('Bhigwan');
    const monsoon = planGetaway({ start: PUNE, days: 2, interests: ['nature'], month: 8 });
    expect(monsoon.places.map((p) => p.name)).toContain('Lonavala');
  });

  it('starts the route at the stop nearest the start', () => {
    const plan = planGetaway({ start: PUNE, days: 3, interests: ['temples'] });
    const firstKm = distanceKm(PUNE, plan.places[0].coords);
    expect(plan.places.every((p) => distanceKm(PUNE, p.coords) >= firstKm - 25)).toBe(true);
  });

  it('suggests food from the districts visited and festivals that month', () => {
    const plan = planGetaway({ start: PUNE, days: 2, month: 8 });
    expect(plan.foods.length).toBeGreaterThan(0);
    expect(plan.festivals.map((f) => f.name)).toContain('Ganesh Chaturthi');
  });

  it('works from every district', () => {
    for (const d of districts.filter((x) => x.coords)) {
      expect(() => planGetaway({ start: d.coords, days: 1 })).not.toThrow();
    }
  });

  it('orders from a fixed start', () => {
    const a = { id: 'a', coords: [18.6, 73.86] };
    const b = { id: 'b', coords: [18.9, 73.86] };
    const c = { id: 'c', coords: [19.2, 73.86] };
    expect(routeFrom(PUNE, [c, a, b]).map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });
});

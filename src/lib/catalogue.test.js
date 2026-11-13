import { describe, expect, it } from 'vitest';
import {
  KINDS,
  STATEWIDE,
  areaName,
  circuitPlaces,
  circuits,
  circuitsWith,
  coverImage,
  festivals,
  foodSpotQuery,
  monthsUntil,
  upcomingFestivals,
  mapsSearchUrl,
  districts,
  featuredPlaces,
  getPlace,
  randomPlace,
  districtsOf,
  foods,
  foodsIn,
  getDistrict,
  places,
  placesIn,
  regions,
  search,
  shortName,
  talukaCounts,
} from './catalogue';

describe('generated data', () => {
  it('puts each of the 36 districts in exactly one region', () => {
    expect(districts).toHaveLength(36);
    const listed = regions.flatMap((r) => r.districts);
    expect(listed).toHaveLength(36);
    expect(new Set(listed).size).toBe(36);
    for (const d of districts) expect(regions.find((r) => r.id === d.region).districts).toContain(d.id);
  });

  it('gives every region, district, place and dish a source link', () => {
    for (const item of [...regions, ...places, ...foods]) {
      expect(item.source ?? item.wikipedia).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
    }
  });

  it('only references districts, regions and kinds that exist', () => {
    for (const p of places) {
      expect(getDistrict(p.district).region).toBe(p.region);
      expect(KINDS[p.kind]).toBeDefined();
    }
    const regionIds = [...regions.map((r) => r.id), STATEWIDE];
    for (const f of foods) {
      expect(regionIds).toContain(f.region);
      if (f.district) expect(getDistrict(f.district).region).toBe(f.region);
    }
  });

  it('links places only to talukas of their own district', () => {
    for (const p of places.filter((x) => x.taluka)) {
      expect(getDistrict(p.district).talukas.map((t) => t.id)).toContain(p.taluka);
    }
    const yavatmal = districts.find((d) => d.name === 'Yavatmal district');
    const counts = talukaCounts(yavatmal.id);
    expect([...counts.values()].reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(placesIn({ district: yavatmal.id }).length);
  });

  it('links every known-for fact and marks produce', () => {
    for (const d of districts) {
      for (const k of d.knownFor ?? []) {
        expect(k.label).toBeTruthy();
        expect(k.source).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
      }
    }
    expect(foods.every((f) => ['dish', 'produce'].includes(f.type))).toBe(true);
    expect(search('strawberr').foods.map((f) => f.type)).toContain('produce');
  });

  it('builds Google Maps searches for food spots without any API key', () => {
    const misal = foods.find((f) => f.name === 'Misal pav');
    const pune = districts.find((d) => d.name === 'Pune district');
    expect(foodSpotQuery(misal)).toBe('Misal pav in Kolhapur');
    expect(foodSpotQuery(misal, { districtId: pune.id })).toBe('Misal pav in Pune');
    expect(foodSpotQuery(misal, { near: 'Shaniwar Wada' })).toBe('Misal pav near Shaniwar Wada');
    expect(foodSpotQuery(foods.find((f) => f.region === STATEWIDE))).toMatch(/ near me$/);
    expect(areaName(districts.find((d) => d.name === 'Mumbai Suburban district').id)).toBe('Mumbai');
    const url = mapsSearchUrl('Misal pav in Kolhapur');
    expect(url).toBe('https://www.google.com/maps/search/?api=1&query=Misal%20pav%20in%20Kolhapur');
    expect(url).not.toMatch(/key=/);
  });

  it('has circuits made of listed places', () => {
    const byId = Object.fromEntries(circuits.map((c) => [c.id, c]));
    expect(byId.ashtavinayak.places).toHaveLength(8);
    expect(byId.jyotirlingas.places).toHaveLength(5);
    expect(byId['shakti-peeth'].places).toHaveLength(4);
    for (const c of circuits) {
      expect(circuitPlaces(c)).toHaveLength(c.places.length);
      expect(c.source).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
    }
    const ajanta = places.find((p) => p.name === 'Ajanta Caves');
    expect(circuitsWith(ajanta.id).map((c) => c.id)).toContain('unesco');
  });

  it('orders festivals by when they next come round', () => {
    expect(festivals.length).toBeGreaterThan(8);
    const ganesh = festivals.find((f) => f.name === 'Ganesh Chaturthi');
    expect(monthsUntil(ganesh, 8)).toBe(0);
    expect(monthsUntil(ganesh, 10)).toBe(10);
    expect(upcomingFestivals(8)[0].months).toContain(8);
    const occasional = festivals.find((f) => f.months.length === 0);
    expect(upcomingFestivals(1).at(-1)).toBe(occasional);
    for (const f of festivals) {
      expect(f.wikipedia).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
      for (const id of f.places) expect(getPlace(id)).toBeDefined();
    }
  });

  it('has no duplicate places or dishes', () => {
    expect(new Set(places.map((p) => p.id)).size).toBe(places.length);
    expect(new Set(foods.map((f) => f.id)).size).toBe(foods.length);
  });
});

describe('helpers', () => {
  it('lists a region’s districts alphabetically', () => {
    const names = districtsOf('vidarbha').map((d) => shortName(d.name));
    expect(names).toContain('Nagpur');
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('filters places by district and region', () => {
    const nagpur = districts.find((d) => d.name === 'Nagpur district');
    expect(placesIn({ district: nagpur.id }).every((p) => p.district === nagpur.id)).toBe(true);
    expect(placesIn({ region: 'marathwada' }).map((p) => p.name)).toContain('Ajanta Caves');
  });

  it('lists a district’s own dishes before the rest of its region’s', () => {
    const pune = districts.find((d) => d.name === 'Pune district');
    const list = foodsIn({ district: pune.id });
    const fromPune = list.filter((f) => f.district === pune.id);
    expect(fromPune.length).toBeGreaterThan(0);
    expect(fromPune.length).toBeLessThan(list.length);
    expect(list.slice(0, fromPune.length)).toEqual(fromPune);
    expect(list.every((f) => f.region === 'western-maharashtra')).toBe(true);
  });

  it('features photographed places from every region', () => {
    const featured = featuredPlaces(2);
    expect(featured.every((p) => p.image)).toBe(true);
    expect(new Set(featured.map((p) => p.region)).size).toBe(regions.length);
    expect(coverImage({ region: 'vidarbha' }).src).toMatch(/^https:\/\//);
    expect(randomPlace(() => 0)).toBe(places[0]);
    expect(getPlace(places[1].id)).toBe(places[1]);
  });

  it('searches in English and Marathi', () => {
    expect(search('lonar').places.map((p) => p.name)).toContain('Lonar Lake');
    expect(search('विदर्भ').regions.map((r) => r.id)).toEqual(['vidarbha']);
    expect(search('haveli').talukas[0].district).toBe(districts.find((d) => d.name === 'Pune district').id);
    expect(search('a').places).toEqual([]);
  });
});

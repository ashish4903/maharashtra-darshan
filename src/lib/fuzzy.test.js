import { describe, expect, it } from 'vitest';
import { phonetic, score } from './fuzzy';
import { search } from './catalogue';

const names = (list) => list.map((x) => x.name);

describe('fuzzy search', () => {
  it('folds spelling variants', () => {
    expect(phonetic('Kolhapoor')).toBe(phonetic('Kolhapur'));
    expect(phonetic('Shivneri killa')).toBe(phonetic('Shivneri Fort'));
    expect(phonetic('Ganpati Mandir')).toBe(phonetic('Ganesh Temple'));
  });

  it('scores name matches above context matches, and needs every word', () => {
    expect(score('lonar', 'Lonar Lake')).toBeGreaterThan(score('lonar', 'Something', 'near Lonar'));
    expect(score('fort pune', 'Sinhagad', 'Pune district fort')).toBeGreaterThan(0);
    expect(score('fort nagpur', 'Sinhagad', 'Pune district fort')).toBe(0);
    expect(score('a', 'Ajanta Caves')).toBe(0);
  });

  it('finds places despite variants and typos', () => {
    expect(names(search('Kolhapoor').districts)).toContain('Kolhapur district');
    expect(names(search('ajnta').places)[0]).toBe('Ajanta Caves');
    expect(names(search('shivneri killa').places)[0]).toBe('Shivneri Fort');
    expect(names(search('ganpati').places)).toEqual(expect.arrayContaining(['Ganesha Temple, Morgaon']));
    expect(names(search('pandharpoor').places)).toContain('Pandharpur');
  });

  it('combines a type with a district', () => {
    const forts = search('fort pune').places;
    expect(forts.length).toBeGreaterThan(3);
    expect(forts.every((p) => p.kind === 'fort' || /fort/i.test(p.name))).toBe(true);
    expect(names(forts)).toContain('Sinhagad');
  });

  it('ranks the closest match first', () => {
    expect(names(search('raigad').places)[0]).toBe('Raigad Fort');
    expect(names(search('ellora').places)[0]).toBe('Ellora Caves');
  });
});

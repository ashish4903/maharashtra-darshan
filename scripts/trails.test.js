import { describe, expect, it } from 'vitest';
import { buildTrails, sentenceWith, sentences, yearsIn } from './trails.mjs';

const article = `Shivneri is a fort. Shivaji Maharaj was born at the fort on 19 February 1630, and spent his childhood there.

== History ==
Eknath (c. 1533 – 25 February 1600) was a saint. The fort was taken in 1646 by Dr. B. R. Example.`;

describe('history trail checks', () => {
  it('splits an article into sentences, keeping "c. 1533" and initials whole', () => {
    const list = sentences(article);
    expect(list).toContain('Eknath (c. 1533 – 25 February 1600) was a saint.');
    expect(list).toContain('The fort was taken in 1646 by Dr. B. R. Example.');
    expect(list.some((s) => s.includes('== History =='))).toBe(false);
  });

  it('needs every phrase in the same sentence', () => {
    expect(sentenceWith(article, ['born at the fort', '19 February 1630'])).toMatch(/^Shivaji Maharaj/);
    // "1630" and "1646" are both in the article, but not in one sentence
    expect(sentenceWith(article, ['1630', '1646'])).toBeUndefined();
    // Dashes and spacing don't matter
    expect(sentenceWith(article, ['c. 1533-25 February 1600'])).toBeTruthy();
  });

  it('reads the years a label shows', () => {
    expect(yearsIn('1664–1667')).toEqual(['1664', '1667']);
    expect(yearsIn('2nd century BCE – 480 CE')).toEqual(['480']);
    expect(yearsIn('After Torna')).toEqual([]);
  });

  it('keeps a stop only when its evidence and years are in the cited sentences', async () => {
    const pages = { Shivneri: { title: 'Shivneri', text: article, wikidata: 'Q1' }, Shivaji: { title: 'Shivaji', text: '', wikidata: 'Q2' } };
    const wikipedia = async (title) => pages[title] ?? null;
    const stop = (when, evidence) => ({ wiki: 'Shivneri', when, event: 'Born here.', evidence });
    const trail = (stops) => [{ id: 't', name: 'T', source: 'Shivaji', stops }];

    const good = await buildTrails(trail([stop('1630', [['born at the fort', '1630']])]), { wikipedia, placeIds: new Set(['Q1']) });
    expect(good.problems).toEqual([]);
    expect(good.trails[0].stops[0]).toMatchObject({ place: 'Q1', sources: [{ title: 'Shivneri' }] });

    const wrongYear = await buildTrails(trail([stop('1631', [['born at the fort']])]), { wikipedia, placeIds: new Set(['Q1']) });
    expect(wrongYear.problems.join()).toMatch(/1631 is not in any matched sentence/);

    const notListed = await buildTrails(trail([stop('1630', [['born']])]), { wikipedia, placeIds: new Set() });
    expect(notListed.problems.join()).toMatch(/not one of the listed places/);
  });
});

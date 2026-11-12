# Maharashtra Darshan · महाराष्ट्र दर्शन

One place to explore Maharashtra region by region: Konkan, Western Maharashtra, North Maharashtra (Khandesh), Marathwada and Vidarbha. For each one, you can browse its districts and talukas, places to visit and food to try.

**Live site:** https://ashish4903.github.io/maharashtra-darshan/

## Features

- **Browse by area:** region, then district, then its talukas.
- **Places to visit:** forts, temples, heritage sites, nature reserves, hill stations, beaches and well-known villages. Filter them by type, and open each on Wikipedia or OpenStreetMap.
- **Food to try:** dishes for each region and district, plus dishes from across the state.
- **Search:** works in English or Marathi, for example `Lonar` or `वडापाव`.
- **Shareable links:** every page has its own link, for example `#/region/vidarbha`.
- **Responsive:** works on phones first, and adapts to larger screens and dark mode.

## Where the data comes from

Nothing is written from memory. Every entry has a source:

| Data | Source |
| --- | --- |
| Districts, talukas, Marathi names, descriptions, map coordinates | [Wikidata](https://www.wikidata.org/) (CC0) |
| Places and dishes | A curated list of [Wikipedia](https://en.wikipedia.org/) articles, linked from every card |
| Which districts belong to each region | The Wikipedia article for each division or region |

`npm run data` rebuilds `src/data/maharashtra.json` and checks every claim:
- Each district must be named on its region's source page.
- Each place must sit in its district, according to Wikidata or its own article.
- Each dish's article must name its region.

If any check fails, the build stops.

## Adding a place or dish

1. Find the place's or dish's English Wikipedia article.
2. Add a line to [`data/curated.json`](data/curated.json). The format is in [`.claude/skills/add-place-or-food/SKILL.md`](.claude/skills/add-place-or-food/SKILL.md).
3. Run `npm run data`, then `npm test`, and open a pull request.

Suggestions without a source can't be added, but feel free to open an issue.

## Development

Requires Node 22 or newer.

```bash
npm install
npm run dev      # http://localhost:5173/maharashtra-darshan/
npm test
npm run lint
npm run build
```

The app needs no API keys, accounts or `.env` file.

## Licence

The code is under the [MIT](LICENSE) licence.
- Data from Wikidata is CC0.
- Wikipedia articles are linked, not copied.

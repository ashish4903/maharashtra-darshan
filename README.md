# Maharashtra Darshan · महाराष्ट्र दर्शन

One place to explore Maharashtra region by region: Konkan, Western Maharashtra, North Maharashtra (Khandesh), Marathwada and Vidarbha. For each one, you can browse its districts and talukas, places to visit and food to try.

**Live site:** https://ashish4903.github.io/maharashtra-darshan/

## Features

- **Interactive map:** hover over or tap any of the 36 districts, or highlight a region from the legend.
- **Browse by area:** region, then district, then its talukas.
- **District pages:** what the district is known for (for example, Yavatmal: cotton, “Cotton City”), its places by taluka, its food, and an About tab with the Wikipedia summary.
- **Places to visit:** 379 forts, caves, places of worship, pilgrim towns, museums, lakes, waterfalls, wildlife sanctuaries, hill stations, beaches and well-known villages, most with photos. Filter them by type or by taluka.
- **Food to try:** 37 dishes and GI-tagged local produce, such as Sangli turmeric, Mahabaleshwar strawberries, Jalgaon bananas and Vengurla cashew, for each region and district.
- **A page for every place:** each one has:
  - the opening paragraph of its Wikipedia article
  - its region and district, and its location on the map
  - the nearest places, with distances
  - food to try nearby
- **My trip:** tap ♡ to save places. They're kept in your browser only.
- **Near me:** lists the places closest to you. Your location never leaves your device.
- **Surprise me:** opens a random place.
- **Search:** works in English or Marathi, for example `Lonar` or `वडापाव`. Press <kbd>/</kbd> to jump to the search box.
- **Shareable links:** every page has its own link, for example `#/region/vidarbha`.
- **Responsive:** works on phones first, and adapts to larger screens and dark mode.

## Where the data comes from

Nothing is written from memory. Every entry has a source:

| Data | Source |
| --- | --- |
| Districts, talukas, Marathi names, descriptions, map coordinates | [Wikidata](https://www.wikidata.org/) (CC0) |
| Places and dishes | A curated list of [Wikipedia](https://en.wikipedia.org/) articles, linked from every card |
| “Known for” facts | The district's Wikipedia article, or a linked article such as a GI product's page |
| Which districts belong to each region | The Wikipedia article for each division or region |
| Photos | The lead image of each Wikipedia article, only when it is freely licensed, from [Wikimedia Commons](https://commons.wikimedia.org/). Each place's page links to the photo's file page for author and licence. |
| Place summaries | Loaded live from the Wikipedia article when a place's page opens, and credited there (CC BY-SA 4.0) |
| State outline on the map | [Natural Earth](https://www.naturalearthdata.com/) (public domain), built by `npm run outline` |

`npm run data` rebuilds `src/data/maharashtra.json` and checks every claim:
- Each district must be named on its region's source page.
- Each place must sit in its district, according to Wikidata or its own article.
- Each dish's article must name its region.
- Each place highlight (for example, “Shree Chintamani Ganesh temple” for Kalamb) must appear in the place's article.
- Each “known for” fact must appear in the district's article.
- A place is linked to a taluka only when Wikidata or its article says so.

If any check fails, the build stops.

## Adding a place or dish

1. Find the place's or dish's English Wikipedia article. `npm run suggest -- <District>` lists candidates from the district's Wikipedia categories and its tourism sections.
2. Add a line to [`data/curated.json`](data/curated.json). The format is in [`.claude/skills/add-place-or-food/SKILL.md`](.claude/skills/add-place-or-food/SKILL.md).
3. Run `npm run data`, then `npm test`, and open a pull request.

Other sites, including the official [Maharashtra Tourism](https://maharashtratourism.gov.in) district pages, are used only to spot what's missing. Their text and photos are never copied, and every entry still needs its own Wikipedia article. Suggestions without a source can't be added, but feel free to open an issue.

## Development

Requires Node 22 or newer.

```bash
npm install
npm run dev      # http://localhost:5173/maharashtra-darshan/
npm test
npm run lint
npm run build
```

The app needs no API keys, accounts or `.env` file. It has no tracking and no cookies. Its only network requests are to Wikipedia and Wikimedia Commons, for summaries and photos.

## Licence

The code is under the [MIT](LICENSE) licence.
- Data from Wikidata is CC0.
- Wikipedia text is loaded live and credited, not copied into the repo.
- Photos stay on Wikimedia Commons under their own licences.
- The map outline is public domain.

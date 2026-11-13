# Maharashtra Darshan · महाराष्ट्र दर्शन

One place to explore Maharashtra region by region: Konkan, Western Maharashtra, North Maharashtra (Khandesh), Marathwada and Vidarbha. For each one, you can browse its districts and talukas, places to visit and food to try.

**Live site:** https://ashish4903.github.io/maharashtra-darshan/

## Features

- **मराठी / English:** the whole interface switches with one tap, and the choice is remembered. Visitors whose browser is set to Marathi get Marathi automatically. Place, district, taluka, region and circuit names appear in Marathi, with English alongside. Descriptions and Wikipedia summaries are still in English.
- **Interactive map:** hover over or tap any of the 36 districts, or highlight a region from the legend.
- **Browse by area:** region, then district, then its talukas.
- **District pages:** what the district is known for (for example, Yavatmal: cotton, “Cotton City”), its places by taluka, its food, and an About tab with the Wikipedia summary.
- **Places to visit:** 466 forts, caves, places of worship, pilgrim towns, museums, lakes, waterfalls, wildlife sanctuaries, hill stations, beaches and well-known villages, most with photos. Filter them by type or by taluka.
- **Food to try:** 52 dishes and GI-tagged local produce, such as Sangli turmeric, Mahabaleshwar strawberries, Jalgaon bananas and Vengurla cashew, for each region and district. Each dish has a **Top-rated spots on Google Maps** link, and each place has **Top-rated restaurants nearby**. These open a Google Maps search, where Google shows its current ratings. We never copy or store ratings, and no API key is used.
- **A page for every place:** each one has:
  - the opening paragraph of its Wikipedia article
  - its region and district, and its location on the map
  - the nearest places, with distances
  - food to try nearby
  - a 4-day weather forecast from Open-Meteo, which is free and needs no key; only the place’s coordinates are sent
- **My trip planner:** tap ♡ to save places. My trip:
  - orders them into the shortest route and splits it into days (choose 2–6 stops a day)
  - shows the route on the map
  - gives Google Maps directions for each day or the whole trip
  - **Share this trip** creates a link that opens the same plan for a friend, who can save it.

  Saved places stay in your browser only.
- **Circuits:** ready-made routes, each planned into days with directions, or added to My trip in one tap:
  - Ashtavinayak (8 Ganesh temples)
  - the 5 Jyotirlingas of Maharashtra
  - Sade Teen Shakti Peeth
  - the UNESCO Maratha Military Landscapes forts
  - Shivaji Maharaj’s forts
  - UNESCO World Heritage Sites
  - the Pandharpur Wari

  Every stop is checked against the circuit’s Wikipedia source or the stop’s own article.
- **Festivals and fairs:** 13 festivals, including the Pandharpur Wari, Ganeshotsav, Navaratri, the Nashik Kumbh (2027) and the Sarangkheda horse fair. They appear month by month and are linked to their places; the home page shows what’s coming up. Each festival’s timing and places are checked against Wikipedia.
- **Near me:** lists the places closest to you. Your location never leaves your device.
- **Surprise me:** opens a random place.
- **Search:** works in English or Marathi and forgives spelling. For example:
  - `Kolhapoor` finds Kolhapur, and the typo `ajnta` finds Ajanta.
  - `Shivneri killa` and `ganpati` work, because Marathi words typed in English letters are understood.
  - `fort pune` lists Pune’s forts.

  The best matches come first. Press <kbd>/</kbd> to jump to the search box.
- **Shareable links:** every page has its own link, for example `#/region/vidarbha`.
- **Responsive:** works on phones first, and adapts to larger screens and dark mode.

## Where the data comes from

Nothing is written from memory. Every entry has a source:

| Data | Source |
| --- | --- |
| Districts, talukas, Marathi names, descriptions, map coordinates (Wikipedia’s, else Wikidata’s) | [Wikidata](https://www.wikidata.org/) (CC0) |
| Places and dishes | A curated list of [Wikipedia](https://en.wikipedia.org/) articles, linked from every card |
| Places and dishes with no Wikipedia article yet | The official district website (`*.gov.in`, `*.nic.in`), or a Wikipedia article that mentions them (for example Saoji and tarri poha in the Nagpur article). The build checks that the page names them. Photos only from Wikimedia Commons with a free licence; locations from OpenStreetMap, checked to fall in the right district |
| “Known for” facts | The district's Wikipedia article, or a linked article such as a GI product's page |
| Which districts belong to each region | The Wikipedia article for each division or region |
| Photos | The lead image of each Wikipedia article, only when it is freely licensed, from [Wikimedia Commons](https://commons.wikimedia.org/). Each place's page links to the photo's file page for author and licence. |
| Circuits | Each stop’s membership is found in the circuit’s Wikipedia article (for example Ashtavinayaka), or in the stop’s own article (“one of the twelve Jyotirlingas”) |
| Festivals | Each festival’s Wikipedia article must contain its timing words (for example Bhadrapada and August), and must name each linked place, or that place’s article must name the festival |
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

**Anyone** can suggest a place, dish or festival with the [suggestion form](https://github.com/ashish4903/maharashtra-darshan/issues/new?template=suggest-a-place.yml). The app links to it from every district page. It asks for the English Wikipedia article, because entries need a source.

To add one yourself:

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

The app needs no API keys, accounts or `.env` file. It has no tracking and no cookies. Its only network requests are to Wikipedia and Wikimedia Commons (summaries and photos) and Open-Meteo (forecasts, sending only a place’s coordinates). Google Maps links are plain links: nothing is sent to Google unless the visitor clicks one.

## Releases

The version is in `package.json` and the notes are in [CHANGELOG.md](CHANGELOG.md). To publish a release:
1. Add the changes under a new `## [x.y.z] - date` section in the changelog.
2. Raise `version` in `package.json` in the same pull request.

When it’s merged, CI creates the GitHub Release `vx.y.z` with those notes. CI also fails if the current version has no changelog section.

## Licence

The code is under the [MIT](LICENSE) licence.
- Data from Wikidata is CC0.
- Wikipedia text is loaded live and credited, not copied into the repo.
- Photos stay on Wikimedia Commons under their own licences.
- The map outline is public domain.

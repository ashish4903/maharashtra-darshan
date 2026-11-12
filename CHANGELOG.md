# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Marathi interface. A मराठी / English switch in the header translates every button, tab, filter, count and message, and the choice is remembered in the browser. Browsers set to Marathi start in Marathi. Names of regions, districts, talukas, places, dishes and circuits show in Marathi, with English alongside.

- Circuits: 7 themed routes. Each has a page planned like a trip (map, days, directions) and “Add all to my trip”. Place pages show which circuits they are part of.
  - Ashtavinayak, in traditional order
  - Jyotirlingas of Maharashtra
  - Sade Teen Shakti Peeth
  - Maratha Military Landscapes (UNESCO)
  - In the footsteps of Shivaji Maharaj
  - UNESCO World Heritage Sites
  - The Pandharpur Wari
- Salher fort.

### Changed

- Places whose Wikipedia article has no coordinates now use Wikidata’s. Only 8 of 407 places are now missing from the map, down from 101.

- Trip planner. My trip:
  - orders saved places into the shortest route and splits it into days
  - draws the numbered route on the map
  - opens directions in Google Maps for each day or the whole trip, using free Maps URLs with no API key
  - can be shared as a link (`#/trip/<ids>`) that a friend can open and save.

- Food spots: every dish links to “Top-rated spots on Google Maps” (local produce links to “Where to buy”). The search is near the place, in the district, or near the visitor. Each place has “Top-rated restaurants nearby”, and each district’s Food tab links to its best-rated restaurants. Ratings stay on Google’s side, always current and never copied, with no API key or cost.

- The rest of the official Maharashtra Tourism district pages compared (all 36 now). Each new entry was checked against its own Wikipedia article.
  - 406 places, up from 379, including Ratangad, Sandhan Valley, Chaul, Ujani Dam, Miraj, Masunda Lake, Mumbai's Mahalakshmi Temple, Sula Vineyards and the Khadakwasla and Panshet dams.
  - Pani puri and sev puri added to the Mumbai food list.
  - “Known for” now covers all 36 districts (88 facts). New facts include Nagpur “Orange City” and “Tiger Capital of India”, Pune “Oxford of the East”, Ratnagiri’s Alphonso mangoes and Tilak, Sangli “Turmeric City”, Kolhapur’s tambda rassa, Solapuri chaddars and Nashik wine.

### Fixed

- The data build now retries when the connection to Wikipedia or Wikidata drops.

- Gaps found by comparing with the official Maharashtra Tourism district pages and Wikipedia's Maharashtra lists. Each new entry was then checked against its own Wikipedia article:
  - 379 places, up from 313. Every district now has at least 2.
  - New places include Jalna Fort, Ambad (Matsyodari Devi), Poharadevi, Aner Dam sanctuary, Mumbai landmarks, and Sahyadri trek forts.
- 37 foods, up from 16, including GI-tagged local produce shown with a 🧺 badge.
- 74 “known for” facts across 34 districts, each linked to the Wikipedia article that backs it, for example Bhandara “Brass City”, Gondia “Rice City”, Nagpur oranges and Warli painting.

- 313 places to visit, up from 155, found from each district's Wikipedia categories and tourism sections. Includes pilgrim towns such as Kalamb (Shree Chintamani Ganesh temple), Alandi, Dehu, Paithan and Tuljapur, and all five Ashtavinayak temples in Pune district.
- District pages show what the district is known for (29 districts, each fact checked against the district's article), with an About tab and a filter for places by taluka.
- Places show a verified highlight and their taluka where known. Search also finds highlights and “known for”.
- `npm run suggest` lists candidate places for a district.

- Interactive map of the 36 districts, with region highlighting, on the home, region, district and place pages.
- A page for every place, with:
  - a photo and the Wikipedia summary
  - key facts
  - nearby places with distances
  - food to try nearby
  - share and map buttons
- "My trip": save places with ♡, kept in the browser only.
- "Near me", "Surprise me", photo carousels, and a keyboard shortcut (/) for search.

### Changed

- New look: photo cards, banners, a hero section, a sticky header and smoother transitions, in light and dark mode.

- 155 places to visit, up from 45, and every district now has at least one. They include more forts, caves, museums, lakes, wildlife sanctuaries and places of worship.
- Each place and dish now records its photo (the freely licensed lead image of its Wikipedia article) and district centres record coordinates, ready for the map.
- The data build also checks that every coordinate lies inside Maharashtra.

### Added

- First version.
  - Browse 5 regions, 36 districts and 358 talukas.
  - 45 places to visit and 16 dishes, each linked to its source.
  - Search in English or Marathi, filters by place type, and shareable links.
- Data build script that checks every entry against Wikidata and Wikipedia.

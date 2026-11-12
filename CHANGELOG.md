# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

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

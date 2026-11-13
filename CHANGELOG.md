# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- More photos on place pages: up to 12 freely licensed photos from the place’s Wikimedia Commons category (277 places), each credited with its author and licence and linked to its file page. Only the category name is sent to Commons; the Commons categories come from Wikidata (`npm run commons` updates just these).
- History trails: walk through a story on the map, in time order. A timeline slider (or Play) moves through the stops while the map draws the route so far. Four trails with 32 stops: Shivaji Maharaj and Swarajya, Saints and the Wari, Caves to the Peshwas, and the Road to freedom and equality, in English and Marathi. Every event and year is checked against one sentence of the cited Wikipedia article (`npm run trails`). Place pages link to their trail stop (“In history”), and stops can be shared, listened to, or planned as a trip.
- Listen mode: a 🔊 Listen button on every place page and on each trip day reads it aloud in English or Marathi, using the device’s own voice (nothing is recorded or sent). It has pause, stop and three speeds. Without a Marathi or Hindi voice it reads in English and says so; Wikipedia text is always read with an English voice.

### Fixed

- Carousel arrows: they no longer show on rows where every card already fits (such as History trails on a wide screen), and each arrow turns off at its end of the row.

## [1.1.0] - 2026-11-13

Planning: where to go, and when. See what is at its best each month, get a ready getaway from where you start, and check the weather for each day of a trip.

### Added

- Weather-aware trips: every trip, circuit and planned getaway has a start date. Within 16 days, each day shows its forecast (Open-Meteo, coordinates only). Heavy rain on a day with forts, trails or beaches, or extreme heat, gets a warning; a rainy outdoor day can be swapped with a drier, less outdoor day in one tap. Trips further ahead get a monsoon note when relevant.
- Plan a getaway (`#/plan`): from a starting district or your location, for 1–4 days, with interests (forts, temples, nature, heritage) and a month. It picks places within reach, boosts ones in season, keeps the trip compact and orders it from the start, with food along the way, festivals that month, Save and Share. There is a “Plan a getaway” button on the home page.
- Where to go, and when: a “Best this month” carousel on the home page, a month picker (`#/seasons`), and “Best time” on place pages. 12 sourced seasons: monsoon waterfalls and treks, Kaas flowers, winter birds at Bhigwan and Karnala, summer hill stations, and Nagpur oranges. The data build checks each claim against the place’s own article.
- Places and dishes that have no Wikipedia article of their own:
  - 59 places from the official district websites (Washim, Gadchiroli, Parbhani, Palghar, Jalgaon, Nanded, Bhandara and more), for example the Swinging Towers of Farkande, Wadadham Fossil Park, Banjara Virasat museum, Tipeshwar sanctuary and Matsyodari Devi temple.
  - 13 dishes mentioned in Wikipedia articles: Saoji cuisine, tarri poha, Santra barfi, tambda and pandhara rassa, Puneri and Kolhapuri misal, kothimbir vadi, varan bhaat, mande, patodi, sev bhaji and sabudana khichdi.
  - Each cites its source page, which the build checks names it. 28 have free Commons photos, and 52 places have OpenStreetMap locations.
- 466 places (from 407) and 52 dishes (from 39).

## [1.0.0] - 2026-11-12

The first public release: a guide to Maharashtra, region by region, in English and मराठी. Every place, dish, festival and fact is checked against Wikipedia or Wikidata before it is added.

### Explore

- 5 regions, 36 districts and 358 talukas, browsable by region, district and taluka.
- An interactive map of all 36 districts, with region highlighting, on every page.
- 407 places to visit: forts, caves, temples, pilgrim towns, museums, lakes, waterfalls, wildlife sanctuaries, hill stations, beaches and well-known villages.
  - Most have photos, and places can be filtered by type and by taluka.
  - Each place is linked to its taluka where the source says so.
- What each district is known for: 88 facts across all 36 districts, each linked to its source. For example, Yavatmal “Cotton City” and Nagpur “Orange City”.
- Verified highlights for places such as Kalamb’s Shree Chintamani Ganesh temple.

### Places

- A page for every place, with:
  - a photo and the Wikipedia summary
  - key facts and its position on the map
  - nearby places with distances
  - a 4-day weather forecast from Open-Meteo
  - festivals held there
  - food to try nearby, with share, map and directions buttons

### Food

- 39 dishes and GI-tagged local produce, such as Sangli turmeric, Mahabaleshwar strawberries and Jalgaon bananas.
- “Top-rated spots on Google Maps” for every dish, and “Top-rated restaurants nearby” for every place. These are plain Maps links: Google shows its own current ratings, and nothing is copied or stored.

### Trips and circuits

- My trip: save places with ♡ (kept in the browser only). My trip then:
  - plans them into the shortest route and splits it into days
  - opens Google Maps directions for each day or the whole trip
  - can be shared as a link a friend can open and save.
- 7 circuits, each planned like a trip:
  - Ashtavinayak, in traditional order
  - the 5 Jyotirlingas of Maharashtra
  - Sade Teen Shakti Peeth
  - Maratha Military Landscapes (UNESCO)
  - In the footsteps of Shivaji Maharaj
  - UNESCO World Heritage Sites
  - the Pandharpur Wari
- 13 festivals and fairs, with their timing and places, including the Wari, Ganeshotsav, Navaratri, the Nashik Kumbh (2027) and the Sarangkheda horse fair. They appear on a month-by-month calendar, and the home page shows what’s coming up.
- Near me, Surprise me, and a “Suggest a place” form for anything missing.

### Language, search and sharing

- A मराठी / English switch for the whole interface. The choice is remembered, and Marathi browsers start in Marathi.
- Search in English or Marathi that forgives spelling and small typos, and understands Marathi words typed in English letters. Examples: Kolhapoor, ajnta, “Shivneri killa”, “fort pune”.
- Shareable links for every page, and a preview card with an image when shared.

### Under the hood

- `npm run data` rebuilds the data from Wikidata and Wikipedia and refuses to save if any claim can’t be verified.
- `npm run suggest` lists candidate places for a district.
- Photos load at the size they’re shown, and the code is split so browsers can keep React and the data cached across updates.
- No API keys, accounts, cookies or tracking.

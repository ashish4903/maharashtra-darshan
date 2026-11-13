---
name: add-place-or-food
description: Use when adding, fixing or removing a place to visit, a dish, a region mapping or a district rename in Maharashtra Darshan. Covers finding the source, editing data/curated.json and running the checks.
---

# Add a place or dish

Every entry must come from a source. Nothing is written from memory.

## 1. Find the Wikipedia article

The entry needs an English Wikipedia article that has a Wikidata item. Search for the exact title (the API is rate-limited: one request at a time, and send a User-Agent naming this repo):

```
https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=<words>
```

If no article exists, add it under `extras` instead (see below).

## 2. Edit `data/curated.json`

Add one line, keeping the region grouping:

- Place: `{ "wiki": "<exact title>", "kind": "<kind>", "district": "<district>" }`
  - `kind` is one of `fort`, `temple`, `pilgrimage`, `heritage`, `nature`, `hill-station`, `beach`, `town`, `village` (see `KINDS` in `src/lib/catalogue.js`).
  - `district` is the short name, for example `Pune` or `Chhatrapati Sambhajinagar`.
  - Optional `"highlight"` and `"evidence"`: a short reason to visit, for example `"Shree Chintamani Ganesh temple"`. `evidence` must appear in the place's own article.
- Known for: `"knownFor": { "<district>": [{ "label": "...", "evidence": "...", "source": "<optional article>" }] }`. `evidence` must appear in the district's Wikipedia article, or in `source` when given (for example `"Nagpur orange"`).
- Dish entries may add `"type": "produce"` for GI-tagged produce such as Sangli turmeric.
- Other tourism sites can be used to spot what is missing. Never copy their text or photos; every entry still needs a Wikipedia article.

To find candidates, run `npm run suggest -- <District>`. It lists articles from the district's Wikipedia categories and its tourism sections. Many famous temples have no article of their own; use the town's article and give it a highlight, as with `Kalamb, Yavatmal`.
- Dish: `{ "wiki": "<exact title>", "region": "<region id or statewide>", "district": "<optional>", "evidence": "<word>" }`
  - `evidence` must be a word the article itself uses to tie the dish to that place, such as `Kolhapur` or `Konkan`.

## Without a Wikipedia article (`extras`)

- Place: `{ "name", "district", "kind", "source": "<official district page or Wikipedia article that mentions it>", "evidence": "<words on that page>", "geocode": "<place, town>", "photo": "<Commons file, optional>" }`
- Dish: `{ "name", "region", "district"?, "source", "evidence", "about"?, "photo"? }`
- Prefer the district site's own tourist-place page (`https://<district>.gov.in/en/tourist-place/...`). Find photos with a Commons search; the build rejects files that aren't freely licensed.
- Write `about` only from what the source says.

## 3. Run `npm run data`

The script fails and writes nothing if:
- the article doesn't exist
- the place isn't in that district according to Wikidata or the article
- the evidence word isn't in the article
- an entry is a duplicate, for example a title that redirects to one already listed

Fix or remove the entry. **Never loosen a check to make it pass.**

## 4. Check and commit

- Run `npm test`, `npm run lint` and `npm run build`.
- Review the diff of `src/data/maharashtra.json` with `git diff --stat` and a targeted `git diff -U0 | grep '"name"'`. Don't read the whole file.
- Add a line under "Unreleased" in `CHANGELOG.md`.
- Commit on a new branch and open a PR.

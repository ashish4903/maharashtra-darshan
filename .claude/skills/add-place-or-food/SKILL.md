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

If no article exists, don't add the entry. Tell the user instead.

## 2. Edit `data/curated.json`

Add one line, keeping the region grouping:

- Place: `{ "wiki": "<exact title>", "kind": "<kind>", "district": "<district>" }`
  - `kind` is one of `fort`, `temple`, `pilgrimage`, `heritage`, `nature`, `hill-station`, `beach`, `town`, `village` (see `KINDS` in `src/lib/catalogue.js`).
  - `district` is the short name, for example `Pune` or `Chhatrapati Sambhajinagar`.
  - Optional `"highlight"` and `"evidence"`: a short reason to visit, for example `"Shree Chintamani Ganesh temple"`. `evidence` must appear in the place's own article.
- Known for: `"knownFor": { "<district>": [{ "label": "...", "evidence": "..." }] }`. `evidence` must appear in the district's Wikipedia article.

To find candidates, run `npm run suggest -- <District>`. It lists articles from the district's Wikipedia categories and its tourism sections. Many famous temples have no article of their own; use the town's article and give it a highlight, as with `Kalamb, Yavatmal`.
- Dish: `{ "wiki": "<exact title>", "region": "<region id or statewide>", "district": "<optional>", "evidence": "<word>" }`
  - `evidence` must be a word the article itself uses to tie the dish to that place, such as `Kolhapur` or `Konkan`.

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

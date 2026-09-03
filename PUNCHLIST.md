# Punch list

Status for the first slice of the recipe site (static HTML/JS on GitHub Pages, SQLite in the browser).

## Done in this pass

- [x] Recipe list (summary rows: placeholder thumbnail, source, italic title; sort/filter bar; count)
- [x] Recipe detail (title, optional metadata, grouped ingredients with bold quantities, numbered instructions)
- [x] Edit flow with three sections: **INFO**, **INSTRUCTIONS**, **INGREDIENTS** (dot pager, Cancel/Save)
- [x] INFO: title required; empty optional fields omitted on display (description, yield, times, categories, favorite, source, URL, notes)
- [x] INSTRUCTIONS: `[group]` headers; newlines preserved as HTML line breaks; steps numbered
- [x] INGREDIENTS: `[group]` headers; line parser for quantity / unit / remainder; common units + abbreviations; scale-aware singular/plural
- [x] Export menu → **COOK NOW** scale picker (¼, ⅓, ½, 1, 2, 3, 4)
- [x] Scaled cook view (quantities emphasized; unit pluralization when recognized)
- [x] SQLite via sql.js (WASM); schema + parsed ingredient/instruction tables; IndexedDB persistence
- [x] Seed recipe: **Banana Punch**
- [x] Import all `data/*.txt` recipes into SQLite seed (`js/seed-data.js`; regenerate with `node scripts/import-recipes.js`)
- [x] Image URL field + list/detail thumbnails when present
- [x] Sidebar shell (search, nav placeholders, last-synced)
- [x] Desktop RWD: wider centered layout, Pepperplate-style header/subnav, recipe detail two-column with actions + live scale sidebar
- [x] Disclaimer page + footer link (non-affiliation / personal non-commercial)
- [x] Soft cookie password gate (static-host deterrent only; passphrase is not a true secret)
- [x] Host recipe photos locally under `images/` instead of Pepperplate CDN URLs

## Deferred (called out in screenshots or likely next)

- [ ] Recipe photos (camera / upload) instead of fork-and-knife placeholder
- [ ] Menus, Planner, Shopping List (and “add to shopping list” scale modal)
- [ ] Settings and real sync (GitHub Pages cannot write a shared SQLite file for all visitors)
- [ ] SET TIMER on the cook screen
- [ ] Richer FILTER (categories, source, time) beyond search + favorites
- [ ] Delete recipe / duplicate recipe
- [ ] **Mobile edit → file export → local repo update:** from GitHub Pages, export an edited recipe as a downloadable `data/*.txt` (Pepperplate-compatible) and/or Share via the Web Share API; on a computer, overwrite the matching file under `data/`, run `node scripts/import-recipes.js`, then commit/push. Optional follow-ons: export all dirty recipes, or a full `seed-data.js` / `recipes.json` dump
- [ ] Export/share extras: print stylesheet, clipboard copy, download `.sqlite`
- [ ] Instruction text that also scales embedded quantities (cook view currently scales the ingredient list only)

## Hosting notes

GitHub Pages is static, so SQLite runs **in the browser** (sql.js). Edits are saved in **this browser’s IndexedDB**, not in the GitHub repo. Seed data ships with the site. Until GitHub auth/API write-back exists, treat **downloadable recipe files** as the bridge from phone edits back into the repo (see deferred export item above).

The site password cookie is a **soft gate** only. Anyone can still open public files such as `js/seed-data.js` or `images/*` directly from the repo or Pages URL.

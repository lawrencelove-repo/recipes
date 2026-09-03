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

## Deferred (called out in screenshots or likely next)

- [ ] Recipe photos (camera / upload) instead of fork-and-knife placeholder
- [ ] Menus, Planner, Shopping List (and “add to shopping list” scale modal)
- [ ] Settings and real sync (GitHub Pages cannot write a shared SQLite file for all visitors)
- [ ] SET TIMER on the cook screen
- [ ] Richer FILTER (categories, source, time) beyond search + favorites
- [ ] Delete recipe / duplicate recipe
- [ ] Export/share as text, print stylesheet, or download `.sqlite`
- [ ] Instruction text that also scales embedded quantities (cook view currently scales the ingredient list only)

## Hosting notes

GitHub Pages is static, so SQLite runs **in the browser** (sql.js). Edits are saved in **this browser’s IndexedDB**, not in the GitHub repo. Seed data ships with the site; a later export-to-file step can make backups commitable.

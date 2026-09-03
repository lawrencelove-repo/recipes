# Recipes

Personal recipe collection site: static HTML/JS for GitHub Pages, with SQLite (sql.js) in the browser.

## Quick start

Serve the project folder over HTTP (not as a `file://` page):

```bash
python -m http.server 8099
```

Open `http://127.0.0.1:8099/`, enter the site password, and use the app.

On GitHub Pages, the same files are hosted from the repo root.

## Recipe photos: desktop vs mobile

Photos can live in two places:

| Kind | Example | Where it lives | Survives a new browser / device? |
|------|---------|----------------|----------------------------------|
| **Repo file** | `images/ceviche-de-cameron.jpg` | Git repository (and thus GitHub Pages) | Yes — anyone with the site gets the file |
| **Browser upload** | `local:42` | This browser’s IndexedDB only | No — only that browser on that device |

### Desktop (local server or desktop browser)

On **Edit → INFO**, desktop shows a **PHOTO** control:

1. **Choose photo** — picks an image from your computer. It is compressed and stored in **this browser’s IndexedDB**, and the recipe is pointed at a `local:{id}` reference.
2. List and detail views show that photo while you use the same browser.
3. **Download for repo** — downloads the stored JPEG so you can commit it into the project (see below).
4. **IMAGE PATH / URL** — optional path like `images/my-recipe.jpg` or an external URL. Use this after you add a file under `images/` in git.

Uploads do **not** write into the GitHub repo by themselves. GitHub Pages is static; the browser cannot save files into `images/` on the server.

### Mobile

Mobile edit does **not** include the photo file picker (desktop-only UI). You can still:

- Set an **IMAGE PATH / URL** to an existing `images/...` file or a URL
- View photos that are already in the repo or that were uploaded earlier on desktop in **that same mobile browser** (if you uploaded there)

For adding new photos you plan to keep long-term, use a **desktop** browser (or your local server), then use **Download for repo**.

## “Download for repo” — how it works

**Problem:** A photo you upload in the app is only in IndexedDB. Refreshing on another phone, clearing site data, or a fresh clone of the repo will not include that upload.

**Solution:** Turn the browser-stored photo into a normal project file:

1. On desktop, open the recipe → **Edit**.
2. If needed, **Choose photo** and **Save**.
3. Click **Download for repo**. Your browser downloads a `.jpg` (named from the recipe title + id).
4. Move that file into the project’s `images/` folder (e.g. `images/banana-punch-12.jpg`).
5. In the recipe’s **IMAGE PATH / URL** field, set:
   ```text
   images/banana-punch-12.jpg
   ```
6. **Save** the recipe in the app (updates your local SQLite/IndexedDB).
7. Also update the matching `data/YourRecipe.txt` `Image:` line if you use the text import pipeline, then regenerate seed data:
   ```bash
   node scripts/import-recipes.js
   ```
8. Commit and push `images/...`, `data/...`, and `js/seed-data.js` as needed.

After that, the photo is part of the site for every visitor/device, not only the browser that uploaded it.

You can leave `local:{id}` for personal-only drafts; use **Download for repo** when you want the image in git and on GitHub Pages.

## Related docs

- [PUNCHLIST.md](PUNCHLIST.md) — feature status and deferred work  
- [DISCLAIMER.md](DISCLAIMER.md) — non-affiliation / personal-use notice  

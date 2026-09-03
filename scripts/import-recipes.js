/**
 * Parse Pepperplate-style data/*.txt into js/seed-data.js for the static site.
 * Run: node scripts/import-recipes.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data");
const OUT = path.join(ROOT, "js", "seed-data.js");

const HEADER_KEYS = {
  Title: "title",
  Description: "description",
  Source: "source",
  "Original URL": "url",
  Yield: "yield",
  Active: "active_time",
  Total: "total_time",
  Image: "image",
  Notes: "notes",
  Categories: "categories",
  Enabled: "enabled",
};

function stripLeadingIndent(line) {
  return line.replace(/^\t+/, "").replace(/^ {2,}/, "");
}

function parseRecipeText(raw, filename) {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const recipe = {
    title: "",
    description: "",
    source: "",
    url: "",
    yield: "",
    active_time: "",
    total_time: "",
    image: "",
    notes: "",
    categories: "",
    favorite: 0,
    enabled: null,
    ingredients_raw: "",
    instructions_raw: "",
    _file: filename,
  };

  let mode = "headers";
  const ingredientLines = [];
  const instructionLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const header = line.match(/^([A-Za-z][A-Za-z0-9 ]*):[ \t]*(.*)$/);

    if (mode === "headers" && header) {
      const key = header[1];
      const rest = header[2] || "";
      if (key === "Ingredients") {
        mode = "ingredients";
        if (rest.trim()) ingredientLines.push(stripLeadingIndent(rest));
        continue;
      }
      if (key === "Instructions") {
        mode = "instructions";
        if (rest.trim()) instructionLines.push(stripLeadingIndent(rest));
        continue;
      }
      const mapped = HEADER_KEYS[key];
      if (mapped) {
        recipe[mapped] = rest.trim();
        continue;
      }
    }

    if (mode === "ingredients") {
      if (/^Instructions:[ \t]*/.test(line)) {
        mode = "instructions";
        const after = line.replace(/^Instructions:[ \t]*/, "");
        if (after.trim()) instructionLines.push(stripLeadingIndent(after));
        continue;
      }
      ingredientLines.push(stripLeadingIndent(line));
      continue;
    }

    if (mode === "instructions") {
      instructionLines.push(stripLeadingIndent(line));
    }
  }

  // Trim trailing blank lines; keep internal blank lines for grouping
  while (ingredientLines.length && ingredientLines[ingredientLines.length - 1].trim() === "") {
    ingredientLines.pop();
  }
  while (instructionLines.length && instructionLines[instructionLines.length - 1].trim() === "") {
    instructionLines.pop();
  }

  recipe.ingredients_raw = ingredientLines.join("\n");
  recipe.instructions_raw = instructionLines.join("\n");
  recipe.title = (recipe.title || "").trim();
  if (!recipe.title) {
    recipe.title = path.basename(filename, ".txt").replace(/_/g, " ");
  }

  const hasIngredients = recipe.ingredients_raw.split("\n").some((line) => {
    const t = line.trim();
    return t && !/^\[.+\]\s*$/.test(t);
  });
  if (recipe.enabled == null || recipe.enabled === "") {
    recipe.enabled = hasIngredients ? 1 : 0;
  } else {
    const v = String(recipe.enabled).trim().toLowerCase();
    recipe.enabled = v === "0" || v === "false" || v === "no" || v === "off" ? 0 : 1;
  }

  return recipe;
}

function main() {
  const files = fs
    .readdirSync(DATA)
    .filter((f) => f.toLowerCase().endsWith(".txt"))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const recipes = [];
  const warnings = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(DATA, file), "utf8");
    const recipe = parseRecipeText(raw, file);
    if (!recipe.ingredients_raw.trim() && !recipe.instructions_raw.trim()) {
      warnings.push(`${file}: empty ingredients and instructions`);
    }
    if (!recipe.instructions_raw.trim()) {
      warnings.push(`${file}: no instructions`);
    }
    recipes.push(recipe);
  }

  // Prefer richer duplicate by title: keep all rows (user may want both),
  // but log same-title pairs.
  const byTitle = new Map();
  for (const r of recipes) {
    const k = r.title.toLowerCase();
    if (!byTitle.has(k)) byTitle.set(k, []);
    byTitle.get(k).push(r._file);
  }
  for (const [title, filesFor] of byTitle) {
    if (filesFor.length > 1) warnings.push(`duplicate title "${title}": ${filesFor.join(", ")}`);
  }

  // Drop exact content duplicates (e.g. BananaPunch.txt + BananaPunch_2.txt).
  // Prefer the copy that has an image, then the longer body.
  const seen = new Map();
  const deduped = [];
  for (const r of recipes) {
    const key = [
      r.title.trim().toLowerCase(),
      r.ingredients_raw.trim(),
      r.instructions_raw.trim(),
    ].join("\n---\n");
    const prev = seen.get(key);
    if (!prev) {
      seen.set(key, r);
      deduped.push(r);
      continue;
    }
    const score = (x) => (x.image ? 100000 : 0) + (x.ingredients_raw.length + x.instructions_raw.length);
    if (score(r) > score(prev)) {
      const idx = deduped.indexOf(prev);
      deduped[idx] = r;
      seen.set(key, r);
      warnings.push(`replaced weaker duplicate of "${r.title}" (${prev._file} → ${r._file})`);
    } else {
      warnings.push(`skipped duplicate of "${r.title}" (${r._file})`);
    }
  }

  // Keep stubs that share a title with a fuller recipe only if content differs.
  // If a stub has the same title as a non-empty recipe but empty body, drop the stub.
  const nonemptyTitles = new Set(
    deduped
      .filter((r) => r.ingredients_raw.trim() || r.instructions_raw.trim())
      .map((r) => r.title.trim().toLowerCase())
  );
  const filtered = deduped.filter((r) => {
    const empty = !r.ingredients_raw.trim() && !r.instructions_raw.trim();
    if (empty && nonemptyTitles.has(r.title.trim().toLowerCase())) {
      warnings.push(`skipped empty stub "${r.title}" (${r._file})`);
      return false;
    }
    return true;
  });

  const payload = filtered.map(({ _file, ...rest }) => rest);
  payload.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

  const disabledCount = payload.filter((r) => !r.enabled).length;
  const json = JSON.stringify(payload, null, 2);
  const out = `/* Auto-generated by scripts/import-recipes.js — do not edit by hand */\nwindow.RECIPE_SEED = ${json};\n`;
  fs.writeFileSync(OUT, out, "utf8");

  console.log(`Wrote ${payload.length} recipes to ${path.relative(ROOT, OUT)} (${disabledCount} disabled)`);
  if (warnings.length) {
    console.log(`Warnings (${warnings.length}):`);
    for (const w of warnings.slice(0, 40)) console.log(" -", w);
    if (warnings.length > 40) console.log(` - ...and ${warnings.length - 40} more`);
  }
}

main();

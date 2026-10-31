/**
 * Generate a deterministic D1 seed import from the GitHub Pages recipe seed.
 * Usage: node scripts/generate-d1-seed.cjs
 * Produces migrations/0002_seed_recipes.sql. Run only on an empty D1 database.
 * Do not use to overwrite recipes already edited in D1.
 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const seedSource = fs.readFileSync(path.join(root, "js/seed-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(seedSource, sandbox, { timeout: 3000, filename: "seed-data.js" });
const recipes = sandbox.window.RECIPE_SEED;
if (!Array.isArray(recipes) || !recipes.length) throw new Error("No seed recipes found");
const fields = [
  "id","title","description","yield","active_time","total_time","categories",
  "favorite","enabled","source","url","notes","image","instructions_raw",
  "ingredients_raw","created_at","updated_at"
];
const sqlValue = (v) => v === null || v === undefined ? "NULL" :
  typeof v === "number" ? String(v) : "'" + String(v).replace(/'/g,"''") + "'";
const timestamp = "2026-10-01T00:00:00.000Z"; // Stable import timestamp; not an actual edit date.
const statements = [
  "-- Generated from js/seed-data.js; import only into an empty recipes table.",
  "-- Recipe IDs match the browser seed's insertion order.",
  "INSERT INTO recipes (" + fields.join(", ") + ") VALUES"
];
const rows = recipes.map((r,i) => {
  if (!r.title || !String(r.title).trim()) throw new Error("Missing title at seed index " + i);
  const record = { ...r, id: i+1, favorite: r.favorite ? 1 : 0,
    enabled: r.enabled === undefined || r.enabled === null ? 1 : r.enabled ? 1 : 0,
    created_at: timestamp, updated_at: timestamp };
  return "(" + fields.map(f => sqlValue(record[f] ?? (f === "id" ? i+1 : ""))).join(", ") + ")";
});
statements.push(rows.join(",\n") + ";");
const target = path.join(root, "migrations/0002_seed_recipes.sql");
fs.writeFileSync(target, statements.join("\n") + "\n");
console.log("Generated D1 seed migration for " + recipes.length + " recipes at " + target);

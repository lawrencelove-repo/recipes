-- Cloudflare D1 schema; preserves existing browser-SQLite recipe IDs.
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  yield TEXT NOT NULL DEFAULT '',
  active_time TEXT NOT NULL DEFAULT '',
  total_time TEXT NOT NULL DEFAULT '',
  categories TEXT NOT NULL DEFAULT '',
  favorite INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  instructions_raw TEXT NOT NULL DEFAULT '',
  ingredients_raw TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_recipes_updated ON recipes(updated_at);
CREATE TABLE IF NOT EXISTS instruction_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  heading TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS instruction_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES instruction_groups(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  trailing_breaks INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS ingredient_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  heading TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES ingredient_groups(id) ON DELETE CASCADE,
  quantity REAL,
  quantity_raw TEXT NOT NULL DEFAULT '',
  rest TEXT NOT NULL DEFAULT '',
  unit_singular TEXT,
  unit_plural TEXT,
  unit_original TEXT,
  unit_index INTEGER,
  unit_token_count INTEGER,
  unit_is_abbrev INTEGER NOT NULL DEFAULT 0,
  recognized INTEGER NOT NULL DEFAULT 0,
  raw_line TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_instruction_groups_recipe ON instruction_groups(recipe_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_instruction_steps_group ON instruction_steps(group_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_ingredient_groups_recipe ON ingredient_groups(recipe_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_ingredients_group ON ingredients(group_id, sort_order);

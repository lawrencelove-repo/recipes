(function (global) {
  const IDB_NAME = "recipes-sqlite";
  const IDB_STORE = "kv";
  const DB_KEY = "database";
  // Bump when schema or shipped seed set changes (forces local DB rebuild).
  const SCHEMA_VERSION = 3;

  const SEED_SQL = `
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      yield TEXT NOT NULL DEFAULT '',
      active_time TEXT NOT NULL DEFAULT '',
      total_time TEXT NOT NULL DEFAULT '',
      categories TEXT NOT NULL DEFAULT '',
      favorite INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      instructions_raw TEXT NOT NULL DEFAULT '',
      ingredients_raw TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS instruction_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      heading TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS instruction_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      trailing_breaks INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES instruction_groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ingredient_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      heading TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
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
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES ingredient_groups(id) ON DELETE CASCADE
    );

    INSERT INTO meta (key, value) VALUES ('schema_version', '${SCHEMA_VERSION}');
  `;

  let SQL = null;
  let db = null;

  function openIdb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet(key) {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }

  async function idbSet(key, value) {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function exec(sql, params) {
    db.run(sql, params || []);
  }

  function query(sql, params) {
    const stmt = db.prepare(sql);
    if (params) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  function queryOne(sql, params) {
    return query(sql, params)[0] || null;
  }

  function persistParsed(recipeId, recipe) {
    exec("DELETE FROM instruction_steps WHERE recipe_id = ?", [recipeId]);
    exec("DELETE FROM instruction_groups WHERE recipe_id = ?", [recipeId]);
    exec("DELETE FROM ingredients WHERE recipe_id = ?", [recipeId]);
    exec("DELETE FROM ingredient_groups WHERE recipe_id = ?", [recipeId]);

    const iGroups = global.RecipeParser.parseInstructionsText(recipe.instructions_raw);
    iGroups.forEach((g, gi) => {
      exec(
        "INSERT INTO instruction_groups (recipe_id, heading, sort_order) VALUES (?, ?, ?)",
        [recipeId, g.heading, gi]
      );
      const gid = queryOne("SELECT last_insert_rowid() AS id").id;
      g.steps.forEach((step, si) => {
        exec(
          "INSERT INTO instruction_steps (recipe_id, group_id, body, trailing_breaks, sort_order) VALUES (?, ?, ?, ?, ?)",
          [recipeId, gid, step.text, step.trailingBreaks || 0, si]
        );
      });
    });

    const gGroups = global.RecipeParser.parseIngredientsText(recipe.ingredients_raw);
    gGroups.forEach((g, gi) => {
      exec(
        "INSERT INTO ingredient_groups (recipe_id, heading, sort_order) VALUES (?, ?, ?)",
        [recipeId, g.heading, gi]
      );
      const gid = queryOne("SELECT last_insert_rowid() AS id").id;
      g.items.forEach((item, ii) => {
        exec(
          `INSERT INTO ingredients (
            recipe_id, group_id, quantity, quantity_raw, rest,
            unit_singular, unit_plural, unit_original, unit_index, unit_token_count,
            unit_is_abbrev, recognized, raw_line, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recipeId,
            gid,
            item.quantity,
            item.quantityRaw || "",
            item.rest || "",
            item.unit ? item.unit.def.singular : null,
            item.unit ? item.unit.def.plural : null,
            item.unit ? item.unit.original : null,
            item.unit ? item.unit.index : null,
            item.unit ? item.unit.tokenCount : null,
            item.unit && item.unit.isAbbrev ? 1 : 0,
            item.recognized || 0,
            item.raw,
            ii,
          ]
        );
      });
    });
  }

  async function persist() {
    const data = db.export();
    await idbSet(DB_KEY, data);
  }

  function seedRecipes() {
    const seed = Array.isArray(global.RECIPE_SEED) ? global.RECIPE_SEED : [];
    for (const recipe of seed) insertRecipe(recipe, false);
  }

  function createFreshDb() {
    db = new SQL.Database();
    db.run("PRAGMA foreign_keys = ON");
    db.run(SEED_SQL);
    seedRecipes();
  }

  function insertRecipe(recipe) {
    const ts = nowIso();
    exec(
      `INSERT INTO recipes (
        title, description, yield, active_time, total_time, categories, favorite,
        source, url, notes, image, instructions_raw, ingredients_raw, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipe.title,
        recipe.description || "",
        recipe.yield || "",
        recipe.active_time || "",
        recipe.total_time || "",
        recipe.categories || "",
        recipe.favorite ? 1 : 0,
        recipe.source || "",
        recipe.url || "",
        recipe.notes || "",
        recipe.image || "",
        recipe.instructions_raw || "",
        recipe.ingredients_raw || "",
        ts,
        ts,
      ]
    );
    const id = queryOne("SELECT last_insert_rowid() AS id").id;
    persistParsed(id, recipe);
    return id;
  }

  function rowToRecipe(row) {
    if (!row) return null;
    return {
      ...row,
      favorite: !!row.favorite,
    };
  }

  const api = {
    async init() {
      SQL = await initSqlJs({
        locateFile: (file) =>
          `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/${file}`,
      });
      const saved = await idbGet(DB_KEY);
      if (saved) {
        db = new SQL.Database(new Uint8Array(saved));
        db.run("PRAGMA foreign_keys = ON");
        const ver = queryOne("SELECT value FROM meta WHERE key = 'schema_version'");
        if (!ver || Number(ver.value) !== SCHEMA_VERSION) {
          db.close();
          createFreshDb();
          await persist();
        }
      } else {
        createFreshDb();
        await persist();
      }
    },

    listRecipes({ search = "", sort = "title", favoritesOnly = false } = {}) {
      let sql = "SELECT * FROM recipes WHERE 1=1";
      const params = [];
      if (favoritesOnly) sql += " AND favorite = 1";
      if (search.trim()) {
        sql +=
          " AND (title LIKE ? OR source LIKE ? OR categories LIKE ? OR notes LIKE ? OR description LIKE ?)";
        const q = "%" + search.trim() + "%";
        params.push(q, q, q, q, q);
      }
      if (sort === "source") sql += " ORDER BY source COLLATE NOCASE, title COLLATE NOCASE";
      else if (sort === "updated") sql += " ORDER BY updated_at DESC";
      else if (sort === "title-desc") sql += " ORDER BY title COLLATE NOCASE DESC";
      else sql += " ORDER BY title COLLATE NOCASE";
      return query(sql, params).map(rowToRecipe);
    },

    getRecipe(id) {
      return rowToRecipe(queryOne("SELECT * FROM recipes WHERE id = ?", [id]));
    },

    getIngredientGroups(recipeId) {
      const groups = query(
        "SELECT * FROM ingredient_groups WHERE recipe_id = ? ORDER BY sort_order",
        [recipeId]
      );
      return groups.map((g) => ({
        heading: g.heading,
        items: query(
          "SELECT * FROM ingredients WHERE group_id = ? ORDER BY sort_order",
          [g.id]
        ).map((row) => ({
          quantity: row.quantity,
          quantityRaw: row.quantity_raw,
          rest: row.rest,
          unit: row.unit_singular
            ? {
                index: row.unit_index,
                tokenCount: row.unit_token_count,
                def: { singular: row.unit_singular, plural: row.unit_plural },
                isAbbrev: !!row.unit_is_abbrev,
                original: row.unit_original,
              }
            : null,
          recognized: row.recognized,
          raw: row.raw_line,
        })),
      }));
    },

    getInstructionGroups(recipeId) {
      const groups = query(
        "SELECT * FROM instruction_groups WHERE recipe_id = ? ORDER BY sort_order",
        [recipeId]
      );
      return groups.map((g) => ({
        heading: g.heading,
        steps: query(
          "SELECT * FROM instruction_steps WHERE group_id = ? ORDER BY sort_order",
          [g.id]
        ).map((s) => ({
          text: s.body,
          trailingBreaks: s.trailing_breaks,
        })),
      }));
    },

    async saveRecipe(recipe) {
      const title = (recipe.title || "").trim();
      if (!title) throw new Error("Title is required.");
      const payload = {
        ...recipe,
        title,
        description: recipe.description || "",
        yield: recipe.yield || "",
        active_time: recipe.active_time || "",
        total_time: recipe.total_time || "",
        categories: recipe.categories || "",
        favorite: recipe.favorite ? 1 : 0,
        source: recipe.source || "",
        url: recipe.url || "",
        notes: recipe.notes || "",
        image: recipe.image || "",
        instructions_raw: recipe.instructions_raw || "",
        ingredients_raw: recipe.ingredients_raw || "",
      };
      if (recipe.id) {
        exec(
          `UPDATE recipes SET
            title=?, description=?, yield=?, active_time=?, total_time=?, categories=?,
            favorite=?, source=?, url=?, notes=?, image=?, instructions_raw=?, ingredients_raw=?,
            updated_at=?
           WHERE id=?`,
          [
            payload.title,
            payload.description,
            payload.yield,
            payload.active_time,
            payload.total_time,
            payload.categories,
            payload.favorite,
            payload.source,
            payload.url,
            payload.notes,
            payload.image,
            payload.instructions_raw,
            payload.ingredients_raw,
            nowIso(),
            recipe.id,
          ]
        );
        persistParsed(recipe.id, payload);
        await persist();
        return recipe.id;
      }
      const id = insertRecipe(payload);
      await persist();
      return id;
    },

    async toggleFavorite(id, value) {
      exec("UPDATE recipes SET favorite = ?, updated_at = ? WHERE id = ?", [
        value ? 1 : 0,
        nowIso(),
        id,
      ]);
      await persist();
    },

    countRecipes(filter) {
      return this.listRecipes(filter).length;
    },

    lastSyncedLabel() {
      const row = queryOne("SELECT MAX(updated_at) AS t FROM recipes");
      if (!row || !row.t) return "Never";
      const d = new Date(row.t);
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    },
  };

  global.RecipeDB = api;
})(window);

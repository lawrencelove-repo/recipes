(function () {
  const SCALE_OPTIONS = [
    { label: "¼", value: 0.25 },
    { label: "⅓", value: 1 / 3 },
    { label: "½", value: 0.5 },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
  ];

  const ICONS = {
    menu: '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
    pencil: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
    export: '<svg viewBox="0 0 24 24"><path d="M14 5v2h3.59L13 11.59 14.41 13 19 8.41V12h2V5h-7zM5 7v12h12v-5h-2v3H7V9h3V7H5z"/></svg>',
    fork: '<svg viewBox="0 0 24 24"><path d="M8.1 13.34 3.91 9.16a4 4 0 0 1 0-5.66l.09-.09 1.06 1.06-.09.09a2.5 2.5 0 0 0 0 3.54l2.83 2.83 1.06-1.06-2.83-2.83a2.5 2.5 0 0 0-3.54 0L1.41 7.12A4 4 0 0 1 7.05 1.5l4.18 4.18 1.41-1.41 1.41 1.41-7.95 7.95zm12.73-1.41L16.66 16.1l1.41 1.41-1.41 1.41-4.24-4.24 7.07-7.07a2.5 2.5 0 0 0 0-3.54l.09-.09 1.06 1.06-.09.09a4 4 0 0 1 0 5.66zM11 19l-4 4H3v-4l4-4 4 4z"/></svg>',
    cup: '<svg viewBox="0 0 24 24"><path d="M6 3h10v2H6V3zm1 3h8l1 13H6L7 6zm11 2h1a3 3 0 0 1 0 6h-1V8z"/></svg>',
    plate: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 .01 20.01A10 10 0 0 0 12 2zm0 2a8 8 0 1 1-.01 16.01A8 8 0 0 1 12 4zm0 3a5 5 0 1 0 .01 10.01A5 5 0 0 0 12 7z"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><path d="M7 2h2v2h6V2h2v2h3v16H4V4h3V2zm13 6H4v10h16V8z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58-2-3.46-2.39.96a7.07 7.07 0 0 0-1.63-.94L14.5 2h-5l-.65 2.04c-.59.22-1.14.54-1.63.94l-2.39-.96-2 3.46 2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.5l2 3.46 2.39-.96c.49.4 1.04.72 1.63.94L9.5 22h5l.65-2.04c.59-.22 1.14-.54 1.63-.94l2.39.96 2-3.46-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 17.3 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M6 7h12v2H6V7zm2 3h8l-1 10H9L8 10zm3-6h2l1 2h4v2H6V6h4l1-2z"/></svg>',
    print: '<svg viewBox="0 0 24 24"><path d="M18 3H6v4h12V3zM6 14H4v-4h16v4h-2v6H6v-6zm2 0v4h8v-4H8z"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M18 16.1a2.9 2.9 0 0 0-2 .8l-7.1-4.1a3 3 0 0 0 0-1.6L16 7.1a3 3 0 1 0-1-1.7L7.9 9.5a3 3 0 1 0 0 5l7.1 4.1a2.9 2.9 0 1 0 3-2.5z"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"/></svg>',
    cart: '<svg viewBox="0 0 24 24"><path d="M7 18a2 2 0 1 0 .01 4.01A2 2 0 0 0 7 18zm10 0a2 2 0 1 0 .01 4.01A2 2 0 0 0 17 18zM7.2 14h9.9l2.1-8H6.1L5.2 3H2v2h2l3.2 9.4L6.1 17H19v-2H7.2z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.25"/><path d="M15.5 15.5L21 21"/></svg>',
  };

  const GATE_COOKIE = "recipes_gate";
  // SHA-256 of the site gate passphrase. This is only a soft deterrent on a static host.
  const GATE_HASH =
    "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";

  const state = {
    view: "list",
    recipeId: null,
    drawer: false,
    exportOpen: false,
    sortOpen: false,
    filterOpen: false,
    cookOpen: false,
    search: "",
    sort: "title",
    favoritesOnly: false,
    enabledMode: "enabled",
    scalePick: 1,
    cookScale: 1,
    detailScale: 1,
    suggestIndex: -1,
    suggestOpen: false,
    editTab: 0,
    editDraft: null,
    editError: "",
    toast: "",
    placeholder: "",
    gateError: "",
  };

  const app = document.getElementById("app");

  function h(s) {
    return RecipeParser.escapeHtml(s == null ? "" : s);
  }

  function getCookie(name) {
    const parts = document.cookie.split(";").map((p) => p.trim());
    for (const part of parts) {
      const i = part.indexOf("=");
      if (i === -1) continue;
      if (part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1));
    }
    return "";
  }

  function isAuthed() {
    return getCookie(GATE_COOKIE) === "1";
  }

  function setGateCookie() {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${GATE_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  async function passwordMatches(password) {
    const data = new TextEncoder().encode(String(password || ""));
    const digest = await crypto.subtle.digest("SHA-256", data);
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex === GATE_HASH;
  }

  function siteFooter() {
    return `<footer class="site-footer">
      <a href="#/disclaimer" data-go="#/disclaimer">Disclaimer</a>
      <span>Personal, non-commercial use · Unofficial / not affiliated with Pepperplate</span>
    </footer>`;
  }

  function formatShortDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  }

  function getSearchSuggestions(query) {
    const q = String(query || "")
      .trim()
      .toLowerCase();
    if (!q) return [];
    return RecipeDB.listRecipes({
      sort: "title",
      enabledMode: state.enabledMode,
    })
      .filter((r) => r.title.toLowerCase().includes(q))
      .slice(0, 10);
  }

  function searchSuggestHtml() {
    if (!state.suggestOpen) return "";
    const items = getSearchSuggestions(state.search);
    if (!items.length) {
      return `<ul class="search-suggest" role="listbox"><li class="search-suggest-empty">No matching recipes</li></ul>`;
    }
    return `<ul class="search-suggest" role="listbox">${items
      .map(
        (r, i) =>
          `<li role="option" class="${i === state.suggestIndex ? "on" : ""}" data-act="suggest" data-id="${r.id}">${h(r.title)}</li>`
      )
      .join("")}</ul>`;
  }

  function deskHeader(active) {
    const nav = [
      ["#/", "recipes", "list"],
      ["#/menus", "menus", "soon"],
      ["#/planner", "planner", "soon"],
      ["#/shopping", "shopping", "soon"],
    ];
    return `
      <header class="desk-header desktop-only">
        <div class="desk-brand">Recipes</div>
        <div class="desk-nav-row">
          <nav class="desk-nav">
            ${nav
              .map(
                ([href, label, key]) =>
                  `<a href="${href}" class="desk-nav-link ${active === key ? "on" : ""}" data-go="${href}">${label}</a>`
              )
              .join("")}
          </nav>
          <div class="desk-search" data-search-wrap>
            <div class="desk-search-row">
              <input type="search" placeholder="Search recipes" value="${h(state.search)}" data-act="desk-search" autocomplete="off" aria-autocomplete="list">
              <button type="button" class="desk-search-btn" data-act="search-submit" title="Search">${ICONS.search}</button>
            </div>
            ${searchSuggestHtml()}
          </div>
        </div>
      </header>`;
  }

  function deskSubnav(kind) {
    if (kind === "list") {
      return `<nav class="desk-subnav desktop-only">
        <a href="#/" class="on" data-go="#/">recipe list</a>
        <a href="#/recipe/new" data-go="#/recipe/new">manual recipe</a>
      </nav>`;
    }
    if (kind === "detail") {
      return `<nav class="desk-subnav desktop-only">
        <a href="#/" data-go="#/">recipe list</a>
        <a href="#/recipe/new" data-go="#/recipe/new">manual recipe</a>
      </nav>`;
    }
    return `<nav class="desk-subnav desktop-only">
      <a href="#/" data-go="#/">recipe list</a>
    </nav>`;
  }

  function detailAside(recipe) {
    const added = formatShortDate(recipe.created_at);
    const updated = formatShortDate(recipe.updated_at);
    const scale = state.detailScale || 1;
    return `
      <aside class="detail-aside desktop-only">
        <button type="button" class="aside-action" data-act="soon" data-soon="Shopping list">
          ${ICONS.cart}<span>ADD TO SHOPPING LIST</span>
        </button>
        <button type="button" class="aside-action ${recipe.favorite ? "on" : ""}" data-act="toggle-favorite">
          ${ICONS.star}<span>FAVORITE</span>
        </button>
        <button type="button" class="aside-action ${recipe.enabled ? "" : "on"}" data-act="toggle-enabled">
          ${ICONS.check}<span>${recipe.enabled ? "DISABLE RECIPE" : "ENABLE RECIPE"}</span>
        </button>
        <button type="button" class="aside-action" data-act="soon" data-soon="Delete recipe">
          ${ICONS.trash}<span>DELETE RECIPE</span>
        </button>
        <button type="button" class="aside-action" data-act="print">
          ${ICONS.print}<span>PRINT RECIPE</span>
        </button>
        <button type="button" class="aside-action" data-act="share">
          ${ICONS.share}<span>SHARE</span>
        </button>
        ${
          recipe.url
            ? `<a class="aside-action" href="${h(recipe.url)}" target="_blank" rel="noopener">
                ${ICONS.link}<span>VIEW ORIGINAL RECIPE</span>
              </a>`
            : `<button type="button" class="aside-action" disabled>
                ${ICONS.link}<span>VIEW ORIGINAL RECIPE</span>
              </button>`
        }
        <div class="aside-meta">
          ${added ? `<div><strong>Recipe Added:</strong> ${h(added)}</div>` : ""}
          ${updated ? `<div><strong>Updated:</strong> ${h(updated)}</div>` : ""}
        </div>
        <div class="aside-scale">
          <div class="aside-scale-head">
            <span>SCALE RECIPE</span>
            <button type="button" class="text-link" data-act="cook-now">COOK NOW</button>
          </div>
          <div class="scale-row desk-scale">
            ${SCALE_OPTIONS.map(
              (o) =>
                `<button type="button" class="${Math.abs(o.value - scale) < 1e-9 ? "on" : ""}" data-act="detail-scale" data-scale="${o.value}">${o.label}</button>`
            ).join("")}
          </div>
        </div>
      </aside>`;
  }

  function routeFromHash() {
    const hash = (location.hash || "#/").replace(/^#/, "");
    const parts = hash.split("?").shift().split("/").filter(Boolean);
    const params = new URLSearchParams(hash.split("?")[1] || "");
    if (!parts.length) return { view: "list" };
    if (parts[0] === "new") return { view: "edit", recipeId: null };
    if (parts[0] === "recipe" && parts[1] === "new") return { view: "edit", recipeId: null };
    if (parts[0] === "recipe" && parts[1]) {
      const id = Number(parts[1]);
      if (parts[2] === "edit") return { view: "edit", recipeId: id };
      if (parts[2] === "cook") return { view: "cook", recipeId: id, scale: Number(params.get("scale") || 1) };
      return { view: "detail", recipeId: id };
    }
    if (["menus", "planner", "shopping", "settings"].includes(parts[0])) {
      return { view: "soon", name: parts[0] };
    }
    if (parts[0] === "disclaimer") return { view: "disclaimer" };
    return { view: "list" };
  }

  function go(hash) {
    location.hash = hash;
  }

  window.addEventListener("hashchange", () => {
    const r = routeFromHash();
    state.view = r.view;
    state.recipeId = r.recipeId || null;
    state.drawer = false;
    state.exportOpen = false;
    state.sortOpen = false;
    state.filterOpen = false;
    state.cookOpen = false;
    state.suggestOpen = false;
    state.suggestIndex = -1;
    if (r.view === "cook") state.cookScale = r.scale || 1;
    if (r.view === "detail") state.detailScale = 1;
    if (r.view === "edit") {
      state.editTab = 0;
      state.editError = "";
      state.editDraft = loadDraft(r.recipeId);
    }
    render();
  });

  function loadDraft(id) {
    if (!id) {
      return {
        title: "",
        description: "",
        yield: "",
        active_time: "",
        total_time: "",
        categories: "",
        favorite: false,
        enabled: true,
        source: "",
        url: "",
        notes: "",
        image: "",
        instructions_raw: "",
        ingredients_raw: "",
      };
    }
    const r = RecipeDB.getRecipe(id);
    return { ...r, enabled: r.enabled !== false };
  }

  function metaBits(recipe) {
    const bits = [];
    if (recipe.source) bits.push({ k: "Source", v: recipe.source.toUpperCase() });
    if (recipe.yield) bits.push({ k: "Yield", v: recipe.yield });
    if (recipe.active_time) bits.push({ k: "Active", v: recipe.active_time });
    if (recipe.total_time) bits.push({ k: "Total", v: recipe.total_time });
    if (recipe.categories) bits.push({ k: "Categories", v: recipe.categories });
    return bits;
  }

  function renderIngredients(groups, scale, scaledStyle) {
    return groups
      .map((g) => {
        const heading = g.heading ? `<div class="group-heading">${h(g.heading)}</div>` : "";
        const items = g.items
          .map((item) => {
            const parsed = {
              quantity: item.quantity,
              rest: item.rest,
              unit: item.unit,
              raw: item.raw,
            };
            const fmt = RecipeParser.formatIngredientParts(parsed, scale, { scaledStyle });
            if (fmt.qtyHtml) {
              return `<li><span class="qty${fmt.scaled ? " qty-scaled" : ""}">${fmt.qtyHtml}</span><span class="ing-rest">${fmt.restHtml}</span></li>`;
            }
            return `<li class="ing-plain">${fmt.html}</li>`;
          })
          .join("");
        return `${heading}<ul class="ing-list">${items}</ul>`;
      })
      .join("");
  }

  function renderInstructions(groups) {
    let n = 1;
    return groups
      .map((g) => {
        const heading = g.heading ? `<div class="group-heading">${h(g.heading)}</div>` : "";
        const steps = g.steps
          .map((step) => {
            const html = RecipeParser.instructionStepToHtml(step);
            const extraLead = "<br>".repeat(step.leadingBreaks || 0);
            return `<li>${extraLead}<span class="n">${n++}.</span> <span>${html}</span></li>`;
          })
          .join("");
        return `${heading}<ol class="steps">${steps}</ol>`;
      })
      .join("");
  }

  function listIndexKey(title) {
    const ch = String(title || "")
      .trim()
      .charAt(0)
      .toLocaleUpperCase();
    // A–Z keep their letter; everything else (digits, symbols, etc.) maps to "#".
    if (ch >= "A" && ch <= "Z") return ch;
    return "#";
  }

  // Index rail order: A–Z, then "#" last (omitted when the list has no such titles).
  const ALPHA_INDEX_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

  function alphaIndexHtml(presentKeys) {
    const letters = ALPHA_INDEX_LETTERS.filter((letter) => presentKeys.has(letter));
    if (!letters.length) return "";
    return `<nav class="alpha-index mobile-only" aria-label="Alphabetical index" data-alpha-index>
      ${letters
        .map(
          (letter) =>
            `<button type="button" class="alpha-index-letter has" data-act="jump-index" data-letter="${letter}">${letter}</button>`
        )
        .join("")}
    </nav>`;
  }

  function imageThumbHtml(imageRef, className) {
    if (!imageRef) {
      return `<div class="thumb">${ICONS.fork}</div>`;
    }
    if (RecipeImages.isLocalRef(imageRef)) {
      return `<div class="thumb has-img"><img alt="" data-local-image="${h(imageRef)}" hidden></div>`;
    }
    return `<div class="thumb has-img"><img src="${h(imageRef)}" alt="" loading="lazy"></div>`;
  }

  function imageHeroHtml(imageRef) {
    if (!imageRef) {
      return `<div class="detail-hero detail-hero-empty desktop-only">${ICONS.fork}</div>`;
    }
    if (RecipeImages.isLocalRef(imageRef)) {
      return `<div class="detail-hero has-photo"><img alt="" data-local-image="${h(imageRef)}"></div>`;
    }
    return `<div class="detail-hero"><img src="${h(imageRef)}" alt=""></div>`;
  }

  function editPhotoPreviewSrc(draft) {
    if (draft._pendingPhotoPreview) return draft._pendingPhotoPreview;
    if (draft._removePhoto) return "";
    if (RecipeImages.isLocalRef(draft.image)) return "";
    return draft.image || "";
  }

  function editPhotoBlock(draft) {
    const previewSrc = editPhotoPreviewSrc(draft);
    const hasLocal = !draft._removePhoto && RecipeImages.isLocalRef(draft.image);
    const hasPreview = !!(previewSrc || hasLocal || draft._pendingPhoto);
    return `
      <div class="field field-span-all photo-field desktop-only">
        <label>PHOTO</label>
        <div class="photo-editor">
          <div class="photo-preview ${hasPreview ? "has-photo" : ""}">
            ${
              previewSrc
                ? `<img src="${h(previewSrc)}" alt="">`
                : hasLocal
                  ? `<img alt="" data-local-image="${h(draft.image)}">`
                  : `<div class="photo-placeholder">${ICONS.fork}<span>No photo</span></div>`
            }
          </div>
          <div class="photo-actions">
            <label class="photo-file-btn">
              Choose photo
              <input type="file" accept="image/*" data-act="pick-photo" hidden>
            </label>
            ${
              hasPreview
                ? `<button type="button" class="btn-secondary" data-act="clear-photo">Remove photo</button>`
                : ""
            }
            ${
              hasLocal && draft.id
                ? `<button type="button" class="btn-secondary" data-act="download-photo">Download for repo</button>`
                : ""
            }
            <p class="photo-help">Desktop upload is stored in this browser. Use “Download for repo” then save under <code>images/</code> and set the path below if you want it in git.</p>
          </div>
        </div>
        <label class="photo-url-label">IMAGE PATH / URL</label>
        <input name="image" value="${h(draft._removePhoto ? "" : draft.image || "")}" placeholder="images/my-recipe.jpg or https://…">
      </div>
      <div class="field field-span-all mobile-only">
        <label>IMAGE PATH / URL</label>
        <input name="image" value="${h(draft._removePhoto ? "" : draft.image || "")}" placeholder="images/my-recipe.jpg">
        <p class="photo-help">Photo upload is available on desktop.</p>
      </div>`;
  }

  function recipeListItemHtml(r, extraAttrs) {
    return `
      <li data-go="#/recipe/${r.id}" class="${r.enabled ? "" : "is-disabled"}" ${extraAttrs || ""}>
        ${imageThumbHtml(r.image)}
        <div>
          ${r.source ? `<p class="source">${h(r.source)}</p>` : ""}
          <p class="title">${h(r.title)}${r.enabled ? "" : '<span class="disabled-badge">Disabled</span>'}</p>
        </div>
      </li>`;
  }

  function orderRecipesForIndex(recipes) {
    // Keep "#" after Z for A–Z, and before Z for Z–A, matching the rail.
    if (state.sort === "title") {
      const letters = recipes.filter((r) => listIndexKey(r.title) !== "#");
      const other = recipes.filter((r) => listIndexKey(r.title) === "#");
      return letters.concat(other);
    }
    if (state.sort === "title-desc") {
      const letters = recipes.filter((r) => listIndexKey(r.title) !== "#");
      const other = recipes.filter((r) => listIndexKey(r.title) === "#");
      return other.concat(letters);
    }
    return recipes;
  }

  function renderIndexedRecipeList(recipes) {
    if (!recipes.length) {
      return { html: `<li style="cursor:default">No recipes yet.</li>`, present: new Set() };
    }

    const alphabetical = state.sort === "title" || state.sort === "title-desc";
    const ordered = alphabetical ? orderRecipesForIndex(recipes) : recipes;
    const present = new Set();
    const seenAnchor = new Set();
    let lastKey = null;
    let html = "";

    for (const r of ordered) {
      const key = listIndexKey(r.title);
      present.add(key);

      if (alphabetical) {
        if (key !== lastKey) {
          html += `<li class="list-section" id="list-index-${key === "#" ? "num" : key}" data-index-key="${key}">${key}</li>`;
          lastKey = key;
        }
        html += recipeListItemHtml(r);
      } else {
        const attrs = !seenAnchor.has(key)
          ? `id="list-index-${key === "#" ? "num" : key}" data-index-key="${key}"`
          : "";
        seenAnchor.add(key);
        html += recipeListItemHtml(r, attrs);
      }
    }

    return { html, present };
  }

  function jumpToIndexLetter(letter) {
    const id = letter === "#" ? "list-index-num" : `list-index-${letter}`;
    const el =
      app.querySelector(`#${typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id}`) ||
      app.querySelector(`[data-index-key="${letter}"]`);
    if (!el) return;
    const scroller = app.querySelector(".list-shell .list");
    if (scroller && scroller.contains(el)) {
      const top = el.offsetTop - scroller.offsetTop;
      scroller.scrollTo({ top, behavior: "auto" });
      return;
    }
    el.scrollIntoView({ block: "start", behavior: "auto" });
  }

  function listView() {
    const recipes = RecipeDB.listRecipes({
      search: state.search,
      sort: state.sort,
      favoritesOnly: state.favoritesOnly,
      enabledMode: state.enabledMode,
    });
    const count = recipes.length;
    const indexed = renderIndexedRecipeList(recipes);

    return `
      <div class="screen screen-list">
        ${drawerHtml()}
        ${deskHeader("list")}
        ${deskSubnav("list")}
        <header class="topbar mobile-only">
          <button class="icon-btn" data-act="drawer">${ICONS.menu}</button>
          <h1>Recipes</h1>
          <button class="icon-btn" data-go="#/recipe/new">${ICONS.plus}</button>
        </header>
        <div class="subbar">
          <button data-act="sort">SORT</button>
          <span class="sep"></span>
          <button data-act="filter">FILTER</button>
          <span class="count">${count} recipe${count === 1 ? "" : "s"}</span>
        </div>
        ${state.sortOpen ? sortSheet() : ""}
        ${state.filterOpen ? filterSheet() : ""}
        <div class="list-shell">
          <ul class="list">${indexed.html}</ul>
          ${alphaIndexHtml(indexed.present)}
        </div>
        ${siteFooter()}
      </div>`;
  }

  function sortSheet() {
    const opts = [
      ["title", "Title A–Z"],
      ["title-desc", "Title Z–A"],
      ["source", "Source"],
      ["updated", "Recently updated"],
    ];
    return `<div class="sheet">${opts
      .map(
        ([k, lab]) =>
          `<button class="${state.sort === k ? "on" : ""}" data-act="set-sort" data-sort="${k}">${lab}</button>`
      )
      .join("")}</div>`;
  }

  function filterSheet() {
    return `<div class="sheet">
      <button class="${state.favoritesOnly ? "on" : ""}" data-act="toggle-fav-filter">Favorites only</button>
      <button class="${state.enabledMode === "enabled" ? "on" : ""}" data-act="set-enabled-mode" data-mode="enabled">Enabled recipes</button>
      <button class="${state.enabledMode === "disabled" ? "on" : ""}" data-act="set-enabled-mode" data-mode="disabled">Disabled recipes</button>
      <button class="${state.enabledMode === "all" ? "on" : ""}" data-act="set-enabled-mode" data-mode="all">All recipes</button>
      <button data-act="clear-filter">Reset filters</button>
    </div>`;
  }

  function drawerHtml() {
    if (!state.drawer) return "";
    const nav = [
      ["#/", "Recipes", ICONS.cup, true],
      ["#/menus", "Menus", ICONS.plate, false],
      ["#/planner", "Planner", ICONS.cal, false],
      ["#/shopping", "Shopping List", ICONS.check, false],
      ["#/settings", "Settings", ICONS.gear, false],
    ];
    return `<div class="drawer">
      <div class="drawer-panel">
        <div class="drawer-search" data-search-wrap>
          <input type="search" placeholder="Search Recipes" value="${h(state.search)}" data-act="search" autocomplete="off" aria-autocomplete="list">
          ${searchSuggestHtml()}
        </div>
        ${nav
          .map(
            ([href, label, icon, home]) =>
              `<button class="nav-item ${home && state.view === "list" ? "active" : ""}" data-go="${href}">${icon}${label}</button>`
          )
          .join("")}
        <div class="drawer-foot">Last synced ${h(RecipeDB.lastSyncedLabel())}</div>
      </div>
      <div class="drawer-scrim" data-act="drawer-close"></div>
    </div>`;
  }

  function detailView() {
    const recipe = RecipeDB.getRecipe(state.recipeId);
    if (!recipe) return `<div class="screen"><p class="soon">Recipe not found.</p></div>`;
    const bits = metaBits(recipe);
    const meta = bits.length
      ? `<div class="meta-row mobile-only">${bits
          .map((b, i) => `${i ? `<span class="pipe">|</span>` : ""}<span class="k">${h(b.k)}</span><span class="pipe">|</span><span class="v">${h(b.v)}</span>`)
          .join("")}</div>`
      : "";
    const ings = RecipeDB.getIngredientGroups(recipe.id);
    const inst = RecipeDB.getInstructionGroups(recipe.id);
    const scale = state.detailScale || 1;
    const scaled = Math.abs(scale - 1) > 1e-9;
    return `
      <div class="screen screen-detail">
        ${deskHeader("list")}
        ${deskSubnav("detail")}
        <header class="topbar mobile-only">
          <button class="icon-btn circle" data-go="#/">${ICONS.back}</button>
          <h1>Recipes</h1>
          <div class="topbar-actions">
            <button class="icon-btn" data-go="#/recipe/${recipe.id}/edit">${ICONS.pencil}</button>
            <button class="icon-btn" data-act="export">${ICONS.export}</button>
          </div>
        </header>
        ${state.exportOpen ? `<div class="menu mobile-only"><button data-act="cook-now">COOK NOW</button></div>` : ""}
        <div class="detail detail-layout">
          <div class="detail-main">
            <div class="detail-top">
              <div class="detail-heading">
                ${recipe.source ? `<p class="detail-source">${h(recipe.source)}</p>` : ""}
                <h2>
                  <span>${h(recipe.title)}</span>
                  <button type="button" class="icon-btn inline-edit desktop-only" data-go="#/recipe/${recipe.id}/edit" title="Edit">${ICONS.pencil}</button>
                </h2>
                ${recipe.enabled ? "" : `<p class="disabled-banner">This recipe is disabled and hidden from the main list.</p>`}
              </div>
              ${imageHeroHtml(recipe.image)}
            </div>
            ${meta}
            <div class="mobile-only detail-enable-row">
              <button type="button" class="text-link" data-act="toggle-enabled">${recipe.enabled ? "Disable recipe" : "Enable recipe"}</button>
            </div>
            ${recipe.description ? `<p class="prose">${RecipeParser.newlinesToBr(recipe.description)}</p>` : ""}
            <div class="section-label">
              INGREDIENTS
              <button type="button" class="icon-btn inline-edit desktop-only" data-go="#/recipe/${recipe.id}/edit" title="Edit ingredients">${ICONS.pencil}</button>
            </div>
            ${renderIngredients(ings, scale, scaled)}
            <div class="section-label">
              INSTRUCTIONS
              <button type="button" class="icon-btn inline-edit desktop-only" data-go="#/recipe/${recipe.id}/edit" title="Edit instructions">${ICONS.pencil}</button>
            </div>
            ${renderInstructions(inst)}
            ${recipe.notes ? `<div class="section-label">NOTES</div><p class="prose notes">${RecipeParser.newlinesToBr(recipe.notes)}</p>` : ""}
            ${recipe.url ? `<div class="section-label mobile-only">SOURCE URL</div><p class="prose mobile-only"><a href="${h(recipe.url)}" target="_blank" rel="noopener">${h(recipe.url)}</a></p>` : ""}
          </div>
          ${detailAside(recipe)}
        </div>
        ${state.cookOpen ? cookModal(recipe) : ""}
        ${siteFooter()}
      </div>`;
  }

  function cookModal(recipe) {
    const idx = SCALE_OPTIONS.findIndex((o) => Math.abs(o.value - state.scalePick) < 1e-9);
    const pct = (idx / (SCALE_OPTIONS.length - 1)) * 100;
    return `<div class="overlay">
      <div>
        <div class="modal">
          <p class="eyebrow">COOK NOW</p>
          <h3>SCALE RECIPE</h3>
          <div class="scale-row">
            ${SCALE_OPTIONS.map(
              (o) =>
                `<button class="${Math.abs(o.value - state.scalePick) < 1e-9 ? "on" : ""}" data-act="scale" data-scale="${o.value}">${o.label}</button>`
            ).join("")}
          </div>
          <div class="scale-track"><div class="line"></div><div class="thumb" style="left:${pct}%"></div></div>
          <button class="btn-primary" data-act="cook-go">COOK NOW</button>
        </div>
        <button class="btn-cancel" data-act="cook-cancel">CANCEL</button>
      </div>
    </div>`;
  }

  function cookView() {
    const recipe = RecipeDB.getRecipe(state.recipeId);
    if (!recipe) return `<div class="screen"><p class="soon">Recipe not found.</p></div>`;
    const ings = RecipeDB.getIngredientGroups(recipe.id);
    const inst = RecipeDB.getInstructionGroups(recipe.id);
    const scaled = Math.abs(state.cookScale - 1) > 1e-9;
    return `
      <div class="screen">
        <header class="topbar">
          <button class="icon-btn circle" data-go="#/recipe/${recipe.id}">${ICONS.back}</button>
          <span></span>
          <button class="topbar-link" data-go="#/recipe/${recipe.id}">FINISH</button>
        </header>
        <button class="timer-bar" data-act="timer">SET TIMER</button>
        <div class="detail">
          <h2>${h(recipe.title)}</h2>
          <div class="section-label">INGREDIENTS</div>
          ${renderIngredients(ings, state.cookScale, scaled)}
          <div class="section-label">INSTRUCTIONS</div>
          ${renderInstructions(inst)}
        </div>
        ${siteFooter()}
      </div>`;
  }

  function editView() {
    const d = state.editDraft;
    const titles = ["INFO", "INSTRUCTIONS", "INGREDIENTS"];
    const hints = [
      "",
      `<div class="hintbar mobile-only"><span>Use [ ] for group headers</span><span>Example: [For Crust]</span></div>`,
      `<div class="hintbar mobile-only"><span>Use [ ] for group headers</span><span>Example: [For Crust]</span></div>`,
    ];
    let body = "";
    if (state.editTab === 0) {
      body = `<form class="edit-form" data-form="info">
        ${state.editError ? `<div class="error">${h(state.editError)}</div>` : ""}
        <div class="field field-span-all"><label>TITLE</label><input name="title" value="${h(d.title)}" required></div>
        <div class="field field-span-all"><label>DESCRIPTION</label><textarea name="description">${h(d.description)}</textarea></div>
        <div class="field"><label>YIELD</label><input name="yield" value="${h(d.yield)}"></div>
        <div class="field"><label>ACTIVE TIME</label><input name="active_time" value="${h(d.active_time)}"></div>
        <div class="field"><label>TOTAL TIME</label><input name="total_time" value="${h(d.total_time)}"></div>
        <div class="field-row field-span-all">
          <div class="field"><label>CATEGORIES</label><input name="categories" value="${h(d.categories)}"></div>
          <div class="field fav-field">
            <label>FAVORITE</label>
            <button type="button" class="toggle ${d.favorite ? "on" : ""}" data-act="fav"><i></i></button>
          </div>
          <div class="field fav-field">
            <label>ENABLED</label>
            <button type="button" class="toggle ${d.enabled !== false ? "on" : ""}" data-act="enabled"><i></i></button>
          </div>
        </div>
        <div class="field"><label>SOURCE</label><input name="source" value="${h(d.source)}"></div>
        <div class="field field-span-2"><label>URL</label><input name="url" value="${h(d.url)}"></div>
        ${editPhotoBlock(d)}
        <div class="field field-span-all"><label>NOTES</label><textarea name="notes">${h(d.notes)}</textarea></div>
      </form>`;
    } else if (state.editTab === 1) {
      body = `
        <p class="edit-hint desktop-only">Use [ ] for group headers — example: [For Crust]. Line breaks are kept when displayed.</p>
        <textarea class="editor-text" data-field="instructions_raw">${h(d.instructions_raw)}</textarea>`;
    } else {
      body = `
        <p class="edit-hint desktop-only">Use [ ] for group headers — example: [For Crust]. One ingredient per line.</p>
        <textarea class="editor-text" data-field="ingredients_raw">${h(d.ingredients_raw)}</textarea>`;
    }
    return `
      <div class="screen screen-edit">
        ${deskHeader("list")}
        ${deskSubnav("detail")}
        <header class="topbar mobile-only">
          <button class="ghost" data-act="cancel-edit">CANCEL</button>
          <h1>${titles[state.editTab]}</h1>
          <button class="save" data-act="save-edit">SAVE</button>
        </header>
        <div class="desk-edit desktop-only">
          <div class="desk-edit-toolbar">
            <div>
              <h1>Edit recipe</h1>
              <p class="desk-edit-sub">${h(d.title || "Untitled recipe")}</p>
            </div>
            <div class="desk-edit-actions">
              <button type="button" class="btn-secondary" data-act="cancel-edit">Cancel</button>
              <button type="button" class="btn-primary-inline" data-act="save-edit">Save</button>
            </div>
          </div>
          <div class="desk-edit-tabs">
            ${titles
              .map(
                (t, i) =>
                  `<button type="button" class="${state.editTab === i ? "on" : ""}" data-act="tab" data-tab="${i}">${t}</button>`
              )
              .join("")}
          </div>
        </div>
        ${hints[state.editTab]}
        <div class="edit-body">${body}</div>
        <div class="pager mobile-only">
          ${[0, 1, 2].map((i) => `<button class="${state.editTab === i ? "on" : ""}" data-act="tab" data-tab="${i}"></button>`).join("")}
        </div>
        ${siteFooter()}
      </div>`;
  }

  function disclaimerView() {
    return `
      <div class="screen">
        ${drawerHtml()}
        ${deskHeader("soon")}
        ${deskSubnav("list")}
        <header class="topbar mobile-only">
          <button class="icon-btn circle" data-go="#/">${ICONS.back}</button>
          <h1>Disclaimer</h1>
          <span></span>
        </header>
        <article class="disclaimer">
          <h2>Disclaimer</h2>
          <p>This site is an unofficial personal recipe collection for <strong>private, non-commercial</strong> use.</p>
          <p>It is <strong>not affiliated with, endorsed by, or connected to Pepperplate</strong> (or any related company). The workflow and layout were inspired by Pepperplate’s product, but this project is independent.</p>
          <p>Recipe text and photographs on this site are the site owner’s own materials (or are used with permission). Photos previously hosted on Pepperplate were originally taken and uploaded by the site owner and are now stored with this project.</p>
          <p>This project is provided <strong>as-is</strong>, without warranty. If you found this repository by accident, please treat it as a personal notebook rather than a public service or commercial product.</p>
          <p class="disclaimer-note">Access to the recipe app may be limited by a simple password cookie. On a static GitHub Pages host that gate is only a soft deterrent, not strong security.</p>
          <p><a href="#/" data-go="#/">Back to recipes</a></p>
        </article>
        ${siteFooter()}
      </div>`;
  }

  function gateView() {
    return `
      <div class="gate">
        <form class="gate-card" data-form="gate">
          <h1>Recipes</h1>
          <p>Personal collection. Enter the site password to continue.</p>
          ${state.gateError ? `<div class="gate-error">${h(state.gateError)}</div>` : ""}
          <label>
            <span>Password</span>
            <input type="password" name="password" autocomplete="current-password" required autofocus>
          </label>
          <button type="submit" class="btn-primary">Enter</button>
          <p class="gate-disclaimer"><a href="#/disclaimer" data-go="#/disclaimer">Disclaimer</a></p>
        </form>
      </div>`;
  }

  function soonView(name) {
    const labels = { menus: "Menus", planner: "Planner", shopping: "Shopping List", settings: "Settings" };
    return `
      <div class="screen">
        ${drawerHtml()}
        ${deskHeader("soon")}
        ${deskSubnav("list")}
        <header class="topbar mobile-only">
          <button class="icon-btn" data-act="drawer">${ICONS.menu}</button>
          <h1>${h(labels[name] || name)}</h1>
          <span></span>
        </header>
        <div class="soon">
          <h2>${h(labels[name] || name)}</h2>
          <p>Not built yet — see the punch list.</p>
        </div>
        ${siteFooter()}
      </div>`;
  }

  let dbReady = false;

  async function ensureDb() {
    if (dbReady) return;
    await RecipeDB.init();
    dbReady = true;
  }

  function render() {
    const r = routeFromHash();
    state.view = r.view;

    if (!isAuthed() && r.view !== "disclaimer") {
      app.innerHTML = gateView();
      return;
    }

    if (r.view === "disclaimer") {
      app.innerHTML = disclaimerView();
      RecipeImages.hydrate(app).catch(() => {});
      return;
    }

    if (!dbReady) {
      app.innerHTML = `<div class="loading">Recipes</div>`;
      ensureDb()
        .then(() => render())
        .catch((err) => {
          app.innerHTML = `<div class="soon"><h2>Could not start</h2><p>${h(err.message)}</p></div>`;
        });
      return;
    }

    if (r.view === "list") app.innerHTML = listView();
    else if (r.view === "detail") app.innerHTML = detailView();
    else if (r.view === "edit") {
      if (!state.editDraft) state.editDraft = loadDraft(r.recipeId);
      app.innerHTML = editView();
    } else if (r.view === "cook") {
      state.cookScale = r.scale || 1;
      app.innerHTML = cookView();
    } else app.innerHTML = soonView(r.name);

    RecipeImages.hydrate(app).catch(() => {});
  }

  function captureEditFields() {
    const form = app.querySelector("[data-form=info]");
    if (form) {
      const fd = new FormData(form);
      state.editDraft.title = fd.get("title") || "";
      state.editDraft.description = fd.get("description") || "";
      state.editDraft.yield = fd.get("yield") || "";
      state.editDraft.active_time = fd.get("active_time") || "";
      state.editDraft.total_time = fd.get("total_time") || "";
      state.editDraft.categories = fd.get("categories") || "";
      state.editDraft.source = fd.get("source") || "";
      state.editDraft.url = fd.get("url") || "";
      state.editDraft.notes = fd.get("notes") || "";
      // Prefer a non-empty image path if multiple inputs exist (desktop + mobile).
      const imageInputs = form.querySelectorAll('input[name="image"]');
      let imageVal = "";
      imageInputs.forEach((input) => {
        if (input.value.trim()) imageVal = input.value.trim();
      });
      if (!imageVal && imageInputs.length) imageVal = imageInputs[0].value || "";
      if (!state.editDraft._pendingPhoto) {
        state.editDraft.image = imageVal;
      }
    }
    const ta = app.querySelector("[data-field]");
    if (ta) state.editDraft[ta.getAttribute("data-field")] = ta.value;
  }

  app.addEventListener("submit", async (e) => {
    const form = e.target.closest("[data-form=gate]");
    if (!form) return;
    e.preventDefault();
    const password = new FormData(form).get("password") || "";
    const ok = await passwordMatches(password);
    if (!ok) {
      state.gateError = "Incorrect password.";
      render();
      return;
    }
    state.gateError = "";
    setGateCookie();
    app.innerHTML = `<div class="loading">Recipes</div>`;
    try {
      await ensureDb();
      const r = routeFromHash();
      if (r.view === "edit") state.editDraft = loadDraft(r.recipeId);
      if (r.view === "cook") state.cookScale = r.scale || 1;
      render();
    } catch (err) {
      app.innerHTML = `<div class="soon"><h2>Could not start</h2><p>${h(err.message)}</p></div>`;
    }
  });

  app.addEventListener("click", async (e) => {
    const goEl = e.target.closest("[data-go]");
    const actEl = e.target.closest("[data-act]");
    if (goEl) {
      e.preventDefault();
      go(goEl.getAttribute("data-go"));
      return;
    }
    if (!actEl) return;
    const act = actEl.getAttribute("data-act");
    if (act === "drawer") {
      state.drawer = true;
      render();
    } else if (act === "drawer-close") {
      state.drawer = false;
      render();
    } else if (act === "sort") {
      state.sortOpen = !state.sortOpen;
      state.filterOpen = false;
      render();
    } else if (act === "filter") {
      state.filterOpen = !state.filterOpen;
      state.sortOpen = false;
      render();
    } else if (act === "set-sort") {
      state.sort = actEl.getAttribute("data-sort");
      state.sortOpen = false;
      render();
    } else if (act === "toggle-fav-filter") {
      state.favoritesOnly = !state.favoritesOnly;
      state.filterOpen = false;
      render();
    } else if (act === "set-enabled-mode") {
      state.enabledMode = actEl.getAttribute("data-mode") || "enabled";
      state.filterOpen = false;
      render();
    } else if (act === "clear-filter") {
      state.favoritesOnly = false;
      state.enabledMode = "enabled";
      state.search = "";
      state.filterOpen = false;
      render();
    } else if (act === "export") {
      state.exportOpen = !state.exportOpen;
      render();
    } else if (act === "cook-now") {
      state.exportOpen = false;
      state.cookOpen = true;
      state.scalePick = 1;
      render();
    } else if (act === "cook-cancel") {
      state.cookOpen = false;
      render();
    } else if (act === "scale") {
      state.scalePick = Number(actEl.getAttribute("data-scale"));
      render();
    } else if (act === "detail-scale") {
      state.detailScale = Number(actEl.getAttribute("data-scale"));
      render();
    } else if (act === "cook-go") {
      const id = state.recipeId;
      const s = state.scalePick;
      state.cookOpen = false;
      go(`#/recipe/${id}/cook?scale=${s}`);
    } else if (act === "toggle-favorite") {
      const recipe = RecipeDB.getRecipe(state.recipeId);
      if (recipe) {
        await RecipeDB.toggleFavorite(recipe.id, !recipe.favorite);
        render();
      }
    } else if (act === "toggle-enabled") {
      const recipe = RecipeDB.getRecipe(state.recipeId);
      if (recipe) {
        await RecipeDB.toggleEnabled(recipe.id, !recipe.enabled);
        render();
      }
    } else if (act === "print") {
      window.print();
    } else if (act === "share") {
      const recipe = RecipeDB.getRecipe(state.recipeId);
      const url = location.href;
      if (navigator.share && recipe) {
        navigator.share({ title: recipe.title, text: recipe.title, url }).catch(() => {});
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert("Recipe link copied to clipboard.");
      } else {
        prompt("Copy this link:", url);
      }
    } else if (act === "suggest") {
      const id = Number(actEl.getAttribute("data-id"));
      state.suggestOpen = false;
      state.suggestIndex = -1;
      state.drawer = false;
      const recipe = RecipeDB.getRecipe(id);
      if (recipe) state.search = recipe.title;
      go(`#/recipe/${id}`);
    } else if (act === "jump-index") {
      const letter = actEl.getAttribute("data-letter");
      if (letter) jumpToIndexLetter(letter);
    } else if (act === "search-submit") {
      state.suggestOpen = false;
      state.suggestIndex = -1;
      if (state.view !== "list") go("#/");
      else render();
    } else if (act === "soon") {
      alert((actEl.getAttribute("data-soon") || "This action") + " is on the punch list and is not implemented yet.");
    } else if (act === "timer") {
      alert("SET TIMER is on the punch list and is not implemented yet.");
    } else if (act === "tab") {
      captureEditFields();
      state.editTab = Number(actEl.getAttribute("data-tab"));
      render();
    } else if (act === "fav") {
      captureEditFields();
      state.editDraft.favorite = !state.editDraft.favorite;
      render();
    } else if (act === "enabled") {
      captureEditFields();
      state.editDraft.enabled = !state.editDraft.enabled;
      render();
    } else if (act === "clear-photo") {
      captureEditFields();
      if (state.editDraft._pendingPhotoPreview) {
        URL.revokeObjectURL(state.editDraft._pendingPhotoPreview);
      }
      state.editDraft._pendingPhoto = null;
      state.editDraft._pendingPhotoPreview = "";
      state.editDraft._removePhoto = true;
      state.editDraft.image = "";
      render();
    } else if (act === "download-photo") {
      const draft = state.editDraft || RecipeDB.getRecipe(state.recipeId);
      const recipe = draft && draft.id ? draft : RecipeDB.getRecipe(state.recipeId);
      if (!recipe || !RecipeImages.isLocalRef(recipe.image)) return;
      const blob = await RecipeImages.getBlob(recipe.image);
      if (!blob) {
        alert("No local photo found in this browser.");
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = RecipeImages.slugFilename(recipe.title, recipe.id);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else if (act === "cancel-edit") {
      const id = state.recipeId;
      state.editDraft = null;
      go(id ? `#/recipe/${id}` : "#/");
    } else if (act === "save-edit") {
      captureEditFields();
      try {
        const draft = { ...state.editDraft };
        const pending = draft._pendingPhoto || null;
        const removePhoto = !!draft._removePhoto;
        if (draft._pendingPhotoPreview) URL.revokeObjectURL(draft._pendingPhotoPreview);
        delete draft._pendingPhoto;
        delete draft._pendingPhotoPreview;
        delete draft._removePhoto;

        if (removePhoto && !pending) {
          if (draft.id) await RecipeImages.removeRecipePhoto(draft.id);
          if (RecipeImages.isLocalRef(draft.image)) draft.image = "";
        }

        let id = await RecipeDB.saveRecipe(draft);
        if (pending) {
          const ref = await RecipeImages.saveRecipePhoto(id, pending);
          await RecipeDB.saveRecipe({ ...draft, id, image: ref });
        }
        state.editDraft = null;
        go(`#/recipe/${id}`);
      } catch (err) {
        state.editError = err.message || String(err);
        state.editTab = 0;
        render();
      }
    }
  });

  function patchSearchSuggest() {
    const html = searchSuggestHtml();
    app.querySelectorAll("[data-search-wrap]").forEach((wrap) => {
      const existing = wrap.querySelector(".search-suggest");
      if (existing) existing.remove();
      if (html) wrap.insertAdjacentHTML("beforeend", html);
    });
  }

  function focusSearchInput(act, pos) {
    const match = app.querySelector(`[data-act="${act}"]`);
    if (match) {
      match.focus();
      if (typeof pos === "number") {
        try {
          match.setSelectionRange(pos, pos);
        } catch (_) {
          /* search inputs may reject setSelectionRange in some browsers */
        }
      }
    }
  }

  app.addEventListener("change", (e) => {
    if (!e.target.matches("[data-act=pick-photo]")) return;
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type || file.type.indexOf("image/") !== 0) {
      alert("Please choose an image file.");
      e.target.value = "";
      return;
    }
    captureEditFields();
    if (state.editDraft._pendingPhotoPreview) {
      URL.revokeObjectURL(state.editDraft._pendingPhotoPreview);
    }
    state.editDraft._pendingPhoto = file;
    state.editDraft._pendingPhotoPreview = URL.createObjectURL(file);
    state.editDraft._removePhoto = false;
    render();
  });

  app.addEventListener("input", (e) => {
    if (!e.target.matches("[data-act=search], [data-act=desk-search]")) return;
    const pos = e.target.selectionStart;
    const act = e.target.getAttribute("data-act");
    state.search = e.target.value;
    state.suggestOpen = state.search.trim().length > 0;
    state.suggestIndex = -1;

    if (state.view === "list" && act === "search") {
      // Drawer search: keep drawer open and refresh list + suggestions.
      state.drawer = true;
      render();
      focusSearchInput(act, pos);
      return;
    }

    if (state.view === "list" && act === "desk-search") {
      render();
      focusSearchInput(act, pos);
      return;
    }

    // Other views: update dropdown without leaving the page.
    patchSearchSuggest();
  });

  app.addEventListener("keydown", (e) => {
    const isSearch = e.target.matches("[data-act=search], [data-act=desk-search]");
    if (!isSearch) return;

    const suggestions = getSearchSuggestions(state.search);
    if (state.suggestOpen && suggestions.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      if (e.key === "ArrowDown") {
        state.suggestIndex = (state.suggestIndex + 1) % suggestions.length;
      } else {
        state.suggestIndex =
          state.suggestIndex <= 0 ? suggestions.length - 1 : state.suggestIndex - 1;
      }
      patchSearchSuggest();
      return;
    }

    if (e.key === "Escape") {
      state.suggestOpen = false;
      state.suggestIndex = -1;
      patchSearchSuggest();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (state.suggestOpen && state.suggestIndex >= 0 && suggestions[state.suggestIndex]) {
        const recipe = suggestions[state.suggestIndex];
        state.suggestOpen = false;
        state.suggestIndex = -1;
        state.drawer = false;
        state.search = recipe.title;
        go(`#/recipe/${recipe.id}`);
        return;
      }
      state.suggestOpen = false;
      state.suggestIndex = -1;
      state.drawer = false;
      if (state.view !== "list") go("#/");
      else render();
    }
  });

  document.addEventListener("click", (e) => {
    if (!state.suggestOpen) return;
    if (e.target.closest("[data-search-wrap]")) return;
    state.suggestOpen = false;
    state.suggestIndex = -1;
    patchSearchSuggest();
  });

  function letterFromIndexPointer(nav, clientY) {
    const buttons = [...nav.querySelectorAll(".alpha-index-letter")];
    if (!buttons.length) return "";
    const rect = nav.getBoundingClientRect();
    if (rect.height <= 0) return "";
    const ratio = (clientY - rect.top) / rect.height;
    const idx = Math.max(0, Math.min(buttons.length - 1, Math.floor(ratio * buttons.length)));
    return buttons[idx].getAttribute("data-letter") || "";
  }

  let alphaScrubbing = false;
  app.addEventListener(
    "pointerdown",
    (e) => {
      const nav = e.target.closest("[data-alpha-index]");
      if (!nav) return;
      alphaScrubbing = true;
      try {
        nav.setPointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
      const letter = letterFromIndexPointer(nav, e.clientY);
      if (letter) jumpToIndexLetter(letter);
    },
    { passive: true }
  );
  app.addEventListener(
    "pointermove",
    (e) => {
      if (!alphaScrubbing) return;
      const nav = e.target.closest("[data-alpha-index]") || app.querySelector("[data-alpha-index]");
      if (!nav) return;
      const letter = letterFromIndexPointer(nav, e.clientY);
      if (letter) jumpToIndexLetter(letter);
    },
    { passive: true }
  );
  function endAlphaScrub() {
    alphaScrubbing = false;
  }
  app.addEventListener("pointerup", endAlphaScrub);
  app.addEventListener("pointercancel", endAlphaScrub);

  async function start() {
    const r = routeFromHash();
    if (!isAuthed() && r.view !== "disclaimer") {
      app.innerHTML = gateView();
      return;
    }
    if (r.view === "disclaimer") {
      app.innerHTML = disclaimerView();
      return;
    }
    app.innerHTML = `<div class="loading">Recipes</div>`;
    try {
      await ensureDb();
      state.view = r.view;
      state.recipeId = r.recipeId || null;
      if (r.view === "edit") state.editDraft = loadDraft(r.recipeId);
      if (r.view === "cook") state.cookScale = r.scale || 1;
      render();
    } catch (err) {
      app.innerHTML = `<div class="soon"><h2>Could not start</h2><p>${h(err.message)}</p><p>This app needs to be served over http (GitHub Pages or a local static server), not opened as a file.</p></div>`;
    }
  }

  start();
})();

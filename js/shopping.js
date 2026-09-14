(function (global) {
  const STORAGE_KEY = "recipes-shopping-list-v1";

  function emptyData() {
    return { entries: [], lastRecipeId: null };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyData();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.entries)) return emptyData();
      return {
        entries: parsed.entries,
        lastRecipeId: parsed.lastRecipeId == null ? null : Number(parsed.lastRecipeId),
      };
    } catch (_) {
      return emptyData();
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function uid() {
    return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  function getEntries() {
    return load().entries;
  }

  function getLastRecipeId() {
    return load().lastRecipeId;
  }

  function setLastRecipeId(recipeId) {
    const data = load();
    data.lastRecipeId = recipeId == null ? null : Number(recipeId);
    save(data);
  }

  function addRecipe({ recipeId, recipeTitle, scale, scaleLabel, items }) {
    const data = load();
    const entry = {
      id: uid(),
      recipeId: Number(recipeId),
      recipeTitle: String(recipeTitle || "Recipe"),
      scale: Number(scale) || 1,
      scaleLabel: String(scaleLabel || scale || "1"),
      addedAt: new Date().toISOString(),
      items: (items || [])
        .map((item) => ({
          id: uid(),
          text: String(item.text || "").trim(),
          heading: String(item.heading || ""),
        }))
        .filter((item) => item.text),
    };
    // Replace an existing group for the same recipe so re-adding updates scale/items.
    data.entries = data.entries.filter((e) => Number(e.recipeId) !== entry.recipeId);
    data.entries.push(entry);
    data.lastRecipeId = entry.recipeId;
    save(data);
    return entry;
  }

  function clear() {
    const data = load();
    save({ entries: [], lastRecipeId: data.lastRecipeId });
  }

  function itemCount() {
    return getEntries().reduce((n, e) => n + (e.items ? e.items.length : 0), 0);
  }

  function isIOS() {
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    // iPadOS desktop UA
    return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  }

  function formatForNotes() {
    const entries = getEntries();
    const lines = ["Shopping List", ""];
    entries.forEach((entry) => {
      const scaled = Math.abs(entry.scale - 1) > 1e-9;
      const title = scaled
        ? `${entry.recipeTitle} (×${entry.scaleLabel})`
        : entry.recipeTitle;
      lines.push(title);
      let lastHeading = null;
      (entry.items || []).forEach((item) => {
        if (item.heading && item.heading !== lastHeading) {
          lines.push(item.heading);
          lastHeading = item.heading;
        }
        // Ballot box + space — Notes keeps these as checklist-looking lines via Share.
        // Markdown task lines also help when sharing as .md on newer iOS.
        lines.push(`☐ ${item.text}`);
      });
      lines.push("");
    });
    return lines.join("\n").trim() + "\n";
  }

  function formatForNotesMarkdown() {
    const entries = getEntries();
    const lines = ["# Shopping List", ""];
    entries.forEach((entry) => {
      const scaled = Math.abs(entry.scale - 1) > 1e-9;
      const title = scaled
        ? `${entry.recipeTitle} (×${entry.scaleLabel})`
        : entry.recipeTitle;
      lines.push(`## ${title}`);
      let lastHeading = null;
      (entry.items || []).forEach((item) => {
        if (item.heading && item.heading !== lastHeading) {
          lines.push(`### ${item.heading}`);
          lastHeading = item.heading;
        }
        lines.push(`- [ ] ${item.text}`);
      });
      lines.push("");
    });
    return lines.join("\n").trim() + "\n";
  }

  function canExportToNotes() {
    return isIOS() && typeof navigator.share === "function";
  }

  async function exportToNotes() {
    if (!canExportToNotes()) {
      throw new Error("Export to Notes is only available on iOS.");
    }
    const text = formatForNotes();
    const md = formatForNotesMarkdown();
    const mdFile = new File([md], "Shopping List.md", { type: "text/markdown" });
    const txtFile = new File([text], "Shopping List.txt", { type: "text/plain" });

    // Prefer sharing a markdown file so Notes can import checklist-style task lines.
    if (navigator.canShare) {
      if (navigator.canShare({ files: [mdFile] })) {
        await navigator.share({
          files: [mdFile],
          title: "Shopping List",
        });
        return { mode: "file-md" };
      }
      if (navigator.canShare({ files: [txtFile] })) {
        await navigator.share({
          files: [txtFile],
          title: "Shopping List",
        });
        return { mode: "file-txt" };
      }
    }

    await navigator.share({
      title: "Shopping List",
      text,
    });
    return { mode: "text" };
  }

  global.RecipeShopping = {
    load,
    getEntries,
    getLastRecipeId,
    setLastRecipeId,
    addRecipe,
    clear,
    itemCount,
    isIOS,
    canExportToNotes,
    formatForNotes,
    exportToNotes,
  };
})(window);

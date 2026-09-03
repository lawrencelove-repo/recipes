(function (global) {
  function padBody(raw) {
    return String(raw || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => {
        if (!line.trim()) return "";
        if (/^\[.+\]\s*$/.test(line.trim())) return line.trim();
        return "\t" + line.replace(/^\t+/, "");
      })
      .join("\n");
  }

  function exportFilename(title, id) {
    const base = String(title || "Recipe")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "")
      .replace(/^\d+/, "");
    const name = base || "Recipe" + String(id || "");
    return name + ".txt";
  }

  function recipeToPepperplateText(recipe) {
    const lines = [
      "Title: " + (recipe.title || ""),
      "Description: " + (recipe.description || ""),
      "Source: " + (recipe.source || ""),
      "Original URL: " + (recipe.url || ""),
      "Yield: " + (recipe.yield || ""),
      "Active: " + (recipe.active_time || ""),
      "Total: " + (recipe.total_time || ""),
    ];
    if (recipe.categories) lines.push("Categories: " + recipe.categories);
    if (recipe.notes) lines.push("Notes: " + recipe.notes);
    lines.push("Enabled: " + (recipe.enabled === false || recipe.enabled === 0 ? "0" : "1"));
    if (recipe.favorite) lines.push("Favorite: 1");
    if (recipe.image) lines.push("Image: " + recipe.image);
    lines.push("Ingredients:");
    const ings = padBody(recipe.ingredients_raw);
    if (ings) lines.push(ings);
    lines.push("Instructions:");
    const inst = padBody(recipe.instructions_raw);
    if (inst) lines.push(inst);
    lines.push("");
    return lines.join("\n");
  }

  function uniqueFilenames(recipes) {
    const used = new Map();
    return recipes.map((recipe) => {
      const stem = exportFilename(recipe.title, recipe.id).replace(/\.txt$/i, "");
      let name = stem + ".txt";
      let key = name.toLowerCase();
      if (used.has(key)) {
        let n = used.get(key) + 1;
        do {
          name = stem + "_" + n + ".txt";
          key = name.toLowerCase();
          n += 1;
        } while (used.has(key));
        used.set(key, 1);
        used.set(stem.toLowerCase() + ".txt", n - 1);
      } else {
        used.set(key, 1);
      }
      return { recipe, filename: name, text: recipeToPepperplateText(recipe) };
    });
  }

  async function writeWithDirectoryPicker(files) {
    if (!window.showDirectoryPicker) {
      throw new Error("Directory picker is not supported in this browser.");
    }
    const dir = await window.showDirectoryPicker({ mode: "readwrite" });
    // Prefer writing into exports/ if user picked the repo root.
    let target = dir;
    try {
      if (dir.name !== "exports") {
        target = await dir.getDirectoryHandle("exports", { create: true });
      }
    } catch (_) {
      target = dir;
    }
    for (const file of files) {
      const handle = await target.getFileHandle(file.filename, { create: true });
      const writable = await handle.createWritable();
      await writable.write(file.text);
      await writable.close();
    }
    return { mode: "directory", count: files.length, folder: target.name };
  }

  async function downloadZip(files) {
    if (typeof JSZip === "undefined") {
      throw new Error("JSZip failed to load.");
    }
    const zip = new JSZip();
    const folder = zip.folder("exports");
    for (const file of files) {
      folder.file(file.filename, file.text);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = "recipes-exports.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return { mode: "zip", count: files.length };
  }

  async function exportAllRecipes(recipes, { preferDirectory = true } = {}) {
    const files = uniqueFilenames(recipes);
    if (!files.length) throw new Error("No recipes to export.");

    if (preferDirectory && window.showDirectoryPicker) {
      try {
        return await writeWithDirectoryPicker(files);
      } catch (err) {
        // User cancel should not fall through to zip noisily.
        if (err && (err.name === "AbortError" || err.name === "NotAllowedError")) throw err;
        // Fall back to zip when picker fails for other reasons.
      }
    }
    return await downloadZip(files);
  }

  function recipeFilePayload(recipe) {
    const filename = exportFilename(recipe.title, recipe.id);
    const text = recipeToPepperplateText(recipe);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const file = new File([blob], filename, { type: "text/plain" });
    return { filename, text, blob, file };
  }

  function downloadRecipeTxt(recipe) {
    const { filename, blob } = recipeFilePayload(recipe);
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return { mode: "download", filename };
  }

  function canShareRecipeFile(recipe) {
    if (!navigator.share || !navigator.canShare) return false;
    try {
      const { file } = recipeFilePayload(recipe);
      return navigator.canShare({ files: [file] });
    } catch (_) {
      return false;
    }
  }

  async function shareRecipeFile(recipe) {
    const payload = recipeFilePayload(recipe);
    if (canShareRecipeFile(recipe)) {
      await navigator.share({
        files: [payload.file],
        title: recipe.title || payload.filename,
        text: "Recipe export for the recipes repo (place under data/).",
      });
      return { mode: "share", filename: payload.filename };
    }
    return downloadRecipeTxt(recipe);
  }

  global.RecipeExport = {
    recipeToPepperplateText,
    exportFilename,
    uniqueFilenames,
    exportAllRecipes,
    recipeFilePayload,
    downloadRecipeTxt,
    canShareRecipeFile,
    shareRecipeFile,
  };
})(window);

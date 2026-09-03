(function (global) {
  const IDB_NAME = "recipes-images";
  const IDB_STORE = "photos";
  const LOCAL_PREFIX = "local:";

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

  async function idbPut(key, value) {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbGet(key) {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  }

  async function idbDelete(key) {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function isLocalRef(ref) {
    return typeof ref === "string" && ref.indexOf(LOCAL_PREFIX) === 0;
  }

  function localIdFromRef(ref) {
    if (!isLocalRef(ref)) return "";
    return ref.slice(LOCAL_PREFIX.length);
  }

  function localRefForRecipe(recipeId) {
    return LOCAL_PREFIX + String(recipeId);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Could not read file."));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not decode image."));
      img.src = src;
    });
  }

  async function compressImageFile(file, { maxEdge = 1400, quality = 0.82 } = {}) {
    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    });
    if (!blob) throw new Error("Could not compress image.");
    return blob;
  }

  const objectUrlCache = new Map();

  const api = {
    LOCAL_PREFIX,
    isLocalRef,
    localIdFromRef,
    localRefForRecipe,

    async saveRecipePhoto(recipeId, fileOrBlob) {
      const key = String(recipeId);
      const blob =
        fileOrBlob instanceof Blob && !(fileOrBlob instanceof File)
          ? fileOrBlob
          : await compressImageFile(fileOrBlob);
      await idbPut(key, {
        blob,
        type: blob.type || "image/jpeg",
        updatedAt: new Date().toISOString(),
      });
      const prev = objectUrlCache.get(key);
      if (prev) URL.revokeObjectURL(prev);
      objectUrlCache.delete(key);
      return localRefForRecipe(key);
    },

    async removeRecipePhoto(recipeId) {
      const key = String(recipeId);
      await idbDelete(key);
      const prev = objectUrlCache.get(key);
      if (prev) URL.revokeObjectURL(prev);
      objectUrlCache.delete(key);
    },

    async getObjectURL(refOrId) {
      const key = isLocalRef(refOrId) ? localIdFromRef(refOrId) : String(refOrId || "");
      if (!key) return "";
      if (objectUrlCache.has(key)) return objectUrlCache.get(key);
      const row = await idbGet(key);
      if (!row || !row.blob) return "";
      const url = URL.createObjectURL(row.blob);
      objectUrlCache.set(key, url);
      return url;
    },

    async getBlob(refOrId) {
      const key = isLocalRef(refOrId) ? localIdFromRef(refOrId) : String(refOrId || "");
      if (!key) return null;
      const row = await idbGet(key);
      return row && row.blob ? row.blob : null;
    },

    displaySrc(imageRef) {
      if (!imageRef) return "";
      if (isLocalRef(imageRef)) return "";
      return imageRef;
    },

    async hydrate(root) {
      const scope = root || document;
      const nodes = scope.querySelectorAll("[data-local-image]");
      await Promise.all(
        Array.from(nodes).map(async (el) => {
          const ref = el.getAttribute("data-local-image");
          const url = await api.getObjectURL(ref);
          if (url) {
            el.src = url;
            el.hidden = false;
            const wrap = el.closest(".has-img, .detail-hero, .photo-preview");
            if (wrap) wrap.classList.add("has-photo");
          }
        })
      );
    },

    slugFilename(title, recipeId) {
      const base = String(title || "recipe")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48);
      return (base || "recipe") + "-" + recipeId + ".jpg";
    },
  };

  global.RecipeImages = api;
})(window);

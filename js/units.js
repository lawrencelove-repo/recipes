(function (global) {
  const UNIT_DEFS = [
    { singular: "teaspoon", plural: "teaspoons", abbrevs: ["tsp", "t", "tsps"] },
    { singular: "tablespoon", plural: "tablespoons", abbrevs: ["tbsp", "tbs", "tbl", "tbsps"] },
    { singular: "cup", plural: "cups", abbrevs: ["c"] },
    { singular: "ounce", plural: "ounces", abbrevs: ["oz"] },
    { singular: "fluid ounce", plural: "fluid ounces", abbrevs: ["fl oz", "floz", "fl. oz"] },
    { singular: "pound", plural: "pounds", abbrevs: ["lb", "lbs"] },
    { singular: "gram", plural: "grams", abbrevs: ["g", "gm"] },
    { singular: "kilogram", plural: "kilograms", abbrevs: ["kg"] },
    { singular: "milliliter", plural: "milliliters", abbrevs: ["ml"] },
    { singular: "liter", plural: "liters", abbrevs: ["l", "litre", "litres"] },
    { singular: "pint", plural: "pints", abbrevs: ["pt"] },
    { singular: "quart", plural: "quarts", abbrevs: ["qt"] },
    { singular: "gallon", plural: "gallons", abbrevs: ["gal"] },
    { singular: "pinch", plural: "pinches", abbrevs: [] },
    { singular: "dash", plural: "dashes", abbrevs: [] },
    { singular: "clove", plural: "cloves", abbrevs: [] },
    { singular: "can", plural: "cans", abbrevs: [] },
    { singular: "box", plural: "boxes", abbrevs: [] },
    { singular: "bag", plural: "bags", abbrevs: [] },
    { singular: "package", plural: "packages", abbrevs: ["pkg", "pkgs"] },
    { singular: "bottle", plural: "bottles", abbrevs: [] },
    { singular: "jar", plural: "jars", abbrevs: [] },
    { singular: "bunch", plural: "bunches", abbrevs: [] },
    { singular: "stick", plural: "sticks", abbrevs: [] },
    { singular: "slice", plural: "slices", abbrevs: [] },
    { singular: "piece", plural: "pieces", abbrevs: [] },
    { singular: "head", plural: "heads", abbrevs: [] },
    { singular: "sprig", plural: "sprigs", abbrevs: [] },
    { singular: "leaf", plural: "leaves", abbrevs: [] },
    { singular: "stalk", plural: "stalks", abbrevs: [] },
    { singular: "ear", plural: "ears", abbrevs: [] },
    { singular: "fillet", plural: "fillets", abbrevs: [] },
    { singular: "strip", plural: "strips", abbrevs: [] },
    { singular: "cube", plural: "cubes", abbrevs: [] },
    { singular: "drop", plural: "drops", abbrevs: [] },
    { singular: "splash", plural: "splashes", abbrevs: [] },
    { singular: "handful", plural: "handfuls", abbrevs: [] },
    { singular: "scoop", plural: "scoops", abbrevs: [] },
    { singular: "sheet", plural: "sheets", abbrevs: [] },
    { singular: "envelope", plural: "envelopes", abbrevs: [] },
    { singular: "container", plural: "containers", abbrevs: [] },
    { singular: "carton", plural: "cartons", abbrevs: [] },
  ];

  const SIZE_UNITS = ["oz", "fl oz", "lb", "lbs", "g", "kg", "ml", "l", "liter", "liters"];
  const SIZE_CONTAINERS = ["can", "cans", "cap", "jar", "jars", "bottle", "bottles", "box", "boxes", "bag", "bags", "pkg", "package", "carton", "tin"];

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const lookup = [];
  for (const def of UNIT_DEFS) {
    const forms = [def.singular, def.plural, ...def.abbrevs];
    for (const form of forms) {
      lookup.push({
        form,
        formLower: form.toLowerCase(),
        def,
        isAbbrev: def.abbrevs.includes(form),
        tokenCount: form.split(/\s+/).length,
      });
    }
  }
  lookup.sort((a, b) => b.form.length - a.form.length);

  function matchUnitAt(tokens, index) {
    const max = 3;
    for (let n = max; n >= 1; n--) {
      if (index + n > tokens.length) continue;
      const slice = tokens.slice(index, index + n).join(" ").toLowerCase().replace(/\.$/, "");
      const hit = lookup.find((u) => u.formLower === slice);
      if (hit) return { ...hit, tokenCount: n };
    }
    return null;
  }

  function findUnitInRest(rest, skipSizePrefix) {
    const tokens = rest.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return null;

    let start = 0;
    if (skipSizePrefix > 0) start = skipSizePrefix;
    if (start >= tokens.length) return null;

    const atStart = matchUnitAt(tokens, start);
    if (atStart) {
      return {
        match: atStart,
        index: start,
        tokenCount: atStart.tokenCount,
      };
    }

    for (let i = start; i < tokens.length; i++) {
      const hit = matchUnitAt(tokens, i);
      if (hit) {
        return { match: hit, index: i, tokenCount: hit.tokenCount };
      }
    }
    return null;
  }

  function sizePrefixTokenCount(tokens) {
    if (!tokens.length) return 0;
    const first = tokens[0];
    const packed = first.match(/^(\d+(?:\.\d+)?)(oz|ml|l|lb|lbs|g|kg)$/i);
    if (packed) {
      let count = 1;
      if (tokens[1] && SIZE_CONTAINERS.includes(tokens[1].toLowerCase())) count = 2;
      return count;
    }
    if (/^\d+(?:\.\d+)?$/.test(first) && tokens[1]) {
      const u = tokens[1].toLowerCase().replace(/\.$/, "");
      if (SIZE_UNITS.includes(u)) {
        let count = 2;
        if (tokens[2] && SIZE_CONTAINERS.includes(tokens[2].toLowerCase())) count = 3;
        return count;
      }
    }
    return 0;
  }

  function formatUnitWord(def, isAbbrev, original, qty) {
    if (isAbbrev) return original;
    const useSingular = Math.abs(qty) <= 1 + 1e-9;
    return useSingular ? def.singular : def.plural;
  }

  global.RecipeUnits = {
    UNIT_DEFS,
    lookup,
    matchUnitAt,
    findUnitInRest,
    sizePrefixTokenCount,
    formatUnitWord,
    escapeRe,
  };
})(window);

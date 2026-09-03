(function (global) {
  const UNICODE_FRAC = {
    "¼": 1 / 4,
    "½": 1 / 2,
    "¾": 3 / 4,
    "⅓": 1 / 3,
    "⅔": 2 / 3,
    "⅛": 1 / 8,
    "⅜": 3 / 8,
    "⅝": 5 / 8,
    "⅞": 7 / 8,
    "⅕": 1 / 5,
    "⅖": 2 / 5,
    "⅗": 3 / 5,
    "⅘": 4 / 5,
    "⅙": 1 / 6,
    "⅚": 5 / 6,
  };

  const FRAC_DISPLAY = [
    [1 / 8, "1/8"],
    [1 / 6, "1/6"],
    [1 / 5, "1/5"],
    [1 / 4, "1/4"],
    [1 / 3, "1/3"],
    [3 / 8, "3/8"],
    [2 / 5, "2/5"],
    [1 / 2, "1/2"],
    [3 / 5, "3/5"],
    [5 / 8, "5/8"],
    [2 / 3, "2/3"],
    [3 / 4, "3/4"],
    [4 / 5, "4/5"],
    [5 / 6, "5/6"],
    [7 / 8, "7/8"],
  ];

  function parseLeadingQuantity(text) {
    const s = text.trimStart();
    const uni = UNICODE_FRAC[s[0]];
    if (uni != null) {
      return { value: uni, raw: s[0], rest: s.slice(1).trimStart() };
    }

    const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
    if (mixed) {
      const value = Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
      return { value, raw: mixed[0], rest: s.slice(mixed[0].length).trimStart() };
    }

    const mixedUni = s.match(/^(\d+)\s*([¼½¾⅓⅔⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚])/);
    if (mixedUni) {
      const value = Number(mixedUni[1]) + UNICODE_FRAC[mixedUni[2]];
      return { value, raw: mixedUni[0], rest: s.slice(mixedUni[0].length).trimStart() };
    }

    const frac = s.match(/^(\d+)\s*\/\s*(\d+)/);
    if (frac) {
      const value = Number(frac[1]) / Number(frac[2]);
      return { value, raw: frac[0], rest: s.slice(frac[0].length).trimStart() };
    }

    const dec = s.match(/^(\d+\.\d+|\d+)/);
    if (dec) {
      return { value: Number(dec[1]), raw: dec[1], rest: s.slice(dec[0].length).trimStart() };
    }

    return null;
  }

  function formatQuantity(n) {
    if (n == null || Number.isNaN(n)) return "";
    const sign = n < 0 ? "-" : "";
    n = Math.abs(n);
    if (n < 1e-9) return "0";

    const whole = Math.floor(n + 1e-9);
    const frac = n - whole;
    let best = null;
    let bestDiff = 0.03;
    for (const [v, label] of FRAC_DISPLAY) {
      const d = Math.abs(frac - v);
      if (d < bestDiff) {
        bestDiff = d;
        best = label;
      }
    }

    if (frac < 0.03) return sign + String(whole);
    if (best && whole === 0) return sign + best;
    if (best) return sign + whole + " " + best;
    const rounded = Math.round(n * 100) / 100;
    return sign + String(rounded);
  }

  function isGroupHeader(line) {
    const m = line.trim().match(/^\[(.+)\]\s*$/);
    return m ? m[1].trim() : null;
  }

  function parseIngredientLine(rawLine) {
    const line = rawLine.replace(/\s+$/, "");
    const trimmed = line.trim();
    if (!trimmed) return { empty: true, raw: rawLine };

    const header = isGroupHeader(trimmed);
    if (header != null) return { group: header, raw: rawLine };

    const qty = parseLeadingQuantity(trimmed);
    if (!qty) {
      return {
        quantity: null,
        quantityRaw: "",
        rest: trimmed,
        unit: null,
        recognized: 0,
        raw: rawLine,
      };
    }

    const units = global.RecipeUnits;
    const tokens = qty.rest.trim().split(/\s+/).filter(Boolean);
    const skip = units.sizePrefixTokenCount(tokens);
    const found = units.findUnitInRest(qty.rest, skip);

    return {
      quantity: qty.value,
      quantityRaw: qty.raw,
      rest: qty.rest,
      unit: found
        ? {
            index: found.index,
            tokenCount: found.tokenCount,
            def: found.match.def,
            isAbbrev: found.match.isAbbrev,
            original: tokens.slice(found.index, found.index + found.tokenCount).join(" "),
          }
        : null,
      recognized: found ? 1 : 0,
      raw: rawLine,
    };
  }

  function formatIngredientParts(parsed, scale, { scaledStyle } = {}) {
    if (parsed.empty) return { html: "", text: "" };
    if (parsed.group) return null;

    const qty = parsed.quantity == null ? null : parsed.quantity * scale;
    const unscaled = Math.abs(scale - 1) < 1e-9;
    const rest =
      parsed.quantity == null || unscaled || !parsed.unit
        ? parsed.rest
        : formatRest(parsed, qty);
    const qtyText = qty == null ? "" : formatQuantity(qty);
    const text = [qtyText, rest].filter(Boolean).join(" ").trim();

    if (qty == null) {
      return { html: escapeHtml(rest), text: rest, qtyHtml: "", restHtml: escapeHtml(rest), scaled: false };
    }

    const scaled = !!(scaledStyle && Math.abs(scale - 1) > 1e-9);
    const qtyClass = scaled ? "qty qty-scaled" : "qty";
    const html = `<span class="${qtyClass}">${escapeHtml(qtyText)}</span>${rest ? " " + escapeHtml(rest) : ""}`;
    return {
      html,
      text,
      qtyHtml: escapeHtml(qtyText),
      restHtml: escapeHtml(rest),
      scaled,
    };
  }

  function formatRest(parsed, qtyForUnit) {
    if (!parsed.unit) return parsed.rest;
    const tokens = parsed.rest.trim().split(/\s+/).filter(Boolean);
    const word = global.RecipeUnits.formatUnitWord(
      parsed.unit.def,
      parsed.unit.isAbbrev,
      parsed.unit.original,
      qtyForUnit
    );
    const next = tokens.slice();
    next.splice(parsed.unit.index, parsed.unit.tokenCount, ...word.split(/\s+/));
    return next.join(" ");
  }

  function parseIngredientsText(raw) {
    const lines = String(raw || "").split("\n");
    const groups = [];
    let current = { heading: "", items: [], blanks: 0 };

    function pushGroup() {
      if (current.heading || current.items.length) groups.push(current);
    }

    for (const line of lines) {
      const parsed = parseIngredientLine(line);
      if (parsed.group != null) {
        pushGroup();
        current = { heading: parsed.group, items: [], blanks: 0 };
        continue;
      }
      if (parsed.empty) {
        current.blanks += 1;
        continue;
      }
      current.items.push(parsed);
    }
    pushGroup();
    if (!groups.length) groups.push({ heading: "", items: [], blanks: 0 });
    return groups;
  }

  function parseInstructionsText(raw) {
    const lines = String(raw || "").split("\n");
    const groups = [];
    let current = { heading: "", steps: [] };
    let pendingBreaks = 0;

    function pushGroup() {
      if (current.heading || current.steps.length) groups.push(current);
    }

    for (const line of lines) {
      const header = isGroupHeader(line);
      if (header != null) {
        pushGroup();
        current = { heading: header, steps: [] };
        pendingBreaks = 0;
        continue;
      }
      if (line.trim() === "") {
        pendingBreaks += 1;
        if (current.steps.length) {
          current.steps[current.steps.length - 1].trailingBreaks = pendingBreaks;
        }
        continue;
      }
      current.steps.push({
        text: line,
        leadingBreaks: current.steps.length ? 0 : pendingBreaks,
        trailingBreaks: 0,
      });
      pendingBreaks = 0;
    }
    pushGroup();
    if (!groups.length) groups.push({ heading: "", steps: [] });
    return groups;
  }

  function instructionStepToHtml(step) {
    const withBr = escapeHtml(step.text).replace(/\r\n|\n/g, "<br>");
    const extra = "<br>".repeat(step.trailingBreaks || 0);
    return withBr + extra;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function newlinesToBr(s) {
    return escapeHtml(s).replace(/\r\n|\n/g, "<br>");
  }

  global.RecipeParser = {
    parseLeadingQuantity,
    formatQuantity,
    parseIngredientLine,
    parseIngredientsText,
    parseInstructionsText,
    formatIngredientParts,
    instructionStepToHtml,
    isGroupHeader,
    escapeHtml,
    newlinesToBr,
  };
})(window);

// MOD-site-frame's look.css: the menu's step badges and the soon pill read in both colour schemes (issue #519).
//
// Run: node --test tests/site-frame-menu-badges.test.mjs
//
// Module: MOD-site-frame
// Level: unit
//
// The cascade is read from the two style sheets the pages load, src/theme/lme.css and then src/site-frame/look.css: the
// custom properties of each colour scheme, and the last rule for each badge selector, which have equal specificity.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const SHEETS = ["../src/theme/lme.css", "../src/site-frame/look.css"].map((path) => readFileSync(new URL(path, import.meta.url), "utf8"));

// Rules of a style sheet in order: { dark, selector, declarations: Map }, `dark` for those inside the dark-mode media query.
function rules(css) {
  const out = [];
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const walk = (source, dark) => {
    let i = 0;
    while (i < source.length) {
      const open = source.indexOf("{", i);
      if (open < 0) break;
      let depth = 1, j = open + 1;
      while (depth && j < source.length) { depth += source[j] === "{" ? 1 : source[j] === "}" ? -1 : 0; j++; }
      const head = source.slice(i, open).trim(), body = source.slice(open + 1, j - 1);
      if (head.startsWith("@media")) { if (/prefers-color-scheme:\s*dark/.test(head)) walk(body, true); }
      else if (!head.startsWith("@")) {
        const declarations = new Map();
        for (const part of body.split(";")) { const at = part.indexOf(":"); if (at > 0) declarations.set(part.slice(0, at).trim(), part.slice(at + 1).trim()); }
        for (const selector of head.split(",")) out.push({ dark, selector: selector.trim().replace(/\s+/g, " "), declarations });
      }
      i = j;
    }
  };
  walk(text, false);
  return out;
}
const ALL = SHEETS.flatMap(rules);

// The custom properties of a scheme: every :root rule of the light scheme, then, for dark, those of the dark media query.
function variables(dark) {
  const map = new Map();
  for (const rule of ALL) {
    if (!/^:root/.test(rule.selector) || (rule.dark && !dark)) continue;
    for (const [name, value] of rule.declarations) if (name.startsWith("--")) map.set(name, value);
  }
  return map;
}
const resolve = (value, vars) => {
  let text = value;
  for (let n = 0; n < 10 && /var\(/.test(text ?? ""); n++) text = text.replace(/var\((--[\w-]+)\)/g, (_, name) => vars.get(name) ?? "UNDEFINED");
  return text;
};
// What a scheme gives a property of a selector: the last rule that sets it.
function computed(selector, property, dark) {
  const vars = variables(dark);
  const set = ALL.filter((rule) => rule.selector === selector && (!rule.dark || dark) && rule.declarations.has(property));
  return set.length ? resolve(set.at(-1).declarations.get(property), vars) : undefined;
}
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

const BADGE = ".menu > :nth-child(-n+6)::before";
const PILL = ".menu > .soon::after";

test("known positive: the reader finds lme.css's badge rule with its fixed --metallic-25", () => {
  assert.equal(computed(BADGE, "background", false), "#e2e7eb");
});

// TST-515001 · level: unit · module: MOD-site-frame
// guards: THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK; UC-020 (issue #519, light mode)
// given: the style sheets lme.css then look.css, light scheme
// input: the rules that apply to a menu step badge and to the soon pill
// expect: the badge keeps the light grey #e2e7eb with the dark blue #041e42 digit, the pill #e2e7eb with the muted #5b6b7d text, each text at least 4.5 to 1 against its background, and a line height of at most 1.2 on both, which centres the digit
test("TST-515001 light mode: the badge and the soon pill keep their colours and centre their text", () => {
  for (const [selector, background, color] of [[BADGE, "#e2e7eb", "#041e42"], [PILL, "#e2e7eb", "#5b6b7d"]]) {
    assert.equal(computed(selector, "background", false), background, `${selector} background`);
    assert.equal(computed(selector, "color", false), color, `${selector} colour`);
    assert.ok(contrast(background, color) >= 4.5, `${selector} contrast`);
    assert.ok(Number(computed(selector, "line-height", false)) <= 1.2, `${selector} line-height ${computed(selector, "line-height", false)}`);
  }
});

// TST-515002 · level: unit · module: MOD-site-frame
// guards: THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK; UC-020 (issue #519, dark mode)
// given: the style sheets lme.css then look.css, dark scheme
// input: the rules that apply to a menu step badge and to the soon pill
// expect: each has a background of the dark scheme's own — a colour that is not the light #e2e7eb —, a text colour with at least 4.5 to 1 against it, and a line height of at most 1.2
test("TST-515002 dark mode: the badge and the soon pill have a background of their own, a readable text and a centring line height", () => {
  for (const selector of [BADGE, PILL]) {
    const background = computed(selector, "background", true), color = computed(selector, "color", true);
    assert.match(background ?? "", /^#[0-9a-f]{6}$/i, `${selector} background resolves to a colour, got ${background}`);
    assert.match(color ?? "", /^#[0-9a-f]{6}$/i, `${selector} colour resolves to a colour, got ${color}`);
    assert.notEqual(background.toLowerCase(), "#e2e7eb", `${selector} does not keep the light grey in dark mode`);
    assert.ok(contrast(background, color) >= 4.5, `${selector} contrast ${contrast(background, color).toFixed(2)}`);
    assert.ok(Number(computed(selector, "line-height", true)) <= 1.2, `${selector} line-height ${computed(selector, "line-height", true)}`);
  }
});

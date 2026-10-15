// The menu's stage numbers and its "soon" pill as the site's style sheet src/theme/lme.css draws them, and the space around the
// buttons of a section of the requirements page as docs/assets/style.css gives it. A stage number stands on the colour of the
// meters' track, which the dark scheme turns dark, so that the number, in the heading colour the dark scheme turns light, can
// be read in both schemes; it sits in the middle of its circle. The section's + Requirement and Change by prompt, which
// src/trace-pages/flow.mjs puts between the section's heading and its table, keep apart from each other and from the table.
// Run: node --test tests/theme-menu-badges.test.mjs
//
// Module: MOD-dashboard-app
// Guards: THE MENU FOLLOWS THE PROCESS; THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK; UC-018; UC-019
// Level: unit
//
// The style sheets are read as text, as the browser gets them; a rule is found by its selector, and a declaration within it by
// its property. Each check first finds, with the same reader, a declaration that must be there.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const LME = read("src/theme/lme.css");
const STYLE = read("docs/assets/style.css");

// The body of the first rule whose selector is exactly `selector`, or null.
function rule(css, selector) {
  const at = css.indexOf(`${selector} {`);
  if (at < 0) return null;
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("}", open));
}
// The value of `property` in a rule's body, or null.
function value(body, property) {
  const found = (body ?? "").match(new RegExp(`(?:^|[;\\s])${property.replace(/[-]/g, "\\-")}\\s*:\\s*([^;]+)`));
  return found ? found[1].trim() : null;
}
// The custom properties the dark scheme sets — the block :root:not([data-theme="light"]) within prefers-color-scheme: dark.
function darkScheme(css) {
  const media = css.indexOf("@media (prefers-color-scheme: dark)");
  return media < 0 ? null : rule(css.slice(media), ':root:not([data-theme="light"])');
}

// TST-620001 · level: unit · module: MOD-dashboard-app
// guards: THE MENU FOLLOWS THE PROCESS; THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK
// given: src/theme/lme.css; known positive: the reader finds --heading in the dark scheme, and --track in :root
// input: the background of the stage number .menu > :nth-child(-n+6)::before and of the pill .menu > .soon::after, and --track in :root and in the dark scheme
// expect: both backgrounds are var(--track), neither the fixed light grey var(--metallic-25); --track is var(--metallic-25) in :root, so the light scheme keeps its grey, and the dark scheme sets --track to a colour of its own
test("lme.css — the stage number and the soon pill stand on the track colour, which the dark scheme turns dark", () => {
  const dark = darkScheme(LME), light = rule(LME, ":root");
  assert.equal(value(dark, "--heading"), "#f4f7fb", "known positive: the dark scheme's heading colour is read");
  assert.equal(value(light, "--track"), "var(--metallic-25)", "the light scheme's track is the light grey");
  const darkTrack = value(dark, "--track");
  assert.ok(darkTrack && darkTrack !== "var(--metallic-25)" && darkTrack !== value(light, "--metallic-25"), `the dark scheme sets a track of its own: ${darkTrack}`);
  for (const selector of [".menu > :nth-child(-n+6)::before", ".menu > .soon::after"]) {
    const background = value(rule(LME, selector), "background");
    assert.equal(background, "var(--track)", `${selector} stands on the track colour, not ${background}`);
  }
});

// TST-620002 · level: unit · module: MOD-dashboard-app
// guards: THE MENU FOLLOWS THE PROCESS
// given: src/theme/lme.css, whose body has line-height 1.55; known positive: the reader finds the stage number's width
// input: the rule .menu > :nth-child(-n+6)::before
// expect: line-height 1, so the number sits in the middle of its circle
test("lme.css — the stage number's line is as high as its digit", () => {
  const badge = rule(LME, ".menu > :nth-child(-n+6)::before");
  assert.equal(value(badge, "width"), "1.35em", "known positive: the stage number's rule is read");
  assert.equal(value(badge, "line-height"), "1");
});

// TST-620003 · level: unit · module: MOD-dashboard-app
// guards: UC-018; UC-019
// given: docs/assets/style.css; known positive: the reader finds the padding of .btn.small, the class of + Requirement and Change by prompt
// input: the rule .spec-section > .btn
// expect: a margin to the right and below, so the section's buttons keep apart from each other and from its table
test("style.css — the buttons of a requirements section keep apart from each other and from the table", () => {
  assert.equal(value(rule(STYLE, ".btn.small"), "padding"), ".2rem .5rem", "known positive: the small button's rule is read");
  const margin = value(rule(STYLE, ".spec-section > .btn"), "margin");
  assert.ok(margin, ".spec-section > .btn has a margin");
  const [, right, bottom] = margin.split(/\s+/);
  assert.ok(parseFloat(right) > 0 && parseFloat(bottom) > 0, `a margin to the right and below: ${margin}`);
});

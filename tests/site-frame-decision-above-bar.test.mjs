// The dialog of a decision is shown above the prompt bar: confirmDecision appends its <section class="decision"> to the end of the body, after the prompt
// bar's footer, and the bar is fixed to the bottom of the window above the page (look.css: .prompt-bar, z-index 20). Without a rule of its own the dialog
// lay at the very end of the page, under the bar, and its buttons could not be clicked — a job's Cancel asked "Cancel the job" where no one could answer.
// Run: node --test tests/site-frame-decision-above-bar.test.mjs
//
// Module: MOD-site-frame
// Guards: ONE CLICK PER DECISION; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// Level: unit
//
// Readings taken where the texts leave one open:
//   - "Above the bar" is a top-level rule of look.css for `.decision` that fixes it in the window (position: fixed) with a z-index higher than the one the
//     rule of `.prompt-bar` gives the bar; a fixed box is in view whatever the page's scroll.
//   - "In view on a phone" is a width bounded by the window less the 16px gutter each side, and a height bounded by the window with its overflow scrolling.
//   - The known positive is the rule of `.prompt-bar`, which the same reading finds with its z-index 20.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const LOOK = readFileSync(new URL("../src/site-frame/look.css", import.meta.url), "utf8");

// The declarations of the top-level rules whose selector list holds `selector` exactly, later ones overriding earlier ones.
function declarationsOf(selector) {
  const topLevel = LOOK.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  const found = {};
  for (const [, selectors, body] of topLevel.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectors.split(",").map((part) => part.trim()).includes(selector)) continue;
    for (const declaration of body.split(";")) {
      const at = declaration.indexOf(":");
      if (at > 0) found[declaration.slice(0, at).trim()] = declaration.slice(at + 1).trim();
    }
  }
  return found;
}

test("TST-2026111507: the dialog of a decision is fixed in the window above the prompt bar, and fits a phone", () => {
  // given: look.css, and the known positive — the prompt bar's own rule
  const bar = declarationsOf(".prompt-bar");
  assert.equal(bar["z-index"], "20");
  // when: the rule of the dialog is read
  const dialog = declarationsOf(".decision");
  // then: it is fixed in the window, above the bar, bounded by the window, and scrolls when taller
  assert.equal(dialog.position, "fixed");
  assert.ok(Number(dialog["z-index"]) > Number(bar["z-index"]), `the dialog's z-index ${dialog["z-index"]} is not above the bar's ${bar["z-index"]}`);
  assert.match(dialog["max-width"] ?? "", /calc\(100vw - 32px\)/);
  assert.match(dialog["max-height"] ?? "", /vh/);
  assert.equal(dialog["overflow-y"], "auto");
});

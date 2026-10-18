// Every route of the instance's site, drawn in a browser and checked against WCAG 2.2 level A and AA by axe-core: no violation. The routes
// that violate a rule today are named as todos, each with its route and its rules; a planted button without a name and a planted image
// without a text alternative each fail the same check.
// Run: node --test tests/site-accessibility.test.mjs
//
// Module: MOD-site-frame
// Guards: THE SITE SERVES A SCREEN READER
// Level: system
//
// The expected results are written here from the requirement's check — "an automatic check of each route against WCAG 2.2 level AA finds
// no violation; counter-proof: a planted button without a name fails" — and none is read from a document. Readings taken where the
// check leaves one open, each adding no word to it:
//   - "Each route" is read as tests/site-usability.test.mjs reads it: the routes of tests/site-usability.d/routes.mjs, drawn in the
//     same engine (tests/site-usability.d/browser.mjs) over the same fixture product, at a phone's width (390 px) and a desktop's (1280 px).
//   - "An automatic check ... against WCAG 2.2 level AA" is axe-core, at the exact version of tests/site-usability.d/axe.mjs, run with the
//     tags wcag2a, wcag2aa, wcag21a, wcag21aa and wcag22aa — level A is part of "level AA". Only violations count; axe-core's
//     "incomplete" results, which it leaves to a person, are not violations.
//   - The checker reaches the test as Electron does: `npm install --no-save` into a folder of the test run's temporary directory. It is no
//     file of the site, so NO SERVER's channels do not apply, and no list of packages of the repository names it.
// A route's violation is a todo: the test of the route asserts that there is none, fails today, and names the rules. Each fix is an item
// of the route's module.

import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { stageElectron, openWindow, configure } from "./site-usability.d/browser.mjs";
import { serveSite, REPO } from "./site-usability.d/site.mjs";
import { files, pullsHandler, tagsHandler } from "./site-usability.d/product.mjs";
import { ROUTES, OBSERVE, show } from "./site-usability.d/routes.mjs";
import { axeSource, AXE_VERSION, RUN_AXE } from "./site-usability.d/axe.mjs";

const WIDTHS = [["phone", 390], ["desktop", 1280]];

// What the pages violate today, as measured in the controlled Electron (the CI's run is the reference): the rules of axe-core, each with
// what it found, and per route the rules it violates at one width or the other. Each is a todo until the module of its route fixes it.
const RULE = {
  menu: "aria-required-children: the menu (nav#tabs, role tablist) holds children that are no tabs (the header of docs/index.html, src/site/menu.mjs)",
  brand: "label-content-name-mismatch: the brand link's accessible name does not hold its visible text (index.html)",
  contrast: "color-contrast: the text of a status badge (.b-accepted) is below the contrast AA asks (MOD-review-pages' lists, look)",
  scroll: "scrollable-region-focusable: a box that scrolls cannot be reached with the keyboard",
  target: "target-size: a summary is smaller than 24 px at a phone's width",
};
const PER_ROUTE = {
  "/": ["brand"],
  "#uc": ["menu", "contrast"], "#uc/UC-001": ["menu", "contrast"], "#use-case/id=UC-002/edit=1": ["menu", "scroll", "target"],
  "#arc": ["menu", "contrast"], "#arc/ARC-001": ["menu", "contrast"], "#arc/MOD-reader": ["menu", "contrast"],
  "#decision/id=ARC-001/edit=1": ["menu", "scroll", "target"], "#module": ["menu", "contrast"],
  "#module/id=MOD-reader/edit=1": ["menu", "scroll", "target"], "#backlog": ["menu", "contrast", "scroll"],
};
const TODAY = Object.fromEntries(ROUTES.map((route) => [route.address, (PER_ROUTE[route.address] ?? ["menu"]).map((rule) => RULE[rule]).join("; ")]));

// Each tick box of the page in <main>: the identifier of its row, and its name as a browser takes it for a checkbox — its aria-label, else the text of the label it stands in.
const TICKS = `[...document.querySelectorAll("main input[type=checkbox]")].map((box) => ({ row: box.closest("tr")?.getAttribute("data-id") ?? "",
  name: (box.getAttribute("aria-label") ?? box.closest("label")?.textContent ?? "").trim() }))`;
const found = new Map(); // "<address> <width name>" -> { violations: [{ id, impact, nodes, first }], text, ticks: [{ row, name }] }
const planted = {};
let site = null, browser = null;
const started = Date.now();
const progress = (step) => console.log(`site-accessibility ${((Date.now() - started) / 1000).toFixed(1)} s: ${step}`);

before(async () => {
  const axe = axeSource();
  progress(`axe-core ${AXE_VERSION} is staged`);
  site = await serveSite({ files: await files(), handlers: [pullsHandler(REPO), tagsHandler(REPO)] });
  const executable = await stageElectron();
  browser = await openWindow(executable, `${site.address}/__blank`);
  const page = browser.page;
  await configure(page, "Page.addScriptToEvaluateOnNewDocument", { source: OBSERVE });
  // axe-core is added to the document after the page has drawn, so that its script is no part of what is checked.
  const check = async () => {
    await page.evaluate(`typeof axe === "undefined" ? (0, eval)(${JSON.stringify(axe)}) : 0`);
    return await page.evaluate(RUN_AXE);
  };
  for (const [kind, width] of WIDTHS) {
    await configure(page, "Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: kind === "phone" });
    for (const route of ROUTES) {
      await show(page, site, route.address);
      found.set(`${route.address} ${kind}`, { violations: await check(), text: await page.evaluate(`(document.querySelector("main")?.innerText ?? "").replace(/\\s+/g, " ")`),
        ticks: await page.evaluate(TICKS) });
    }
    progress(`every route is checked at a ${kind}'s width`);
  }
  // The counter-proofs: a page as it is, then the same page with a button without a name and an image without a text alternative planted.
  await configure(page, "Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await show(page, site, "#how");
  planted.before = await check();
  await page.evaluate(`document.querySelector("main").insertAdjacentHTML("beforeend",
    '<p><button id="planted-button"></button> <img id="planted-image" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="></p>')`);
  planted.after = await check();
  // The same page with a tick box without a name planted besides: the counter-proof of the tick boxes' name.
  await page.evaluate(`document.querySelector("main").insertAdjacentHTML("beforeend", '<p><input type="checkbox" id="planted-tick"></p>')`);
  planted.afterTick = await check();
  progress("the counter-proofs are checked");
  for (const [key, value] of found) console.log(`site-accessibility ${key}: ${value.violations.map((each) => `${each.id}/${each.impact}/${each.nodes}[${each.first.slice(0, 70)}]`).join(" ")}`);
}, { timeout: 110000 });

after(async () => {
  browser?.close();
  await site?.close();
});

let number = 1;
for (const route of ROUTES) {
  test(`TST-905${String(number++).padStart(3, "0")}: ${route.address} was drawn, with its content, at both widths`, () => {
    for (const [kind] of WIDTHS) {
      const result = found.get(`${route.address} ${kind}`);
      assert.ok(result.text.includes(route.shows), `${route.address} at a ${kind}'s width shows "${route.shows}"; it shows: ${result.text.slice(0, 200)}`);
    }
  });
}

for (const route of ROUTES) {
  const today = TODAY[route.address];
  test(`TST-905${String(number++).padStart(3, "0")}: ${route.address} meets WCAG 2.2 level AA`,
    today ? { todo: `FINDING ${route.address} - ${today}` } : {}, () => {
      for (const [kind] of WIDTHS) {
        const violations = found.get(`${route.address} ${kind}`).violations;
        assert.deepEqual(violations.map((each) => `${each.id} (${each.nodes}: ${each.first})`), [], `${route.address} at a ${kind}'s width violates`);
      }
    });
}

// The page the counter-proofs plant in, as it is, has no violation of the two rules the plants break — the known positive.
test(`TST-905${String(number++).padStart(3, "0")}: the page before the planting has no violation of button-name or image-alt`, () => {
  assert.equal(planted.before.some((each) => each.id === "button-name" || each.id === "image-alt"), false);
});

test(`TST-905${String(number++).padStart(3, "0")}: a planted button without a name fails the check with the rule button-name`, () => {
  const rule = planted.after.find((each) => each.id === "button-name");
  assert.ok(rule, `violations: ${planted.after.map((each) => each.id).join(", ")}`);
  assert.ok(rule.first.includes("planted-button"), `the first node is ${rule.first}`);
});

test(`TST-905${String(number++).padStart(3, "0")}: a planted image without a text alternative fails the check with the rule image-alt`, () => {
  const rule = planted.after.find((each) => each.id === "image-alt");
  assert.ok(rule, `violations: ${planted.after.map((each) => each.id).join(", ")}`);
});

// ITM-921: the tick boxes of the review pages' lists (MOD-review-pages). The routes whose lists draw them; `#spec` draws none in this fixture.
const LISTS = ["#uc", "#arc", "#module", "#spec"];
const TICKED = ["#uc", "#arc", "#module"];

// given: every list route drawn at both widths; input: axe-core's rule `label` over each; expect: no violation of it (the whole-page tests above stay todos while the menu, a badge or a box violates)
test(`TST-905${String(number++).padStart(3, "0")}: the tick boxes of the lists ${LISTS.join(", ")} have an accessible name (rule label)`, () => {
  for (const address of LISTS) {
    for (const [kind] of WIDTHS) {
      const violations = found.get(`${address} ${kind}`).violations.filter((each) => each.id === "label").map((each) => `${each.id} (${each.nodes}: ${each.first})`);
      assert.deepEqual(violations, [], `${address} at a ${kind}'s width violates`);
    }
  }
});

// given: the lists #uc, #arc and #module, which hold open files; input: the tick boxes in <main>; expect: the list draws at least one (the known positive that the rule above has something to check), and each one's name holds the identifier of its row, the file it accepts
test(`TST-905${String(number++).padStart(3, "0")}: each tick box of the lists ${TICKED.join(", ")} names the file it accepts`, () => {
  for (const address of TICKED) {
    for (const [kind] of WIDTHS) {
      const ticks = found.get(`${address} ${kind}`).ticks;
      assert.ok(ticks.length > 0, `${address} at a ${kind}'s width draws a tick box`);
      assert.deepEqual(ticks.filter((tick) => !tick.name.includes(tick.row)).map((tick) => `${tick.row}: "${tick.name}"`), [], `${address} at a ${kind}'s width`);
    }
  }
});

// The counter-proof: the page before the planting has no violation of label; with a tick box without a name planted, the rule label finds it.
test(`TST-905${String(number++).padStart(3, "0")}: the page before the planting has no violation of label`, () => {
  assert.equal(planted.before.some((each) => each.id === "label"), false);
});

test(`TST-905${String(number++).padStart(3, "0")}: a planted tick box without a name fails the check with the rule label`, () => {
  const rule = planted.afterTick.find((each) => each.id === "label");
  assert.ok(rule, `violations: ${planted.afterTick.map((each) => each.id).join(", ")}`);
  assert.ok(rule.first.includes("planted-tick"), `the first node is ${rule.first}`);
});

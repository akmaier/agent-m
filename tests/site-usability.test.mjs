// Every route of the instance's site, drawn in a browser at a phone's width and at a desktop's: it uses the site's style sheets only,
// offers no button or link below the minimum target size, and holds no element wider than the window. The routes that fail today are
// named as todos, each with its route and its finding; a planted table wider than a phone, a planted button below the minimum and a
// planted embedded style sheet each fail the same checks. A route that holds a block that did not render (a `.unrendered` block, which is
// what MOD-markdown-render shows for a diagram that fails) is a finding of that route, and a planted failed diagram fails it.
// Run: node --test tests/site-usability.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// Level: system
//
// The expected results are written here from the requirement's check — "each route, drawn at a phone's width and at a desktop's, uses the
// site's style sheets only, offers no button or link below the minimum target size, and holds no element wider than the window;
// counter-proof: a planted table wider than a phone fails" — and none is read from a document. Readings taken where the check leaves one
// open, each adding no word to it:
//   - "Each route" is each page the site's two entry pages answer: the main page, and every address of the review pages that the page's
//     routing serves — the menu's addresses, and the routes' own names with one identifier of the fixture product where a route takes one.
//     The test names the first part of each address and compares them with the routes MOD-review-pages provides and the views
//     docs/assets/dashboard/built.json builds, so that a route added there and not drawn here fails.
//   - "The window" is the width the browser is given: 390 px for a phone, 1280 px for a desktop. A page "holds an element wider than the
//     window" when an element's box is wider than that width, or when the page can be scrolled sideways. A table in a box that scrolls
//     sideways is such an element: the requirement asks that tables are read "without scrolling sideways".
//   - "The minimum target size" is 24 by 24 CSS pixels (WCAG 2.2, success criterion 2.5.8). A button or link smaller than that is a finding
//     unless the criterion's exception for a link in a sentence, or its exception for spacing (a circle of 24 px centred on the target
//     meets no other target and no circle of another undersized target), holds. A button is a button, a [role=button] or a button input;
//     a link is an a[href] or a [role=link].
//   - "The site's style sheets" are the style sheets the pages link from their own address. A `<style>` element, a style sheet built in script
//     and a style sheet from another address are not; a `<style>` inside a drawn diagram is the diagram's.
// The engine is the controlled Electron of tests/dashboard-backlog-layout.test.mjs, in tests/site-usability.d/browser.mjs; the fixture
// product is in tests/site-usability.d/product.mjs. A route's finding is a todo: the test of its clause asserts that there is none, fails
// today, and names the finding. Each fix is an item of the route's module.

import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stageElectron, openWindow, configure, withStderr } from "./site-usability.d/browser.mjs";
import { ROUTES, CASES, OBSERVE, show, testId } from "./site-usability.d/routes.mjs";
import { serveSite, REPO } from "./site-usability.d/site.mjs";
import { files, history, pullsHandler, tagsHandler } from "./site-usability.d/product.mjs";
import { styleSheetFindings, targetFindings, unrenderedFindings, widthFindings } from "./site-usability.d/inspect.mjs";
import { view as reviewPages } from "../src/review-pages/index.mjs";
import { DASHBOARD, builtViews } from "../src/site/views.mjs";

const WIDTHS = [["phone", 390], ["desktop", 1280]];
const MINIMUM = 24;
const PHONE_MENU_EXPECTED = {
  main: [
    ["requirements", "docs/#spec", false], ["use-cases", "docs/#uc", false], ["architecture", "docs/#arc", false],
    ["implementation", "docs/#backlog", false], ["tests", null, true], ["releases", "docs/#release", false],
    ["maintenance", "docs/#mail", false], ["settings", "docs/#settings", false],
  ],
  review: [
    ["requirements", "#spec", false], ["use-cases", "#uc", false], ["architecture", "#arc", false],
    ["implementation", "#backlog", false], ["tests", null, true], ["releases", "#release", false],
    ["maintenance", "#mail", false], ["settings", "#settings", false],
  ],
};
const CLAUSES = [
  ["sheets", "uses the site's style sheets only"],
  ["targets", "offers no button or link below the minimum target size"],
  ["widths", "holds no element wider than the window"],
];

// What the pages do today that the check names: route -> clause -> the finding, as measured in the controlled Electron at a phone's width
// (at a desktop's width every route passes). Each is a todo until the module of its route fixes it; each fix is an item of that module.
const TODAY = {
  "#uc/UC-001": { widths: "its diagram is drawn; what remains is the Markdown table and the run of code of the use case, wider than a phone's window, and the page scrolls sideways; MOD-review-pages shows the file as MOD-markdown-render renders it" },
  "#review/uc": { widths: "Review all draws the changed use case UC-001 rendered, with its Markdown table and run of code wider than a phone's window, and the page scrolls sideways; MOD-review-pages shows the file as MOD-markdown-render renders it" },
  "#arc": { widths: "the table of the modules is wider than a phone's window (src/trace-pages/flow.mjs, MOD-trace-pages); ITM-1159, The architecture and modules views fit a phone" },
  "#module": { widths: "the table of the modules is wider than a phone's window (src/trace-pages/flow.mjs, MOD-trace-pages); ITM-1159, The architecture and modules views fit a phone" },
};

// ---------------------------------------------------------------- drawing

const MEASURE = (width) => `(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const styleSheetFindings = ${styleSheetFindings}, targetFindings = ${targetFindings}, widthFindings = ${widthFindings}, unrenderedFindings = ${unrenderedFindings};
  return { sheets: styleSheetFindings(), targets: targetFindings(${MINIMUM}), widths: widthFindings(${width}), diagrams: unrenderedFindings(),
    boxes: [...document.querySelectorAll("main pre.diff")].map((box) => box.getAttribute("tabindex")),
    controls: document.querySelectorAll("a[href], button").length,
    text: (document.querySelector("main")?.innerText ?? "").replace(/\\s+/g, " ") };
})()`;

// The phone's two live entry pages each expose the whole process menu. This reports the entry contract and whether every
// entry's rendered box is visible without the menu scrolling sideways; CSS source text alone would not establish either.
const PHONE_MENU = `(() => {
  const menu = document.querySelector(".site-header .menu");
  return { fits: menu.scrollWidth <= menu.clientWidth, entries: [...menu.children].map((entry) => {
    const box = entry.getBoundingClientRect(), style = getComputedStyle(entry);
    return [entry.dataset.entry, entry.getAttribute("href"), entry.getAttribute("aria-disabled") === "true",
      style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0
        && box.left >= 0 && box.right <= innerWidth];
  }) };
})()`;

const measured = new Map(); // "<address> <width name>" -> { sheets, targets, widths, text }
const planted = {};
const phoneMenus = {};
let site = null, browser = null;

const started = Date.now();
const progress = (step) => console.log(`site-usability ${((Date.now() - started) / 1000).toFixed(1)} s: ${step}`);

// Each width's routes are drawn by WINDOWS windows at once, the routes dealt out in turn: a route waits for its page to be quiet (400 ms, DRAWN) and for the measure's
// own 100 ms, which no window can shorten but all can spend together. Each window has a folder of its own for the browser's data, so that no two share a lock.
const WINDOWS = 3;
const windows = [];
const drawn = async (executable, kind, width, routes, index) => {
  const window_ = await openWindow(executable, `${site.address}/__blank`);
  windows.push(window_);
  const page = window_.page;
  await configure(page, "Page.addScriptToEvaluateOnNewDocument", { source: OBSERVE });
  await configure(page, "Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: kind === "phone" });
  const took = [];
  for (const route of routes) {
    const at = Date.now();
    await show(page, site, route.address);
    const drawnAt = Date.now() - at;
    measured.set(`${route.address} ${kind}`, await page.evaluate(MEASURE(width)));
    took.push([route.address, drawnAt, Date.now() - at]);
  }
  progress(`window ${index + 1} of the ${kind}'s width has drawn ${routes.length} routes; the slowest (drawn ms, measured ms): ${JSON.stringify(took.sort((a, b) => b[2] - a[2]).slice(0, 2))}`);
  return window_;
};

const setUp = async () => {
  site = await serveSite({ files: await files(), history: await history(), handlers: [pullsHandler(REPO), tagsHandler(REPO)] });
  progress("the site is served");
  const executable = await stageElectron();
  progress("Electron is staged");
  const opened = await Promise.all(WIDTHS.flatMap(([kind, width]) => Array.from({ length: WINDOWS }, (_, index) =>
    drawn(executable, kind, width, ROUTES.filter((_route, at) => at % WINDOWS === index), index))));
  progress("every route is drawn at both widths");
  // The first window drew the phone's routes; the counter-proofs below plant in it, and the others are closed.
  browser = opened[0];
  for (const each of opened.slice(1)) each.close();
  const page = browser.page;
  // The counter-proofs: the same page at a phone's width, first as it is, then with a table 600 px wide, a button 10 px square and an
  // embedded style sheet planted in it.
  await configure(page, "Emulation.setDeviceMetricsOverride", { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
  await show(page, site, "/");
  phoneMenus.main = await page.evaluate(PHONE_MENU);
  await show(page, site, "#uc");
  phoneMenus.review = await page.evaluate(PHONE_MENU);
  await show(page, site, "#how");
  planted.before = await page.evaluate(MEASURE(390));
  await page.evaluate(`(() => { const main = document.querySelector("main");
    main.insertAdjacentHTML("beforeend", '<table id="planted-table" style="width:600px"><tr><td>planted</td></tr></table>'
      + '<p id="planted-button-row"><button style="width:10px;height:10px;padding:0">x</button><button style="width:10px;height:10px;padding:0;margin-left:2px">x</button></p>'
      + '<style id="planted-style">.planted { color: red; }</style>'); })()`);
  planted.after = await page.evaluate(MEASURE(390));
  // The counter-proof of the failed diagram: the same page with a block that did not render planted, as `renderMermaid` returns one.
  await page.evaluate(`document.querySelector("main").insertAdjacentHTML("beforeend",
    '<div id="planted-unrendered" class="unrendered"><p>Diagram error: planted</p><pre><code>flowchart LR</code></pre></div>')`);
  planted.afterDiagram = await page.evaluate(MEASURE(390));
  console.log(`site-usability ${JSON.stringify([...measured].map(([key, value]) => [key, value.sheets, value.targets.length, value.widths.length]))}`);
};
// A failure after the window opened carries the tail of the browser child's stderr (withStderr), which nothing else writes.
before(async () => { try { await setUp(); } catch (failure) { throw browser ? withStderr(failure, browser.stderr()) : failure; } }, { timeout: 110000 });

after(async () => {
  for (const each of windows) each.close();
  await site?.close();
});

// ---------------------------------------------------------------- the routes

test(`${testId(904, CASES[904].routes)}: the routes drawn are the routes of the site: every route of MOD-review-pages and every view the dashboard builds`, () => {
  const builtFiles = JSON.parse(readFileSync(new URL("../docs/assets/dashboard/built.json", import.meta.url), "utf8"));
  const named = new Set(ROUTES.filter((route) => route.address.startsWith("#")).map((route) => route.address.slice(1).split("/")[0]));
  const required = new Set([...reviewPages.routes.map((route) => route.name), ...builtViews(builtFiles),
    ...DASHBOARD.filter((entry) => entry.builtIn && entry.view).map((entry) => entry.view)]);
  const missing = [...required].filter((name) => !named.has(name) && !["uc", "arc", "spec", "review"].includes(name));
  assert.deepEqual(missing, [], `routes of the site that this test does not draw: ${missing.join(", ")}`);
  for (const name of ["uc", "arc", "spec", "review"]) assert.ok(named.has(name), `the menu's address #${name} is drawn`);
  assert.ok(ROUTES.some((route) => route.address === "/"), "the main page is drawn");
});

for (const route of ROUTES) {
  test(`${testId(904, route.ids[904].drawn)}: ${route.address} was drawn, with its content and its controls, at both widths`, () => {
    for (const [kind] of WIDTHS) {
      const result = measured.get(`${route.address} ${kind}`);
      assert.ok(result.text.includes(route.shows), `${route.address} at a ${kind}'s width shows "${route.shows}"; it shows: ${result.text.slice(0, 200)}`);
      assert.ok(result.controls > 0, `${route.address} at a ${kind}'s width has buttons or links for the target-size check to measure`);
    }
  });
}

for (const route of ROUTES) {
  for (const [clause, title] of CLAUSES) {
    const today = TODAY[route.address]?.[clause];
    test(`${testId(904, route.ids[904][clause])}: ${route.address} ${title}`,
      today ? { todo: `FINDING ${route.address} - ${today}` } : {}, () => {
        for (const [kind] of WIDTHS) {
          const found = measured.get(`${route.address} ${kind}`)[clause];
          assert.deepEqual(found, [], `${route.address} at a ${kind}'s width: ${found.join("; ")}`);
        }
      });
  }
}

// ---------------------------------------------------------------- the menu at a phone's width

// TST-920001 · level: system · module: MOD-site-frame
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: the live main entry page at a 390 px phone viewport
// input: its eight process-menu entries' rendered boxes, destinations, and disabled state
// expect: the literal eight-entry main-menu contract, with every entry visible and no sideways menu scrolling
test("TST-920001 the main entry page shows all eight process-menu entries at 390 px without sideways scrolling", () => {
  const page = "main", expected = PHONE_MENU_EXPECTED.main, actual = phoneMenus.main;
  assert.equal(actual.fits, true, `${page} menu is not wider than its visible box`);
  assert.deepEqual(actual.entries, expected.map(([key, href, disabled]) => [key, href, disabled, true]),
    `${page} menu order, destinations, disabled entry, and visible entry geometry at 390 px`);
});

// TST-920002 · level: system · module: MOD-site-frame
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: the live review entry page at a 390 px phone viewport
// input: its eight process-menu entries' rendered boxes, destinations, and disabled state
// expect: the literal eight-entry review-menu contract, with every entry visible and no sideways menu scrolling
test("TST-920002 the review entry page shows all eight process-menu entries at 390 px without sideways scrolling", () => {
  const page = "review", expected = PHONE_MENU_EXPECTED.review, actual = phoneMenus.review;
  assert.equal(actual.fits, true, `${page} menu is not wider than its visible box`);
  assert.deepEqual(actual.entries, expected.map(([key, href, disabled]) => [key, href, disabled, true]),
    `${page} menu order, destinations, disabled entry, and visible entry geometry at 390 px`);
});

// ---------------------------------------------------------------- the counter-proofs

// The page the counter-proofs plant in, as it is, has none of the planted faults — the known positive of the three that follow.
test(`${testId(904, CASES[904].plantedBefore)}: the page before the planting has no table, button or embedded style sheet that the checks name`, () => {
  assert.deepEqual(planted.before.sheets, [], "no style sheet finding before the planting");
  assert.equal(planted.before.widths.some((finding) => finding.startsWith("table#planted-table")), false);
  assert.equal(planted.before.targets.some((finding) => finding.includes('"x"')), false);
});

test(`${testId(904, CASES[904].plantedTable)}: a planted table wider than a phone fails the width check`, () => {
  assert.ok(planted.after.widths.some((finding) => finding.startsWith("table#planted-table is 600 px wide")), `findings: ${planted.after.widths.join("; ")}`);
  assert.ok(planted.after.widths.some((finding) => finding.startsWith("the page scrolls sideways")), `findings: ${planted.after.widths.join("; ")}`);
});

test(`${testId(904, CASES[904].plantedButton)}: a planted button 10 px square fails the target-size check`, () => {
  assert.ok(planted.after.targets.includes('button "x" is 10 x 10 px'), `findings: ${planted.after.targets.join("; ")}`);
});

test(`${testId(904, CASES[904].plantedSheet)}: a planted embedded style sheet fails the style-sheet check`, () => {
  assert.deepEqual(planted.after.sheets, ["an embedded <style> element"]);
});

// ---------------------------------------------------------------- a diagram that failed

// given: every route drawn at both widths; input: the blocks of the page with the class `unrendered`, which MOD-markdown-render shows for a diagram that fails; expect: none
for (const route of ROUTES) {
  test(`${testId(904, route.ids[904].diagrams)}: ${route.address} holds no block that did not render, such as a diagram that failed`, () => {
    for (const [kind] of WIDTHS) {
      const found = measured.get(`${route.address} ${kind}`).diagrams;
      assert.deepEqual(found, [], `${route.address} at a ${kind}'s width: ${found.join("; ")}`);
    }
  });
}

// The counter-proof: the page before the planting has no such block; with a failed diagram planted, the check names it with its reason.
test(`${testId(904, CASES[904].diagramBefore)}: the page before the planting holds no block that did not render`, () => {
  assert.deepEqual(planted.before.diagrams, []);
});

test(`${testId(904, CASES[904].diagramAfter)}: a planted failed diagram fails the check and is named with its reason`, () => {
  assert.deepEqual(planted.afterDiagram.diagrams, ['a block that did not render: "Diagram error: planted"']);
});

// ---------------------------------------------------------------- a changed file

// given: the fixture's use case UC-001, accepted at an earlier text and changed since; input: the routes that draw it, at both widths, and each `pre.diff` in <main>;
// expect: the route draws at least one difference box (the known positive that the checks above meet it), and each has tabindex "0" (ITM-921)
for (const address of ["#uc/UC-001", "#review/uc"]) {
  test(`${testId(904, ROUTES.find((each) => each.address === address).ids[904].box)}: ${address} draws the difference box of the changed use case, which the keyboard reaches`, () => {
    for (const [kind] of WIDTHS) {
      const boxes = measured.get(`${address} ${kind}`).boxes;
      assert.equal(boxes.length > 0, true, `${address} at a ${kind}'s width draws a difference box`);
      assert.deepEqual(boxes.filter((tabindex) => tabindex !== "0"), [], `${address} at a ${kind}'s width: boxes without tabindex 0`);
    }
  });
}

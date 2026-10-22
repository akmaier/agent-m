// The waiting state and rendered UC-001 Markdown in the site's existing fixture, drawn by its native Electron caller at the
// phone and desktop widths. This is a focused release check of the integrated Frame and Markdown Renderer changes.
// Run: node --test tests/release-itm-1174-917-rendered.test.mjs
//
// Module: MOD-site-frame; MOD-markdown-render
// Guards: UC-001; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; THE SITE SERVES A SCREEN READER
// Level: release

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { stageElectron, openWindow, configure, withStderr } from "./site-usability.d/browser.mjs";
import { serveSite, REPO } from "./site-usability.d/site.mjs";
import { files, history, pullsHandler, tagsHandler } from "./site-usability.d/product.mjs";
import { axeSource, RUN_AXE } from "./site-usability.d/axe.mjs";
import { OBSERVE, show } from "./site-usability.d/routes.mjs";
import { widthFindings } from "./site-usability.d/inspect.mjs";

const WIDTHS = [["phone", 390], ["desktop", 1280]];
const TABLE_HEADERS = ["Request", "Path read", "Batch", "Answer when the file is missing", "Answer when the commit is unknown", "Counted as"];
const TABLE_ROW = ["Request", "readFile", "Path read", "docs/use-cases/UC-001-read-a-file-at-a-pinned-commit.md", "Batch", "one hundred files at most",
  "Answer when the file is missing", "the path, named", "Answer when the commit is unknown", "the commit, named", "Counted as", "one request"];
const CODE = "/repos/akmaier/agent-m/git/trees/0123456789abcdef0123456789abcdef01234567?recursive=1&per_page=100&page=1&format=json";
const MIN_BADGE_CONTRAST = 4.5;
const found = new Map();
let site = null, browser = null;

const markdown = (width) => `(() => {
  const table = [...document.querySelectorAll("main .md table")].find((entry) => entry.querySelector("thead"));
  const code = [...document.querySelectorAll("main .md code")].find((entry) => entry.textContent === ${JSON.stringify(CODE)});
  const box = code?.getBoundingClientRect();
  return {
    table: table ? {
      visible: (() => { const rect = table.getBoundingClientRect(), style = getComputedStyle(table); return style.display !== "none" && rect.width > 0 && rect.height > 0; })(),
      headers: [...table.querySelectorAll("thead th")].map((cell) => cell.textContent),
      row: [...table.querySelectorAll("tbody tr")][0] ? [...[...table.querySelectorAll("tbody tr")][0].querySelectorAll("td")].flatMap((cell) => [cell.getAttribute("data-label"), cell.textContent]) : [],
    } : null,
    code: code ? { text: code.textContent, visible: getComputedStyle(code).display !== "none" && box.width > 0 && box.height > 0,
      right: box.right, viewport: innerWidth } : null,
    widths: (${widthFindings})(${width}),
  };
})()`;

before(async () => {
  try {
    site = await serveSite({ files: await files(), history: await history(), handlers: [pullsHandler(REPO), tagsHandler(REPO)] });
    browser = await openWindow(await stageElectron(), `${site.address}/__blank`);
    const page = browser.page, axe = axeSource();
    await configure(page, "Page.addScriptToEvaluateOnNewDocument", { source: OBSERVE });
    for (const [kind, width] of WIDTHS) {
      await configure(page, "Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: kind === "phone" });
      await show(page, site, "#backlog");
      await page.evaluate(`typeof axe === "undefined" ? (0, eval)(${JSON.stringify(axe)}) : 0`);
      found.set(`#backlog ${kind}`, { badges: await page.evaluate(`[...document.querySelectorAll("main .b-superseded")].map((badge) => {
        const style = getComputedStyle(badge);
        const foreground = new axe.commons.color.Color(), background = new axe.commons.color.Color();
        foreground.parseString(style.color);
        background.parseString(style.backgroundColor);
        return { text: badge.textContent.replace(/\\s+/g, " ").trim(), color: style.color, background: style.backgroundColor,
          contrast: axe.commons.color.getContrast(background, foreground) };
      })`),
        contrast: (await page.evaluate(RUN_AXE)).filter((violation) => violation.id === "color-contrast") });
      for (const address of ["#uc/UC-001", "#review/uc"]) {
        await show(page, site, address);
        found.set(`${address} ${kind}`, await page.evaluate(markdown(width)));
      }
    }
  } catch (failure) {
    throw browser ? withStderr(failure, browser.stderr()) : failure;
  }
}, { timeout: 110000 });

after(async () => {
  browser?.close();
  await site?.close();
});

// TST-1174101 · level: release · module: MOD-site-frame
// guards: THE SITE SERVES A SCREEN READER
// given: the live fixture #backlog route at the existing 390 px phone and 1280 px desktop widths
// input: its literal waiting for an item it builds on badge and axe-core color-contrast violations
// expect: waiting for an item it builds on is visibly present in .b-superseded, its computed text/background contrast is at least 4.5, and color-contrast is [] at both widths
test("TST-1174101 the backlog waiting-for-prerequisite badge has no axe color-contrast violation", () => {
  for (const [kind] of WIDTHS) {
    const result = found.get(`#backlog ${kind}`);
    assert.ok(result.badges.some((badge) => badge.text === "waiting for an item it builds on"),
      `#backlog at a ${kind}'s width renders its waiting-for-prerequisite badge; actual=${JSON.stringify(result.badges)}`);
    assert.ok(result.badges.every((badge) => badge.contrast >= MIN_BADGE_CONTRAST),
      `#backlog at a ${kind}'s width gives every waiting badge at least ${MIN_BADGE_CONTRAST}:1 computed contrast; actual=${JSON.stringify(result.badges)}`);
    assert.deepEqual(result.contrast, [], `#backlog at a ${kind}'s width has a color-contrast violation`);
  }
});

// TST-917101 · level: release · module: MOD-markdown-render
// guards: UC-001; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: UC-001's live fixture Markdown table and literal long code at the existing 390 px phone and 1280 px desktop widths
// input: #uc/UC-001 and #review/uc in the unchanged Electron geometry caller, including every unfiltered width finding
// expect: the six literal headings and their first-row labels/content remain, the literal code is visible within the viewport, and width findings are []
test("TST-917101 the UC-001 and review Markdown table and code retain meaning and reflow at both widths", () => {
  for (const address of ["#uc/UC-001", "#review/uc"]) {
    for (const [kind] of WIDTHS) {
      const result = found.get(`${address} ${kind}`);
      assert.equal(result.table?.visible, true, `${address} at a ${kind}'s width renders the Markdown table`);
      assert.deepEqual(result.table?.headers, TABLE_HEADERS, `${address} at a ${kind}'s width preserves the column headings`);
      assert.deepEqual(result.table?.row, TABLE_ROW, `${address} at a ${kind}'s width preserves each first-row label and value`);
      assert.equal(result.code?.text, CODE, `${address} at a ${kind}'s width renders the literal code`);
      assert.equal(result.code?.visible, true, `${address} at a ${kind}'s width visibly renders the literal code`);
      assert.ok(result.code.right <= result.code.viewport, `${address} at a ${kind}'s width keeps the literal code within the viewport`);
      assert.deepEqual(result.widths, [], `${address} at a ${kind}'s width has unfiltered width findings: ${result.widths.join("; ")}`);
    }
  }
});

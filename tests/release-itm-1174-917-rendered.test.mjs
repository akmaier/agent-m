// The waiting state and rendered UC-001 Markdown in the site's existing fixture, drawn by its native Electron caller at the
// phone and desktop widths. This is a focused release check of the integrated Frame and Markdown Renderer changes.
// Run: node --test tests/release-itm-1174-917-rendered.test.mjs
//
// Module: MOD-site-frame; MOD-markdown-render
// Guards: UC-001; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; THE SITE SERVES A SCREEN READER
// Level: release

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { stageElectron, openWindow, configure, withStderr, until } from "./site-usability.d/browser.mjs";
import { serveSite, REPO } from "./site-usability.d/site.mjs";
import { files, history, pullsHandler, tagsHandler } from "./site-usability.d/product.mjs";
import { axeSource, RUN_AXE } from "./site-usability.d/axe.mjs";
import { OBSERVE, DRAWN, show } from "./site-usability.d/routes.mjs";
import { widthFindings, targetFindings } from "./site-usability.d/inspect.mjs";

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
        const rect = badge.getBoundingClientRect();
        const foreground = new axe.commons.color.Color(), background = new axe.commons.color.Color();
        foreground.parseString(style.color);
        background.parseString(style.backgroundColor);
        return { text: badge.textContent.replace(/\\s+/g, " ").trim(), color: style.color, background: style.backgroundColor,
          visible: style.display !== "none" && style.visibility === "visible" && rect.width > 0 && rect.height > 0,
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
// expect: waiting for an item it builds on is visibly rendered in .b-superseded, its computed text/background contrast is at least 4.5, and color-contrast is [] at both widths
test("TST-1174101 the backlog waiting-for-prerequisite badge has no axe color-contrast violation", () => {
  for (const [kind] of WIDTHS) {
    const result = found.get(`#backlog ${kind}`);
    assert.ok(result.badges.some((badge) => badge.text === "waiting for an item it builds on"),
      `#backlog at a ${kind}'s width renders its waiting-for-prerequisite badge; actual=${JSON.stringify(result.badges)}`);
    assert.ok(result.badges.some((badge) => badge.text === "waiting for an item it builds on" && badge.visible),
      `#backlog at a ${kind}'s width visibly renders its waiting-for-prerequisite badge; actual=${JSON.stringify(result.badges)}`);
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

const LONG_REQUIREMENT = "AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION";
const LONG_RULE = "The input Agent M sends with a job that writes, changes or reviews the architecture gives chapters 9, 10, 11 and 12 of the book Vibe Coding in full.";
const JOB_GROUP = "13. Process execution and jobs";

const requirements = (width) => `(() => {
  const root = document.querySelector(".current-requirements");
  const visible = (node) => {
    if (!node) return false;
    const rect = node.getBoundingClientRect(), style = getComputedStyle(node);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility === "visible";
  };
  const styleOf = (node) => {
    if (!node) return null;
    const style = getComputedStyle(node), rect = node.getBoundingClientRect();
    return { visible: visible(node), disabled: node.disabled, font: style.fontFamily, size: style.fontSize,
      border: parseFloat(style.borderTopWidth), borderStyle: style.borderTopStyle,
      padding: parseFloat(style.paddingLeft), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  };
  const groups = [...(root?.querySelectorAll(".spec-group") ?? [])].map((group) => {
    const toggle = group.querySelector(".spec-group-toggle"), held = group.querySelector(".spec-group-held");
    return { title: toggle.textContent, count: held.textContent, visible: visible(group), label: styleOf(toggle),
      countVisible: visible(held), expanded: toggle.getAttribute("aria-expanded"), bodyVisible: visible(group.querySelector(".spec-group-body")) };
  });
  const members = [...(root?.querySelectorAll(".requirement-name") ?? [])];
  const member = members.find((node) => node.textContent === ${JSON.stringify(LONG_REQUIREMENT)});
  const detail = root?.querySelector(".requirement-detail");
  const rule = [...(detail?.querySelectorAll(".requirement-field") ?? [])].find((node) => node.querySelector("h4")?.textContent === "Rule")?.querySelector(".md");
  const textBoxes = [member, rule].filter(visible).flatMap((node) => {
    const range = document.createRange(); range.selectNodeContents(node);
    return [...range.getClientRects()].map((rect) => ({ left: rect.left, right: rect.right, height: rect.height }));
  });
  return { heading: root?.querySelector("h2")?.textContent, headingVisible: visible(root?.querySelector("h2")), groups,
    names: members.map((node) => node.textContent), visibleNames: members.filter(visible).map((node) => node.textContent),
    reference: styleOf(document.querySelector(".version-choice")),
    controls: [...(root?.querySelectorAll(".spec-narrow input, .spec-narrow select") ?? [])].map(styleOf),
    labels: [...(root?.querySelectorAll(".spec-narrow label") ?? [])].map((node) => ({ name: node.firstChild.textContent.trim(), visible: visible(node) })),
    member: styleOf(member), rule: rule?.textContent.replace(/\\s+/g, " ").trim(), ruleVisible: visible(rule), textBoxes,
    widths: (${widthFindings})(${width}), targets: (${targetFindings})(24) };
})()`;

// TST-1178101 · level: release · module: MOD-site-frame
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: the fixed complete requirements-repair SPEC/group Markdown input, with 17 groups and 414 unique members, on the live dashboard's #requirements route
// input: 390 px phone and 1280 px desktop; open group 13, narrow to the literal architecture-job name, open its rule, clear the search and close the group
// expect: groups 0 and 16 show 5 and 4 requirements; shared-font boxed enabled controls and visible labels/counts; exactly the literal filtered member and group remain visible; its complete literal rule and text boxes fit; clearing restores 17 groups/414 members; unfiltered width and 24 px target findings are []
test("TST-1178101 the full Requirements tree shares controls and keeps filtered long content readable at both widths", async () => {
  const input = await files();
  input["SPEC.md"] = readFileSync(new URL("./fixtures/requirements-repair/SPEC.md", import.meta.url), "utf8");
  input["docs/groups/requirements.md"] = readFileSync(new URL("./fixtures/requirements-repair/requirements.md", import.meta.url), "utf8");
  const fullSite = await serveSite({ files: input, history: await history(), handlers: [pullsHandler(REPO), tagsHandler(REPO)] });
  const page = browser.page;
  const measure = (width) => page.evaluate(requirements(width));
  const clickGroup = () => page.evaluate(`(() => { [...document.querySelectorAll(".spec-group-toggle")].find((node) => node.textContent === ${JSON.stringify(JOB_GROUP)}).click(); })()`);
  const narrow = async (text) => {
    await page.evaluate(`(() => { const input = document.querySelector(".spec-narrow-text"); input.value = ${JSON.stringify(text)}; input.dispatchEvent(new Event("input", { bubbles: true })); })()`);
    await until("the narrowed Requirements tree is drawn", () => page.evaluate(DRAWN));
  };
  const fits = (result, where) => {
    assert.deepEqual(result.widths, [], `${where}: unfiltered width findings`);
    assert.deepEqual(result.targets, [], `${where}: unchanged 24 px target findings`);
  };
  try {
    for (const [kind, width] of WIDTHS) {
      await configure(page, "Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: kind === "phone" });
      // A new origin carries the complete input without changing either old case's fixture or setup.
      await show(page, fullSite, "/");
      await show(page, fullSite, "#requirements");
      const initial = await measure(width);
      assert.equal(initial.heading, "Current requirements");
      assert.equal(initial.headingVisible, true);
      assert.equal(initial.groups.length, 17);
      assert.equal(initial.names.length, 414);
      assert.equal(new Set(initial.names).size, 414);
      for (const [title, count] of [["0. Hard product rules", "5 requirements"], ["16. Usability", "4 requirements"]]) {
        assert.equal(initial.groups.find((group) => group.title === title)?.count, count);
      }
      assert.ok(initial.groups.every((group) => group.visible && group.label.visible && group.countVisible && group.expanded === "false" && !group.bodyVisible),
        `${kind}: all group titles/counts are visible and bodies start closed; actual=${JSON.stringify(initial.groups)}`);
      assert.equal(initial.reference?.visible, true);
      assert.equal(initial.controls.length, 4);
      assert.deepEqual(initial.labels, [{ name: "status", visible: true }, { name: "source", visible: true }, { name: "realised", visible: true }]);
      for (const control of [...initial.controls, ...initial.groups.map((group) => group.label)]) {
        assert.ok(control.visible && !control.disabled);
        assert.equal(control.font, initial.reference.font, `${kind}: controls share the version selector's font`);
        assert.equal(control.size, initial.reference.size, `${kind}: controls share the version selector's text size`);
        assert.ok(control.border > 0 && control.borderStyle !== "none" && control.padding > 0, `${kind}: boxed, padded controls; actual=${JSON.stringify(control)}`);
      }
      for (let a = 0; a < initial.controls.length; a += 1) for (let b = a + 1; b < initial.controls.length; b += 1) {
        const x = initial.controls[a], y = initial.controls[b];
        assert.ok(x.right <= y.left || y.right <= x.left || x.bottom <= y.top || y.bottom <= x.top, `${kind}: narrowing controls do not overlap`);
      }
      assert.ok(Math.max(...initial.controls.map((control) => control.bottom)) <= initial.groups[0].label.top, `${kind}: controls stand above the tree`);
      fits(initial, `${kind} collapsed`);
      await clickGroup();
      const opened = await measure(width);
      assert.ok(opened.groups.find((group) => group.title === JOB_GROUP)?.bodyVisible);
      assert.ok(opened.visibleNames.includes(LONG_REQUIREMENT));
      assert.ok(opened.groups.filter((group) => group.title !== JOB_GROUP).every((group) => !group.bodyVisible));
      fits(opened, `${kind} opened`);
      await narrow(LONG_REQUIREMENT);
      const filtered = await measure(width);
      assert.deepEqual(filtered.visibleNames, [LONG_REQUIREMENT], `${kind}: only the literal matching requirement is visibly rendered`);
      assert.deepEqual(filtered.groups.filter((group) => group.visible).map((group) => group.title), [JOB_GROUP], `${kind}: only the matching group remains visible`);
      assert.ok(filtered.member?.visible);
      fits(filtered, `${kind} filtered`);
      await page.evaluate(`(() => { [...document.querySelectorAll(".requirement-name")].find((node) => node.textContent === ${JSON.stringify(LONG_REQUIREMENT)}).click(); })()`);
      await until("the opened requirement is drawn", () => page.evaluate(DRAWN));
      const detail = await measure(width);
      assert.equal(detail.rule, LONG_RULE, `${kind}: the complete rule remains readable`);
      assert.equal(detail.ruleVisible, true);
      assert.ok(detail.textBoxes.length > 0);
      assert.ok(detail.textBoxes.every((box) => box.height > 0 && box.left >= 0 && box.right <= width), `${kind}: rendered long-name/rule text fits; actual=${JSON.stringify(detail.textBoxes)}`);
      fits(detail, `${kind} detail`);
      await narrow("");
      const cleared = await measure(width);
      assert.equal(cleared.groups.filter((group) => group.visible).length, 17);
      assert.equal(cleared.names.length, 414);
      assert.ok(cleared.visibleNames.length > 1 && cleared.visibleNames.includes(LONG_REQUIREMENT));
      await clickGroup();
      assert.ok((await measure(width)).groups.every((group) => !group.bodyVisible), `${kind}: the opened group closes again`);
    }
  } finally {
    await fullSite.close();
  }
});

// MOD-trace-pages' public specification route — the SPEC overview of ITM-277, the version choice above it (ITM-594), and what an opened
// requirement shows beside its four fields: what traces to it and its open proposals, each linked (ITM-597).
//
// Run: node --test tests/trace-pages-specification.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT HAS FOUR FIELDS; THE BROWSER SHOWS ANY RELEASED VERSION; A REQUIREMENT SHOWS WHAT TRACES TO IT; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// Level: unit
//
// This test calls the public trace/specification Route.render with a Host/Snapshot-shaped fake (the DOM and the fixtures are those of
// tests/trace-pages-harness.mjs). The fixture has two
// sections and a requirement before every section. The fake has no write method, so rendering has no write path.
// Readings the version-choice cases take: the ref the caller hands is "current" when the Host names it the default branch, else it is
// offered under its own name; the tags are those listTags gives, newest first by their vYYYY.MINOR.PATCH numbers, a tag of another form
// after them; a Host whose listTags fails offers no tag; any ref that is not the default branch is read-only and the view says "as of" it.

import test from "node:test";
import assert from "node:assert/strict";
import { blobOf, doc, document, find, treeHost, until } from "./trace-pages-harness.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const SPEC = `# Fixture — Specification

**OUTSIDE REQUIREMENT** *(Source outside)*
Outside rule.
*Check:* at review.

## First section

**FIRST REQUIREMENT** *(Source one)*
First rule.
*Check:* \`tests/first.test.mjs\`

## Second section

**SECOND REQUIREMENT** *(Source two)*
Second <img src=x onerror=alert(1)> rule.
*Check:* \`tests/second.test.mjs\`
`;

// tags: what listTags names; specs: the SPEC at a ref, where it differs; defaultBranch: what repositoryInfo names (null: no repositoryInfo);
// gates: a promise a ref's snapshot waits for; unreadable: refs whose snapshot cannot be read; tagsFail: listTags fails.
function host(text = SPEC, { tags = [], specs = {}, defaultBranch = null, gates = {}, unreadable = [], tagsFail = false } = {}) {
  const calls = [];
  const fake = {
    calls,
    async readSnapshot(ref) {
      calls.push(ref);
      await gates[ref];
      if (unreadable.includes(ref)) throw Object.assign(new Error("unreachable"), { name: "Unreachable" });
      const at = specs[ref] ?? text;
      return { ref, commit: ref, paths: at === null ? [] : ["SPEC.md"], read: async (path) => path === "SPEC.md" ? at : null, blob: () => null };
    },
    async listTags() { if (tagsFail) throw new Error("tags unavailable"); return tags.map((name) => ({ name, commit: `commit-of-${name}` })); },
  };
  if (defaultBranch !== null) fake.repositoryInfo = async () => ({ defaultBranch, visibility: "public", canWrite: false, archived: false, description: "" });
  return fake;
}
function render(productHost, params = { key: "specification", ref: "pinned-commit" }) { const target = document.createElement("div"); document.body.append(target); return route.render(target, { product: { host: productHost } }, params).then(() => target); }

// CASE ITM-277-01
// TST-473163 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: a public trace Route and a Host whose pinned snapshot has one unsectioned requirement and two sections
// input: Route.render(target, { product: { host } }, { key: "specification", ref: "pinned-commit" })
// expect: the Host receives exactly that ref; current requirement names appear once, before/within their sections in SPEC order
test("the public trace/specification route reads the pinned SPEC and lists each requirement in file order", async () => {
  assert.ok(route, "the public trace route is exposed");
  const productHost = host();
  const target = await render(productHost);
  assert.deepEqual(productHost.calls, ["pinned-commit"]);
  const names = find(target, (node) => node.localName === "button" && node.className.includes("requirement-name"));
  assert.deepEqual(names.map((node) => node.textContent), ["OUTSIDE REQUIREMENT", "FIRST REQUIREMENT", "SECOND REQUIREMENT"]);
  assert.equal(new Set(names.map((node) => node.textContent)).size, 3);
  const visible = target.textContent;
  assert.ok(visible.indexOf("OUTSIDE REQUIREMENT") < visible.indexOf("First section"));
  assert.ok(visible.indexOf("First section") < visible.indexOf("FIRST REQUIREMENT"));
  assert.ok(visible.indexOf("FIRST REQUIREMENT") < visible.indexOf("Second section"));
  assert.deepEqual(find(target, (node) => node.localName === "h3").map((node) => node.textContent), ["First section", "Second section"]);
});

// CASE ITM-277-02
// TST-473164 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: the rendered overview and an unsafe HTML image in SECOND REQUIREMENT's rule (known positive: SPEC contains both `<img` and `onerror`)
// input: a click on SECOND REQUIREMENT's displayed name
// expect: its name, source, rule and check are readable in the detail, no image node is created, and no route/navigation context is needed
test("selecting a requirement renders its four fields safely without navigating to a queue", async () => {
  assert.match(SPEC, /<img[^>]+onerror=/, "known positive: the fixture has unsafe HTML");
  const target = await render(host());
  const name = find(target, (node) => node.localName === "button" && node.textContent === "SECOND REQUIREMENT")[0];
  name.dispatchEvent(new Event("click"));
  const opened = name.parentNode.parentNode.nextSibling;
  for (const text of ["SECOND REQUIREMENT", "Source", "Source two", "Rule", "Second <img src=x onerror=alert(1)> rule.", "Check", "tests/second.test.mjs"]) {
    assert.match(opened.textContent, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal(find(opened, (node) => node.localName === "img").length, 0);
  assert.equal(find(opened, (node) => node.localName === "a" && node.getAttribute("href")?.includes("queue")).length, 0);
});

// CASE ITM-278-01
// TST-473165 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: the public trace/specification route with two sectioned requirements and one outside a section
// input: a fresh render, then each readable section-heading control is clicked to open, close and reopen its own list
// expect: section lists start hidden, each toggle changes only its own list, and the outside requirement stays reachable
test("section headings start collapsed and independently toggle their requirement lists", async () => {
  const target = await render(host());
  const sections = find(target, (node) => node.localName === "section" && node.className.includes("spec-section"));
  const toggles = sections.map((section) => find(section, (node) => node.localName === "button" && node.className.includes("spec-section-toggle"))[0]);
  const tables = sections.map((section) => find(section, (node) => node.localName === "table")[0]);
  assert.deepEqual(toggles.map((toggle) => toggle?.textContent), ["First section", "Second section"]);
  assert.ok(tables.every((table) => table.getAttribute("hidden") === "hidden"), "a fresh render hides every section list");
  assert.ok(find(target, (node) => node.localName === "button" && node.textContent === "OUTSIDE REQUIREMENT").length === 1,
    "the requirement outside sections remains reachable");
  toggles[0].dispatchEvent(new Event("click"));
  assert.equal(tables[0].getAttribute("hidden"), null, "the first heading opens its own list");
  assert.equal(tables[1].getAttribute("hidden"), "hidden", "the second list stays collapsed");
  toggles[0].dispatchEvent(new Event("click"));
  assert.equal(tables[0].getAttribute("hidden"), "hidden", "the same heading closes its list");
  toggles[0].dispatchEvent(new Event("click"));
  assert.equal(tables[0].getAttribute("hidden"), null, "the same heading reopens its list");
});

// CASE ITM-278-02
// TST-473166 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: a displayed current requirement in a row-local closed detail
// input: click its existing requirement-name button three times
// expect: the first click opens readable four fields, the second closes them, and the third reopens them without changing another section
test("a requirement name toggles its row-local detail closed and open again", async () => {
  const target = await render(host());
  const name = find(target, (node) => node.localName === "button" && node.textContent === "FIRST REQUIREMENT")[0];
  const opened = name.parentNode.parentNode.nextSibling;
  assert.equal(opened.textContent, "", "the row-local detail starts closed");
  name.dispatchEvent(new Event("click"));
  for (const text of ["FIRST REQUIREMENT", "Source", "Source one", "Rule", "First rule.", "Check", "tests/first.test.mjs"]) {
    assert.match(opened.textContent, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "the first click opens the readable fields");
  }
  name.dispatchEvent(new Event("click"));
  assert.equal(opened.textContent, "", "the second click closes that detail");
  name.dispatchEvent(new Event("click"));
  assert.match(opened.textContent, /FIRST REQUIREMENT/, "the third click reopens the same detail");
});

// CASE ITM-277-03
// TST-473167 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: a Host whose pinned snapshot has no SPEC.md, no tags, and no default branch it can name
// input: the same public specification route
// expect: the version choice offers only the handed ref (UC-020 1c) and says "as of" it; the page then states that the current requirements are empty; no write operation is called
test("an absent or empty SPEC has an explicit empty state and rendering offers no write", async () => {
  const productHost = host(null);
  const target = await render(productHost, { key: "specification", ref: "pinned-empty" });
  assert.equal(target.textContent, "Version pinned-emptyNo release is tagged yet (UC-013); only the current text can be shown.as of pinned-emptyCurrent requirementsNo current requirements are recorded in SPEC.md.");
  assert.equal(Object.hasOwn(productHost, "commitFiles"), false);
});

// The version choice (ITM-594). The Host names main the default branch; main has the SPEC above, the tag v2026.1.0 an older one.
const OLD_SPEC = `# Fixture — Specification

## Old section

**OLD REQUIREMENT** *(Source old)*
Old rule.
*Check:* \`tests/old.test.mjs\`
`;
const options = (target) => find(target, (node) => node.localName === "option");
const selectOf = (target) => find(target, (node) => node.localName === "select")[0];
const names = (target) => find(target, (node) => node.localName === "button" && node.className.includes("requirement-name")).map((node) => node.textContent);
const choose = (target, ref) => { const select = selectOf(target); select.value = ref; select.dispatchEvent(new Event("change")); };
const editLinks = (target) => find(target, (node) => node.localName === "a" && /requirement-(edit|new)/.test(node.className));
const asOf = (target) => find(target, (node) => node.localName === "p" && node.className === "version-as-of").map((node) => node.textContent);
const tagged = (extra = {}) => host(SPEC, { defaultBranch: "main", tags: ["v2026.1.0"], specs: { "v2026.1.0": OLD_SPEC }, ...extra });
const mainParams = { key: "specification", ref: "main" };
const CURRENT_NAMES = ["OUTSIDE REQUIREMENT", "FIRST REQUIREMENT", "SECOND REQUIREMENT"];

// CASE ITM-594-01
// TST-594000 · level: unit · module: MOD-trace-pages
// guards: UC-020 (steps 1, 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: a Host that names main the default branch and gives the tags v2026.1.9, v2026.10.0, nightly, v2026.2.0, v2025.12.3 in that order
// input: the route rendered at main
// expect: the options are, in this order, main (shown as "current"), v2026.10.0, v2026.2.0, v2026.1.9, v2025.12.3, nightly (shown by their names); main is selected; no "as of" line
test("the version choice offers the default branch as current and every tag, newest first by number", async () => {
  const target = await render(host(SPEC, { defaultBranch: "main", tags: ["v2026.1.9", "v2026.10.0", "nightly", "v2026.2.0", "v2025.12.3"] }), mainParams);
  assert.deepEqual(options(target).map((node) => node.value), ["main", "v2026.10.0", "v2026.2.0", "v2026.1.9", "v2025.12.3", "nightly"]);
  assert.deepEqual(options(target).map((node) => node.textContent), ["current", "v2026.10.0", "v2026.2.0", "v2026.1.9", "v2025.12.3", "nightly"]);
  assert.equal(selectOf(target).value, "main");
  assert.deepEqual(asOf(target), []);
});

// CASE ITM-594-02
// TST-594001 · level: unit · module: MOD-trace-pages
// guards: UC-020 (step 1c); THE BROWSER SHOWS ANY RELEASED VERSION
// given: a Host that names main the default branch and gives no tag; and one whose listTags fails
// input: the route rendered at main with each
// expect: for each, the only option is main shown as "current", and a note says that no release is tagged yet and points to UC-013
test("a product without tags is offered only current, with a pointer to UC-013", async () => {
  for (const productHost of [host(SPEC, { defaultBranch: "main" }), host(SPEC, { defaultBranch: "main", tagsFail: true })]) {
    const target = await render(productHost, mainParams);
    assert.deepEqual(options(target).map((node) => [node.value, node.textContent]), [["main", "current"]]);
    assert.deepEqual(find(target, (node) => node.localName === "p" && node.className === "version-none").map((node) => node.textContent),
      ["No release is tagged yet (UC-013); only the current text can be shown."]);
  }
});

// CASE ITM-594-03
// TST-594002 · level: unit · module: MOD-trace-pages
// guards: UC-020 (steps 1, 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: main has OUTSIDE, FIRST and SECOND REQUIREMENT and is the default branch; the tag v2026.1.0 has OLD REQUIREMENT only
// input: the route rendered at main, then v2026.1.0 chosen
// expect: at main three Edit links, two + Requirement links and no "as of"; readSnapshot is then asked main, v2026.1.0 and nothing else; the tree lists only OLD REQUIREMENT; v2026.1.0 is selected; the view says "as of v2026.1.0"; no Edit and no + Requirement link
test("choosing a tag draws the SPEC of that tag, read-only and as of it", async () => {
  const productHost = tagged();
  const target = await render(productHost, mainParams);
  assert.deepEqual(names(target), CURRENT_NAMES);
  assert.equal(editLinks(target).filter((node) => node.className.includes("requirement-edit")).length, 3);
  assert.equal(editLinks(target).filter((node) => node.className.includes("requirement-new")).length, 2);
  assert.deepEqual(asOf(target), []);
  choose(target, "v2026.1.0");
  await until(() => names(target)[0] === "OLD REQUIREMENT");
  assert.deepEqual(productHost.calls, ["main", "v2026.1.0"]);
  assert.deepEqual(names(target), ["OLD REQUIREMENT"]);
  assert.equal(selectOf(target).value, "v2026.1.0");
  assert.deepEqual(asOf(target), ["as of v2026.1.0"]);
  assert.deepEqual(editLinks(target), []);
});

// CASE ITM-594-04
// TST-594003 · level: unit · module: MOD-trace-pages
// guards: UC-020 (steps 1, 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: the route rendered at main and the tag v2026.1.0 chosen
// input: main chosen again
// expect: readSnapshot is asked main, v2026.1.0, main; the three current requirements are listed with five Edit and + Requirement links; main is selected; no "as of" line
test("choosing current again draws the default branch editable", async () => {
  const productHost = tagged();
  const target = await render(productHost, mainParams);
  choose(target, "v2026.1.0");
  await until(() => names(target)[0] === "OLD REQUIREMENT");
  choose(target, "main");
  await until(() => names(target).length === 3);
  assert.deepEqual(productHost.calls, ["main", "v2026.1.0", "main"]);
  assert.equal(selectOf(target).value, "main");
  assert.equal(editLinks(target).length, 5);
  assert.deepEqual(asOf(target), []);
});

// CASE ITM-594-05
// TST-594004 · level: unit · module: MOD-trace-pages
// guards: UC-020 (step 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: the route rendered at main (the params keep ref main), v2026.1.0 chosen, OLD REQUIREMENT opened
// input: route.subject(params, context) with the context the route was drawn with
// expect: kind "converse", no draft route, title "OLD REQUIREMENT at v2026.1.0", a key holding ref=v2026.1.0, and a page text holding "Version: v2026.1.0" and "Old rule."
test("the subject of a chosen tag is about the version shown, not the ref the caller handed", async () => {
  const context = { product: { address: "https://github.com/acme/library", host: tagged() } };
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, context, mainParams);
  choose(target, "v2026.1.0");
  await until(() => names(target)[0] === "OLD REQUIREMENT");
  find(target, (node) => node.localName === "button" && node.textContent === "OLD REQUIREMENT")[0].dispatchEvent(new Event("click"));
  const subject = route.subject(mainParams, context);
  assert.equal(subject.kind, "converse");
  assert.equal(subject.draftRoute, null);
  assert.equal(subject.title, "OLD REQUIREMENT at v2026.1.0");
  assert.ok(subject.key.includes("ref=v2026.1.0"), subject.key);
  const page = subject.paramsFor({}).page;
  assert.ok(page.includes("Version: v2026.1.0") && page.includes("Old rule."), page);
});

// CASE ITM-594-06
// TST-594005 · level: unit · module: MOD-trace-pages
// guards: UC-020 (step 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: a Host that gives the tags v2026.1.0 and v2026.0.1 and cannot read the snapshot of v2026.0.1
// input: the route rendered at main, v2026.0.1 chosen, then v2026.1.0
// expect: after the first choice the page says "v2026.0.1 could not be read: unreachable", lists no requirement and keeps the choice with v2026.0.1 selected; after the second it lists OLD REQUIREMENT and no problem line
test("a chosen tag that cannot be read is named in place of the tree and the choice stays", async () => {
  const problems = (target) => find(target, (node) => node.localName === "p" && node.className === "version-problem").map((node) => node.textContent);
  const target = await render(tagged({ tags: ["v2026.1.0", "v2026.0.1"], unreadable: ["v2026.0.1"] }), mainParams);
  choose(target, "v2026.0.1");
  await until(() => problems(target).length === 1);
  assert.deepEqual(problems(target), ["v2026.0.1 could not be read: unreachable"]);
  assert.deepEqual(names(target), []);
  assert.equal(selectOf(target).value, "v2026.0.1");
  choose(target, "v2026.1.0");
  await until(() => names(target)[0] === "OLD REQUIREMENT");
  assert.deepEqual(problems(target), []);
});

// CASE ITM-594-07
// TST-594006 · level: unit · module: MOD-trace-pages
// guards: UC-020 (step 1); THE BROWSER SHOWS ANY RELEASED VERSION
// given: a Host whose snapshot of v2026.1.0 waits for a gate that opens later
// input: v2026.1.0 chosen, then main chosen before the gate opens; then the gate opens and 50 ms of the clock pass
// expect: the page shows main's three requirements with main selected and no "as of" line; the slower, earlier choice does not replace it
test("of two choices made in a row, the later one stays when the earlier answers last", async () => {
  let open;
  const gate = new Promise((resolve) => { open = resolve; });
  const productHost = tagged({ gates: { "v2026.1.0": gate } });
  const target = await render(productHost, mainParams);
  choose(target, "v2026.1.0");
  await until(() => productHost.calls.length === 2);
  choose(target, "main");
  await until(() => names(target).length === 3);
  open();
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.deepEqual(names(target), CURRENT_NAMES);
  assert.equal(selectOf(target).value, "main");
  assert.deepEqual(asOf(target), []);
});

// ---------------------------------------------------------------- what traces to an opened requirement, and its open proposals (ITM-597)
//
// The fixture is a small product of its own: a SPEC of three requirements in two sections; three use cases that name ALPHA RULE and one
// that realises a name the SPEC no longer has; a decision and two modules; a test; the product's links file and the register entry of the one
// source it links; and three queues of change entries, two open and one decided, which the open proposals are read from. The expected texts are
// written in each case; none is read from a document. Readings the cases take, each from the sentence quoted:
// - "lists its sources and every use case, architecture element, module and test that names it" (A REQUIREMENT SHOWS WHAT TRACES TO IT): the
//   lists are the sources the product links with version and part, the use cases with their review status, the decisions, modules and tests;
// - "Every requirement that an open queue entry would add, change or withdraw is shown in the browser with that entry's status and a link to it"
//   (OPEN PROPOSALS ARE SHOWN IN THE BROWSER): on the default branch an opened requirement lists, under Open proposals, each entry of a queue whose
//   state is not "in SPEC" and whose file is the SPEC, which MOD-spec-changes' entryView gives an impact naming the requirement: the entry's address
//   spec-<queue folder>-<NN> linked to #spec-entry/id=<address>, the kind of the impact (changed, withdrawn, added) and the entry's state in brackets,
//   the entries in the order of the queues, newest first; none where no entry does; at a released version no proposal is shown (UC-020 1a);
// - "Both are listed; the browser notes that accepting one makes the other stale" (UC-020 5c): where two or more entries are listed, a note says how
//   many open proposals touch the requirement and that accepting one makes the other stale (the others, from three).
const TICK = "`";
const TRACE_SPEC = [
  "# Fixture — Specification", "", "## First section", "",
  "**ALPHA RULE** *(Vibe Coding, ch. 9; Unlinked Source)*", "Alpha rule.", `*Check:* ${TICK}tests/alpha.test.mjs${TICK}`, "",
  "**BETA RULE** *(Vibe Coding)*", "Beta rule.", "*Check:* at review.", "",
  "## Second section", "",
  "**GAMMA RULE** *(Vibe Coding)*", "Gamma rule.", "*Check:* at review.", "",
].join("\n");
const UC1 = doc("UC-001", "First use case", { realises: ["ALPHA RULE", "REMOVED RULE"] });
const UC3 = doc("UC-003", "Third use case", { realises: ["ALPHA RULE"] });
const REGISTER_ENTRY = [
  "---", "id: SRC-vibe-coding", "title: Vibe Coding", "kind: document", "authority: normative", "licence: may be republished — CC BY 4.0", "---",
  "# SRC-vibe-coding Vibe Coding", "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| ${TICK}2026-10-05${TICK} | 2026-10-05 | the manuscript | a repository | none |`, "",
].join("\n");
const LINKS = ["# Sources of the fixture", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-vibe-coding | 2026-10-05 | ${"a".repeat(64)} | ch. 9 |`, ""].join("\n");
const firstSection = (alpha, withBeta) => ["## First section", "", "**ALPHA RULE** *(Vibe Coding, ch. 9; Unlinked Source)*", alpha, `*Check:* ${TICK}tests/alpha.test.mjs${TICK}`, "",
  ...(withBeta ? ["**BETA RULE** *(Vibe Coding)*", "Beta rule.", "*Check:* at review.", ""] : [])].join("\n");
// The files of one queue with one entry: its index, its decisions (a row when the entry is decided), the entry and the section it proposes.
function queue(folder, title, anchor, proposal, decided = false, target = "SPEC.md") {
  const base = `docs/spec-freigaben/${folder}`;
  return {
    [`${base}/index.md`]: [`# SPEC approvals — queue ${folder.slice(0, 10)} · ${title}`, "", `**Zieldatei aller Einträge:** ${TICK}${target}${TICK}`, "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", `| 01 | ${TICK}${target}${TICK} | ${anchor} | — | — |`, ""].join("\n"),
    [`${base}/entscheidungen.md`]: [`# Decisions — queue ${folder.slice(0, 10)} ${title}`, "", "Append-only.", "", ...(decided ? [`| 2026-10-08 10:00 UTC | 1 | uebernommen | ${"c".repeat(40)} |`] : []), ""].join("\n"),
    [`${base}/01-entry.md`]: proposal,
  };
}
const TRACE_FILES = {
  "SPEC.md": TRACE_SPEC,
  "docs/sources.md": LINKS,
  "docs/sources/SRC-vibe-coding.md": REGISTER_ENTRY,
  "docs/use-cases/UC-001-first.md": UC1,
  [`docs/approvals/UC-001-${blobOf(UC1).slice(0, 12)}.md`]: "record of the text UC-001 has now",
  "docs/use-cases/UC-002-second.md": doc("UC-002", "Second use case", { realises: ["BETA RULE"] }, `It also touches ${TICK}ALPHA RULE${TICK}.`),
  "docs/use-cases/UC-003-third.md": UC3,
  "docs/approvals/UC-003-000000000000.md": "record of an earlier text of UC-003",
  "docs/use-cases/UC-004-fourth.md": doc("UC-004", "Fourth use case", { realises: ["ORPHAN RULE"] }),
  "docs/architecture/ARC-001-first.md": doc("ARC-001", "First decision", { forced_by: ["ALPHA RULE"] }),
  "docs/architecture/MOD-direct.md": doc("MOD-direct", "Direct module", { folder: "src/direct/", realises: ["ALPHA RULE"] }),
  "docs/architecture/MOD-tested.md": doc("MOD-tested", "Tested module", { folder: "src/tested/", realises: ["BETA RULE"] }),
  "tests/alpha.test.mjs": ["// TST-501", "// level: unit", "// module: MOD-tested", "// guards: ALPHA RULE", ""].join("\n"),
  ...queue("2026-10-09_alpha", "alpha", "## First section", firstSection("Alpha rule, changed.", false)),
  ...queue("2026-10-09b_alpha-again", "alpha again", "## First section", firstSection("Alpha rule, again.", true)),
  ...queue("2026-10-08_done", "done", "## Second section", ["## Second section", "", "**GAMMA RULE** *(Vibe Coding)*", "Gamma rule, changed.", "*Check:* at review.", ""].join("\n"), true),
};

const mainOnly = (files = TRACE_FILES) => treeHost({ trees: { main: files } });
const withoutQueues = Object.fromEntries(Object.entries(TRACE_FILES).filter(([path]) => !path.startsWith("docs/spec-freigaben/")));

// Opens a requirement by its name and waits, by the clock, until what traces to it is drawn. -> the row that holds its detail
async function openRequirement(target, name) {
  const button = find(target, (node) => node.localName === "button" && node.textContent === name)[0];
  button.dispatchEvent(new Event("click"));
  const row = button.parentNode.parentNode.nextSibling;
  await until(() => find(row, (node) => node.className === "traces-reading").length === 0);
  return row;
}
const traceSection = (row, title) => find(row, (node) => node.localName === "section" && node.className === "requirement-trace"
  && find(node, (kid) => kid.localName === "h4")[0].textContent === title)[0];
const listed = (row, title) => find(traceSection(row, title), (node) => node.localName === "li").map((node) => node.textContent);
const linksOf = (row, title) => find(traceSection(row, title), (node) => node.localName === "a").map((node) => node.getAttribute("href"));
const paragraphs = (row, title) => find(traceSection(row, title), (node) => node.localName === "p").map((node) => `${node.className}: ${node.textContent}`);

// CASE ITM-597-01
// TST-597001 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture product, whose links file links SRC-vibe-coding at version 2026-10-05 with the part ch. 9; ALPHA RULE names the item "Vibe Coding, ch. 9" and "Unlinked Source", BETA RULE "Vibe Coding"
// input: the route rendered at main, ALPHA RULE opened, then BETA RULE
// expect: ALPHA RULE's Sources are "Vibe Coding — version 2026-10-05, part ch. 9", linked to #library/source=SRC-vibe-coding, and "Unlinked Source — no linked version", not linked; BETA RULE's the first of these alone; the four fields stay in the detail
test("an opened requirement lists its sources with the version and the part the product links, the linked ones as links", async () => {
  const target = await render(mainOnly(), mainParams);
  const alpha = await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(listed(alpha, "Sources"), ["Vibe Coding — version 2026-10-05, part ch. 9", "Unlinked Source — no linked version"]);
  assert.deepEqual(linksOf(alpha, "Sources"), ["#library/source=SRC-vibe-coding"]);
  assert.match(alpha.textContent, /Alpha rule\./);
  const beta = await openRequirement(target, "BETA RULE");
  assert.deepEqual(listed(beta, "Sources"), ["Vibe Coding — version 2026-10-05, part ch. 9"]);
});

// CASE ITM-597-02
// TST-597002 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture product: UC-001 has an approval record naming its current text, UC-002 none, UC-003 only a record of an earlier text; UC-001 and UC-003 realise ALPHA RULE, UC-002 names it in its text
// input: ALPHA RULE opened on the default branch
// expect: Use cases lists UC-001 "accepted", UC-002 "open", UC-003 "changed since acceptance", each as its title and status, linked to #use-case/id=<id>
test("an opened requirement lists the use cases that name it with their review status, each linked", async () => {
  const row = await openRequirement(await render(mainOnly(), mainParams), "ALPHA RULE");
  assert.deepEqual(listed(row, "Use cases"), ["UC-001 First use case — accepted", "UC-002 Second use case — open", "UC-003 Third use case — changed since acceptance"]);
  assert.deepEqual(linksOf(row, "Use cases"), ["#use-case/id=UC-001", "#use-case/id=UC-002", "#use-case/id=UC-003"]);
});

// CASE ITM-597-03
// TST-597003 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture product: ARC-001 is forced by ALPHA RULE, MOD-direct realises it, MOD-tested is exercised by TST-501, which guards it
// input: ALPHA RULE opened, then BETA RULE, which MOD-tested realises and no decision or test names
// expect: ALPHA RULE — decisions ARC-001 linked to #decision/id=ARC-001; modules MOD-direct and MOD-tested linked to #module/id=<id>; tests TST-501 linked to #trace/key=tests/row=TST-501. BETA RULE — decisions "none", modules MOD-tested, tests "none"
test("an opened requirement lists the decisions, modules and tests that name it, each linked, and none where nothing does", async () => {
  const target = await render(mainOnly(), mainParams);
  const alpha = await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(listed(alpha, "Architecture decisions"), ["ARC-001 First decision"]);
  assert.deepEqual(linksOf(alpha, "Architecture decisions"), ["#decision/id=ARC-001"]);
  assert.deepEqual(listed(alpha, "Modules"), ["MOD-direct Direct module", "MOD-tested Tested module"]);
  assert.deepEqual(linksOf(alpha, "Modules"), ["#module/id=MOD-direct", "#module/id=MOD-tested"]);
  assert.deepEqual(listed(alpha, "Tests"), ["TST-501"]);
  assert.deepEqual(linksOf(alpha, "Tests"), ["#trace/key=tests/row=TST-501"]);
  const beta = await openRequirement(target, "BETA RULE");
  assert.deepEqual(paragraphs(beta, "Architecture decisions"), ["none: none"]);
  assert.deepEqual(listed(beta, "Modules"), ["MOD-tested Tested module"]);
  assert.deepEqual(paragraphs(beta, "Tests"), ["none: none"]);
});

// CASE ITM-597-04
// TST-597004 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture product, in which nothing names GAMMA RULE (known positive: ALPHA RULE's lists are full); and a product with a use case and no decision, module or test file at all
// input: GAMMA RULE opened in the first, ALPHA RULE in the second
// expect: GAMMA RULE — use cases, decisions, modules and tests each "none". In the second product: use cases list UC-001, and decisions, modules and tests each read "none yet" with the folded "What is this?" of MOD-site-frame (a details of the class explain) whose text says a list reads none yet when the version shown holds no artifact of that kind at all, and that architecture decisions and module files come when the architecture is derived from the accepted use cases
test("a list nothing fills reads none, and where the version holds no artifact of the kind it reads none yet with a folded note", async () => {
  const full = await render(mainOnly(), mainParams);
  assert.equal(listed(await openRequirement(full, "ALPHA RULE"), "Use cases").length, 3, "known positive: the same version fills ALPHA RULE's lists");
  const gamma = await openRequirement(full, "GAMMA RULE");
  for (const title of ["Use cases", "Architecture decisions", "Modules", "Tests"]) assert.deepEqual(paragraphs(gamma, title), ["none: none"], title);

  const bare = { "SPEC.md": TRACE_SPEC, "docs/use-cases/UC-001-first.md": UC1 };
  const row = await openRequirement(await render(mainOnly(bare), mainParams), "ALPHA RULE");
  assert.deepEqual(listed(row, "Use cases"), ["UC-001 First use case — open"]);
  for (const title of ["Architecture decisions", "Modules", "Tests"]) {
    assert.equal(paragraphs(row, title)[0], "none-yet: none yet", title);
    const note = find(traceSection(row, title), (node) => node.localName === "details")[0];
    assert.equal(note.className, "explain", title);
    assert.equal(find(note, (node) => node.localName === "summary")[0].textContent, "What is this?");
    assert.match(note.textContent, /a list reads none yet when the version shown holds no artifact of that kind at all/, title);
    assert.match(note.textContent, /Architecture decisions and module files come when the architecture is derived from the accepted use cases/, title);
  }
});

// CASE ITM-597-07
// TST-597007 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: a Host that names main the default branch and gives the tag v2026.1.0, whose tree holds the same files, queues included
// input: the route rendered at main, v2026.1.0 chosen, ALPHA RULE opened
// expect: the detail lists ALPHA RULE's use cases (known positive) and has no Open proposals section; no file of docs/spec-freigaben is read at all; a fault fails the case within 10 s of the clock
test("at a released version the traces are shown, no open proposals, and the queues are not read", { timeout: 10000 }, async () => {
  const productHost = treeHost({ trees: { main: TRACE_FILES, "v2026.1.0": TRACE_FILES }, tags: ["v2026.1.0"] });
  const target = await render(productHost, mainParams);
  choose(target, "v2026.1.0");
  await until(() => productHost.log.snapshots.length === 2 && asOf(target).length === 1);
  const row = await openRequirement(target, "ALPHA RULE");
  assert.equal(listed(row, "Use cases").length, 3, "known positive: the traces are shown at the tag");
  assert.equal(traceSection(row, "Open proposals") === undefined, true, "no Open proposals section");
  assert.deepEqual(productHost.log.reads.filter((path) => path.startsWith("docs/spec-freigaben/")), []);
});

// CASE ITM-597-15
// TST-597015 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// given: the fixture on the default branch, whose queue 2026-10-09_alpha proposes ALPHA RULE changed and BETA RULE withdrawn (its section lacks it), whose queue 2026-10-09b_alpha-again proposes ALPHA RULE changed, and whose queue 2026-10-08_done holds an entry that changes GAMMA RULE and is in SPEC; ALPHA RULE's use cases are listed (known positive)
// input: ALPHA RULE opened, then BETA RULE, then GAMMA RULE
// expect: ALPHA RULE's Open proposals lists, newest queue first, "spec-2026-10-09b_alpha-again-01 — changed (open)" and "spec-2026-10-09_alpha-01 — changed (open)", linked to #spec-entry/id=spec-2026-10-09b_alpha-again-01 and #spec-entry/id=spec-2026-10-09_alpha-01; BETA RULE's lists "spec-2026-10-09_alpha-01 — withdrawn (open)", linked to #spec-entry/id=spec-2026-10-09_alpha-01; GAMMA RULE's reads "none", since the entry that changes it is in SPEC
test("an opened requirement lists the open entries whose impact names it, with the kind and the state, each linked", { timeout: 10000 }, async () => {
  const target = await render(mainOnly(), mainParams);
  const alpha = await openRequirement(target, "ALPHA RULE");
  assert.equal(listed(alpha, "Use cases").length, 3, "known positive: the traces are shown");
  assert.deepEqual(listed(alpha, "Open proposals"), ["spec-2026-10-09b_alpha-again-01 — changed (open)", "spec-2026-10-09_alpha-01 — changed (open)"]);
  assert.deepEqual(linksOf(alpha, "Open proposals"), ["#spec-entry/id=spec-2026-10-09b_alpha-again-01", "#spec-entry/id=spec-2026-10-09_alpha-01"]);
  const beta = await openRequirement(target, "BETA RULE");
  assert.deepEqual(listed(beta, "Open proposals"), ["spec-2026-10-09_alpha-01 — withdrawn (open)"]);
  assert.deepEqual(linksOf(beta, "Open proposals"), ["#spec-entry/id=spec-2026-10-09_alpha-01"]);
  assert.deepEqual(paragraphs(await openRequirement(target, "GAMMA RULE"), "Open proposals"), ["none: none"]);
});

// CASE ITM-597-08
// TST-597008 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture, in which UC-001, a use case of ALPHA RULE, also realises REMOVED RULE, a name the SPEC does not hold, and UC-004, which names neither ALPHA RULE nor BETA RULE, realises ORPHAN RULE, another; and a product whose use case names only the requirement it holds
// input: ALPHA RULE and BETA RULE opened in the first, ALPHA RULE in the second
// expect: ALPHA RULE's Unknown names lists "REMOVED RULE — named by UC-001", UC-001 linked to #use-case/id=UC-001, and not ORPHAN RULE, which no artifact listed for ALPHA RULE names; BETA RULE's reads "none"; in the second product ALPHA RULE's reads "none"
test("the names that match no requirement and that the listed artifacts also name are listed under unknown names with what names them", async () => {
  const target = await render(mainOnly(), mainParams);
  const alpha = await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(listed(alpha, "Unknown names"), ["REMOVED RULE — named by UC-001"]);
  assert.deepEqual(linksOf(alpha, "Unknown names"), ["#use-case/id=UC-001"]);
  assert.deepEqual(paragraphs(await openRequirement(target, "BETA RULE"), "Unknown names"), ["none: none"]);
  const only = doc("UC-001", "First use case", { realises: ["ALPHA RULE"] });
  const clean = await openRequirement(await render(mainOnly({ "SPEC.md": TRACE_SPEC, "docs/use-cases/UC-001-first.md": only }), mainParams), "ALPHA RULE");
  assert.deepEqual(paragraphs(clean, "Unknown names"), ["none: none"]);
});

// CASE ITM-597-09
// TST-597009 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture on the default branch without its queues (each entryView of an open entry builds a graph of its own, which a snapshot that does not keep its reads reads again; TST-648005 counts what the queues add)
// input: the route drawn; ALPHA RULE opened; BETA RULE opened; ALPHA RULE closed and opened again
// expect: drawing reads SPEC.md alone and calls readMany never; after ALPHA RULE is opened, UC-001's file has been named to readMany once and read once; after BETA RULE and the second opening both counts are still one
test("the trace graph is built when a requirement is opened, not when the tree is drawn, and kept for every later opening", async () => {
  const productHost = mainOnly(withoutQueues);
  const target = await render(productHost, mainParams);
  assert.deepEqual(productHost.log.reads, ["SPEC.md"]);
  assert.deepEqual(productHost.log.manys, []);
  const uc = "docs/use-cases/UC-001-first.md";
  const counts = () => [productHost.log.manys.filter((paths) => paths.includes(uc)).length, productHost.log.reads.filter((path) => path === uc).length];
  await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(counts(), [1, 1]);
  await openRequirement(target, "BETA RULE");
  const alpha = find(target, (node) => node.localName === "button" && node.textContent === "ALPHA RULE")[0];
  alpha.dispatchEvent(new Event("click"));
  await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(counts(), [1, 1]);
});

// CASE ITM-597-10
// TST-597010 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture, in which the first read of UC-001's file fails as an unreachable server does
// input: ALPHA RULE opened, closed, opened again
// expect: the first opening keeps the four fields and says "What traces to this requirement could not be read: unreachable" with no list; the second opening reads again and lists UC-001 as "accepted"
test("a graph that cannot be read is named in place of the traces, the four fields stay, and the next opening reads it again", async () => {
  const productHost = treeHost({ trees: { main: TRACE_FILES }, failing: (path, nth) => path === "docs/use-cases/UC-001-first.md" && nth === 1 });
  const target = await render(productHost, mainParams);
  const row = await openRequirement(target, "ALPHA RULE");
  assert.match(row.textContent, /Alpha rule\./);
  assert.match(row.textContent, /What traces to this requirement could not be read: unreachable/);
  assert.equal(traceSection(row, "Use cases") === undefined, true, "no lists beside the problem");
  find(target, (node) => node.localName === "button" && node.textContent === "ALPHA RULE")[0].dispatchEvent(new Event("click"));
  const again = await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(listed(again, "Use cases")[0], "UC-001 First use case — accepted");
  assert.doesNotMatch(again.textContent, /could not be read/);
});

// CASE ITM-597-11
// TST-597011 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture, in which every read of docs/sources.md fails as an unreachable server does
// input: ALPHA RULE opened
// expect: Sources says "The sources could not be read: unreachable"; the use cases are listed all the same
test("a part that cannot be read is named in its own section and leaves the others", async () => {
  const row = await openRequirement(await render(treeHost({ trees: { main: TRACE_FILES }, failing: (path) => path === "docs/sources.md" }), mainParams), "ALPHA RULE");
  assert.deepEqual(paragraphs(row, "Sources"), ["traces-problem: The sources could not be read: unreachable"]);
  assert.equal(listed(row, "Use cases").length, 3);
});

// CASE ITM-597-13
// TST-597013 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: a product whose files hold the SPEC and the links file, and an instance whose default branch holds the register entry of SRC-vibe-coding; the route is handed both Hosts
// input: ALPHA RULE opened
// expect: Sources lists "Vibe Coding — version 2026-10-05, part ch. 9" and "Unlinked Source — no linked version", as when the product holds the register; the product's snapshot is asked for no file of docs/sources/, the instance's snapshot is the one of its default branch
test("the register of the sources is read from the instance's default branch when the route is handed the instance", async () => {
  const productHost = treeHost({ trees: { main: { "SPEC.md": TRACE_SPEC, "docs/sources.md": LINKS } } });
  const instanceHost = treeHost({ trees: { main: { "docs/sources/SRC-vibe-coding.md": REGISTER_ENTRY } } });
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { instance: { host: instanceHost }, product: { host: productHost } }, mainParams);
  const row = await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(listed(row, "Sources"), ["Vibe Coding — version 2026-10-05, part ch. 9", "Unlinked Source — no linked version"]);
  assert.deepEqual(productHost.log.reads.filter((path) => path.startsWith("docs/sources/")), []);
  assert.ok(instanceHost.log.reads.includes("docs/sources/SRC-vibe-coding.md"));
});

// CASE ITM-597-14
// TST-597014 · level: component · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: a SPEC whose requirement LONELY RULE names no source, and the fixture's ALPHA RULE for the known positive
// input: LONELY RULE opened
// expect: Sources reads "none"
test("a requirement that names no source reads none under Sources", async () => {
  const lonely = `${TRACE_SPEC}\n**LONELY RULE**\nLonely rule.\n*Check:* at review.\n`;
  const target = await render(mainOnly({ ...TRACE_FILES, "SPEC.md": lonely }), mainParams);
  assert.equal(listed(await openRequirement(target, "ALPHA RULE"), "Sources").length, 2, "known positive: ALPHA RULE names two sources");
  assert.deepEqual(paragraphs(await openRequirement(target, "LONELY RULE"), "Sources"), ["none: none"]);
});

// ---------------------------------------------------------------- the open proposals of an opened requirement (ITM-648)
//
// The fixture is the one above. Its queues in the order MOD-spec-changes' queues gives them, newest first, are 2026-10-09b_alpha-again, 2026-10-09_alpha and
// 2026-10-08_done; a queue folder sorts by its name, so a letter after the date sorts after the same date without one. The queues added below sort in front of those.
const QUEUES = "docs/spec-freigaben/";
const ALPHA_ENTRY = `${QUEUES}2026-10-09_alpha/01-entry.md`;
const AGAIN_ENTRY = `${QUEUES}2026-10-09b_alpha-again/01-entry.md`;
const DONE_ENTRY = `${QUEUES}2026-10-08_done/01-entry.md`;
const THIRD = queue("2026-10-09c_alpha-third", "alpha third", "## First section", firstSection("Alpha rule, third.", true));
const OTHER = queue("2026-10-09d_other", "other", "## First section", firstSection("Alpha rule, elsewhere.", true), false, "products/x/SPEC.md");
const SAME = queue("2026-10-09e_same", "same", "## Second section",
  ["## Second section", "", "**GAMMA RULE** *(Vibe Coding)*", "Gamma rule.", "*Check:* at review.", ""].join("\n"));
const MOVED = queue("2026-10-09f_moved", "moved", "## Moved section",
  ["## Moved section", "", "**ALPHA RULE** *(Vibe Coding, ch. 9; Unlinked Source)*", "Alpha rule.", `*Check:* ${TICK}tests/alpha.test.mjs${TICK}`, ""].join("\n"));
const without = (prefix) => Object.fromEntries(Object.entries(TRACE_FILES).filter(([path]) => !path.startsWith(prefix)));
const notes = (row) => paragraphs(row, "Open proposals");

// CASE ITM-648-01
// TST-648001 · level: component · module: MOD-trace-pages
// guards: UC-020; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// given: the fixture, in which two open entries (2026-10-09_alpha, 2026-10-09b_alpha-again) change ALPHA RULE and one of them withdraws BETA RULE; the same with a third open entry that changes ALPHA RULE; the same with the queue 2026-10-09b_alpha-again left out
// input: ALPHA RULE and BETA RULE opened in the first, ALPHA RULE in the second and in the third
// expect: with two, ALPHA RULE's Open proposals carries the note "2 open proposals touch this requirement: accepting one makes the other stale." and BETA RULE's, touched by one, none; with three, "3 open proposals touch this requirement: accepting one makes the others stale."; with one entry, ALPHA RULE's carries no note and lists that entry
test("two or more open proposals that touch one requirement carry the note that accepting one makes the other stale", { timeout: 10000 }, async () => {
  const two = await render(mainOnly(), mainParams);
  assert.deepEqual(notes(await openRequirement(two, "ALPHA RULE")), ["stale-note: 2 open proposals touch this requirement: accepting one makes the other stale."]);
  assert.deepEqual(notes(await openRequirement(two, "BETA RULE")), []);
  const three = await openRequirement(await render(mainOnly({ ...TRACE_FILES, ...THIRD }), mainParams), "ALPHA RULE");
  assert.deepEqual(notes(three), ["stale-note: 3 open proposals touch this requirement: accepting one makes the others stale."]);
  const one = await openRequirement(await render(mainOnly(without(`${QUEUES}2026-10-09b_`)), mainParams), "ALPHA RULE");
  assert.deepEqual(listed(one, "Open proposals"), ["spec-2026-10-09_alpha-01 — changed (open)"], "known positive: the one entry is listed");
  assert.deepEqual(notes(one), []);
});

// CASE ITM-648-02
// TST-648002 · level: component · module: MOD-trace-pages
// guards: UC-020; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// given: the fixture, with a record for the entry 2026-10-09_alpha-01 that names another text of its proposal than the one it has (its file name carries 000000000000), which makes that entry stale
// input: ALPHA RULE opened
// expect: Open proposals lists "spec-2026-10-09b_alpha-again-01 — changed (open)" and "spec-2026-10-09_alpha-01 — changed (stale)"; the note counts both
test("an open proposal is shown with the state of its entry, a stale one too", { timeout: 10000 }, async () => {
  const files = { ...TRACE_FILES, "docs/approvals/spec-2026-10-09_alpha-01-000000000000.md": "a record of another text of the proposal" };
  const row = await openRequirement(await render(mainOnly(files), mainParams), "ALPHA RULE");
  assert.deepEqual(listed(row, "Open proposals"), ["spec-2026-10-09b_alpha-again-01 — changed (open)", "spec-2026-10-09_alpha-01 — changed (stale)"]);
  assert.deepEqual(notes(row), ["stale-note: 2 open proposals touch this requirement: accepting one makes the other stale."]);
});

// CASE ITM-648-03
// TST-648003 · level: component · module: MOD-trace-pages
// guards: UC-020; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// given: the fixture with three more queues: 2026-10-09d_other, an open entry for the file products/x/SPEC.md that changes ALPHA RULE's section; 2026-10-09e_same, an open entry that restates GAMMA RULE's section word for word; 2026-10-09f_moved, an open entry under a heading the SPEC lacks that states ALPHA RULE
// input: ALPHA RULE and GAMMA RULE opened
// expect: ALPHA RULE's Open proposals lists, newest queue first, "spec-2026-10-09f_moved-01 — added (open)", "spec-2026-10-09b_alpha-again-01 — changed (open)" and "spec-2026-10-09_alpha-01 — changed (open)" and not the entry of another file, with the note for three; GAMMA RULE's reads "none"; the proposal of the entry of another file is read never and that of the entry that restates GAMMA RULE once
test("the open proposals are the SPEC's entries whose impact names the requirement, whatever kind it gives", { timeout: 10000 }, async () => {
  const productHost = mainOnly({ ...TRACE_FILES, ...OTHER, ...SAME, ...MOVED });
  const target = await render(productHost, mainParams);
  const alpha = await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(listed(alpha, "Open proposals"), ["spec-2026-10-09f_moved-01 — added (open)", "spec-2026-10-09b_alpha-again-01 — changed (open)", "spec-2026-10-09_alpha-01 — changed (open)"]);
  assert.deepEqual(notes(alpha), ["stale-note: 3 open proposals touch this requirement: accepting one makes the others stale."]);
  assert.deepEqual(paragraphs(await openRequirement(target, "GAMMA RULE"), "Open proposals"), ["none: none"]);
  const reads = (path) => productHost.log.reads.filter((each) => each === path).length;
  assert.equal(reads(`${QUEUES}2026-10-09d_other/01-entry.md`), 0, "the entry of another file is not examined");
  assert.equal(reads(`${QUEUES}2026-10-09e_same/01-entry.md`), 1, "known positive: the entry that restates GAMMA RULE was examined");
});

// CASE ITM-648-04
// TST-648004 · level: component · module: MOD-trace-pages
// guards: UC-020; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// given: a product on the default branch whose files hold the SPEC and a use case that realises ALPHA RULE (known positive: the use case is listed) and no queue
// input: ALPHA RULE opened
// expect: Open proposals reads "none"
test("a product without a queue reads none under Open proposals", { timeout: 10000 }, async () => {
  const bare = { "SPEC.md": TRACE_SPEC, "docs/use-cases/UC-001-first.md": UC1 };
  const row = await openRequirement(await render(mainOnly(bare), mainParams), "ALPHA RULE");
  assert.deepEqual(listed(row, "Use cases"), ["UC-001 First use case — open"]);
  assert.deepEqual(paragraphs(row, "Open proposals"), ["none: none"]);
});

// CASE ITM-648-05
// TST-648005 · level: component · module: MOD-trace-pages
// guards: UC-020; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// given: the fixture on the default branch, with the tag v2026.1.0 of the same files: two open entries and one in SPEC; the Host's snapshot keeps no read, so every read of a file is counted
// input: the route drawn; ALPHA RULE opened; BETA RULE opened; ALPHA RULE closed and opened again; v2026.1.0 chosen and main chosen again; ALPHA RULE opened
// expect: drawing reads no file of docs/spec-freigaben; after ALPHA RULE is opened the index of the decided queue has been read once (queues, once, and no entryView for an entry in SPEC), the proposal of each of the two open entries once (one entryView each), that of the entry in SPEC never, and readMany has been told the two proposals in one batch; after BETA RULE, the second opening and the second drawing of main every one of those counts is the same
test("the queues are read once for a version and each open entry once, and nothing again on reopening", { timeout: 10000 }, async () => {
  const productHost = treeHost({ trees: { main: TRACE_FILES, "v2026.1.0": TRACE_FILES }, tags: ["v2026.1.0"] });
  const target = await render(productHost, mainParams);
  const counts = () => [`${QUEUES}2026-10-08_done/index.md`, ALPHA_ENTRY, AGAIN_ENTRY, DONE_ENTRY].map((path) => productHost.log.reads.filter((each) => each === path).length);
  const batches = () => productHost.log.manys.filter((paths) => paths.some((path) => path.endsWith("/01-entry.md"))).map((paths) => paths.filter((path) => path.endsWith("/01-entry.md")).sort());
  assert.deepEqual(productHost.log.reads.filter((path) => path.startsWith(QUEUES)), []);
  const alpha = await openRequirement(target, "ALPHA RULE");
  assert.equal(listed(alpha, "Open proposals").length, 2, "known positive: the proposals are listed");
  assert.deepEqual(counts(), [1, 1, 1, 0]);
  assert.deepEqual(batches(), [[ALPHA_ENTRY, AGAIN_ENTRY]]);
  await openRequirement(target, "BETA RULE");
  find(target, (node) => node.localName === "button" && node.textContent === "ALPHA RULE")[0].dispatchEvent(new Event("click"));
  await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(counts(), [1, 1, 1, 0]);
  choose(target, "v2026.1.0");
  await until(() => asOf(target).length === 1);
  choose(target, "main");
  await until(() => asOf(target).length === 0 && names(target).length === 3);
  assert.equal(listed(await openRequirement(target, "ALPHA RULE"), "Open proposals").length, 2, "known positive: the second drawing lists them");
  assert.deepEqual(counts(), [1, 1, 1, 0]);
  assert.deepEqual(batches(), [[ALPHA_ENTRY, AGAIN_ENTRY]]);
});

// CASE ITM-648-06
// TST-648006 · level: component · module: MOD-trace-pages
// guards: UC-020; OPEN PROPOSALS ARE SHOWN IN THE BROWSER
// given: the fixture, in which the first read of the proposal of 2026-10-09_alpha-01 fails as an unreachable server does
// input: ALPHA RULE opened, closed, opened again
// expect: the first opening says "The open proposals could not be read: unreachable" under Open proposals and lists the use cases all the same; the second opening reads again and lists the two proposals
test("open proposals that cannot be read are named in their own section, and the next opening reads them again", { timeout: 10000 }, async () => {
  const productHost = treeHost({ trees: { main: TRACE_FILES }, failing: (path, nth) => path === ALPHA_ENTRY && nth === 1 });
  const target = await render(productHost, mainParams);
  const row = await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(paragraphs(row, "Open proposals"), ["traces-problem: The open proposals could not be read: unreachable"]);
  assert.equal(listed(row, "Use cases").length, 3);
  find(target, (node) => node.localName === "button" && node.textContent === "ALPHA RULE")[0].dispatchEvent(new Event("click"));
  const again = await openRequirement(target, "ALPHA RULE");
  assert.deepEqual(listed(again, "Open proposals"), ["spec-2026-10-09b_alpha-again-01 — changed (open)", "spec-2026-10-09_alpha-01 — changed (open)"]);
});

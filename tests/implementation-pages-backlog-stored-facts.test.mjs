// MOD-implementation-pages' route `backlog` takes its facts from MOD-progress-measures' productFacts (ITM-1149), as the accepted text of docs/architecture/MOD-implementation-pages.md states it:
// "MOD-progress-measures.productFacts, … — the product's facts and its progress", and as MOD-progress-measures states productFacts: where the default branch's snapshot has `readOn`, the facts stored for its
// commit are read first and "none of the files they come from" is read; "`model` and `workflow` are "unknown" when that commit cannot be read, and `modelUnread` then names the commit and the error"
// (A PAGE LOAD READS THE REPOSITORY IN BATCHES). The page names an unreadable model version and does not fall back to the catalogue as it stands now (UC-031 step 6a).
// Run: node --test tests/implementation-pages-backlog-stored-facts.test.mjs
//
// Module: MOD-implementation-pages
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// The product is a small Scrum-with-limit fixture with two teams, held in memory behind a host of this file's own. Its snapshot offers `readMany` and `readOn`; every call of `read`, `readMany` and `readOn`
// is kept. The branch `overview-cache` holds `<commit>.facts.json` (MOD-progress-measures' format 1, written here from the fixture's files) where the test says so. Nothing reaches the network.
// Readings the texts leave open, which the tests state (the pull request names them): the facts are asked with the scope `work`, because the scope `all` reads the test files and the CI-independent results the
// page has no use for; the SPEC's requirements and the module files, which Facts does not carry, come from the stored facts' own lists (`storedFacts`) where they are stored, and from the files otherwise.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import "./site-frame-dom.mjs";
const { view } = await import("../src/implementation-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "backlog");

const matches = (element, selector) => {
  const attribute = /^\[([a-z-]+)(?:="([^"]*)")?\]$/.exec(selector);
  if (selector === "pre > code.language-mermaid") return element.localName === "code" && element.getAttribute("class") === "language-mermaid" && element.parentNode?.localName === "pre";
  return attribute ? (attribute[2] === undefined ? element.getAttribute(attribute[1]) !== null : element.getAttribute(attribute[1]) === attribute[2]) : false;
};
const found = (root, selector) => {
  const all = [];
  (function walk(node) { for (const child of node.childNodes) if (child.nodeType === 1) { if (matches(child, selector)) all.push(child); walk(child); } })(root);
  return all;
};
globalThis.window.Element.prototype.querySelectorAll = function querySelectorAll(selector) { return found(this, selector); };
globalThis.window.Element.prototype.replaceWith = function replaceWith(node) { this.parentNode.insertBefore(node, this); this.parentNode.removeChild(this); };
globalThis.window.Element.prototype.querySelector = function querySelector(selector) { return found(this, selector)[0] ?? null; };
globalThis.SVGElement ??= class SVGElement {};
afterEach(() => { delete globalThis.mermaid; });
function recorder() {
  globalThis.mermaid = { initialize() {}, mermaidAPI: { getDiagramFromText: async () => ({ db: { getVertices: () => ({}) } }) }, run: async () => {} };
}

const lines = (...rows) => `${rows.join("\n")}\n`;
const blobOf = (content) => createHash("sha1").update(content).digest("hex");
const ADDRESS = "https://github.com/acme/product";
const COMMIT = "c".repeat(40);
const MODEL_VERSION = "a".repeat(40);
const SPEC = lines("# SPEC", "", "## 1. Rules", "", "**RULE ONE** *(PO, 2026-09-01)*", "The first rule.", "*Check:* no automatic check; at review.", "",
  "**RULE TWO** *(PO, 2026-09-01)*", "The second rule, which no item realises.", "*Check:* no automatic check; at review.");
const DECLARATION = lines("---", "model: fixture-scrum-wip", "model_file: docs/process-models/fixture.md", `model_version: ${MODEL_VERSION}`, "---", "# How the fixture product is developed", "", "## Practices", "",
  "- none", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Sprint | `sprint/<team>/<nn>` |", "", "## Definition of Done", "", "The job rules hold.");
const assignment = (team, owner, builder) => lines(`# ${team}`, "", "## Roles", "", "| Role | Participants |", "|---|---|", `| Owner | ${owner} |`, `| Builders | ${builder} |`, `| Checker | ${builder} |`);
const moduleFile = (id, uses) => lines("---", `id: ${id}`, `title: The module ${id}`, `folder: src/${id.slice(4)}/`, "realises:", "  - RULE ONE", "follows:", "  - ARC-001", `uses:${uses.length ? `\n${uses.map((use) => `  - ${use}`).join("\n")}` : " []"}`,
  "provides:", "  - read", "---", `# ${id} The module ${id}`);
const id = (n) => `ITM-${String(n).padStart(3, "0")}`;
const itemPath = (n) => `docs/backlog/${id(n)}-item-${n}.md`;
const itemText = (n, { modules, realises = ["RULE ONE"] }) => lines("---", `id: ${id(n)}`, `title: The work of item ${n}`, "level: module", "realises:", ...realises.map((name) => `  - ${name}`), "modules:",
  ...modules.map((module) => `  - ${module}`), "builds_on: []", "tests:", "  - unit", "origin:", "  - RULE ONE", "---", `# ${id(n)} The work of item ${n}`, "", "## Outcome", "", `What item ${n} delivers.`, "", "## Acceptance", "", "- a unit test.");
const TEAM1_SPRINT = "docs/backlog/sprints/team1/01.md";
const TEAM2_SPRINT = "docs/backlog/sprints/team2/01.md";

function productFiles() {
  return {
    "SPEC.md": SPEC, "docs/process.md": DECLARATION, "docs/process-models/fixture.md": readFileSync(new URL("./fixtures/flow/scrum-wip.md", import.meta.url), "utf8"),
    "docs/role-assignments/team1.md": assignment("team1", "alice", "dev-a"), "docs/role-assignments/team2.md": assignment("team2", "bob", "dev-b"),
    "docs/architecture/MOD-store.md": moduleFile("MOD-store", []), "docs/architecture/MOD-pages.md": moduleFile("MOD-pages", ["MOD-store.read"]),
    [itemPath(1)]: itemText(1, { modules: ["MOD-store"] }), [itemPath(2)]: itemText(2, { modules: ["MOD-pages"] }), [itemPath(3)]: itemText(3, { modules: ["MOD-store"] }),
    [TEAM1_SPRINT]: lines("---", "sprint: 1", "goal: Store and show", "start: 2026-09-14", "end:", "closer: alice", "branch: sprint/team1/01", "selection:", "  - ITM-001", "---", "# team1 Sprint 01"),
    [TEAM2_SPRINT]: lines("---", "sprint: 1", "goal: Mail", "start: 2026-09-01", "end: 2026-09-07", "closer: bob", "branch:", "selection:", "  - ITM-002", "---", "# team2 Sprint 01"),
  };
}
const FILES_STORED_FROM = (path) => path === "SPEC.md" || path === "docs/process.md" || /^docs\/(backlog|role-assignments|architecture)\//.test(path);

// The facts file of the commit as MOD-progress-measures' format 1 has it, written from the files; the model is left out, so that the page reads it again.
function factsFile(files) {
  const of = (re) => Object.keys(files).filter((path) => re.test(path)).sort().map((path) => ({ path, text: files[path] }));
  return `${JSON.stringify({ format: 1, commit: COMMIT, declaration: { path: "docs/process.md", text: files["docs/process.md"] }, order: null, items: of(/^docs\/backlog\/ITM-[^/]+\.md$/),
    sprints: of(/^docs\/backlog\/sprints\//), assignments: of(/^docs\/role-assignments\//), gates: [], modules: of(/^docs\/architecture\/MOD-/), queues: [],
    requirements: ["RULE ONE", "RULE TWO"], tests: [], jobs: [] })}\n`;
}

const PRS = [{ number: 2, title: "ITM-002: the work of ITM-002", branch: "team/ITM-002", base: "sprint/team1/01", head: "b".repeat(40), state: "open", draft: false, url: `${ADDRESS}/pull/2`,
  opened: "2026-09-15T12:00:00Z", merged: null, closed: null }];

const named = (name, message) => Object.assign(new Error(message), { name });
// The product's host; `stored` is the text of the facts file on overview-cache, or null for a branch that holds none. `calls` keeps every read.
function hostOf(files, calls, stored, { unreadable = null } = {}) {
  const snapshot = (own) => ({ repository: { server: "github", path: "acme/product", web: ADDRESS }, ref: "main", commit: COMMIT, paths: Object.keys(own), blob: (path) => (Object.hasOwn(own, path) ? blobOf(own[path]) : null),
    read: async (path) => { calls.push({ fn: "read", path }); return Object.hasOwn(own, path) ? own[path] : null; },
    readMany: async (paths) => { calls.push({ fn: "readMany", paths: [...paths] }); },
    readOn: async (branch, path) => { calls.push({ fn: "readOn", branch, path }); if (branch === "overview-cache" && path === `${COMMIT}.facts.json` && stored !== null) return stored; throw named("NotFound", "no such file"); } });
  return {
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot(ref) { if (unreadable !== null && ref === MODEL_VERSION) { calls.push({ fn: "model_version", ref }); throw unreadable; } return snapshot(files); },
    async listPullRequests() { return PRS; },
    async containsCommit() { return false; },
    async commitFiles() { throw new Error("a render writes nothing"); },
  };
}
async function render(stored, options = {}) {
  const files = productFiles(), calls = [];
  const host = hostOf(files, calls, stored === undefined ? null : stored(files));
  // The instance is another repository: its SPEC and the process model; the commit its model version names is the one it cannot read where the test says so.
  const instanceFiles = { "SPEC.md": "# Instance\n", "docs/process-models/fixture.md": files["docs/process-models/fixture.md"] };
  const instance = hostOf(instanceFiles, [], null, options);
  const target = document.createElement("div");
  document.body.append(target);
  recorder();
  await route.render(target, { calls, page: "review", instance: { repository: "acme/agent-m", host: instance }, product: { address: ADDRESS, kind: "github", host, tokenStored: true }, store: {}, go() {} }, {});
  return { target, html: target.innerHTML, calls };
}
const readPaths = (calls) => calls.filter((call) => call.fn === "read").map((call) => call.path);
const batched = (calls) => calls.filter((call) => call.fn === "readMany").flatMap((call) => call.paths);

// TST-1149001 · level: unit · module: MOD-implementation-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fixture product with two teams, and overview-cache holding the facts of its commit (declaration, items, sprints, role assignments, module files, requirements)
// input: the route backlog's render
// expect: no file the facts come from is read, by `read` or in a batch — not the declaration, an item, a sprint, a role assignment, a module file nor the SPEC; `readOn` is asked for overview-cache / <commit>.facts.json; the page lists the three items and both teams
test("the backlog page reads none of the files the stored facts come from", async () => {
  const { html, calls } = await render((files) => factsFile(files));
  const files = Object.keys(productFiles()).filter(FILES_STORED_FROM);
  assert.deepEqual(readPaths(calls).filter((path) => files.includes(path)), [], "no file the facts come from is read");
  assert.deepEqual(batched(calls).filter((path) => files.includes(path)), [], "none is asked for in a batch either");
  assert.ok(calls.some((call) => call.fn === "readOn" && call.branch === "overview-cache" && call.path === `${COMMIT}.facts.json`), "the stored facts are asked for");
  assert.deepEqual([...html.slice(html.indexOf('data-part="backlog"')).matchAll(/<tr data-item="(ITM-\d{3})"/g)].map((match) => match[1]), ["ITM-001", "ITM-002", "ITM-003"]);
  assert.ok(html.includes('data-team="team1"') && html.includes('data-team="team2"'));
});

// TST-1149002 · level: unit · module: MOD-implementation-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the same product, with and without the facts stored for its commit
// input: the route backlog's render, both ways
// expect: the page is the same HTML; without them every file the facts come from is told to `readMany` (the declaration, the three items, the two sprints, the two role assignments, the two module files) and the SPEC is read (the counter-proof of TST-1149001)
test("the backlog page shows the same page from the files, which it reads in batches", async () => {
  const stored = await render((files) => factsFile(files));
  const files = await render(undefined);
  assert.equal(files.html, stored.html, "the same page");
  const wanted = Object.keys(productFiles()).filter((path) => path !== "SPEC.md" && FILES_STORED_FROM(path));
  for (const path of wanted) assert.ok(batched(files.calls).includes(path), `${path} is told to readMany`);
  assert.ok(readPaths(files.calls).includes("SPEC.md"), "the SPEC is read where nothing is stored");
});

// TST-1149003 · level: unit · module: MOD-implementation-pages
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: the same product whose instance cannot read the commit its declaration's model_version names (NotFound), with the facts stored and without them
// input: the route backlog's render
// expect: the page names the commit and the error (NotFound) in a warning; it shows no model-derived part (no "items in progress" line, no burn-down chart) — the catalogue as it stands now is not used instead; the items are still listed
for (const [label, stored] of [["stored facts", (files) => factsFile(files)], ["files", undefined]]) {
  test(`the backlog page names a model version it cannot read and does not fall back to today's catalogue (${label})`, async () => {
    const { html } = await render(stored, { unreadable: named("NotFound", "no such commit") });
    assert.match(html, /<p class="warn">[^<]*<code>a{40}<\/code>[^<]*NotFound/);
    assert.doesNotMatch(html, /items in progress/);
    assert.doesNotMatch(html, /data-burn-down/);
    assert.deepEqual([...html.slice(html.indexOf('data-part="backlog"')).matchAll(/<tr data-item="(ITM-\d{3})"/g)].map((match) => match[1]), ["ITM-001", "ITM-002", "ITM-003"]);
  });
}

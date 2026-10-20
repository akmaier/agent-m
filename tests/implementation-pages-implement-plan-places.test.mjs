// MOD-implementation-pages' route `implement` for a model that plans its work offers a participant a linked source forbids only where the step's job can do without that source's content (ITM-1160), as the accepted
// text of docs/architecture/MOD-implementation-pages.md states it in its Uses: "MOD-source-register.sourceSchemas, restrictedPlaces — ... the places each restricted source permits, against which the route `implement`
// judges the participants it offers: a participant whose place a linked source forbids is offered only where the job needs none of that source's content, and the content is named (UC-024 5b)", an alternative of
// UC-024 step 5, "Agent M offers, for each step, the holders of the implementing role". It continues tests/implementation-pages-implement-places.test.mjs, which has the same for the backlog models.
// Run: node --test tests/implementation-pages-implement-plan-places.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-024; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; A JOB GOES ONLY TO A HOLDER OF ITS ROLE
// Level: unit
//
// The product is the V-model fixture of tests/implementation-pages-implement-plan-start.test.mjs (the steps ITM-012 and ITM-010 ticked); the role assignment gives dev-a and dev-b the roles Developer and Tester; dev-a
// processes data at "this machine", dev-b at "elsewhere". The instance's register holds the source SRC-fixture, whose licence and places each test states. The recipe `implementation-inputs` is stood in for: the part it gives
// for ITM-012 cites SRC-fixture, the part for ITM-010 cites no source. Nothing reaches the network. Readings the tests state (the pull request names them):
//   - "offered" is the option in <select data-participant-of="<step>"> of the step's <div data-job-of>; a participant a source forbids is not an option.
//   - "the content is named": the text of <p data-withheld-of="<step>"> names the participant that is not offered, the source and the place.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import "./site-frame-dom.mjs";
const { view } = await import("../src/implementation-pages/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "implement");

const matches = (element, selector) => {
  const attribute = /^\[([a-z-]+)(?:="([^"]*)")?\]$/.exec(selector);
  return attribute ? (attribute[2] === undefined ? element.getAttribute(attribute[1]) !== null : element.getAttribute(attribute[1]) === attribute[2]) : element.localName === selector;
};
const found = (root, selector) => {
  const all = [];
  (function walk(node) { for (const child of node.childNodes) if (child.nodeType === 1) { if (matches(child, selector)) all.push(child); walk(child); } })(root);
  return all;
};
globalThis.window.Element.prototype.querySelectorAll = function querySelectorAll(selector) { return found(this, selector); };
globalThis.window.Element.prototype.querySelector = function querySelector(selector) { return found(this, selector)[0] ?? null; };
const text = (node) => node.textContent.replace(/\s+/g, " ").trim();

// ---------------------------------------------------------------- the fixture product
const lines = (...rows) => `${rows.join("\n")}\n`;
const blobOf = (content) => createHash("sha1").update(content).digest("hex");
const ADDRESS = "https://github.com/acme/product";
const MODEL_VERSION = "5".repeat(40);
const decision = (id, extra) => lines("---", `id: ${id}`, `title: ${id} decision`, ...extra, "---", `# ${id} decision`, "", "## Context", "", "c", "", "## Decision", "", "d", "", "## Alternatives", "", "a", "", "## Consequences", "", "q");
const module_ = (id) => lines("---", `id: ${id}`, `title: ${id}`, `folder: src/${id.slice(4)}/`, "realises:", "follows:", "  - ARC-002", "uses: []", "provides:", "  - f", "---", `# ${id} ${id}`, "", "## Responsibility", "", "r", "",
  "## Parts", "", "p", "", "## Data", "", "d", "", "## Interfaces", "", "- `f` — i", "", "## Files", "", "f", "", "## Uses", "", "u");
const step = (id, title, extra = []) => lines("---", `id: ${id}`, `title: ${title}`, "level: module", "realises:", "  - UC-001", "modules:", "  - MOD-reader", ...extra, "tests:", "  - unit", "origin:", "  - UC-001", "---",
  `# ${id} ${title}`, "", "## Outcome", "", "o", "", "## Acceptance", "", "a");
const declaration = (model) => lines("---", `model: ${model}`, `model_file: src/model-catalogue/models/${model}.md`, `model_version: ${MODEL_VERSION}`, "---", "# Process", "", "## Practices", "", "- none", "", "## Branches", "",
  "| Phase or time box | Branch |", "|---|---|", "| Implementation | work/<item> |", "| Testing | test/<item> |", "", "## Definition of Done", "", "The job rules hold; no condition is added.");
const USE_CASE = "docs/use-cases/UC-001-load.md";
const ARCHITECTURE = {
  "docs/architecture/ARC-001-whole.md": decision("ARC-001", ["forced_by:", "  - UC-001"]),
  "docs/architecture/ARC-002-sub.md": decision("ARC-002", ["refines: ARC-001", "forced_by:", "  - UC-001", "designs:", "  - MOD-reader", "  - MOD-writer"]),
  "docs/architecture/MOD-reader.md": module_("MOD-reader"), "docs/architecture/MOD-writer.md": module_("MOD-writer"),
};
const PLAN = {
  "docs/plan/ITM-010-reader.md": step("ITM-010", "Read the store"), "docs/plan/ITM-011-writer.md": step("ITM-011", "Write the store", ["builds_on:", "  - ITM-010"]),
  "docs/plan/ITM-012-loose.md": step("ITM-012", "Loose ends"), "docs/plan/ITM-013-gated.md": step("ITM-013", "Gated work"),
  "docs/plan/order.md": lines("## Order", "", "| Step | Phase |", "| --- | --- |", "| ITM-012 | Testing |", "| ITM-010 | Testing |", "| ITM-011 | Implementation |", "| ITM-013 | Implementation |"),
};
const ASSIGNMENT = lines("# Product", "", "## Roles", "", "| Role | Participants |", "|---|---|", "| Product owner | alice |", "| Developer | dev-a, dev-b |", "| Tester | dev-a, dev-b |", "| Reviewer | alice |");

function productFiles({ model = "v-model", plan = true, declared = true, later = false } = {}) {
  const files = { "SPEC.md": "# Fixture\n", ...(declared ? { "docs/process.md": declaration(model) } : {}), [USE_CASE]: "# UC-001 load\n", ...ARCHITECTURE, ...(plan ? PLAN : {}), "docs/role-assignments/product.md": ASSIGNMENT, ".github/workflows/agent-m-jobs.yml": "name: agent-m jobs\n" };
  if (later) {
    // A ready step of a later phase: no gate stands before Validation & Verification, and it builds on nothing.
    files["docs/plan/ITM-014-later.md"] = step("ITM-014", "Later work");
    files["docs/plan/order.md"] = PLAN["docs/plan/order.md"] + "| ITM-014 | Validation & Verification |\n";
  }
  for (const path of Object.keys(files).filter((each) => each === USE_CASE || each.startsWith("docs/architecture/"))) {
    files[`docs/approvals/${/(ARC-\d+|MOD-[a-z]+|UC-\d+)/.exec(path)[1]}-${blobOf(files[path]).slice(0, 12)}.md`] = "kind: record\n";
  }
  return files;
}

const ROOT = new URL("../", import.meta.url);
const HEAD = readFileSync(new URL("docs/participants.md", ROOT), "utf8").split("\n").filter((row, at, all) => at <= all.findIndex((each) => each.startsWith("|---"))).join("\n");
const REGISTER = `${HEAD}\n| dev-a | model endpoint | model-a | 200000 | — | read the repository, write to the repository, run code and tests, use tools | this machine | ci hosted secret DEV_KEY |
| dev-b | model endpoint | model-b | 200000 | — | read the repository, write to the repository, run code and tests, use tools | elsewhere | ci hosted secret DEV_KEY |
| dev-c | model endpoint | model-c | 200000 | — | read the repository, write to the repository | a server in Singapore | ci hosted secret DEV_KEY |\n`;


// The strategies the kinds name: stand-ins.
const part = (name, sources = []) => ({ name, text: name, size: 0, sources });
registerStrategies("tests/implementation-pages-implement-plan-places.test.mjs", {
  recipes: { "implementation-inputs": async (_, params) => [{ ...part(`inputs of ${(params.steps ?? params.items ?? []).join(", ")}`, (params.steps ?? []).includes("ITM-012") ? ["SRC-fixture"] : []), required: true }],
    "chapters-for-implementation": async () => [{ ...part("chapters 9, 11, 12 and 13"), required: true }], "resource-pins": async () => [] },
  preconditions: { "rests-on-accepted": async () => [] },
  writers: { "branch-and-pull-request": async () => ({ commits: [], files: [], pullRequest: null, shown: null, notes: [] }) },
});
const sourceEntry = (licence, places) => lines("---", "id: SRC-fixture", "title: The fixture source", "kind: document", "authority: normative", `licence: ${licence}`,
  ...(places.length ? ["places:", ...places.map((place) => `  - ${place}`)] : []), "---", "# SRC-fixture The fixture source", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  "| `1` | 2026-10-13 | fixture | here | one file, hashed only |");

// A host of this file's own: the part of MOD-repository-hosts' interface the route uses, keeping every commit; `failure` makes commitFiles fail as a token that may not write.
function hostOf(files, commits, failure = null) {
  let head = 0;
  const tree = new Map(Object.entries(files));
  const snapshot = () => ({ repository: { server: "github", path: "acme/product", web: ADDRESS }, ref: "main", commit: String(head).padStart(40, "c"), paths: [...tree.keys()],
    blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null), read: async (path) => (tree.has(path) ? tree.get(path) : null) });
  return {
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return snapshot(); }, async listPullRequests() { return []; }, async containsCommit() { return false; },
    async commitFiles(change) {
      if (failure) throw failure;
      commits.push(structuredClone(change));
      head += 1;
      for (const file of change.files) tree.set(file.path, file.text);
      return { commit: String(head).padStart(40, "c"), url: `${ADDRESS}/commit/${head}` };
    },
  };
}
async function render(files, { register = REGISTER, failure = null, store = {}, licence = "restricted - fixture terms", places = ["this machine"] } = {}) {
  const commits = [];
  const instance = hostOf({ "SPEC.md": "# Instance\n", "docs/participants.md": register, "docs/sources/SRC-fixture.md": sourceEntry(licence, places) }, [], null);
  const context = { page: "review", instance: { repository: "acme/agent-m", host: instance }, product: { address: ADDRESS, kind: "github", host: hostOf(files, commits, failure), tokenStored: true }, store, go() {} };
  const target = document.createElement("div");
  document.body.append(target);
  globalThis.mermaid = { initialize() {}, mermaidAPI: { getDiagramFromText: async () => ({ db: { getVertices: () => ({}) } }) }, run: async () => {} };
  try { await route.render(target, context, {}); } finally { delete globalThis.mermaid; }
  return { target, commits };
}
const rowOf = (target, id) => found(target, `[data-step="${id}"]`)[0];
const tickOf = (target, id) => found(rowOf(target, id), "[data-select-step]")[0];
const ticked = (box) => box.getAttribute("disabled") === null && (box.checked === undefined ? box.getAttribute("checked") !== null : box.checked === true);
const reasons = (target, id) => found(rowOf(target, id), "[data-reasons]").map(text).join(" ");


const jobOf = (target, step) => found(target, `[data-job-of="${step}"]`)[0];
const offered = (target, step) => (found(jobOf(target, step), `[data-participant-of="${step}"]`)[0]?.childNodes ?? []).map(text);
const withheld = (target, step) => found(jobOf(target, step), `[data-withheld-of="${step}"]`).map(text).join(" ");

// TST-1160101 · level: unit · module: MOD-implementation-pages
// guards: UC-024; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; A JOB GOES ONLY TO A HOLDER OF ITS ROLE
// given: SRC-fixture is restricted and permits only "this machine"; dev-a processes data there, dev-b at "elsewhere"; both hold Developer and Tester; ITM-012's job would include the source's content
// input: the route's render, ITM-012 and ITM-010 ticked
// expect: ITM-012 offers dev-a alone and says that dev-b is not offered because SRC-fixture's content would go to its place, elsewhere; ITM-010, whose job includes none of that content, offers dev-a and dev-b
// Planted fault: offering every holder of the role, or leaving the content unnamed, fails.
test("a step's holder whose place a linked source forbids is not offered for a job that includes its content, and the content is named", async () => {
  const { target } = await render(productFiles());
  assert.deepEqual(offered(target, "ITM-012"), ["dev-a"]);
  const said = withheld(target, "ITM-012");
  assert.match(said, /dev-b/);
  assert.match(said, /SRC-fixture/);
  assert.match(said, /elsewhere/);
  assert.deepEqual(offered(target, "ITM-010"), ["dev-a", "dev-b"]);
  assert.equal(withheld(target, "ITM-010"), "");
});

// TST-1160102 · level: unit · module: MOD-implementation-pages
// guards: UC-024; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the counter-proof: SRC-fixture permits both "this machine" and "elsewhere"
// input: the route's render
// expect: ITM-012 offers dev-a and dev-b as before, and names no participant as withheld
// Planted fault: withholding every participant for a job that includes restricted content, whatever the source permits, fails.
test("a step's holder whose place the source allows is offered as before", async () => {
  const { target } = await render(productFiles(), { places: ["this machine", "elsewhere"] });
  assert.deepEqual(offered(target, "ITM-012"), ["dev-a", "dev-b"]);
  assert.equal(withheld(target, "ITM-012"), "");
});

// TST-1160103 · level: unit · module: MOD-implementation-pages
// guards: UC-024; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: SRC-fixture permits no place; ITM-012's job would include its content
// input: the route's render
// expect: ITM-012 offers nobody, says that no holder is at a place the linked sources permit (not that no participant can write and run tests), and names dev-a and dev-b as withheld
// Planted fault: the message of a step with no capable holder where every holder is withheld fails.
test("where every holder's place is forbidden the step says so, and names them", async () => {
  const { target } = await render(productFiles(), { places: [] });
  assert.deepEqual(offered(target, "ITM-012"), []);
  const shown = text(jobOf(target, "ITM-012"));
  assert.match(shown, /at a place the linked sources permit/);
  assert.doesNotMatch(shown, /No participant can write and run tests/);
  assert.match(withheld(target, "ITM-012"), /dev-a/);
  assert.match(withheld(target, "ITM-012"), /dev-b/);
});

// TST-1160104 · level: unit · module: MOD-implementation-pages
// guards: UC-024; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: SRC-fixture may be republished
// input: the route's render
// expect: ITM-012 offers dev-a and dev-b, and names no participant as withheld
// Planted fault: treating every cited source as restricted fails.
test("a source that may be republished forbids no place of a step's holders", async () => {
  const { target } = await render(productFiles(), { licence: "may be republished - fixture", places: [] });
  assert.deepEqual(offered(target, "ITM-012"), ["dev-a", "dev-b"]);
  assert.equal(withheld(target, "ITM-012"), "");
});

// TST-1160105 · level: unit · module: MOD-implementation-pages
// guards: UC-024; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: SRC-fixture permits only "elsewhere", so dev-a, the first holder, is the one withheld for ITM-012
// input: the route's render
// expect: ITM-012 offers dev-b alone, and what is sent where names dev-b and not dev-a
// Planted fault: judging the first of the capable holders instead of the first offered fails.
test("when the first holder is withheld the job is shown for the holder that is offered", async () => {
  const { target } = await render(productFiles(), { places: ["elsewhere"] });
  assert.deepEqual(offered(target, "ITM-012"), ["dev-b"]);
  const sent = text(found(jobOf(target, "ITM-012"), "[data-sent-of]")[0]);
  assert.match(sent, /dev-b/);
  assert.doesNotMatch(sent, /dev-a/);
});

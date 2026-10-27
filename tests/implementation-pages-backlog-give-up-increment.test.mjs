// MOD-implementation-pages gives up the increment of a closed sprint (ITM-1232), as the accepted text of docs/architecture/MOD-implementation-pages.md states it: "after the close, for an increment not merged,
// *Give up increment* with a reason, through `giveUpIncrement`", and UC-041 7b: "If the Product Owner gives the increment up, its done items stay done and are no longer held". MOD-work-plans' giveUpIncrement appends
// `## Increment given up` to the sprint's record; the sprint then holds none of its items.
// Run: node --test tests/implementation-pages-backlog-give-up-increment.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-041; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Level: unit
//
// The product is a small Scrum-with-limit fixture with two teams, held in memory behind a host of this file's own that answers MOD-repository-hosts' interface and applies a commit to its files; the process
// model is the instance's, read from a second host. Nothing reaches the network. Readings the texts leave open, which the tests state: the route `sprint/<team>/<n>/close` is not built, so the button stands
// where the closed sprint is shown, in its team's panel on the route `backlog`, as *End sprint* does; it is `data-give-up-increment="<team>/<nn>"` with its reason field `data-give-up-reason="<team>/<nn>"`,
// offered for each closed sprint of the team whose record holds no `## Increment given up` and that still holds an item (heldItems): its increment is not merged; a click that is not the person's, or one
// without a reason, writes nothing.
// Each test states its input and its expected result before it runs (given / input / expect).

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
const recorder = () => { globalThis.mermaid = { initialize() {}, mermaidAPI: { getDiagramFromText: async () => ({ db: { getVertices: () => ({}) } }) }, run: async () => {} }; };

const lines = (...rows) => `${rows.join("\n")}\n`;
const blobOf = (content) => createHash("sha1").update(content).digest("hex");
const ADDRESS = "https://github.com/acme/product";
const COMMIT = "c".repeat(40);
const SPEC = lines("# SPEC", "", "## 1. Rules", "", "**RULE ONE** *(PO, 2026-09-01)*", "The first rule.", "*Check:* no automatic check; at review.");
const DECLARATION = lines("---", "model: fixture-scrum-wip", "model_file: docs/process-models/fixture.md", `model_version: ${"a".repeat(40)}`, "---", "# How the fixture product is developed", "", "## Practices", "",
  "- none", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Sprint | `sprint/<team>/<nn>` |", "", "## Definition of Done", "", "The job rules hold.");
const assignment = (team, owner, builder) => lines(`# ${team}`, "", "## Roles", "", "| Role | Participants |", "|---|---|", `| Owner | ${owner} |`, `| Builders | ${builder} |`, `| Checker | ${builder} |`);
const item = (n) => lines("---", `id: ITM-00${n}`, `title: The work of item ${n}`, "level: module", "realises:", "  - RULE ONE", "modules:", "  - MOD-store", "builds_on: []", "tests:", "  - unit", "origin:", "  - RULE ONE", "---",
  `# ITM-00${n} The work of item ${n}`, "", "## Outcome", "", `What item ${n} delivers.`, "", "## Acceptance", "", "- a unit test.");
const sprint = ({ n = 1, start, end = "", goal, selection, branch = "", tail = [] }) => lines("---", `sprint: ${n}`, `goal: ${goal}`, `start: ${start}`, `end: ${end}`, "closer: alice", `branch: ${branch}`, "selection:", ...selection.map((each) => `  - ${each}`), "---",
  `# Sprint ${n}`, ...tail);
const TEAM1 = "docs/backlog/sprints/team1/01.md";
const TEAM2 = "docs/backlog/sprints/team2/01.md";

function productFiles(overrides = {}) {
  return {
    "SPEC.md": SPEC, "docs/process.md": DECLARATION, "docs/process-models/fixture.md": readFileSync(new URL("./fixtures/flow/scrum-wip.md", import.meta.url), "utf8"),
    "docs/role-assignments/team1.md": assignment("team1", "alice", "dev-a"), "docs/role-assignments/team2.md": assignment("team2", "bob", "dev-b"),
    "docs/backlog/ITM-001-item-1.md": item(1), "docs/backlog/ITM-002-item-2.md": item(2),
    [TEAM1]: sprint({ start: "2026-09-14", goal: "Store", selection: ["ITM-001"] }),
    [TEAM2]: sprint({ start: "2026-09-01", end: "2026-09-07", goal: "Mail", selection: ["ITM-002"] }),
    ...overrides,
  };
}

const named = (name, message) => Object.assign(new Error(message), { name });
// The product's host, applying a commit to `files`; `commits` keeps each commitFiles call.
function hostOf(files, commits, pulls = []) {
  const snapshot = () => ({ repository: { server: "github", path: "acme/product", web: ADDRESS }, ref: "main", commit: COMMIT, paths: Object.keys(files), blob: (path) => (Object.hasOwn(files, path) ? blobOf(files[path]) : null),
    read: async (path) => (Object.hasOwn(files, path) ? files[path] : null), readMany: async () => {}, readOn: async () => { throw named("NotFound", "no such file"); } });
  return {
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return snapshot(); },
    async listPullRequests(filter = {}) { return pulls.filter((p) => (!filter.state || filter.state === "all" || p.state === filter.state) && (!filter.branch || p.branch === filter.branch)); },
    async containsCommit() { return false; },
    async commitFiles(change) { commits.push(change); for (const file of change.files) files[file.path] = file.text; return { commit: "d".repeat(40), url: "https://example.org/d" }; },
  };
}
// The page, with the listeners of its click events kept by button.
async function render(overrides, pulls = PULLS) {
  const files = productFiles(overrides), commits = [], handlers = [];
  const Element = globalThis.window.Element, add = Element.prototype.addEventListener;
  Element.prototype.addEventListener = function (type, listener, ...rest) { if (type === "click") handlers.push([this, listener]); return add.call(this, type, listener, ...rest); };
  const host = hostOf(files, commits, pulls);
  const instance = hostOf({ "SPEC.md": "# Instance\n", "docs/process-models/fixture.md": files["docs/process-models/fixture.md"] }, []);
  const target = document.createElement("div");
  document.body.append(target);
  recorder();
  try {
    await route.render(target, { page: "review", instance: { repository: "acme/agent-m", host: instance }, product: { address: ADDRESS, kind: "github", host, tokenStored: true }, store: {}, go() {} }, {});
  } finally { Element.prototype.addEventListener = add; }
  const listenerOf = (button) => handlers.filter(([element]) => element === button).at(-1)?.[1];
  return { target, files, commits, listenerOf };
}

const BRANCH = "sprint/team1/01";
// ITM-001 merged into team1's sprint branch, which is not merged into main.
const PULLS = [{ number: 3, title: "ITM-001 the store", branch: "work/ITM-001", base: BRANCH, head: "b".repeat(40), state: "merged", draft: false,
  url: "https://example.org/pull/3", opened: "2026-09-15T08:00:00Z", merged: "2026-09-16T08:00:00Z", closed: "2026-09-16T08:00:00Z" }];
const CLOSE = ["", "## Review", "", "The increment is ITM-001.", "", "## Unfinished items", "", "to the backlog:", "into the next sprint:", "", "## Retrospective", "", "- went well: the store."];
const GIVEN_UP = ["", "## Increment given up", "", "at: 2026-09-21", "by: Product Owner", "reason: the store is built anew"];
const closedSprint = (tail = []) => sprint({ start: "2026-09-14", end: "2026-09-20", goal: "Store", selection: ["ITM-001"], branch: BRANCH, tail: [...CLOSE, ...tail] });
const giveUpButtons = (target) => found(target, "[data-give-up-increment]");

// TST-1232005 · level: unit · module: MOD-implementation-pages
// guards: UC-041; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: team1's sprint 01 closed (its record holds ## Review) on its own branch sprint/team1/01, ITM-001 merged into that branch and the branch not merged into main; as further pages, the same sprint with ## Increment given up, and team1's sprint 01 running
// input: the route backlog's render, each way
// expect: the first page offers Give up increment for team1/01 in team1's panel — one button data-give-up-increment="team1/01" and one reason field data-give-up-reason="team1/01" —; the given-up and the running sprint are offered none
test("the backlog page offers Give up increment for a closed sprint whose increment is not merged, and for no other", async () => {
  const { target } = await render({ [TEAM1]: closedSprint() });
  assert.equal(found(target, '[data-team="team1"]').length, 1, "known positive: team1's panel is drawn");
  assert.equal(giveUpButtons(target).length, 1, "one Give up increment on the page");
  assert.equal(found(target, '[data-give-up-increment="team1/01"]').length, 1);
  assert.equal(found(target, '[data-give-up-reason="team1/01"]').length, 1, "with a field for the reason");
  assert.match(found(target, '[data-team="team1"]')[0].textContent, /Give up increment/);
  const givenUp = await render({ [TEAM1]: closedSprint(GIVEN_UP) });
  assert.equal(found(givenUp.target, '[data-team="team1"]').length, 1, "known positive: team1's panel is drawn");
  assert.equal(giveUpButtons(givenUp.target).length, 0, "an increment given up is not given up twice");
  const running = await render({ [TEAM1]: sprint({ start: "2026-09-14", goal: "Store", selection: ["ITM-001"], branch: BRANCH }) });
  assert.match(found(running.target, '[data-team="team1"]')[0].textContent, /Change the selection/, "known positive: team1's sprint runs");
  assert.equal(giveUpButtons(running.target).length, 0, "a running sprint has no increment to give up");
});

// TST-1232006 · level: unit · module: MOD-implementation-pages
// guards: UC-041; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: the closed sprint team1/01 of TST-1232005, its increment not merged
// input: a click that is not the person's (isTrusted false) on Give up increment; the person's click with the reason empty; the person's click with the reason "the store is built anew"
// expect: the first two write nothing; the third makes one commit on main at the head read, holding only docs/backlog/sprints/team1/01.md, which then holds ## Increment given up with that reason; the page is drawn again with no Give up increment
test("Give up increment is one click with a reason that writes ## Increment given up through giveUpIncrement, and only the person's click", async () => {
  const { target, files, commits, listenerOf } = await render({ [TEAM1]: closedSprint() });
  const button = found(target, '[data-give-up-increment="team1/01"]')[0];
  assert.ok(button, "the page offers Give up increment for team1/01");
  const listener = listenerOf(button);
  assert.equal(typeof listener, "function", "known positive: the button has a click listener");
  const reason = found(target, '[data-give-up-reason="team1/01"]')[0];
  reason.value = "the store is built anew";
  await listener({ isTrusted: false });
  assert.equal(commits.length, 0, "an untrusted click writes nothing");
  reason.value = "  ";
  await listener({ isTrusted: true });
  assert.equal(commits.length, 0, "without a reason nothing is written");
  reason.value = "the store is built anew";
  await listener({ isTrusted: true });
  assert.equal(commits.length, 1, "one commit");
  assert.deepEqual(commits[0].files.map((file) => file.path), [TEAM1]);
  assert.equal(commits[0].branch, "main");
  assert.equal(commits[0].expectedHead, COMMIT);
  assert.match(files[TEAM1], /^## Increment given up$/m);
  assert.match(files[TEAM1], /^reason: the store is built anew$/m);
  assert.equal(giveUpButtons(target).length, 0, "the page is drawn again: the increment is given up");
});

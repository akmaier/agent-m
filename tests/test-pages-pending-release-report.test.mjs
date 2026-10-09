// MOD-test-pages' pending release-report route (ITM-289).  This controlled DOM/host case keeps all repository data
// in memory and names the route's failure node: resolving a pending report must happen before the new-release form
// reads its next-version data.
//
// TST-289001
// level: unit
// module: MOD-test-pages
// guards: UC-013; UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
// given: the selected product has a notification address for release and its pending-report lookup is refused by the host.
// input: render the release route with no new-candidate interaction.
// expect: the route names that pending report cannot be reopened and does not read or offer the new-release form.

import test from "node:test";
import assert from "node:assert/strict";

class Element {
  constructor(name) { this.name = name; this.children = []; this.className = ""; this.listeners = new Map(); this.data = {}; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  async fire(type) { await this.listeners.get(type)?.(); }
  focus() {}
  get dataset() { return this.data; }
  get textContent() { return `${this.children.map((child) => child?.textContent ?? String(child)).join("")}${this.innerHTML ?? ""}`; }
  set textContent(value) { this.children = [String(value)]; }
}

globalThis.document = { createElement: (name) => new Element(name) };

const { route } = await import("../src/test-pages/release.mjs");

const COMMIT = "a".repeat(40);
const VERSION = "2026.10.8";
const TAG = `v${VERSION}-rc.1`;
const JOB = "docs/jobs/JOB-20261009-0148-2890.md";

function elements(root, className) {
  const found = [];
  (function walk(node) { for (const child of node.children ?? []) if (child?.children) {
    if (child.className?.split(" ").includes(className)) found.push(child);
    walk(child);
  } })(root);
  return found;
}

function jobRecord() {
  return ["---", "id: JOB-20261009-0148-2890", "kind: run-tests", "works_on:", `  - ${COMMIT}`,
    "route: ci hosted", "started_by: akmaier", "start: 2026-10-09 01:48 UTC", "agent_m: unreleased, commit unknown", "limit: 1", "---",
    "## Destinations", "", "## Parameters", "", "```json",
    JSON.stringify({ candidate: { version: VERSION, tag: TAG, commit: COMMIT }, changelog: "Recorded release entry." }), "```", "",
    "## End", "", "at: 2026-10-09 02:00 UTC", "state: done", ""].join("\n");
}

const SPEC = ["# Fixture product", "", "**A SAMPLE REQUIREMENT** *(Product Owner)*", "A sample rule.",
  "*Check:* `tests/pending.test.mjs`", ""].join("\n");
const DECLARATION = ["// TST-100", "// level: unit", "// guards: A SAMPLE REQUIREMENT", ""].join("\n");
function resultRecord(outcome = "failed") {
  return ["---", `commit: ${COMMIT}`, "levels:", "  - unit", "occasion: release-candidate", "participant: ci",
    "date: 2026-10-09 02:00 UTC", "---", "## Outcomes", "", "| Test | Level | Outcome | Runs |",
    "|---|---|---|---|", `| TST-100 | unit | ${outcome} | |`, ""].join("\n");
}

function snapshot(files, ref) {
  return { repository: { path: "org/product" }, ref, commit: COMMIT, paths: Object.keys(files),
    read: async (path) => files[path] ?? null, blob: () => "b".repeat(40) };
}

function pendingHost({ pending = true, complete = true } = {}) {
  const branch = pending ? { [JOB]: jobRecord(), "SPEC.md": SPEC, "tests/pending.test.mjs": DECLARATION } : {};
  const results = complete ? { [`runs/${COMMIT}/20261009-0200-release-candidate.md`]: resultRecord() } : {};
  const writes = [];
  const tags = pending ? [{ name: TAG, commit: COMMIT }] : [];
  return { writes, tags,
    async repositoryInfo() { return { defaultBranch: "main" }; },
    async listTags() { return tags; },
    async readSnapshot(ref) {
      if (ref === "test-results") return snapshot(results, ref);
      return snapshot(branch, ref);
    },
    async commitFiles(change) { writes.push(change); return { commit: COMMIT }; },
    async createTag(name, commit) { writes.push({ name, commit }); },
  };
}

// The pending-read sentinel is the observable failure node. The default-branch snapshot is a known-positive Host
// contract; only the pending lookup's tag read is refused.
test("TST-289001: a refused pending-report lookup is named before the new-release form", async () => {
  const target = new Element("target");
  const host = {
    async repositoryInfo() { return { defaultBranch: "main" }; },
    async readSnapshot() { return snapshot({}, "main"); },
    async listTags() { throw new Error("pending report read refused"); },
  };

  await route.render(target, { product: { host } }, {});

  assert.match(target.textContent, /pending report read refused/i);
  assert.doesNotMatch(target.textContent, /New release/);
});

// TST-289002
// level: unit
// module: MOD-test-pages
// guards: UC-013; UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
// given: the selected product has a completed recorded run, its declared guarded test, and its failed recorded outcome.
// input: render the release route, refresh its report, then enter the required limitation and explicitly accept it.
// expect: the candidate, report requirement and limitation reopen without writes; only explicit acceptance invokes release.
test("TST-289002: a completed recorded candidate reopens without writes and accepts through the existing service", async () => {
  const target = new Element("target");
  const host = pendingHost();

  await route.render(target, { product: { host } }, {});
  assert.match(target.textContent, new RegExp(`Release candidate ${TAG}`));
  assert.match(target.textContent, /Recorded release entry/);
  assert.match(target.textContent, /A SAMPLE REQUIREMENT/);
  assert.match(target.textContent, /TST-100/);
  assert.equal(host.writes.length, 0, "opening a waiting report does not write");

  await elements(target, "refresh")[0].fire("click");
  assert.equal(host.writes.length, 0, "refreshing the waiting report does not write");

  const accept = elements(target, "accept")[0];
  elements(accept, "person")[0].value = "akmaier";
  elements(accept, "reason")[0].value = "known fixture limitation";
  await elements(accept, "accept")[0].fire("click");
  assert.equal(host.writes.length, 2, "only the explicit acceptance writes the report commit and tested tag");
});

// TST-289003
// level: unit
// module: MOD-test-pages
// guards: UC-013; UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// given: the selected product has no candidate report awaiting acceptance.
// input: render the release route.
// expect: the existing new-release form remains available for that selected product.
test("TST-289003: a selected product without a pending report keeps the new-release form", async () => {
  const target = new Element("target");
  await route.render(target, { product: { host: pendingHost({ pending: false }) } }, {});
  assert.match(target.textContent, /New release/);
});

// TST-289004
// level: unit
// module: MOD-test-pages
// guards: UC-013; UC-047; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
// given: the selected product has a completed run record for a pending candidate but no outcome on its test-results branch.
// input: render the release route.
// expect: the existing candidate report reopens as incomplete and offers no Accept and release action.
test("TST-289004: a pending candidate with missing results remains incomplete", async () => {
  const target = new Element("target");
  await route.render(target, { product: { host: pendingHost({ complete: false }) } }, {});
  assert.match(target.textContent, /has not finished at every level/);
  assert.equal(elements(target, "accept").length, 0);
});

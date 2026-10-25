// ITM-521: a failure raised after the snapshot is read, while the entry's view is built, is named on the page (MOD-review-pages, route `spec-entry`).
// Run: node --test tests/review-pages-failure-after-snapshot.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-006; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// Level: unit
//
// This imports the browser harness of tests/review-pages-harness.mjs unchanged (its document and its localStorage). The repository is a Host of
// the tests' own over one product in memory: a SPEC of one section and a queue of one entry. The snapshot it returns reads every file but the entry's rationale,
// whose read fails as a used-up limit does, so the failure is raised while the entry's view is built, after the snapshot was read. The impact list comes from
// the graph stored for the commit (tests/stored-graph-fake.mjs), which the page reads and never builds, so the page reads no use case itself.
// Nothing reaches the network. The expected values are stated in the test.

import "./review-pages-harness.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { withStoredGraph } from "./stored-graph-fake.mjs";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const { HostError } = await import("../src/repository-hosts/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));
const route = pages.view?.routes.find((candidate) => candidate.name === "spec-entry");

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const WRITING = text("## 2. Writing", "", "**A WRITE RULE** *(Fixture PO)*", "A writer writes a file whole.", "*Check:* no automatic check; at review");
const QUEUE = "docs/spec-freigaben/2026-03-01_sample";
const USE_CASE = "docs/use-cases/UC-001-write-a-file.md";
// The file whose read fails: the entry's rationale, which the page reads itself while it builds the entry's view, after the snapshot was read.
const FAILING = `${QUEUE}/07-entry.begruendung.md`;
const FILES = {
  "README.md": "# Fixture product\n",
  "SPEC.md": text("# Fixture product — Specification", "") + WRITING,
  [USE_CASE]: text("---", "id: UC-001", "title: Write a file", "area: files", "actors:", "  - Writer", "realises:", "  - A WRITE RULE", "---", "# UC-001 Write a file", "", "**Goal.** Write a file."),
  [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · sample", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 07 | `SPEC.md` | ## 2. Writing | — | — |"),
  [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-03-01 sample", "", "Append-only."),
  [`${QUEUE}/07-entry.md`]: WRITING.replace("whole.", "entirely."),
  [`${QUEUE}/07-entry.begruendung.md`]: text("# ## 2. Writing: a change", "", "**The change.** A sample change."),
};
const LIMIT = "GitHub's request limit for the account these requests are made with is used up. It resets at 2030-01-01 00:00 UTC.";

function byClass(root, name, className) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (kid.localName === name && kid.className.split(" ").includes(className)) found.push(kid); walk(kid); } } })(root);
  return found;
}

function hostWhose(reading) {
  const snapshot = withStoredGraph({ repository: REPOSITORY, ref: "main", commit: "c".repeat(40), paths: Object.keys(FILES).sort(),
    read: async (path) => { if (path === FAILING) throw reading(); return path in FILES ? FILES[path] : null; },
    blob: (path) => (path in FILES ? blobOf(FILES[path]) : null) }, { read: async (path) => FILES[path] ?? null });
  return { async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return snapshot; } };
}

// TST-521101
// level: unit
// module: MOD-review-pages
// guards: UC-006; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: the product with one queue entry, 07, and a stored token; reading the entry's rationale, while the entry's view is built, fails with a RateLimited whose message names the used-up limit and its reset
// input: the route spec-entry with the id of entry 07
// expect: render resolves; the page holds one problem paragraph, its last element, whose text is exactly that message; no word of the token in it and no link to store a token
test("spec-entry/<id> — a failure raised while the entry's view is built is drawn as the problem paragraph, last on the page", async () => {
  assert.ok(route, `the route spec-entry: ${pages.error?.message}`);
  const store = openStore("alice/agent-m");
  writeSetting(store, "github-token:alice/thesis-tool", { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Agent M · thesis-tool", expires: "2027-01-01" });
  const target = document.createElement("div");
  document.body.append(target);
  const host = hostWhose(() => new HostError("RateLimited", {}, LIMIT));
  const context = { page: "review", instance: { repository: "alice/agent-m", host }, store, go() {}, product: { address: REPOSITORY.web, kind: "github", host } };
  await route.render(target, context, { id: "spec-2026-03-01_sample-07" });

  const problems = byClass(target, "p", "problem");
  assert.equal(problems.length, 1, "one problem paragraph on the page");
  assert.equal(target.children.at(-1) === problems[0], true, "the paragraph is the last element of the page");
  assert.equal(problems[0].textContent, LIMIT);
  assert.doesNotMatch(problems[0].textContent, /token/i);
  assert.equal(byClass(problems[0], "a", "token-step").length, 0, "no link to store a token");
});

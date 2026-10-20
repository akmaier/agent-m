// MOD-review-pages' route spec-entry, the list of an entry of the instance's own SPEC whose approval is committed and whose section is not written (ITM-656), as the accepted text of
// docs/architecture/MOD-review-pages.md states it: "An entry of the instance's own SPEC whose approval record is committed but whose section is not written, because the instance's
// workflows are not turned on, is shown *approved*, not *in SPEC*, with why and a link to the Actions step of MOD-settings-pages' `get-your-own` (UC-014 step 4, 4a)."
// Run: node --test tests/review-pages-spec-entries-approved-why.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-014; A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
// Level: unit
//
// This imports the browser harness of tests/review-pages-harness.mjs unchanged. The repository is a Host of the tests' own over one repository in memory, keeping to MOD-repository-hosts'
// interface. The real MOD-spec-changes, MOD-approvals and MOD-documents run as they are. Nothing reaches the network. The product is a SPEC of one section and a queue of one entry (07)
// whose approval record names the section that holds now. Where the module file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The page does not read the state of the workflows (the module's Uses give it no read of them): an entry of the instance's own SPEC — the route given no product — whose state is
//     `approved` is the case the text names, and the row says why in <p class="why">: that the section is written by the instance's workflows and they are not turned on, naming the step.
//   - The link is <a class="actions-step"> to `#get-your-own/step=actions`, the route get-your-own at its Actions step.
//   - The entry stays *approved* (<span class="badge">) and keeps its tick as before; only a note and a link are added. A product's SPEC and an entry in another state get neither.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import "./review-pages-harness.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));
const route = pages.view?.routes.find((candidate) => candidate.name === "spec-entry");

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" };
const TOKEN = { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Agent M · agent-m", expires: "2027-01-01" };

const WRITING = text("## 2. Writing", "", "**A WRITE RULE** *(Fixture PO)*", "A writer writes a file whole.", "*Check:* no automatic check; at review");
const WRITING_NEW = WRITING.replace("whole.", "entirely.");
const SPEC = text("# Fixture — Specification", "") + WRITING;
const QUEUE = "docs/spec-freigaben/2026-03-01_sample", ID = "spec-2026-03-01_sample-07";
const PROPOSAL_PATH = `${QUEUE}/07-entry-7.md`;
const RECORD_PATH = `docs/approvals/${ID}-${blobOf(WRITING_NEW).slice(0, 12)}.md`;
const RECORD = text("kind: spec", `queue: ${QUEUE}`, "entry: 07", `proposal: ${PROPOSAL_PATH}`, `blob: ${blobOf(WRITING_NEW)}`, "target: SPEC.md", "anchor: ## 2. Writing", `section: ${blobOf(WRITING)}`);
const DECISIONS = text("# Decisions — queue 2026-03-01 sample", "", "Append-only.");
const APPLIED = `${DECISIONS}| 2026-03-02 10:00 UTC | 7 | uebernommen | approval:${RECORD_PATH.split("/").pop()} |\n`;
const files = (extra = {}) => ({
  "README.md": "# Fixture\n", "SPEC.md": SPEC,
  [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · sample", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|", "| 07 | `SPEC.md` | ## 2. Writing | — | — |"),
  [`${QUEUE}/entscheidungen.md`]: DECISIONS, [PROPOSAL_PATH]: WRITING_NEW,
  [`${QUEUE}/07-entry-7.begruendung.md`]: text("# ## 2. Writing: a change", "", "**The change.** A sample change."),
  ...extra,
});

function fakeHost(tree) {
  const commit = "c".repeat(40);
  const snapshot = (ref) => ({ repository: ON_GITHUB, ref, commit, paths: Object.keys(tree).sort(), read: async (path) => tree[path] ?? null, blob: (path) => (path in tree ? blobOf(tree[path]) : null) });
  return { repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }),
    readSnapshot: async (ref) => snapshot(ref), readHistory: async () => [] };
}
async function show(tree, { product = false } = {}) {
  assert.ok(route, `the route spec-entry: ${pages.error?.message}`);
  const store = openStore("alice/agent-m");
  writeSetting(store, product ? "github-token:alice/agent-m" : "github-token", TOKEN);
  const target = document.createElement("div");
  document.body.append(target);
  const host = fakeHost(tree);
  await route.render(target, { page: "review", instance: { repository: "alice/agent-m", host }, store, go() {},
    product: product ? { address: ON_GITHUB.web, kind: "github", host } : null }, {});
  return target;
}
function find(root, match) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
}
const byClass = (root, name, className) => find(root, (node) => node.localName === name && node.className.split(" ").includes(className));
const row = (target) => find(target, (node) => node.localName === "tr" && node.getAttribute("data-id") === ID)[0];
const badge = (node) => byClass(node, "span", "badge")[0]?.textContent;

// TST-656001 · level: unit · module: MOD-review-pages
// guards: UC-014; A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
// given: the instance's own SPEC, whose queue holds entry 07 with its approval record committed and no decision row; the section is not written
// input: the route spec-entry, the list
// expect: the row of entry 07 shows the state approved, not in SPEC; it says why — the instance's workflows are not turned on, so the section is not written —, in <p class="why">, and holds <a class="actions-step"> to #get-your-own/step=actions
test("spec-entry — an approved entry of the instance's own SPEC says why it is not written and links the Actions step", async () => {
  const target = await show(files({ [RECORD_PATH]: RECORD }));
  assert.equal(badge(row(target)), "approved");
  const why = byClass(row(target), "p", "why")[0];
  assert.ok(why, "the row says why");
  assert.match(why.textContent, /workflows/i);
  assert.match(why.textContent, /not turned on/i);
  const link = byClass(row(target), "a", "actions-step")[0];
  assert.equal(link?.getAttribute("href"), "#get-your-own/step=actions");
});

// TST-656002 · level: unit · module: MOD-review-pages
// guards: UC-014
// given: the same entry without its approval record (open), the same entry with its decision row (in SPEC), and the same approved entry on a product's SPEC
// input: the list of each
// expect: no <p class="why"> and no <a class="actions-step"> in any of them (the counter-proof of TST-656001: the note belongs to the approved entry of the instance's own SPEC alone); the states are open, in SPEC and approved
test("spec-entry — an open entry, an entry in the SPEC and a product's approved entry carry no note", async () => {
  const open = await show(files());
  assert.equal(badge(row(open)), "open");
  const applied = await show(files({ [RECORD_PATH]: RECORD, [`${QUEUE}/entscheidungen.md`]: APPLIED }));
  assert.equal(badge(row(applied)), "in SPEC");
  const product = await show(files({ [RECORD_PATH]: RECORD }), { product: true });
  assert.equal(badge(row(product)), "approved");
  for (const target of [open, applied, product]) {
    assert.equal(byClass(row(target), "p", "why").length, 0);
    assert.equal(byClass(row(target), "a", "actions-step").length, 0);
  }
});

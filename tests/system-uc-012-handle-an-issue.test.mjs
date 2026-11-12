// System tests of UC-012 "Handle an issue: bug fix or specification change", as far as the dashboard's route `issue` carries it: step 2, Implement, which puts the request to handle the issue into the prompt bar with the
// class its label gives (steps 3 and 4), the alternative flow 2a, the issue closed at once with the reason, and the alternative flow 5a, the old and the new expectation side by side before the fix's pull request is
// merged. Steps 5 and 6 and the alternative flow 5b are the work of the conversation's agent (UC-049), not of the page; TST-585201 maps the flows the page carries to the system test that walks them.
// Run: node --test tests/system-uc-012-handle-an-issue.test.mjs
//
// Module: MOD-maintenance-pages
// Module: MOD-issue-handling
// Guards: UC-012
// Level: system
//
// The world is tests/uc-012-harness.mjs: the real route `issue` of MOD-maintenance-pages over the real MOD-job-ledger, MOD-runtimes, MOD-test-document and MOD-repository-hosts, behind a fake GitHub of alice/product.
// Each test states its input and its expected result in its own text (given / input / expect) from UC-012, before it runs; none reads an expected value from the page. The counter-proofs are recorded in the pull
// request. Readings the texts leave open, which the cases state:
//   - Step 2's "puts the request … into the prompt bar" is read as the window's event agent-m:prompt, which MOD-prompt-bar takes into its input; the request names the issue and UC-012 and holds its number, title and text.
//   - 5a "the author sees the old and the new expectation side by side before merging" is read on the issue's page, from the open pull request of the issue's fix job, whose record the product holds.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { testDeclarations } from "../src/test-document/index.mjs";
import { ADDRESS, PRODUCT_URL, byClass, issueOf, one, open, restoreWorld, start, textOf, trusted, waitFor, walk } from "./uc-012-harness.mjs";

// The map reads files only and draws no page, so that there is no world to put back after it.
afterEach(() => { if (globalThis.document) restoreWorld(); });

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const SELF = "tests/system-uc-012-handle-an-issue.test.mjs";

// ---------------------------------------------------------------- the map

// Each flow of UC-012 that the page carries, with the system test that walks it.
const FLOWS = {
  "main flow, step 2": [[SELF, "TST-585208"]],
  "main flow, steps 3 and 4": [[SELF, "TST-585210"]],
  "2a": [[SELF, "TST-585209"]],
  "5a": [[SELF, "TST-585207"]],
};

// TST-585201 · level: system · module: system
// guards: UC-012
// given: FLOWS, which names step 2, steps 3 and 4, 2a and 5a, the flows of UC-012 the page carries, each with the system test that walks it
// input: the declarations of the test files named for each flow
// expect: FLOWS holds exactly "main flow, step 2", "main flow, steps 3 and 4", "2a" and "5a"; each test named stands in its file with the level system and guards UC-012
test("TST-585201: UC-012 every flow the page carries has a system test that walks it", () => {
  assert.deepEqual(Object.keys(FLOWS), ["main flow, step 2", "main flow, steps 3 and 4", "2a", "5a"], "the flows the page carries");
  for (const [flow, tests] of Object.entries(FLOWS)) {
    for (const [file, id] of tests) {
      assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `${flow}: ${file} exists`);
      const declared = testDeclarations(file, read(file)).find((each) => each.id === id);
      assert.ok(declared, `${flow}: ${id} is declared in ${file}`);
      assert.equal(declared.level, "system", `${id} is a system test`);
      assert.ok((declared.guards ?? []).includes("UC-012"), `${id} guards UC-012`);
    }
  }
});

// ---------------------------------------------------------------- step 2: Implement

const NAMING = "The export is cut off after the second page; FIRST RULE says nothing about page counts (UC-001, TST-001).";

// TST-585208 · level: system · module: system
// guards: UC-012; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the open issue 5 of alice/product, titled "Export loses pages 5", whose text is NAMING
// input: the author opens the issue and presses Implement
// expect: one click puts one request into the prompt bar: it names issue #5 and UC-012 and holds the title and NAMING; nothing is written to the product's repository or its issue
test("TST-585208: UC-012 step 2 Implement puts the request to handle the issue into the prompt bar with one click", async () => {
  const w = start({ issues: [issueOf(5, NAMING)] });
  const detail = await open(w, 5);
  await waitFor(() => byClass(detail, "implement-issue").length > 0);
  const prompts = [];
  const before = globalThis.dispatchEvent;
  globalThis.dispatchEvent = (event) => { if (event.type === "agent-m:prompt") prompts.push(event.detail); return true; };
  try { await trusted(one(detail, "implement-issue")); } finally { if (before) globalThis.dispatchEvent = before; else delete globalThis.dispatchEvent; }
  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /issue #5\b/);
  assert.match(prompts[0], /UC-012/);
  assert.ok(prompts[0].includes("Export loses pages 5") && prompts[0].includes(NAMING), prompts[0]);
  assert.deepEqual(w.kept.github.filter((request) => request.method !== "GET"), [], "Implement writes nothing");
});

// ---------------------------------------------------------------- steps 3 and 4: the class is the label

// TST-585210 · level: system · module: system
// guards: UC-012; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
// given: the open issue 5, labelled defect, and the open issue 6, labelled change, of alice/product, each whose text is NAMING
// input: the author opens each issue and presses Implement
// expect: the request of 5 gives its class as its label defect, a bug, and that of 6 as its label change, a change; each says not to classify the issue anew, and neither asks for a class to be proposed or confirmed
test("TST-585210: UC-012 steps 3 and 4 the class is the label set when the mail became the issue, and it is not decided again", async () => {
  const w = start({ issues: [issueOf(5, NAMING, { labels: ["defect"] }), issueOf(6, NAMING, { labels: ["change"] })] });
  const requests = {};
  for (const number of [5, 6]) {
    const detail = await open(w, number);
    await waitFor(() => byClass(detail, "implement-issue").length > 0);
    const prompts = [];
    const before = globalThis.dispatchEvent;
    globalThis.dispatchEvent = (event) => { if (event.type === "agent-m:prompt") prompts.push(event.detail); return true; };
    try { await trusted(one(detail, "implement-issue")); } finally { if (before) globalThis.dispatchEvent = before; else delete globalThis.dispatchEvent; }
    [requests[number]] = prompts;
  }
  assert.match(requests[5], /label defect: a bug/);
  assert.match(requests[6], /label change: a change/);
  for (const number of [5, 6]) {
    assert.match(requests[number], /Do not classify it anew/);
    assert.doesNotMatch(requests[number], /Propose its class|wait for my confirmation/i);
  }
});

// ---------------------------------------------------------------- 2a: the author does not implement the issue

const REASON = "Not implemented: the export of more than two pages is out of scope.";

// TST-585209 · level: system · module: system
// guards: UC-012; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the open issue 5 of alice/product, labelled change, whose text is NAMING
// input: the author opens the issue, types REASON and presses Close
// expect: one click closes the issue: the issue receives one comment, REASON, and the state closed; nothing else is written — no commit, no label; drawn again, the page offers neither Implement nor Close
test("TST-585209: UC-012 2a the author closes the issue at once with the reason, and nothing else changes", async () => {
  const w = start({ issues: [issueOf(5, NAMING, { labels: ["change"] })] });
  const detail = await open(w, 5);
  await waitFor(() => byClass(detail, "close-issue").length > 0);
  one(detail, "close-reason").value = REASON;
  await trusted(one(detail, "close-issue"));
  await waitFor(() => byClass(detail, "close-done").length > 0 || byClass(detail, "close-problem").length > 0);
  const written = w.kept.github.filter((request) => request.method !== "GET");
  assert.deepEqual(written.map((request) => [request.method, request.path]), [["POST", "/repos/alice/product/issues/5/comments"], ["PATCH", "/repos/alice/product/issues/5"]]);
  assert.equal(JSON.parse(written[0].body).body, REASON);
  assert.equal(JSON.parse(written[1].body).state, "closed");
  assert.deepEqual(w.kept.issues.find((each) => each.number === 5).labels, ["change"]);
  const again = await open(w, 5);
  await waitFor(() => byClass(again, "issue-text").length > 0);
  assert.deepEqual([byClass(again, "implement-issue").length, byClass(again, "close-issue").length], [0, 0]);
});

// ---------------------------------------------------------------- 5a: the test was wrong, not the code

const declared = (id, guards, expect) => [`// ${id} · level: unit · module: MOD-store`, `// guards: ${guards}`, "// given: a store of three pages", "// input: the export", `// expect: ${expect}`, `test("${id}", () => {});`, ""].join("\n");
const TEXTS = {
  base: { "tests/store.test.mjs": declared("TST-100", "FIRST RULE", "the export holds two pages") },
  head: { "tests/store.test.mjs": declared("TST-100", "FIRST RULE", "the export holds three pages") },
};
const FIX_JOB = "JOB-20261029-0900-c3d4";
const FIX_RECORD = startRecord({ id: FIX_JOB, kind: "fix-bug", worksOn: [ADDRESS(5)], participant: "ci-bot", model: "fixture-llm", route: "ci hosted", run: null, retries: null, startedBy: "alice", start: new Date("2026-10-29T09:00:00Z"),
  agentM: { version: "unreleased", commit: "f".repeat(40) }, inputs: [], limit: 2, destinations: [{ participant: "ci-bot", place: "GitHub's hosted runners", parts: [] }], params: { issue: 5 } });
const pullOf = (branch, state) => ({ number: 9, title: `${branch}: fix-bug`, branch, base: "main", head: "2".repeat(40), mergeCommit: state === "merged" ? "3".repeat(40) : null, state, draft: false,
  url: `${PRODUCT_URL}/pull/9`, opened: "2026-10-29T09:10:00Z", merged: state === "merged" ? "2026-10-29T09:50:00Z" : null, closed: state === "merged" ? "2026-10-29T09:50:00Z" : null, body: `Job: ${branch}` });

// TST-585207 · level: system · module: system
// guards: UC-012
// given: the open issue 5, labelled defect; the product holds the record of its fix job, of the kind fix-bug, working on the issue; the fix's pull request #9, open, changes only the test file tests/store.test.mjs, whose TST-100 (guards FIRST RULE) expected "the export holds two pages" and now expects "the export holds three pages"
// input: the author opens the issue while #9 is open
// expect: the page names pull request #9 as open and shows one row: TST-100, FIRST RULE, "the export holds two pages" beside "the export holds three pages", the old before the new; it offers no Close with links before the merge
test("TST-585207: UC-012 5a the test was wrong — before the merge the author sees its old and new expectation side by side", async () => {
  const w = start({ issues: [issueOf(5, NAMING, { labels: ["defect"] })], product: { [FIX_RECORD.path]: FIX_RECORD.text }, pulls: (branch) => (branch === FIX_JOB ? pullOf(branch, "open") : null),
    facts: async () => ({ pullRequest: pullOf(FIX_JOB, "open"), commits: [], files: [{ path: "tests/store.test.mjs", change: "modified" }], reviews: [], checks: [], read: async (path, side) => TEXTS[side][path] ?? null }) });

  const again = await open(w, 5);
  await waitFor(() => byClass(again, "fix-expectations").length > 0 || byClass(again, "fix-no-expectation").length > 0 || byClass(again, "issue-problem").length > 0);
  assert.equal(byClass(again, "issue-problem").length, 0, textOf(one(again, "issue-problem") ?? again));
  assert.match(textOf(one(again, "fix-pull")), /pull request #9 is open/);
  const rows = walk(one(again, "fix-expectations"), (node) => node.localName === "tr" && node.getAttribute?.("data-test"));
  assert.deepEqual(rows.map((row) => walk(row, (node) => node.localName === "td").map(textOf).map((text) => text.trim())), [["TST-100", "FIRST RULE", "the export holds two pages", "the export holds three pages"]]);
  assert.equal(byClass(again, "close-with-links").length, 0, "no closing before the merge");
});

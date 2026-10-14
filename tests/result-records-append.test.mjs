// ITM-476 foundation: appendResult with the accepted Document and Host interfaces only.
// Module: MOD-result-records
// Level: component
// Guards: TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN; UC-028
// Run: node --test tests/result-records-append.test.mjs
// Author/executor: developer-terra-a (this Codex session; runtime model unavailable).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as records from "../src/result-records/index.mjs";
import { readDocument, writeDocument } from "../src/documents/index.mjs";

const COMMIT = "1".repeat(40), HEAD = "2".repeat(40), MADE = "3".repeat(40);
const PATH = `runs/${COMMIT}/20261014-0800-commit-a1b2.md`;
const TEXT = readFileSync(new URL("./fixtures/result-records/run.md", import.meta.url), "utf8");
const record = () => readDocument(records.resultSchema.run, PATH, TEXT);
const failure = (name, fields = {}) => Object.assign(new Error(name), { name }, fields);
const address = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };

// Like the job-ledger fixture: snapshots are immutable heads, and the Host alone refuses stale commit attempts.
function fixtureHost({ branchExists = true, initialCommit = HEAD, files = {}, moved = null, refusal = null, readRefusal = null } = {}) {
  const branches = new Map([["trunk", { commit: initialCommit, files: new Map(Object.entries(files)) }]]);
  if (branchExists) branches.set("test-results", { commit: initialCommit, files: new Map(Object.entries(files)) });
  const calls = [], attempts = [];
  const host = {
    async repositoryInfo() {
      calls.push({ method: "repositoryInfo" });
      return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
    },
    async readSnapshot(ref) {
      calls.push({ method: "readSnapshot", ref });
      if (readRefusal) throw readRefusal;
      const tree = branches.get(ref === "HEAD" ? "trunk" : ref);
      if (!tree) throw failure("NotFound", { what: ref });
      const frozen = new Map(tree.files);
      return { repository: address, ref, commit: tree.commit, paths: [...frozen.keys()],
        read: async (path) => frozen.get(path) ?? null, blob: () => null };
    },
    async createBranch(name, from) {
      calls.push({ method: "createBranch", name, from });
      assert.equal(from, initialCommit, "first branch starts at a commit actually read");
      assert.notEqual(from, null, "createBranch requires a commit SHA, not null");
      if (!branches.has(name)) branches.set(name, { commit: from, files: new Map(branches.get("trunk").files) });
    },
    async commitFiles(change) {
      calls.push({ method: "commitFiles" });
      attempts.push(structuredClone(change));
      if (refusal) throw refusal;
      if (moved) throw moved;
      const tree = branches.get(change.branch);
      if (!tree && initialCommit !== null) throw failure("Moved", { head: null });
      if (change.expectedHead !== (tree?.commit ?? null)) throw failure("Moved", { head: tree?.commit ?? null });
      assert.deepEqual(Object.keys(change).sort(), ["branch", "expectedHead", "files", "message"], "accepted Host write shape; no force option");
      assert.equal(change.branch, "test-results", "result records never enter the default branch");
      assert.deepEqual(change.files, [{ path: PATH, text: writeDocument(records.resultSchema.run, record()) }], "only the new file, never delete/rewrite");
      assert.match(change.message, /\S/);
      branches.set(change.branch, { commit: MADE, files: new Map([...(tree?.files ?? []), [PATH, change.files[0].text]]) });
      return { commit: MADE, url: `${address.web}/commit/${MADE}` };
    },
  };
  return { host, calls, attempts, branches };
}

function append(host, document) {
  assert.equal(typeof records.appendResult, "function", "MOD-result-records public appendResult must be implemented");
  return records.appendResult(host, document);
}

// TST-476210
// level: component
// module: MOD-result-records
// guards: TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN; EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: existing test-results at HEAD, holding an unrelated immutable file, and the fixture read as a public Document
// input: appendResult(host, document), then resultsAt on the resulting branch snapshot
// expect: one commit at the head read, only the new canonical run file, returned commit/path, old file and default branch unchanged; reader shows its pass
test("TST-476210: append adds one canonical record at the read head and the reader consumes it", async () => {
  const fake = fixtureHost({ files: { "old.md": "immutable existing bytes\n" } });
  const result = await append(fake.host, record());
  assert.deepEqual(result, { commit: MADE, path: PATH });
  assert.equal(fake.attempts.length, 1);
  assert.equal(fake.attempts[0].expectedHead, HEAD);
  assert.equal(fake.calls.filter((call) => call.method === "readSnapshot" && call.ref === "test-results").length, 1);
  assert.equal(fake.calls.filter((call) => call.method === "createBranch").length, 0);
  assert.equal(fake.branches.get("test-results").files.get("old.md"), "immutable existing bytes\n");
  assert.equal(fake.branches.get("trunk").commit, HEAD);
  assert.equal(fake.branches.get("trunk").files.has(PATH), false);
  const levels = await records.resultsAt(await fake.host.readSnapshot("test-results"), COMMIT, [{ id: "TST-900001", level: "unit" }]);
  assert.equal(levels[0].tests[0].outcome, "passed");
});

// TST-476211
// level: component
// module: MOD-result-records
// guards: A RESULT RECORD IS NEVER REWRITTEN; UC-028
// given: test-results already holds the new record's exact path, once with identical bytes and once with different bytes
// input: appendResult(host, document) for each
// expect: Exists in both cases, no commit attempt, no branch creation and the existing text unchanged
test("TST-476211: an existing result path is refused even when its bytes match", async () => {
  for (const existing of [TEXT, "different immutable evidence\n"]) {
    const fake = fixtureHost({ files: { [PATH]: existing } });
    await assert.rejects(() => append(fake.host, record()), { name: "Exists" });
    assert.equal(fake.attempts.length, 0);
    assert.equal(fake.calls.filter((call) => call.method === "createBranch").length, 0);
    assert.equal(fake.branches.get("test-results").files.get(PATH), existing);
  }
});

// TST-476212
// level: component
// module: MOD-result-records
// guards: A RESULT RECORD IS NEVER REWRITTEN; UC-028
// given: a host which reports Moved with a new head at the first append commit attempt
// input: appendResult(host, document)
// expect: the identical Moved is propagated after exactly one attempt on the read head, no reread/retry/force and no existing file or default branch change
test("TST-476212: Moved propagates without retry, force or rewrite", async () => {
  const moved = failure("Moved", { head: "4".repeat(40) });
  const fake = fixtureHost({ files: { "old.md": "immutable\n" }, moved });
  await assert.rejects(() => append(fake.host, record()), (error) => error === moved);
  assert.equal(fake.attempts.length, 1);
  assert.equal(fake.attempts[0].expectedHead, HEAD);
  assert.equal(fake.calls.filter((call) => call.method === "readSnapshot").length, 1);
  assert.equal(fake.calls.filter((call) => call.method === "createBranch").length, 0);
  assert.equal(fake.branches.get("test-results").commit, HEAD);
  assert.equal(fake.branches.get("test-results").files.get("old.md"), "immutable\n");
  assert.equal(fake.branches.get("test-results").files.has(PATH), false);
});

// TST-476213
// level: component
// module: MOD-result-records
// guards: TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN; UC-028
// given: a nonempty product at trunk's HEAD, no test-results branch; Host offers only its accepted public operations
// input: appendResult(host, document)
// expect: first test-results created through createBranch at the product commit read, then one append there at that expected head; trunk unchanged
test("TST-476213: the first result branch uses accepted Host operations and a read commit", async () => {
  const fake = fixtureHost({ branchExists: false, files: { "README.md": "# Product\n" } });
  assert.deepEqual(await append(fake.host, record()), { commit: MADE, path: PATH });
  const created = fake.calls.filter((call) => call.method === "createBranch");
  assert.deepEqual(created, [{ method: "createBranch", name: "test-results", from: HEAD }]);
  const reads = fake.calls.filter((call) => call.method === "readSnapshot");
  assert.equal(reads[0].ref, "test-results");
  assert.ok(reads.some((call) => ["HEAD", "trunk"].includes(call.ref)), "the branch origin is a read snapshot, not an invented SHA");
  assert.equal(fake.attempts.length, 1);
  assert.equal(fake.attempts[0].expectedHead, HEAD);
  assert.equal(fake.branches.get("trunk").commit, HEAD);
  assert.equal(fake.branches.get("trunk").files.has(PATH), false);
});

// TST-476214
// level: component
// module: MOD-result-records
// guards: TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN; UC-028
// given: an empty GitHub repository's test-results snapshot has commit null and no path, as the accepted Snapshot specifies
// input: appendResult(host, document)
// expect: one commitFiles call on test-results at expectedHead null, no createBranch(null), canonical new file returned at its path
test("TST-476214: an empty repository's first result uses Host's null-head first commit", async () => {
  const fake = fixtureHost({ initialCommit: null });
  assert.deepEqual(await append(fake.host, record()), { commit: MADE, path: PATH });
  assert.equal(fake.attempts.length, 1);
  assert.equal(fake.attempts[0].expectedHead, null);
  assert.equal(fake.calls.filter((call) => call.method === "createBranch").length, 0);
});

// TST-476215
// level: component
// module: MOD-result-records
// guards: TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN; UC-028
// given: a known successful Host; then the accepted TokenRefused, PermissionMissing, RateLimited and Unreachable errors at read or commit
// input: appendResult(host, document) on each
// expect: successful control appends; each original error object propagates, no repeated attempts, no new evidence on failure
test("TST-476215: accepted Host read/write failures propagate without retry or fabricated evidence", async () => {
  assert.equal((await append(fixtureHost().host, record())).commit, MADE);
  for (const name of ["TokenRefused", "PermissionMissing", "RateLimited", "Unreachable"]) {
    for (const stage of ["read", "commit"]) {
      const error = failure(name);
      const fake = fixtureHost(stage === "read" ? { readRefusal: error } : { refusal: error });
      await assert.rejects(() => append(fake.host, record()), (caught) => caught === error);
      assert.equal(fake.attempts.length, stage === "read" ? 0 : 1);
      assert.equal(fake.branches.get("test-results").files.has(PATH), false);
    }
  }
});

// ITM-635: append one supplied result record on an expected test-results head.
// Module: MOD-result-records
// Guards: UC-028; EVERY TEST RUN LEAVES A RESULT RECORD; TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN
// Level: unit
// Run: node --test tests/result-records-append.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import * as records from "../src/result-records/index.mjs";
import { readDocument, writeDocument, documentFindings } from "../src/documents/index.mjs";

const COMMIT = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const HEAD = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const ADDED = "cccccccccccccccccccccccccccccccccccccccc";
const LATER = "dddddddddddddddddddddddddddddddddddddddd";
const PATH = "runs/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/20261017-0300-commit-abcd.md";
const EARLIER_PATH = "runs/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/20261016-2300-commit-1234.md";
const EARLIER_TEXT = [
  "---", "commit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "levels:", "  - unit",
  "occasion: commit", "participant: ci-earlier", "date: 2026-10-16 23:00 UTC", "---",
  "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|",
  "|TST-635901|unit|passed||", "",
].join("\n");
const INPUT_TEXT = [
  "---", "commit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "levels:", "  - unit",
  "occasion: commit", "participant: ci-before", "date: 2026-10-17 03:00 UTC", "---",
  "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|",
  "| TST-635900 | unit | failed |  |", "",
].join("\n");
// Literal canonical expected text, independent of the production writer's result.
// The supplied Document's fields/rows change below; its original raw body still says failed.
const EXPECTED_TEXT = [
  "---", "commit: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "levels:", "  - unit",
  "occasion: commit", "participant: ci-fixture", "date: 2026-10-17 03:00 UTC", "---",
  "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|",
  "| TST-635900 | unit | passed | \u2014 |", "",
].join("\n");

function snapshot(files, commit = HEAD) {
  const held = new Map(files);
  return {
    repository: { server: "github", origin: "https://github.com", path: "fixture/product", web: "https://github.com/fixture/product" },
    ref: "test-results", commit, paths: [...held.keys()],
    read: async (path) => held.get(path) ?? null,
    readMany: async () => {},
    blob: (path) => held.has(path) ? "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : null,
  };
}

// Same in-memory public Host/Snapshot boundary used by the existing release-evidence tests.
// No branch creation, credential, fetch, git command or real repository write.
function captureHost({ failAt = null, failure = null } = {}) {
  const files = new Map([[EARLIER_PATH, EARLIER_TEXT]]);
  const calls = [];
  let head = HEAD;
  return {
    calls, files,
    host: {
      async readSnapshot(ref) {
        calls.push({ method: "readSnapshot", ref });
        if (failAt === "read") throw failure;
        if (ref !== "test-results") throw Object.assign(new Error("unknown fixture branch"), { name: "NotFound" });
        return snapshot(files, head);
      },
      async commitFiles(change) {
        calls.push({ method: "commitFiles", change: structuredClone(change) });
        if (failAt === "write") throw failure;
        if (change.expectedHead !== head) throw Object.assign(new Error("fixture head moved"), { name: "Moved", head });
        for (const file of change.files) {
          if (file.delete) files.delete(file.path);
          else files.set(file.path, file.text);
        }
        head = head === HEAD ? ADDED : LATER;
        return { commit: head, url: `https://github.com/fixture/product/commit/${head}` };
      },
    },
  };
}

async function supplied(t) {
  const document = readDocument(records.resultSchema.run, PATH, INPUT_TEXT);
  document.fields.participant = "ci-fixture";
  document.sections[0].rows[0].cells.Outcome = "passed";
  assert.deepEqual(documentFindings(records.resultSchema.run, document), []);
  assert.equal(writeDocument(records.resultSchema.run, document), EXPECTED_TEXT, "literal public serializer control");
  assert.deepEqual(await records.resultsAt(snapshot([[EARLIER_PATH, EARLIER_TEXT]]), COMMIT,
    [{ id: "TST-635901", level: "unit" }]), [{
    level: "unit", passed: 1, failed: 0, flaky: 0, notRun: 0,
    tests: [{ id: "TST-635901", outcome: "passed", runs: null, records: [EARLIER_PATH] }],
  }]);
  t.diagnostic("Known-positive public result schema, literal serializer and existing resultsAt caller controls passed.");
  return document;
}

// An absent optional namespace entry resolves undefined so its behavior assertion fails natively.
// Errors from a present entry remain errors, observed below by their accepted public names.
async function attempt(host, document) {
  try { return { value: await records.appendResult?.(host, document), error: null }; }
  catch (error) { return { value: null, error }; }
}

// TST-635001
// level: unit
// module: MOD-result-records
// guards: UC-028; EVERY TEST RUN LEAVES A RESULT RECORD; TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN
// given: an existing test-results head bbbb... with EARLIER_TEXT; a valid supplied Document whose participant/Outcome fields have changed
// input: public appendResult(host, document) at PATH
// expect: commit cccc... and PATH; one addition of the literal EXPECTED_TEXT on exactly bbbb... on test-results; earlier bytes unchanged; no delete or force
test("TST-635001 adds the serialized supplied Document once on exactly the head read", async (t) => {
  const document = await supplied(t), fixture = captureHost();
  const answer = await attempt(fixture.host, document);
  assert.deepEqual(answer.value, { commit: ADDED, path: PATH });
  assert.equal(answer.error, null);
  assert.equal(fixture.calls.filter((call) => call.method === "readSnapshot").length, 1);
  assert.equal(fixture.calls.find((call) => call.method === "readSnapshot").ref, "test-results");
  const writes = fixture.calls.filter((call) => call.method === "commitFiles");
  assert.equal(writes.length, 1);
  assert.deepEqual({ branch: writes[0].change.branch, expectedHead: writes[0].change.expectedHead, files: writes[0].change.files },
    { branch: "test-results", expectedHead: HEAD, files: [{ path: PATH, text: EXPECTED_TEXT }] });
  assert.equal(Object.hasOwn(writes[0].change, "force"), false);
  assert.equal(typeof writes[0].change.message, "string");
  assert.ok(writes[0].change.message.trim().length > 0);
  assert.deepEqual([...fixture.files], [[EARLIER_PATH, EARLIER_TEXT], [PATH, EXPECTED_TEXT]]);
});

// TST-635002
// level: unit
// module: MOD-result-records
// guards: UC-028; A RESULT RECORD IS NEVER REWRITTEN
// given: the same valid record and existing branch; a successful addition is observed before trying its identical path/text again
// input: appendResult twice with the same supplied record
// expect: first commit cccc... at PATH; second rejects Exists, makes no second commit and preserves both exact file texts
test("TST-635002 refuses an existing path even when its serialized text is identical", async (t) => {
  const document = await supplied(t), fixture = captureHost();
  assert.deepEqual((await attempt(fixture.host, document)).value, { commit: ADDED, path: PATH }, "positive addition first");
  const refused = await attempt(fixture.host, document);
  assert.equal(refused.error?.name, "Exists");
  assert.equal(fixture.calls.filter((call) => call.method === "commitFiles").length, 1);
  assert.deepEqual([...fixture.files], [[EARLIER_PATH, EARLIER_TEXT], [PATH, EXPECTED_TEXT]]);
});

// TST-635003
// level: unit
// module: MOD-result-records
// guards: UC-028; A RESULT RECORD IS NEVER REWRITTEN
// given: head bbbb... was read, but the public commitFiles boundary refuses with Moved naming dddd...
// input: appendResult of the valid supplied Document
// expect: Moved with head dddd... propagated; one read/one commit attempt, no hidden retry, no added or changed file
test("TST-635003 propagates Moved without retrying or overwriting the advanced head", async (t) => {
  const document = await supplied(t);
  const failure = Object.assign(new Error("fixture branch moved"), { name: "Moved", head: LATER });
  const fixture = captureHost({ failAt: "write", failure });
  const answer = await attempt(fixture.host, document);
  assert.deepEqual({ name: answer.error?.name, head: answer.error?.head }, { name: "Moved", head: LATER });
  assert.equal(fixture.calls.filter((call) => call.method === "readSnapshot").length, 1);
  const writes = fixture.calls.filter((call) => call.method === "commitFiles");
  assert.equal(writes.length, 1);
  assert.equal(writes[0].change.expectedHead, HEAD);
  assert.deepEqual([...fixture.files], [[EARLIER_PATH, EARLIER_TEXT]]);
});

// TST-635004
// level: unit
// module: MOD-result-records
// guards: UC-028; TEST RESULTS ARE KEPT IN THE REPOSITORY
// given: valid record, passing public controls; the Host refuses either its snapshot read or commit with TokenRefused
// input: appendResult for each boundary refusal
// expect: TokenRefused propagated by name, one snapshot attempt and zero/one commit attempts respectively; no file changed
test("TST-635004 propagates TokenRefused from read and write without retry", async (t) => {
  const document = await supplied(t);
  for (const failAt of ["read", "write"]) {
    const fixture = captureHost({ failAt, failure: Object.assign(new Error("fixture token refused"), { name: "TokenRefused" }) });
    const answer = await attempt(fixture.host, document);
    assert.equal(answer.error?.name, "TokenRefused", failAt);
    assert.equal(fixture.calls.filter((call) => call.method === "readSnapshot").length, 1);
    assert.equal(fixture.calls.filter((call) => call.method === "commitFiles").length, failAt === "read" ? 0 : 1);
    assert.deepEqual([...fixture.files], [[EARLIER_PATH, EARLIER_TEXT]]);
  }
});

// TST-635005
// level: unit
// module: MOD-result-records
// guards: UC-028; TEST RESULTS ARE KEPT IN THE REPOSITORY
// given: valid record, passing public controls; the Host refuses either its snapshot read or commit with PermissionMissing
// input: appendResult for each boundary refusal
// expect: PermissionMissing propagated by name, one snapshot attempt and zero/one commit attempts respectively; no file changed
test("TST-635005 propagates PermissionMissing from read and write without retry", async (t) => {
  const document = await supplied(t);
  for (const failAt of ["read", "write"]) {
    const fixture = captureHost({ failAt, failure: Object.assign(new Error("fixture permission missing"), { name: "PermissionMissing" }) });
    const answer = await attempt(fixture.host, document);
    assert.equal(answer.error?.name, "PermissionMissing", failAt);
    assert.equal(fixture.calls.filter((call) => call.method === "readSnapshot").length, 1);
    assert.equal(fixture.calls.filter((call) => call.method === "commitFiles").length, failAt === "read" ? 0 : 1);
    assert.deepEqual([...fixture.files], [[EARLIER_PATH, EARLIER_TEXT]]);
  }
});

// TST-635006
// level: unit
// module: MOD-result-records
// guards: UC-028; TEST RESULTS ARE KEPT IN THE REPOSITORY
// given: valid record, passing public controls; the Host refuses either its snapshot read or commit with RateLimited
// input: appendResult for each boundary refusal
// expect: RateLimited propagated by name, one snapshot attempt and zero/one commit attempts respectively; no file changed
test("TST-635006 propagates RateLimited from read and write without retry", async (t) => {
  const document = await supplied(t);
  for (const failAt of ["read", "write"]) {
    const fixture = captureHost({ failAt, failure: Object.assign(new Error("fixture rate limited"), { name: "RateLimited" }) });
    const answer = await attempt(fixture.host, document);
    assert.equal(answer.error?.name, "RateLimited", failAt);
    assert.equal(fixture.calls.filter((call) => call.method === "readSnapshot").length, 1);
    assert.equal(fixture.calls.filter((call) => call.method === "commitFiles").length, failAt === "read" ? 0 : 1);
    assert.deepEqual([...fixture.files], [[EARLIER_PATH, EARLIER_TEXT]]);
  }
});

// TST-635007
// level: unit
// module: MOD-result-records
// guards: UC-028; TEST RESULTS ARE KEPT IN THE REPOSITORY
// given: valid record, passing public controls; the Host refuses either its snapshot read or commit with Unreachable
// input: appendResult for each boundary refusal
// expect: Unreachable propagated by name, one snapshot attempt and zero/one commit attempts respectively; no file changed
test("TST-635007 propagates Unreachable from read and write without retry", async (t) => {
  const document = await supplied(t);
  for (const failAt of ["read", "write"]) {
    const fixture = captureHost({ failAt, failure: Object.assign(new Error("fixture server unreachable"), { name: "Unreachable" }) });
    const answer = await attempt(fixture.host, document);
    assert.equal(answer.error?.name, "Unreachable", failAt);
    assert.equal(fixture.calls.filter((call) => call.method === "readSnapshot").length, 1);
    assert.equal(fixture.calls.filter((call) => call.method === "commitFiles").length, failAt === "read" ? 0 : 1);
    assert.deepEqual([...fixture.files], [[EARLIER_PATH, EARLIER_TEXT]]);
  }
});


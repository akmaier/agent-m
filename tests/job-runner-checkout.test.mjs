// A job in a checkout of the instance (ITM-391) — MOD-job-runner's `JobContext`, as the accepted text of docs/architecture/MOD-job-runner.md states
// it: "its `instance` also holding `checkout: string | null`: ... `instance.checkout` is the folder of a checkout of the instance in which the
// participant works and reads files itself — on a Bridge the instance at the job's `agent_m` commit in the offered agent's working folder
// (MOD-bridge-jobs), in CI the job workflow's checkout of the instance —, from which the instance's `snapshot` is then read; it is `null` in a
// browser"; and prepareJob, which reads the instance through the context. For UC-010 step 3 and UC-011 step 3. The routes that set the checkout
// (ITM-327, ITM-365) and the chapter recipes that read it (ITM-392) are other items'.
// Run: node --test tests/job-runner-checkout.test.mjs
//
// Module: MOD-job-runner
// Guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE; A RUNTIME IS INTERCHANGEABLE
// Level: unit
//
// The module file gives no refusal for a checkout at another commit than the job's record names. These tests read it from the texts that set it: the
// record names the instance's commit as `agent_m` (MOD-job-ledger, Data) and the context holds it as `agentM.commit`; MOD-bridge-jobs (Data) has the
// instance's clone hold "the commit of the instance the job's record names"; and the instance's snapshot is read from the checkout, so its `commit`
// (MOD-repository-hosts' Snapshot) is the commit the checkout is at. A checkout whose snapshot is at another commit, or at none, is refused by
// prepareJob as `CheckoutAtOtherCommit { checkout, expected, found }` before any recipe runs; the name is this file's reading, the module file
// names none. A context whose checkout is null, as in a browser, is read as before, whatever commit its snapshot is at. The checkout is a folder of
// this file's own in the system's temporary folder, never read by the runner: the runner hands its path on as it was given (compared after
// resolving symlinks, as /var and /private/var are one on macOS). The recipe is a fixture that shows what it reads. Each test states its input and
// its expected result before it runs (given / input / expect); where a test asserts a refusal, the same call is first shown to succeed. Nothing
// reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareJob, registerStrategies } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text", "read the repository"], place: "this machine", route: "bridge lab-pc agent claude" };
const RECORD_COMMIT = "a".repeat(40);
const OTHER_COMMIT = "b".repeat(40);
const CHECKOUT = mkdtempSync(join(tmpdir(), "agent-m-391-"));

const seen = [];
// The kind is propose-groups, whose one recipe this file stands in for: it shows what it reads of the instance.
const recipes = { "items-of-kind": async (context) => {
  seen.push({ checkout: context.instance.checkout, commit: context.instance.snapshot.commit });
  return [{ name: "the instance", text: `checkout ${context.instance.checkout ?? "none"} at ${context.instance.snapshot.commit ?? "none"}`,
    sources: [], required: true, size: 0 }];
} };
try {
  registerStrategies("tests/job-runner-checkout.test.mjs", { recipes });
} catch (error) {
  if (error.name !== "DuplicateStrategy") throw error;
}

const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/instance", web: "https://github.com/alice/instance" };
const snapshotAt = (commit) => ({ repository: REPOSITORY, ref: "main", commit, paths: [], read: async () => null, blob: () => null });
const contextOf = (instance) => ({ kind: null, params: {}, product: { address: "https://github.com/alice/product", snapshot: snapshotAt(null), host: null },
  instance: { host: null, ...instance }, connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null }, gates: [],
  person: "alice", now: new Date("2026-10-11T08:00:00Z"), agentM: { version: "unreleased", commit: RECORD_COMMIT },
  jobId: "JOB-20261011-0800-abcd" });
const prepare = (instance) => prepareJob("propose-groups", contextOf(instance), { drafter: DRAFTER, reviewers: [] });
const same = (a, b) => realpathSync(a) === realpathSync(b);

// guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE; UC-010 step 3
// given: a context whose instance holds a checkout, a folder, and a snapshot at the commit the job's record names
// input: prepareJob of a kind whose recipe reads the instance
// expect: the job is prepared; the recipe was given the checkout's path and the snapshot at the record's commit, and its part shows both
test("prepareJob — a context with a checkout of the instance at the record's commit is read through it", async () => {
  seen.length = 0;
  const prepared = await prepare({ checkout: CHECKOUT, snapshot: snapshotAt(RECORD_COMMIT) });
  assert.equal(seen.length, 1);
  assert.ok(same(seen[0].checkout, CHECKOUT), "the recipe is given the checkout's folder");
  assert.equal(seen[0].commit, RECORD_COMMIT);
  assert.deepEqual(prepared.parts.map((part) => part.text), [`checkout ${CHECKOUT} at ${RECORD_COMMIT}`]);
});

// guards: A RUNTIME IS INTERCHANGEABLE; UC-011 step 3
// given: a context whose instance has no checkout — null, as in a browser, and with no such key at all, as every context before this item —, its
//        snapshot at a commit other than the record's, or at none
// input: prepareJob of the same kind
// expect: the job is prepared as before, whatever commit the snapshot is at; the recipe sees no checkout
test("prepareJob — a context without a checkout is read as before", async () => {
  for (const instance of [{ checkout: null, snapshot: snapshotAt(OTHER_COMMIT) }, { snapshot: snapshotAt(null) }, { snapshot: snapshotAt(RECORD_COMMIT) }]) {
    seen.length = 0;
    const prepared = await prepare(instance);
    assert.equal(seen.length, 1);
    assert.ok(seen[0].checkout === null || seen[0].checkout === undefined);
    assert.match(prepared.parts[0].text, /^checkout none at /);
  }
});

// guards: A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE; UC-010 step 3
// given: a context whose instance holds a checkout whose snapshot is at another commit than the record's — one that differs in its last digit
//        only, and the record's first seven digits, as a short commit would be — and one whose snapshot has no commit
// input: prepareJob of each; known positive first — the same context at the record's commit
// expect: the known positive is prepared; each other is refused as CheckoutAtOtherCommit, naming the checkout, the commit the record names and the
//         one found (null for none), and no recipe ran
test("prepareJob — a checkout at another commit than the job's record names is refused as CheckoutAtOtherCommit", async () => {
  assert.ok(await prepare({ checkout: CHECKOUT, snapshot: snapshotAt(RECORD_COMMIT) }), "known positive: the checkout at the record's commit");
  for (const found of [OTHER_COMMIT, RECORD_COMMIT.slice(0, 39) + "c", RECORD_COMMIT.slice(0, 7), null]) {
    seen.length = 0;
    await assert.rejects(prepare({ checkout: CHECKOUT, snapshot: snapshotAt(found) }), (error) => error.name === "CheckoutAtOtherCommit"
      && error.checkout === CHECKOUT && error.expected === RECORD_COMMIT && error.found === found, String(found));
    assert.equal(seen.length, 0, "no recipe ran");
  }
});

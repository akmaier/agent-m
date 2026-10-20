// A commit a job made after its cancel (ITM-1023) — MOD-runtimes' `liveState` reporting it in `writtenAfterCancel` and `revertAfterCancel` reverting it, as the accepted text of docs/architecture/MOD-runtimes.md states it
// (:210-213 and the Interfaces entry of `revertAfterCancel`): "the commits of the branch named after the job, read with the host's `readHistory` (`changes: false`), whose date is after the record's `## End` of state
// `cancelled`"; "on a person's click, one commit on the job's branch, on the head that was read, with the person's token: every file the given commits changed gets back its text from before the first of them (`readFileAt`),
// and a file they added is removed. Only commits `liveState` reported in `writtenAfterCancel` are accepted; any other is a `TypeError`. Fails as `commitFiles` fails, `Moved` among them (UC-036 6a)."
// Run: node --test tests/runtimes-after-cancel.test.mjs
//
// Module: MOD-runtimes
// Guards: A CANCELLED JOB WRITES NOTHING MORE; ONE DASHBOARD SHOWS EVERY JOB; UC-036
// Level: unit
//
// A fake host of MOD-repository-hosts' interface (readHistory, readFileAt, commitFiles) keeping every call; the records are handwritten JobRecords (only `id`, `taken`, `end` are read). No request leaves the process.
// Readings the texts leave open, which the tests state (the pull request names them):
//   - The branch named after the job is named by the job's identifier (as trail.mjs reads it). A commit is "after" when its date is later than the end's `at`; one dated at the end's moment is not.
//   - `writtenAfterCancel` lists the commits newest first, as readHistory gives them, for a record whose end is `cancelled` only; a job that has not ended, or ended otherwise, reports none and its history is not read.
//   - A branch the host does not hold (`NotFound`) reports none; any other failure of the history is the live state's own: `reachable: false` with its message, never thrown.
//   - "From before the first of them" is the parent of the oldest given commit; a file that did not exist there is removed, one that did is written with that text. `revertAfterCancel` accepts the commits of one list the history reports
//     for the job (the same ones `liveState` reported) and none other, and an empty list is a `TypeError`.
// The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";

// A name the module does not provide yet is undefined here, so that each test fails by itself.
const { liveState, revertAfterCancel } = runtimes;

const ID = "JOB-20261016-1000-c0c0";
const sha = (n) => String(n).repeat(40);
const CANCELLED_AT = new Date("2026-10-16T11:00:00Z");
const record = (end = { at: CANCELLED_AT, state: "cancelled" }) => ({ id: ID, taken: { at: new Date("2026-10-16T10:00:00Z"), by: "ci hosted" }, end });
const entry = (n, date, parents, changes = []) => ({ commit: sha(n), parents: parents.map(sha), author: { account: null, name: "dev" }, date, message: `work ${n}`, changes });

// The branch, newest first: 4 and 3 after the cancel, 2 before it (the oldest of the given commits is 3, whose parent is 2).
const HISTORY = [
  entry(4, "2026-10-16T11:30:00Z", [3], [{ path: "src/new.txt", change: "added" }, { path: "src/kept.txt", change: "modified" }]),
  entry(3, "2026-10-16T11:10:00Z", [2], [{ path: "src/kept.txt", change: "modified" }, { path: "src/gone.txt", change: "deleted" }]),
  entry(2, "2026-10-16T10:30:00Z", [1], [{ path: "src/kept.txt", change: "modified" }]),
];
const AT_PARENT = { "src/kept.txt": "kept text before the cancel", "src/gone.txt": "gone text before the cancel" };

function fakeProduct({ history = HISTORY, historyFails = null, commitFails = null } = {}) {
  const calls = [], writes = [];
  const host = {
    async readHistory(path, options) {
      calls.push(["readHistory", path, options.ref, options.changes]);
      if (historyFails) throw historyFails;
      return options.changes === false ? history.map((each) => ({ ...each, changes: [] })) : history;
    },
    async readFileAt(path, commits) {
      calls.push(["readFileAt", path, commits]);
      return new Map(commits.map((commit) => [commit, commit === sha(2) ? (AT_PARENT[path] ?? null) : null]));
    },
    async commitFiles(change) {
      calls.push(["commitFiles"]);
      if (commitFails) throw commitFails;
      writes.push(structuredClone(change));
      return { commit: sha(9), url: "u" };
    },
  };
  return { host, calls, writes };
}
const failure = (name, fields = {}) => Object.assign(new Error(name), { name, ...fields });

// TST-1023001 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-036
// given: a job cancelled at 11:00, whose branch (named by the job's identifier) has two commits after that and one before it
// input: liveState of the record
// expect: writtenAfterCancel holds the two later commits, newest first, and not the earlier one; the history was read for the branch named after the job with changes: false; the live state is reachable
test("liveState reports the commits the job's branch got after the cancel", async () => {
  const { host, calls } = fakeProduct();
  const live = await liveState(record(), { host }, {});
  assert.deepEqual(live.writtenAfterCancel, [sha(4), sha(3)]);
  assert.equal(live.reachable, true);
  assert.deepEqual(calls.filter(([what]) => what === "readHistory"), [["readHistory", null, ID, false]]);
});

// TST-1023002 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-036
// given: a cancelled job whose branch has no commit after the cancel; one whose branch does not exist (NotFound); one with a commit dated at the very moment of the end
// input: liveState of each
// expect: writtenAfterCancel is empty for each, and each is reachable
test("a branch without a commit after the cancel, a missing branch and a commit at the moment of the end report none", async () => {
  const quiet = fakeProduct({ history: [entry(2, "2026-10-16T10:30:00Z", [1])] });
  assert.deepEqual((await liveState(record(), { host: quiet.host }, {})).writtenAfterCancel, []);
  const missing = fakeProduct({ historyFails: failure("NotFound") });
  const lost = await liveState(record(), { host: missing.host }, {});
  assert.deepEqual([lost.writtenAfterCancel, lost.reachable], [[], true]);
  const exact = fakeProduct({ history: [entry(5, "2026-10-16T11:00:00Z", [2])] });
  assert.deepEqual((await liveState(record(), { host: exact.host }, {})).writtenAfterCancel, []);
});

// TST-1023003 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE
// given: a job that has not ended, and one that ended done; the same branch with later commits
// input: liveState of each (the first is taken on CI, whose runs the host does not list)
// expect: writtenAfterCancel is empty for both, and the history is read for neither
test("only a job whose end is cancelled reports commits written after the cancel", async () => {
  const running = fakeProduct();
  running.host.listCiRuns = async () => [];
  const live = await liveState(record(null), { host: running.host }, {});
  assert.deepEqual(live.writtenAfterCancel, []);
  const finished = fakeProduct();
  assert.deepEqual((await liveState(record({ at: CANCELLED_AT, state: "done" }), { host: finished.host }, {})).writtenAfterCancel, []);
  assert.deepEqual([...running.calls, ...finished.calls].filter(([what]) => what === "readHistory"), []);
});

// TST-1023004 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: a cancelled job whose history cannot be read (the host fails with Unreachable)
// input: liveState of the record
// expect: no error is thrown; reachable false with the failure's message; writtenAfterCancel empty
test("a history that cannot be read gives reachable: false and the reason, never an error", async () => {
  const { host } = fakeProduct({ historyFails: failure("Unreachable") });
  const live = await liveState(record(), { host }, {});
  assert.equal(live.reachable, false);
  assert.match(live.reason, /Unreachable/);
  assert.deepEqual(live.writtenAfterCancel, []);
});

// TST-1023005 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-036
// given: the two commits written after the cancel (3, which deleted src/gone.txt and changed src/kept.txt, and 4, which added src/new.txt and changed src/kept.txt); the head the branch stands at, sha(4)
// input: revertAfterCancel(record, { host }, [sha(4), sha(3)], sha(4))
// expect: one commit on the branch named after the job, on the head given, with three files: src/kept.txt and src/gone.txt with their text at the parent of the oldest given commit (sha(2)), src/new.txt deleted; the answer is { commit }; the texts were read by readFileAt at sha(2)
test("revertAfterCancel writes one commit that gives each file its text from before the first of the given commits and removes a file they added", async () => {
  const { host, writes, calls } = fakeProduct();
  const result = await revertAfterCancel(record(), { host }, [sha(4), sha(3)], sha(4));
  assert.deepEqual(result, { commit: sha(9) });
  assert.equal(writes.length, 1);
  const [change] = writes;
  assert.deepEqual([change.branch, change.expectedHead], [ID, sha(4)]);
  const byPath = Object.fromEntries(change.files.map((file) => [file.path, file]));
  assert.deepEqual(Object.keys(byPath).sort(), ["src/gone.txt", "src/kept.txt", "src/new.txt"]);
  assert.equal(byPath["src/kept.txt"].text, "kept text before the cancel");
  assert.equal(byPath["src/gone.txt"].text, "gone text before the cancel");
  assert.equal(byPath["src/new.txt"].delete, true);
  assert.equal(byPath["src/new.txt"].text, undefined);
  assert.equal(calls.filter(([what]) => what === "readFileAt").every(([, , commits]) => commits.length === 1 && commits[0] === sha(2)), true);
});

// TST-1023006 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE
// given: the same branch
// input: revertAfterCancel with a commit made before the cancel (sha(2)), with an unknown commit, with one reported and one not, and with no commit
// expect: each is refused with a TypeError and nothing is committed
test("revertAfterCancel accepts only commits reported as written after the cancel", async () => {
  for (const commits of [[sha(2)], [sha(8)], [sha(4), sha(2)], []]) {
    const { host, writes } = fakeProduct();
    await assert.rejects(revertAfterCancel(record(), { host }, commits, sha(4)), TypeError, commits.join());
    assert.deepEqual(writes, []);
  }
});

// TST-1023007 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE
// given: a branch that moved after the head was read (commitFiles fails with Moved)
// input: revertAfterCancel
// expect: the Moved failure is thrown as it is, with its head
test("revertAfterCancel fails as commitFiles fails, Moved among them", async () => {
  const moved = failure("Moved", { head: sha(7) });
  const { host } = fakeProduct({ commitFails: moved });
  await assert.rejects(revertAfterCancel(record(), { host }, [sha(4)], sha(4)), (error) => error === moved);
});

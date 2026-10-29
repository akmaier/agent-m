// MOD-approvals' lastAcceptedText reads the last accepted text as one file of one commit (ITM-1268), as the accepted texts state it:
// MOD-approvals — "lastAcceptedText(id: string, host: Host) -> Promise<{ text: string, blob: string, path: string } | null> — the text
// named by the most recent approval record of an identifier … Crosses the network: reads the history of the records and of the file
// through the host; fails with the host's errors (`TokenRefused`, `RateLimited`, `NotFound`, `Unreachable`)" — and MOD-repository-hosts —
// "readSnapshot(ref: string, options?: { folders?: string[] }) -> Promise<Snapshot> … With `folders` — paths of folders or files —, the
// snapshot's `paths` are only the files at every depth of those folders and the files named … A read of a path outside them fails with
// `OutsideSnapshot`". The text is the file at the commit that added the record, read from the snapshot of that commit with `folders` naming
// only the file, so that the older commit's whole tree is not read; the blob of the text read is compared with the one the record names.
// Run: node --test tests/approvals-last-accepted-one-file.test.mjs
//
// Module: MOD-approvals
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; AN APPROVAL NAMES THE EXACT TEXT
// Level: unit
//
// The repository server is replaced by a fixture: a fake host with repositoryInfo, readSnapshot and readHistory, every call counted. Its
// readSnapshot gives the default branch whole; of any other ref it gives only the files of the `folders` it is asked with, and a snapshot of
// another ref without `folders` is a failure, so that a read of an older commit's whole tree cannot go unnoticed. One history: UC-010 is
// written, accepted by one record, and edited after it. Nothing reaches the network. Each test states its input and its expected result
// before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lastAcceptedText } from "../src/approvals/index.mjs";

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };

const useCase = (sentence) => text("---", "id: UC-010", "title: Send a file", "area: files", "actors:", "  - Reader",
  "realises:", "  - A SAMPLE RULE", "---", "# UC-010 Send a file", "", `**Goal.** ${sentence}`);
const UC10 = "docs/use-cases/UC-010-send-a-file.md";
const V1 = useCase("The sender picks a file and sends it.");
const V2 = useCase("The sender picks a file and sends it to a colleague.");
const RECORD = `docs/approvals/UC-010-${blobOf(V1).slice(0, 12)}.md`;
const RECORD_TEXT = text("kind: use-case", `file: ${UC10}`, `blob: ${blobOf(V1)}`);

const HISTORY = [
  { at: "2026-10-01T09:00:00Z", write: { [UC10]: V1 } },
  { at: "2026-10-02T09:00:00Z", write: { [RECORD]: RECORD_TEXT } },
  { at: "2026-10-03T09:00:00Z", write: { [UC10]: V2 } },
];
const COMMITS = [];
HISTORY.forEach((step, n) => {
  const tree = new Map(n ? COMMITS[n - 1].tree : []);
  for (const [path, body] of Object.entries(step.write)) tree.set(path, body);
  COMMITS.push({ commit: createHash("sha1").update(`commit ${n + 1}`).digest("hex"), tree, at: step.at, changed: Object.keys(step.write) });
});
const ADDING = COMMITS[1].commit;

// The fake host. `at`: what the snapshot of the commit that added the record holds of UC-010, in place of the text it had there (null: no file).
function fakeHost({ at } = {}) {
  const calls = [];
  const head = COMMITS.at(-1);
  const snapshotOf = (ref, files, folders) => ({ repository: ON_GITHUB, ref, commit: files.commit, paths: [...files.tree.keys()].sort(),
    async read(path) {
      calls.push({ fn: "read", path, ref });
      if (folders && !folders.includes(path)) throw Object.assign(new Error(`${path} lies outside the folders`), { name: "OutsideSnapshot", path });
      return files.tree.get(path) ?? null;
    },
    blob: (path) => (files.tree.has(path) ? blobOf(files.tree.get(path)) : null) });
  return {
    calls,
    host: {
      async repositoryInfo() {
        calls.push({ fn: "repositoryInfo" });
        return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref, options = {}) {
        calls.push({ fn: "readSnapshot", ref, folders: options?.folders });
        if (ref === "trunk") return snapshotOf(ref, head, null);
        if (!options?.folders) throw Object.assign(new Error(`the whole tree of ${ref} was read`), { name: "OlderTreeRead" });
        const found = COMMITS.find((c) => c.commit === ref);
        const tree = new Map([...found.tree].filter(([path]) => options.folders.includes(path)));
        if (at !== undefined && options.folders.includes(UC10)) { if (at === null) tree.delete(UC10); else tree.set(UC10, at); }
        return snapshotOf(ref, { commit: found.commit, tree }, options.folders);
      },
      async readHistory(path, { ref = "trunk", limit } = {}) {
        calls.push({ fn: "readHistory", path, ref, limit });
        const touching = COMMITS.filter((c) => c.changed.includes(path)).reverse()
          .map((c) => ({ commit: c.commit, parents: [], author: { account: "alice", name: "Alice" }, date: c.at, message: "", changes: [] }));
        return limit === undefined ? touching : touching.slice(0, limit);
      },
    },
  };
}

// TST-1268001 · level: unit · module: MOD-approvals
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// given: the history above, in which UC-010 is written (V1), accepted by one record, and edited since (V2); a host that counts its calls and fails when the whole tree of any commit but the default branch's is read
// input: lastAcceptedText("UC-010", host)
// expect: { text: V1, blob: the record's, path: UC-010's file } — not V2, the text the file has now; and the calls: repositoryInfo, the head's snapshot, one history (the record), a read of the record, the snapshot of the commit that added the record with `folders` naming only UC-010's file, and a read of UC-010 from it — 6 in all; no snapshot of another ref without `folders`
test("lastAcceptedText — a use case with one record reads the commit that added it with folders naming only the file, and that one file", async () => {
  const fake = fakeHost();
  const found = await lastAcceptedText("UC-010", fake.host);

  assert.deepEqual(found, { text: V1, blob: blobOf(V1), path: UC10 });
  assert.deepEqual(fake.calls.map((call) => call.fn), ["repositoryInfo", "readSnapshot", "readHistory", "read", "readSnapshot", "read"]);
  assert.deepEqual(fake.calls.filter((call) => call.fn === "readSnapshot").map((call) => [call.ref, call.folders]),
    [["trunk", undefined], [ADDING, [UC10]]]);
  assert.deepEqual(fake.calls.at(-1), { fn: "read", path: UC10, ref: ADDING });
});

// TST-1268002 · level: unit · module: MOD-approvals
// guards: AN APPROVAL NAMES THE EXACT TEXT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// given: the history above, and a host whose snapshot of the commit that added the record holds V2 for UC-010, a text of another blob than the one the record names; and, as the known positive, the same history on a host that gives what the file held there
// input: lastAcceptedText("UC-010", host) on each
// expect: the known positive gives V1; the other rejects with NotFound naming the file, and gives no result
test("lastAcceptedText — a text of another blob than the record names fails with NotFound naming the file", async () => {
  assert.notEqual(blobOf(V2), blobOf(V1), "fixture: the other text is a text of another blob");
  assert.deepEqual(await lastAcceptedText("UC-010", fakeHost().host), { text: V1, blob: blobOf(V1), path: UC10 }, "known positive");

  let answer = null;
  await assert.rejects(lastAcceptedText("UC-010", fakeHost({ at: V2 }).host).then((found) => { answer = found; }), (error) => {
    assert.equal(error.name, "NotFound");
    assert.ok(error.message.includes(UC10) || String(error.what).includes(UC10), `it names the file: ${error.message}`);
    return true;
  });
  assert.equal(answer, null, "no result was given for the other text");
});

// TST-1268003 · level: unit · module: MOD-approvals
// guards: AN APPROVAL NAMES THE EXACT TEXT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// given: the history above, and a host whose snapshot of the commit that added the record holds no UC-010 — the file is not there
// input: lastAcceptedText("UC-010", host)
// expect: it rejects with NotFound naming the file
test("lastAcceptedText — a file that the commit that added the record does not hold fails with NotFound naming the file", async () => {
  await assert.rejects(lastAcceptedText("UC-010", fakeHost({ at: null }).host), (error) => {
    assert.equal(error.name, "NotFound");
    assert.ok(error.message.includes(UC10) || String(error.what).includes(UC10), `it names the file: ${error.message}`);
    return true;
  });
});

// MOD-approvals' lastAcceptedText reads the older text of a file as one request (ITM-1291), as the accepted texts state it: MOD-repository-hosts —
// "`Host` — the object `connect` returns; the functions below, from `readSnapshot` on, are its functions" and "readFileAt(path: string, commits: string[]) ->
// Promise<Map<string, string | null>> — the text of one file at each of several commits, keyed by commit, `null` where the file does not exist there. It reads
// in batches, not one snapshot per commit: with a token, one request per batch of commits through the server's batch query" —, and MOD-approvals — "lastAcceptedText
// … Crosses the network: reads the history of the records and of the file through the host". The file at the commit that added the record is read with one
// readFileAt(file, [commit]); the commit and the tree of the older commit are not read.
// Run: node --test tests/approvals-last-accepted-read-file-at.test.mjs
//
// Module: MOD-approvals
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// Level: unit
//
// The repository server is replaced by a fixture: a fake host with repositoryInfo, readSnapshot, readFileAt and readHistory, every call counted. A snapshot of a
// ref other than the default branch counts as a read of the older commit and its tree, and the fake gives it, so that the old reading would be counted and answer.
// One history: UC-010 is written, accepted by one record, and edited after it. Nothing reaches the network. Each test states its input and its expected result
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

function fakeHost() {
  const calls = [];
  const snapshotOf = (ref, found) => ({ repository: ON_GITHUB, ref, commit: found.commit, paths: [...found.tree.keys()].sort(),
    async read(path) { calls.push({ fn: "read", path, ref }); return found.tree.get(path) ?? null; },
    blob: (path) => (found.tree.has(path) ? blobOf(found.tree.get(path)) : null) });
  return {
    calls,
    host: {
      async repositoryInfo() {
        calls.push({ fn: "repositoryInfo" });
        return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref, options = {}) {
        calls.push({ fn: "readSnapshot", ref, folders: options?.folders });
        return snapshotOf(ref, ref === "trunk" ? COMMITS.at(-1) : COMMITS.find((c) => c.commit === ref));
      },
      async readFileAt(path, shas) {
        calls.push({ fn: "readFileAt", path, shas });
        return new Map(shas.map((sha) => [sha, COMMITS.find((c) => c.commit === sha).tree.get(path) ?? null]));
      },
      async readHistory(path, { limit } = {}) {
        calls.push({ fn: "readHistory", path });
        const touching = COMMITS.filter((c) => c.changed.includes(path)).reverse()
          .map((c) => ({ commit: c.commit, parents: [], author: { account: "alice", name: "Alice" }, date: c.at, message: "", changes: [] }));
        return limit === undefined ? touching : touching.slice(0, limit);
      },
    },
  };
}
// The reads of an older commit: a snapshot of a ref other than the default branch, which is a request for its commit and for its tree entries.
const olderReads = (calls) => calls.filter((call) => call.fn === "readSnapshot" && call.ref !== "trunk");

// TST-1291001 · level: unit · module: MOD-approvals
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the history above, in which UC-010 is written (V1), accepted by one record, and edited since (V2); a host that counts its calls and gives a snapshot of any commit
// input: lastAcceptedText("UC-010", host)
// expect: { text: V1, blob: the record's, path: UC-010's file }; exactly one readFileAt, for UC-010's file at the one commit that added the record; no snapshot of that commit or of any ref but the default branch's
test("lastAcceptedText — the older file is read by one readFileAt, and the older commit's snapshot is not read", async () => {
  const fake = fakeHost();
  const found = await lastAcceptedText("UC-010", fake.host);

  assert.deepEqual(found, { text: V1, blob: blobOf(V1), path: UC10 });
  assert.deepEqual(fake.calls.filter((call) => call.fn === "readFileAt"), [{ fn: "readFileAt", path: UC10, shas: [ADDING] }]);
  assert.deepEqual(olderReads(fake.calls), [], "no snapshot of the commit that added the record");
  assert.deepEqual(fake.calls.filter((call) => call.fn === "read").map((call) => call.path), [RECORD], "the only file read from a snapshot is the record");
});

// TST-1291002 · level: unit · module: MOD-approvals
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the same history and host
// input: readSnapshot(the commit that added the record, { folders: [UC-010's file] }) and read of UC-010 from it, called directly on the host
// expect: counter-proof of the case above: the fake counts this reading — one snapshot of an older commit — and it gives V1, so that a lastAcceptedText that read the older file so would be counted by TST-1291001 and fail it
test("the fake counts a snapshot of the older commit: known positive of the case above", async () => {
  const fake = fakeHost();
  const snapshot = await fake.host.readSnapshot(ADDING, { folders: [UC10] });
  assert.equal(await snapshot.read(UC10), V1);
  assert.deepEqual(olderReads(fake.calls), [{ fn: "readSnapshot", ref: ADDING, folders: [UC10] }]);
});

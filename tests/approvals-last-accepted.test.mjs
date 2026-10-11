// The last accepted text of a file (ITM-334) — MOD-approvals' lastAcceptedText(id, host), as the accepted text of
// docs/architecture/MOD-approvals.md states it (UC-008 2a, 3e): the text that the most recent approval record of an identifier
// names — most recent by the order of the commits that added the records —, also when the file has been renamed since; null
// when no record names it; the host's failures passed on. statusOf and the acceptance (ITM-333) are not part of this item.
// Run: node --test tests/approvals-last-accepted.test.mjs
//
// Module: MOD-approvals
// Guards: UC-008; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; STATUS IS DERIVED FROM THE RECORDS
// Level: unit
//
// The repository server is replaced by a fixture: a fake host that keeps to MOD-repository-hosts' interface as docs/architecture/
// MOD-repository-hosts.md states it — one repository in memory, whose default branch is `trunk` and whose history is written
// below, oldest commit first; repositoryInfo, readSnapshot (the repository at the branch or at a commit: its paths, blob(path)
// and read(path)) and readHistory (the commits that changed a path, newest first, up to `ref` and at most `limit`, each with its
// parents, date, message and changes, a rename with the path it came from). Its other functions do not exist, so that a call
// the module has no business making fails by itself. Every call is counted, so that a test can refuse the nth. A failure is an
// error whose name is the one the interface gives it, with its fields. The history is one that serves every test: use cases
// written, edited, accepted by records, renamed. The module file does not say what `path` of the result is, nor what comes of a
// record whose file did not hold the text it names at the commit that added the record: this file reads `path` as the path the
// accepted text stood at when it was accepted, the `file` its record names, and that record as NotFound. A name the module
// does not provide yet is undefined here, so that each test fails by itself and not the whole file at once. Nothing reaches
// the network. Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as approvalsModule from "../src/approvals/index.mjs";

const { lastAcceptedText } = approvalsModule;

// ---------------------------------------------------------------- the history

const text = (...lines) => `${lines.join("\n")}\n`;
// The blob SHA git gives a text, as MOD-repository-hosts' snapshot gives a file's.
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/product",
  web: "https://github.com/alice/product" };

const useCase = (id, title, sentence) => text("---", `id: ${id}`, `title: ${title}`, "area: files", "actors:", "  - Reader",
  "realises:", "  - A SAMPLE RULE", "---", `# ${id} ${title}`, "", `**Goal.** ${sentence}`);
const moduleFile = (id, title) => text("---", `id: ${id}`, `title: ${title}`, `folder: src/${id.slice(4)}/`, "realises:",
  "follows:", "  - ARC-001", "---", `# ${id} ${title}`);

// UC-010 and UC-011 are each accepted twice and edited since: the older record of UC-010 sorts after the newer in the folder of
// records, the older of UC-011 before it, so that neither the first nor the last record by name is the newest.
const UC10 = "docs/use-cases/UC-010-send-a-file.md";
const V1 = useCase("UC-010", "Send a file", "The sender picks a file and sends it.");
const V2 = useCase("UC-010", "Send a file", "The sender picks a file and sends it to a colleague.");
const V3 = useCase("UC-010", "Send a file", "The sender picks a file, sends it to a colleague and is told when it arrives.");
const UC11 = "docs/use-cases/UC-011-receive-a-file.md";
const W1 = useCase("UC-011", "Receive a file", "The receiver opens a file that was sent.");
const W2 = useCase("UC-011", "Receive a file", "The receiver opens a file that was sent and saves it.");
const W3 = useCase("UC-011", "Receive a file", "The receiver opens a file that was sent, saves it and says thanks.");
// UC-020 is accepted, then renamed and edited.
const UC20_THEN = "docs/use-cases/UC-020-archive-a-file.md";
const UC20_NOW = "docs/use-cases/UC-020-store-a-file.md";
const X1 = useCase("UC-020", "Archive a file", "The keeper moves a file into the archive.");
const X2 = useCase("UC-020", "Store a file", "The keeper moves a file into the archive and notes where it went.");
// UC-030 has no record; UC-031 has one. MOD-sample has none; MOD-sample-extra, whose name begins with it, has one.
const UC30 = "docs/use-cases/UC-030-list-files.md";
const Q1 = useCase("UC-030", "List files", "The reader lists the files.");
const UC31 = "docs/use-cases/UC-031-count-files.md";
const Z1 = useCase("UC-031", "Count files", "The reader counts the files.");
const MOD = "docs/architecture/MOD-sample.md";
const M1 = moduleFile("MOD-sample", "Sample");
const MOD_EXTRA = "docs/architecture/MOD-sample-extra.md";
const E1 = moduleFile("MOD-sample-extra", "Sample extra");
// UC-040 was edited after the person saw it, and then accepted through GitHub's web interface: its record names the text seen.
const UC40 = "docs/use-cases/UC-040-mark-a-file.md";
const Y1 = useCase("UC-040", "Mark a file", "The reader marks a file as read.");
const Y2 = useCase("UC-040", "Mark a file", "The reader marks a file as read and as important.");

// The record that accepts a text of a file: the path it is written at, and its three lines.
const record = (id, kind, file, body) => ({ [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`]:
  text(`kind: ${kind}`, `file: ${file}`, `blob: ${blobOf(body)}`) });
// Dates as the servers give them: GitHub's in UTC, a GitLab server's in the offset the commit was made in — so that R10a, made
// at 10:00 in +02:00, is earlier than R10b at 09:00 UTC, though its text sorts after.
const HISTORY = [
  { at: "2026-10-01T09:00:00Z", message: "add the use cases and the modules", write: { [UC10]: V1, [UC11]: W1, [UC20_THEN]: X1,
    [UC30]: Q1, [UC31]: Z1, [MOD]: M1, [MOD_EXTRA]: E1, [UC40]: Y1 } },
  { at: "2026-10-05T10:00:00+02:00", message: "accept UC-010", write: record("UC-010", "use-case", UC10, V1) },
  { at: "2026-10-05T08:30:00Z", message: "accept UC-011", write: record("UC-011", "use-case", UC11, W1) },
  { at: "2026-10-05T08:45:00Z", message: "edit UC-010, UC-011 and UC-040", write: { [UC10]: V2, [UC11]: W2, [UC40]: Y2 } },
  { at: "2026-10-05T09:00:00Z", message: "accept UC-010 and UC-011", write: { ...record("UC-010", "use-case", UC10, V2),
    ...record("UC-011", "use-case", UC11, W2) } },
  { at: "2026-10-06T09:00:00Z", message: "edit UC-010 and UC-011 again", write: { [UC10]: V3, [UC11]: W3 } },
  { at: "2026-10-07T09:00:00Z", message: "accept UC-020, UC-031 and MOD-sample-extra",
    write: { ...record("UC-020", "use-case", UC20_THEN, X1), ...record("UC-031", "use-case", UC31, Z1),
      ...record("MOD-sample-extra", "module", MOD_EXTRA, E1) } },
  { at: "2026-10-08T09:00:00Z", message: "rename UC-020 and edit it", move: [{ from: UC20_THEN, to: UC20_NOW, text: X2 }] },
  { at: "2026-10-09T09:00:00Z", message: "accept UC-040", write: record("UC-040", "use-case", UC40, Y1) },
];

// ---------------------------------------------------------------- the fake host

// A failure as MOD-repository-hosts names it: an error with the failure's name and its fields.
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name }, fields);

// The fake host. refuseAt: the number of the call, counted from 1 over repositoryInfo, readSnapshot, readHistory and every read of
// a file, that is answered with the failure `refusal` instead.
function fakeHost({ refuseAt = null, refusal = null } = {}) {
  const calls = [], commits = [];
  let tree = new Map();
  HISTORY.forEach((step, n) => {
    const before = tree;
    tree = new Map(tree);
    const changes = [];
    for (const { from, to, text: moved } of step.move ?? []) {
      tree.delete(from);
      tree.set(to, moved);
      changes.push({ path: to, change: "renamed", from });
    }
    for (const [path, body] of Object.entries(step.write ?? {})) {
      changes.push({ path, change: before.has(path) ? "modified" : "added" });
      tree.set(path, body);
    }
    const commit = createHash("sha1").update(`commit ${n + 1}`).digest("hex");
    const parents = n ? [commits[n - 1].commit] : [];
    commits.push({ commit, tree, entry: { commit, parents, author: { account: "alice", name: "Alice" }, date: step.at,
      message: step.message, changes } });
  });
  // Counts a call, and refuses the one that is to be refused.
  const cross = (call) => {
    calls.push(call);
    if (refuseAt === calls.length) throw refusal;
  };
  const at = (ref) => {
    const found = ref === "trunk" ? commits.length - 1 : commits.findIndex((each) => each.commit === ref);
    if (found < 0) throw failure("NotFound", { what: ref });
    return found;
  };
  return {
    calls,
    host: {
      async repositoryInfo() {
        cross({ fn: "repositoryInfo" });
        return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        cross({ fn: "readSnapshot", ref });
        const { commit, tree: files } = commits[at(ref)];
        return { repository: ON_GITHUB, ref, commit, paths: [...files.keys()].sort(),
          async read(path) {
            cross({ fn: "read", path, ref });
            return files.has(path) ? files.get(path) : null;
          },
          blob: (path) => (files.has(path) ? blobOf(files.get(path)) : null) };
      },
      async readHistory(path, { ref = "trunk", limit } = {}) {
        cross({ fn: "readHistory", path, ref, limit });
        const touched = (entry) => path === null || entry.changes.some((change) => change.path === path || change.from === path);
        const touching = commits.slice(0, at(ref) + 1).map((each) => each.entry).filter(touched).reverse();
        return limit === undefined ? touching : touching.slice(0, limit);
      },
    },
  };
}

// The names of the records of an identifier, in the order they were committed.
const recordNames = (id) => HISTORY.flatMap((step) => Object.keys(step.write ?? {}))
  .filter((path) => path.startsWith(`docs/approvals/${id}-`));

// ---------------------------------------------------------------- the last accepted text

// guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; STATUS IS DERIVED FROM THE RECORDS; UC-008
// given: the history above, in which UC-010 and UC-011 each have two records — the first for the text written first, the second
//        for the next one — and have been edited since; the older record of UC-010 stands after the newer in the folder, the
//        older of UC-011 before it; UC-010's older record was committed at 10:00 in +02:00, its newer at 09:00 UTC
// input: lastAcceptedText("UC-010", host), and lastAcceptedText("UC-011", host)
// expect: for each the text the newer record names — V2 and W2, not the text the file has now — with the blob that record
//         names and the path the file had: { text, blob, path }
test("lastAcceptedText — of two records of one use case, the newer one's text", async () => {
  const [older10, newer10] = recordNames("UC-010"), [older11, newer11] = recordNames("UC-011");
  assert.ok(older10 > newer10 && older11 < newer11, "fixture: the older record is neither always first nor always last by name");

  const sent = await lastAcceptedText("UC-010", fakeHost().host);
  const received = await lastAcceptedText("UC-011", fakeHost().host);

  assert.deepEqual(sent, { text: V2, blob: blobOf(V2), path: UC10 });
  assert.deepEqual(received, { text: W2, blob: blobOf(W2), path: UC11 });
});

// guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; UC-008
// given: the history above, in which UC-020 was accepted at one path and has since been renamed to another and edited, so that
//        the head holds it only at the new path, with another text
// input: lastAcceptedText("UC-020", host)
// expect: the text that was accepted — X1, not the one the renamed file holds now — with its blob and the path it had then
test("lastAcceptedText — a file renamed after its record is still found, with the text that was accepted", async () => {
  const fake = fakeHost();
  const head = await fake.host.readSnapshot("trunk");
  assert.equal(head.blob(UC20_THEN), null, "fixture: the old path is gone");
  assert.equal(await head.read(UC20_NOW), X2, "fixture: the file holds another text under the new name");

  const found = await lastAcceptedText("UC-020", fake.host);

  assert.deepEqual(found, { text: X1, blob: blobOf(X1), path: UC20_THEN });
});

// guards: STATUS IS DERIVED FROM THE RECORDS; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; UC-008
// given: the history above, in which UC-030 has a file and no record, MOD-sample has a file and no record while the record of
//        MOD-sample-extra, whose identifier begins with it, and that of UC-031 are there; and, as the known positive, UC-031
// input: lastAcceptedText for UC-030, for MOD-sample and for an identifier no file has, UC-099; and for UC-031
// expect: null for the first three; for UC-031 its text, so that the null is not the fixture's
test("lastAcceptedText — an identifier no record names gives null", async () => {
  assert.deepEqual(await lastAcceptedText("UC-031", fakeHost().host), { text: Z1, blob: blobOf(Z1), path: UC31 },
    "known positive: the record of another identifier is found");

  for (const id of ["UC-030", "MOD-sample", "UC-099"]) assert.equal(await lastAcceptedText(id, fakeHost().host), null, id);
  assert.deepEqual(await lastAcceptedText("MOD-sample-extra", fakeHost().host), { text: E1, blob: blobOf(E1), path: MOD_EXTRA });
});

// guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; UC-008
// given: the history above and UC-010 asked for; the host answers the nth of its calls — however many a successful answer
//        makes — with TokenRefused, for each n in turn
// input: lastAcceptedText("UC-010", host)
// expect: it rejects with that TokenRefused, the same name and the same fields, wherever it was refused
test("lastAcceptedText — TokenRefused is passed on, wherever the host refuses", async () => {
  const refusal = failure("TokenRefused", { tokenName: "Agent M · alice/product",
    renewal: "https://github.com/settings/personal-access-tokens" });
  const done = fakeHost();
  await lastAcceptedText("UC-010", done.host);
  const calls = done.calls.length;
  assert.ok(calls >= 4, `known positive: an answer takes ${calls} calls`);

  for (let n = 1; n <= calls; n++) {
    const fake = fakeHost({ refuseAt: n, refusal });

    await assert.rejects(lastAcceptedText("UC-010", fake.host), (error) => {
      assert.equal(error, refusal, `call ${n} of ${calls}: ${JSON.stringify(done.calls[n - 1])}`);
      return true;
    });
  }
});

// guards: AN APPROVAL NAMES THE EXACT TEXT; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; UC-008
// given: the history above, in which UC-040 was edited after a person saw it and accepted afterwards through GitHub's web
//        interface: the record names the text seen, Y1, and the file held Y2 when the record was added
// input: lastAcceptedText("UC-040", host)
// expect: it rejects with NotFound, naming the file — no text other than the one the record names is given
test("lastAcceptedText — a record whose text its file did not hold when it was added is not answered with another text", async () => {
  const fake = fakeHost();
  assert.equal((await (await fake.host.readSnapshot("trunk")).read(UC40)), Y2, "fixture: the file holds the text edited since");

  await assert.rejects(lastAcceptedText("UC-040", fake.host), (error) => {
    assert.equal(error.name, "NotFound");
    assert.ok(error.message.includes(UC40) || String(error.what).includes(UC40), `it names the file: ${error.message}`);
    return true;
  });
});

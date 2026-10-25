// The approval gates for reviewed files and records — MOD-approvals' statuses, statusOf and acceptShown, and MOD-spec-changes'
// queues and acceptEntries, on the gates fixture. Deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-approvals
// Guards: A GENERATED ARTIFACT IS A PROPOSAL; A RECORD IS EVIDENCE, NOT A PROPOSAL; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
// Level: unit
//
// The product is tests/fixtures/gates/: a use case, an architecture decision, a module and a queue of two SPEC entries, all
// written straight to the branch without a record, a job record, and the link and register entry of the source its
// requirements name. It is held by tests/memory-host.mjs. What this file adds to the status checks of the modules
// (tests/approvals-status.test.mjs, tests/approvals-status-of.test.mjs, tests/spec-changes-queues.test.mjs): the round trip from
// the acceptance commits (acceptShown for the reviewed files, acceptEntries for a SPEC entry) to the status then derived from
// the tree — a file counts as accepted because the record written names its text, and only that text — and how a record that
// is no reviewed file is treated.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { statuses, statusOf, acceptShown, approvalSchema } from "../../src/approvals/index.mjs";
import { queues, acceptEntries } from "../../src/spec-changes/index.mjs";
import { sectionText } from "../../src/spec-document/index.mjs";
import { blobSha } from "../../src/text-tools/index.mjs";
import { readDocument } from "../../src/documents/index.mjs";
import { sourceSchemas } from "../../src/source-register/index.mjs";
import { memoryHost } from "../memory-host.mjs";

const FIX = fileURLToPath(new URL("../fixtures/gates/", import.meta.url));
function fixture() {
  const files = {};
  (function walk(dir) {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) walk(p); else files[relative(FIX, p).split("\\").join("/")] = readFileSync(p, "utf8");
    }
  })(FIX);
  return files;
}

const QD = "docs/spec-freigaben/2026-10-01a_gates";
const UC = "docs/use-cases/UC-001-read-a-report.md", ARC = "docs/architecture/ARC-001-static-site.md";
const MOD = "docs/architecture/MOD-reader.md", JOB = "docs/jobs/JOB-20261001-0900-a1b2.md";
const REVIEWED = [UC, ARC, MOD];
const WHEN = new Date("2026-10-01T12:00:00Z");
const ANCHORS = { 1: "## 2. More", 2: "## 3. Last" };

// What the pages derive from the head of a host: the status of every reviewed file (MOD-approvals' statuses, from the names of
// the records) and the state of every SPEC entry of the queue (MOD-spec-changes' queues).
async function derived(host) {
  const snapshot = await host.readSnapshot("main");
  const all = statuses(snapshot), out = {};
  for (const path of REVIEWED) out[path] = all.get(path)?.status;
  const queue = (await queues(snapshot)).find((each) => each.folder === QD);
  for (const entry of queue.entries) out[`entry ${entry.number}`] = entry.state;
  return out;
}

// The files a reviewer was shown, each by the blob SHA of the text shown, accepted on the host's head by `alice`.
const shownOf = async (files, paths) => Promise.all(paths.map(async (path) => ({ path, blob: await blobSha(files[path]) })));
// A SPEC entry as the page shows it: its proposal, and the section beside it, each by its blob SHA.
async function entryShown(files, nr) {
  const proposal = `${QD}/0${nr}-${nr === 1 ? "more" : "last"}.md`;
  return { queue: QD, entry: nr, proposalBlob: await blobSha(files[proposal]), sectionBlob: await blobSha(sectionText(files["SPEC.md"], ANCHORS[nr])) };
}
const sources = (files) => ({ links: readDocument(sourceSchemas().links, "docs/sources.md", files["docs/sources.md"]),
  register: [readDocument(sourceSchemas().entry, "docs/sources/SRC-po.md", files["docs/sources/SRC-po.md"])] });
const recordsOf = (files) => Object.keys(files).filter((p) => p.startsWith("docs/approvals/") && !p.endsWith("README.md")).sort();

// ---------------------------------------------------------------- reviewed files and SPEC entries on the default branch

// A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN · A GENERATED ARTIFACT IS A PROPOSAL. Expected: written straight to the
// branch with no record, the use case, the decision, the module and both SPEC entries are open; after the acceptance commits of
// the use case, the decision and the module, and of entry 01, those four are accepted (entry 01: in SPEC) and entry 02, which
// nobody accepted, is still open; an edit committed straight to the branch afterwards makes the use case no longer accepted — no
// status was stored that would have to be reset — while the untouched module stays accepted.
test("A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN — every kind is open until an acceptance commit names its text, and an edit committed afterwards is not accepted", async () => {
  const t0 = fixture(), product = memoryHost(t0);
  assert.deepEqual(await derived(product.host), { [UC]: "open", [ARC]: "open", [MOD]: "open", "entry 1": "open", "entry 2": "open" });

  const accepted = await acceptShown(product.host, await shownOf(t0, REVIEWED), "alice");
  assert.deepEqual(accepted.leftOut, []);
  assert.ok((await acceptEntries(product.host, [await entryShown(t0, 1)], "alice", WHEN, sources(t0))).commit);
  assert.deepEqual(await derived(product.host), { [UC]: "accepted", [ARC]: "accepted", [MOD]: "accepted", "entry 1": "in SPEC", "entry 2": "open" });
  // Each record the commits hold names the path and the blob of the text the reviewer was shown — and nothing else is a record.
  const t1 = product.files(), records = recordsOf(t1);
  assert.equal(records.length, 4);
  for (const path of REVIEWED) {
    const fields = records.map((p) => readDocument(approvalSchema, p, t1[p]).fields).find((x) => x.file === path);
    assert.equal(fields?.blob, await blobSha(t0[path]), `${path}: its record names the text shown`);
  }

  // An edit committed straight to the branch.
  const edited = t1[UC].replace("The reader opens the report.", "The reader opens the report, GENERATED-EDIT.");
  const head = (await product.host.readSnapshot("main")).commit;
  await product.host.commitFiles({ branch: "main", expectedHead: head, files: [{ path: UC, text: edited }], message: "edit" });
  const s2 = await derived(product.host);
  assert.equal(s2[UC], "changed", "edited after acceptance: not accepted, and nobody reset a status");
  assert.equal(s2[MOD], "accepted", "the module's text did not change");
  // Accepted anew, the edited text is accepted by a second record; the first stays as it was.
  await acceptShown(product.host, [{ path: UC, blob: await blobSha(edited) }], "alice");
  assert.equal((await derived(product.host))[UC], "accepted");
  assert.equal(Object.keys(product.files()).filter((p) => p.startsWith("docs/approvals/UC-001-")).length, 2);
});

// A GENERATED ARTIFACT IS A PROPOSAL — what accepts a file is a record naming its current text, not one naming another text of
// it, another file's text, or a text the reviewer was not shown. Expected: a record naming the text before a generated edit,
// one naming another file with the same blob, and an acceptance whose shown text is not the branch's text each leave the file
// open; the acceptance of such a text writes no record.
test("A GENERATED ARTIFACT IS A PROPOSAL — a file is accepted by a record naming its current text, never by one naming another text or another file", async () => {
  const t0 = fixture(), product = memoryHost(t0);
  // The record for the module as it was shown, then the module rewritten by a participant straight on the branch.
  await acceptShown(product.host, await shownOf(t0, [MOD]), "alice");
  const t1 = product.files();
  const rewritten = t1[MOD].replace("Reads the reports.", "Reads the reports and DRAFTED-BY-A-PARTICIPANT.");
  const t2 = memoryHost({ ...t1, [MOD]: rewritten });
  assert.equal((await derived(t2.host))[MOD], "changed");
  // Another file whose text is byte for byte the accepted one: that record is not its record.
  const copy = "docs/architecture/MOD-reader-copy.md";
  const t3 = await memoryHost({ ...t1, [copy]: t1[MOD] }).host.readSnapshot("main");
  assert.equal(statusOf(copy, t3.blob(copy), t3), "open");
  // An acceptance of the text shown before the participant's rewrite, written on the rewritten branch: no record.
  const shownBefore = await shownOf(t0, [ARC]);
  const t4 = memoryHost({ ...t0, [ARC]: t0[ARC].replace("A static site.", "A static site, DRAFTED-BY-A-PARTICIPANT.") });
  await assert.rejects(acceptShown(t4.host, shownBefore, "alice"), (e) => e.name === "NothingToAccept"
    && e.leftOut.length === 1 && e.leftOut[0].path === ARC && e.leftOut[0].reason === "changed since shown");
  assert.deepEqual(t4.commits(), [], "nothing is written");
  assert.equal((await derived(t4.host))[ARC], "open");
});

// ---------------------------------------------------------------- records are evidence

// A RECORD IS EVIDENCE, NOT A PROPOSAL (SPEC check: "a job record without approval is not listed as open; counter-proof: a use
// case without approval is"). Expected: the use case without a record is listed as open; the job record without one is not
// listed at all, and asked for its status it is no reviewed file (NotReviewed).
test("A RECORD IS EVIDENCE, NOT A PROPOSAL — a job record without approval is not listed as open; counter-proof: a use case without approval is", async () => {
  const snapshot = await memoryHost(fixture()).host.readSnapshot("main");
  const listed = statuses(snapshot);
  assert.equal(listed.get(UC)?.status, "open", "counter-proof: the use case is open");
  assert.equal(listed.has(JOB), false, "the job record is not listed");
  assert.throws(() => statusOf(JOB, snapshot.blob(JOB), snapshot), (e) => e.name === "NotReviewed", "the job record is no proposal");
});

// A RECORD IS EVIDENCE, NOT A PROPOSAL — an acceptance commit holds no approval record for a record. Expected: an acceptance that
// names a job record, a gate record below it or an approval record itself writes nothing; a use case gets its record
// (counter-proof).
test("A RECORD IS EVIDENCE, NOT A PROPOSAL — an acceptance that names a job, gate or approval record writes no approval record", async () => {
  const t0 = { ...fixture(), "docs/jobs/JOB-20261001-0900-a1b2/gates/G-1.md": "# G-1\n", "docs/approvals/UC-001-0123456789ab.md": "kind: use-case\n" };
  for (const path of [JOB, "docs/jobs/JOB-20261001-0900-a1b2/gates/G-1.md", "docs/approvals/UC-001-0123456789ab.md"]) {
    const product = memoryHost(t0);
    await assert.rejects(acceptShown(product.host, await shownOf(t0, [path]), "alice"), TypeError, path);
    assert.deepEqual(product.commits(), [], `${path}: nothing is written`);
  }
  const product = memoryHost(t0);
  assert.deepEqual((await acceptShown(product.host, await shownOf(t0, [UC]), "alice")).recorded, [UC], "counter-proof: the use case gets its record");
});

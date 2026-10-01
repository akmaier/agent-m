// Status from the names in the tree, and file texts kept by blob SHA — review-core.mjs statusByNames, specStatusByNames,
// readByBlob; settings-store.mjs createFileTexts. Deterministic, no network.
//
// SPEC §10 STATUS IS DERIVED FROM THE RECORDS: a record is named approvalPath(id, blob), so the tree's names say whether a
// record exists for a file's current blob. Checked here: the status from the names equals the status from reading every
// record, on a fixture with renamed files, several records, a record named by no known form, and SPEC entries in every state.
// AN APPROVAL NAMES THE EXACT TEXT: where the record is read, its content decides — a name its content contradicts counts
// for nothing.

import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../docs/assets/review-core.mjs";
import * as artifacts from "../docs/assets/artifacts.mjs";
import * as settings from "../docs/assets/settings-store.mjs";
import { fakeCaches } from "./app-harness.mjs";

const { gitBlobSha, recordText, useCaseRecord, reviewedRecord, specRecord, approvalPath, parseRecord, deriveReviewedStatus,
  deriveSpecStatus } = core;

// records: { path: text } -> the reader statusByNames is given, counting what it reads.
function reader(records) {
  const read = [];
  const f = async (paths) => paths.map((p) => { read.push(p); return { ...parseRecord(records[p]), _path: p }; });
  return { f, read };
}
const allRecords = (records) => Object.entries(records).map(([p, t]) => ({ ...parseRecord(t), _path: p }));

const T = (s) => `---\nid: x\n---\n${s}\n`;
const UC1 = "docs/use-cases/UC-001-a.md", UC2 = "docs/use-cases/UC-002-b.md", UC3 = "docs/use-cases/UC-003-c.md";
const UC10_OLD = "docs/use-cases/UC-010-run-a-stage.md", UC10 = "docs/use-cases/UC-010-run-a-job.md";
const UC11 = "docs/use-cases/UC-011-renamed-and-accepted.md", UC11_OLD = "docs/use-cases/UC-011-old-name.md";
const ARC = "docs/architecture/ARC-001-x.md", MOD = "docs/architecture/MOD-reader.md", MODX = "docs/architecture/MOD-reader-extra.md";

// The fixture: every file with its current text, and the records written for texts accepted now or earlier.
async function fixture({ unknown = false } = {}) {
  const text = { [UC1]: T("one"), [UC2]: T("two, edited"), [UC3]: T("three"), [UC10]: T("ten, renamed and edited"),
    [UC11]: T("eleven, renamed, then accepted anew"), [ARC]: T("arc"), [MOD]: T("mod"), [MODX]: T("mod extra") };
  const records = {};
  const rec = async (id, path, t) => { const b = await gitBlobSha(t); records[approvalPath(id, b)] = recordText(path.includes("/use-cases/") ? useCaseRecord(path, b) : reviewedRecord(path, b)); };
  await rec("UC-001", UC1, text[UC1]);                          // accepted
  await rec("UC-002", UC2, T("two"));                           // changed
  await rec("UC-010", UC10_OLD, T("ten, first"));               // renamed since: by path, open
  await rec("UC-010", UC10_OLD, T("ten, second"));
  await rec("UC-011", UC11_OLD, T("eleven, before the rename"));  // renamed, and accepted again under the new name
  await rec("UC-011", UC11, text[UC11]);
  await rec("ARC-001", ARC, T("arc, earlier"));                 // changed
  await rec("MOD-reader-extra", MODX, text[MODX]);              // accepted — and no record of MOD-reader
  if (unknown) {
    // Committed by hand under a name of no known form: it accepts UC-003.
    records["docs/approvals/accepted-by-hand.md"] = recordText(useCaseRecord(UC3, await gitBlobSha(text[UC3])));
  }
  const blobs = Object.fromEntries(await Promise.all(Object.entries(text).map(async ([p, t]) => [p, await gitBlobSha(t)])));
  const index = core.recordIndex(["docs/approvals/README.md", ...Object.keys(records), ...Object.keys(text)]);
  return { text, records, blobs, index };
}

test("recordIndex: the records named in a tree, by identifier and by SPEC entry; any other name is unknown", () => {
  const i = core.recordIndex(["docs/approvals/README.md", "docs/approvals/UC-001-0123456789ab.md", "docs/approvals/MOD-review-core-aaaaaaaaaaaa.md",
    "docs/approvals/ARC-014-bbbbbbbbbbbb.md", "docs/approvals/spec-2026-09-24_ein-klick-02-c3dd97578fd5.md", "docs/approvals/spec-2026-09-30-01-dddddddddddd.md",
    "docs/approvals/by-hand.md", "docs/approvals/UC-001-short.md", "docs/use-cases/UC-001-x.md", "docs/approvals/sub/UC-002-0123456789ab.md"]);
  assert.deepEqual([...i.byId.keys()], ["UC-001", "MOD-review-core", "ARC-014"]);
  assert.deepEqual(i.byId.get("UC-001"), [{ path: "docs/approvals/UC-001-0123456789ab.md", hex: "0123456789ab" }]);
  assert.deepEqual([...i.spec.keys()], ["2026-09-24_ein-klick#2", "2026-09-30#1"]);
  assert.deepEqual(i.unknown, ["docs/approvals/by-hand.md", "docs/approvals/UC-001-short.md"]);
});

test("STATUS IS DERIVED FROM THE RECORDS — from the names, equal to reading every record, reading only where names cannot decide", async () => {
  for (const unknown of [false, true]) {
    const fx = await fixture({ unknown });
    const every = allRecords(fx.records);
    for (const path of Object.keys(fx.text)) {
      const r = reader(fx.records);
      const byNames = await core.statusByNames({ index: fx.index, path, blob: fx.blobs[path], read: r.f });
      const truth = deriveReviewedStatus(path, fx.blobs[path], every);
      assert.equal(byNames.status, truth, `${path}${unknown ? " (with a record of unknown name)" : ""}`);
      const verified = await core.statusByNames({ index: fx.index, path, blob: fx.blobs[path], read: reader(fx.records).f, verify: true });
      assert.equal(verified.status, truth, `${path}, verified`);
      if (truth === "accepted") assert.equal(fx.records[byNames.record] !== undefined, true, `${path}: the record accepting it is named`);
      if (!unknown) {
        // An accepted file's name, or no name at all, decides without reading; otherwise only the records of its identifier are read.
        const id = artifacts.reviewedId(path);
        if (byNames.byName) assert.deepEqual(r.read, [], path);
        else assert.ok(r.read.every((p) => p.startsWith(`docs/approvals/${id}-`)), `${path}: ${r.read}`);
      }
    }
    const statuses = Object.fromEntries(await Promise.all(Object.keys(fx.text).map(async (p) =>
      [p, (await core.statusByNames({ index: fx.index, path: p, blob: fx.blobs[p], read: reader(fx.records).f })).status])));
    assert.deepEqual(statuses, { [UC1]: "accepted", [UC2]: "changed", [UC3]: unknown ? "accepted" : "open", [UC10]: "open",
      [UC11]: "accepted", [ARC]: "changed", [MOD]: "open", [MODX]: "accepted" });
  }
});

test("counter-proof: a record named for the current blob whose content names another blob does not accept the file where it is read", async () => {
  const fx = await fixture();
  const name = approvalPath("UC-003", fx.blobs[UC3]);
  const records = { ...fx.records, [name]: recordText(useCaseRecord(UC3, "e".repeat(40))) };
  const index = core.recordIndex(Object.keys(records));
  // The name claims it — this is what a list shows without reading.
  assert.equal((await core.statusByNames({ index, path: UC3, blob: fx.blobs[UC3], read: reader(records).f })).status, "accepted");
  // Read, the content decides: it names another text.
  const r = reader(records);
  const v = await core.statusByNames({ index, path: UC3, blob: fx.blobs[UC3], read: r.f, verify: true });
  assert.notEqual(v.status, "accepted");
  assert.equal(v.record, null);
  assert.deepEqual(r.read, [name]);
  // Also when the content names another file: the record of a renamed file with the same text is not this file's record.
  const other = { ...fx.records, [name]: recordText(useCaseRecord("docs/use-cases/UC-003-old-name.md", fx.blobs[UC3])) };
  assert.equal((await core.statusByNames({ index: core.recordIndex(Object.keys(other)), path: UC3, blob: fx.blobs[UC3],
    read: reader(other).f, verify: true })).status, "open");
});

test("STATUS IS DERIVED FROM THE RECORDS — SPEC entries: decided ones read no record, undecided ones only their own", async () => {
  const Q = "docs/spec-freigaben/2026-09-24_q", SPEC = "# S\n\n## 1. A\n\nold\n## 2. B\n\nold b\n";
  const prop = (n) => `## ${n}\n\nnew ${n}\n`;
  const pBlob = async (n) => gitBlobSha(prop(n));
  const sec = async (t) => gitBlobSha(t);
  const records = {};
  const rec = async (nr, n, section) => {
    const blob = await pBlob(n);
    records[approvalPath(`spec-2026-09-24_q-${String(nr).padStart(2, "0")}`, blob)] = recordText(specRecord({ queue: Q, entry: nr,
      proposal: `${Q}/0${nr}-x.md`, blob, target: "SPEC.md", anchor: `## ${n}`, section }));
  };
  const secA = await sec("## 1. A\n\nold\n"), secB = await sec("## 2. B\n\nold b\n");
  await rec(1, "1. A", secA);                         // approved: proposal and section as recorded
  await rec(2, "2. B", "f".repeat(40));               // stale: the section changed since
  records[approvalPath("spec-2026-09-23_other-03", "a".repeat(40))] = recordText(specRecord({ queue: "docs/spec-freigaben/2026-09-23_other",
    entry: 3, proposal: "docs/spec-freigaben/2026-09-23_other/03-x.md", blob: "a".repeat(40), target: "SPEC.md", anchor: "## 3", section: "b".repeat(40) }));
  const index = core.recordIndex(Object.keys(records)), every = allRecords(records);
  const decided = new Map([[4, { decision: "uebernommen" }]]);
  const entries = [
    { nr: 1, anchor: "## 1. A", proposalText: prop("1. A"), proposalBlob: await pBlob("1. A"), sectionBlob: secA },
    { nr: 2, anchor: "## 2. B", proposalText: prop("2. B"), proposalBlob: await pBlob("2. B"), sectionBlob: secB },
    { nr: 3, anchor: "## 2. B", proposalText: prop("2. B"), proposalBlob: await pBlob("2. B"), sectionBlob: secB },
    { nr: 4, anchor: "## 1. A", proposalText: "## 1. A\n\nold\n", proposalBlob: "c".repeat(40), sectionBlob: secA },
  ];
  const want = { 1: "approved", 2: "stale", 3: "open", 4: "applied" };
  for (const en of entries) {
    const entry = { queue: Q, bis: null, proposalPath: `${Q}/0${en.nr}-x.md`, specText: SPEC, decisions: decided, ...en };
    const r = reader(records);
    const s = await core.specStatusByNames({ index, entry, read: r.f });
    assert.equal(s, deriveSpecStatus({ ...entry, records: every }), `entry ${en.nr}`);
    assert.equal(s, want[en.nr], `entry ${en.nr}`);
    assert.ok(r.read.every((p) => p.includes(`-2026-09-24_q-0${en.nr}-`)), `entry ${en.nr} reads only its own records: ${r.read}`);
    if (en.nr >= 3) assert.deepEqual(r.read, [], `entry ${en.nr}: no record named for it, or decided`);
  }
});

// ---------------------------------------------------------------- file texts by blob SHA

function memoryCache(init = {}) {
  const m = new Map(Object.entries(init)), log = [];
  return { m, log, get: async (k) => { log.push(`get ${k}`); return m.get(k) ?? null; }, put: async (k, t) => { log.push(`put ${k}`); m.set(k, t); } };
}

test("readByBlob: a kept text that hashes to the SHA is used without reading; a text read is kept by its SHA", async () => {
  const text = "# UC-001\n\nä ✓\n", sha = await gitBlobSha(text);
  let reads = 0;
  const read = async () => { reads += 1; return text; };
  const c = memoryCache();
  assert.equal(await core.readByBlob({ sha, read, cache: c, key: `github.com/a/b/${sha}` }), text);
  assert.equal(reads, 1);
  assert.equal(c.m.get(`github.com/a/b/${sha}`), text);
  assert.equal(await core.readByBlob({ sha, read, cache: c, key: `github.com/a/b/${sha}` }), text);
  assert.equal(reads, 1, "the second time from the kept text");
});

test("counter-proof: a kept text whose SHA does not match is read again and replaced; a text that does not match its SHA is not kept", async () => {
  const text = "right\n", sha = await gitBlobSha(text);
  let reads = 0;
  const c = memoryCache({ k: "forged\n" });
  assert.equal(await core.readByBlob({ sha, read: async () => { reads += 1; return text; }, cache: c, key: "k" }), text);
  assert.equal(reads, 1);
  assert.equal(c.m.get("k"), text, "replaced by the text read");
  const d = memoryCache();
  assert.equal(await core.readByBlob({ sha, read: async () => "not the blob\n", cache: d, key: "k" }), "not the blob\n",
    "passed on as read — the view says the SHA differs");
  assert.equal(d.m.size, 0, "not kept");
  // A name that is no blob SHA is not looked up.
  const e = memoryCache();
  await core.readByBlob({ sha: "HEAD", read: async () => text, cache: e, key: "k" });
  assert.deepEqual(e.log, []);
});

test("readByBlob: a cache that fails at every step is passed over — the text is read", async () => {
  const text = "x\n", sha = await gitBlobSha(text);
  const broken = { get: async () => { throw new Error("SecurityError"); }, put: async () => { throw new Error("QuotaExceededError"); } };
  assert.equal(await core.readByBlob({ sha, read: async () => text, cache: broken, key: "k" }), text);
  assert.equal(await core.readByBlob({ sha, read: async () => text }), text, "and without any cache");
});

test("readBlob keeps the accepted text of a record by its blob SHA", async () => {
  const text = "---\nid: UC-001\n---\naccepted\n", sha = await gitBlobSha(text), c = memoryCache();
  const calls = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (u) => { calls.push(String(u)); return new Response(JSON.stringify({ encoding: "base64", content: Buffer.from(text).toString("base64") })); };
  try {
    assert.equal(await core.readBlob({ repo: "a/b", blob: sha, cache: c, cacheKey: `github.com/a/b/${sha}` }), text);
    assert.equal(await core.readBlob({ repo: "a/b", blob: sha, cache: c, cacheKey: `github.com/a/b/${sha}` }), text);
  } finally { globalThis.fetch = real; }
  assert.equal(calls.length, 1);
});

test("the file texts live in Cache Storage under their key; a clear removes them; without Cache Storage nothing is kept", async () => {
  const caches = fakeCaches(), kept = settings.createFileTexts(caches);
  await kept.put("github.com/a/b/" + "a".repeat(40), "text ä\n");
  assert.equal(await kept.get("github.com/a/b/" + "a".repeat(40)), "text ä\n");
  assert.deepEqual([...caches.stores.keys()], [settings.FILE_TEXTS]);
  assert.ok(!settings.FILE_TEXTS.startsWith(settings.PREFIX), "not a localStorage key of the settings");
  assert.equal(await kept.clear(), true);
  assert.equal(caches.stores.size, 0, "A CLEAR IS A REAL CLEAR");
  assert.equal(await kept.get("github.com/a/b/" + "a".repeat(40)), null);
  // Counter-proof: a Cache Storage that keeps its store after delete is reported.
  const stuck = { ...fakeCaches(), delete: async () => false, has: async () => true };
  assert.equal(await settings.createFileTexts(stuck).clear(), false);
  // No Cache Storage, or one that refuses: nothing kept, nothing thrown.
  const none = settings.createFileTexts(null);
  await none.put("k", "x");
  assert.equal(await none.get("k"), null);
  assert.equal(await none.clear(), true);
  const refusing = { open: async () => { throw new Error("SecurityError"); }, delete: async () => { throw new Error("SecurityError"); },
    has: async () => { throw new Error("SecurityError"); } };
  const r = settings.createFileTexts(refusing);
  await r.put("k", "x");
  assert.equal(await r.get("k"), null);
  assert.equal(await r.clear(), true);
});

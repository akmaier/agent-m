// The instance workflow's route — MOD-spec-changes' applyApproved (ITM-691): what the instance's apply workflow writes for every `kind: spec` record committed
// without the dashboard. Deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for A STALE APPROVAL IS NOT APPLIED: node --test tests/*.test.mjs
//
// Module: MOD-spec-changes
// Guards: A STALE APPROVAL IS NOT APPLIED; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; UC-006
// Level: unit
//
// The product is tests/fixtures/gates/ (a queue of two SPEC entries, 01 and 02, against SPEC.md), held in memory as a Snapshot; its docs/sources.md and docs/sources/SRC-po.md
// are the link and the register entry a product needs for the source "PO" its requirements name. A record's `section` is the blob of the section's exact bytes (MOD-spec-document's sectionText), and so
// is the section the dashboard's acceptance (MOD-spec-changes' acceptEntries, on tests/memory-host.mjs) was shown. The report is one line per record: "<record>: applied" or "<record>: refused — <applyApproved's reason>".
// The comparison with the old Python tool, which is gone, is no longer made; tests/test_apply_approvals.py holds the cases on throwaway repositories.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { acceptEntries, applyApproved } from "../../src/spec-changes/index.mjs";
import { sectionText } from "../../src/spec-document/index.mjs";
import { blobSha } from "../../src/text-tools/index.mjs";
import { readDocument } from "../../src/documents/index.mjs";
import { sourceSchemas } from "../../src/source-register/index.mjs";
import { memoryHost } from "../memory-host.mjs";

const FIX = fileURLToPath(new URL("../fixtures/gates/", import.meta.url));
const Q = "docs/spec-freigaben/2026-10-01a_gates", QNAME = "2026-10-01a_gates";
const ENTRIES = { 1: ["01-more.md", "## 2. More"], 2: ["02-last.md", "## 3. Last"] };
const WHEN = new Date("2026-10-01T12:00:00Z");

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

// The approval record a person commits on GitHub's page for entry `nr`, naming the texts shown -> its path.
async function record(tree, nr, over = {}) {
  const [file, anchor] = ENTRIES[nr];
  const r = { kind: "spec", queue: Q, entry: `0${nr}`, proposal: `${Q}/${file}`, blob: await blobSha(tree[`${Q}/${file}`]),
    target: "SPEC.md", anchor, section: await blobSha(sectionText(tree["SPEC.md"], anchor) ?? ""), ...over };
  const path = `docs/approvals/spec-${QNAME}-${r.entry}-${String(r.blob).slice(0, 12)}.md`;
  // As a person writes it on GitHub's page: one `key: value` line each, also where a key is wrong or empty.
  tree[path] = Object.entries(r).map(([key, value]) => `${key}: ${value}\n`).join("");
  return path;
}

// The fixture's link and register entry, as MOD-documents reads them: what acceptEntries is given.
const sources = (tree) => ({ links: readDocument(sourceSchemas().links, "docs/sources.md", tree["docs/sources.md"]),
  register: [readDocument(sourceSchemas().entry, "docs/sources/SRC-po.md", tree["docs/sources/SRC-po.md"])] });

// applyApproved on the in-memory tree -> { files: [{ path, content }], report, refused }.
const apply = async (tree) => {
  const all = tree;
  const blobOf = (p) => (p in all ? createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${Buffer.byteLength(all[p])}\0`), Buffer.from(all[p])])).digest("hex") : null);
  const out = await applyApproved({ commit: "0".repeat(40), paths: Object.keys(all), read: async (p) => all[p] ?? null, blob: blobOf }, WHEN);
  const name = (p) => p.split("/").pop();
  const report = [...out.applied.map((p) => `${name(p)}: applied`), ...out.refused.map((r) => `${name(r.record)}: refused — ${r.reason}`)].join("\n");
  return { files: Object.entries(out.files).map(([path, content]) => ({ path, content })), report, refused: out.refused.map((r) => ({ record: name(r.record), reason: r.reason })) };
};
const written = (out) => Object.fromEntries(out.files.map((f) => [f.path, f.content]));

test("A STALE APPROVAL IS NOT APPLIED — the engine's workflow route: a proposal or a SPEC section changed after approval writes nothing and is named", async () => {
  // Counter-proof first: the same record on the unchanged tree is applied.
  const ok = fixture();
  const rec = (await record(ok, 1)).split("/").pop();
  const applied = await apply(ok);
  assert.deepEqual(applied.refused, []);
  assert.deepEqual(applied.files.map((f) => f.path).sort(), ["SPEC.md", `${Q}/entscheidungen.md`]);
  assert.equal(applied.report, `${rec}: applied`);

  // Expected: the proposal changed after approval — no file, the record named with the reason.
  const p = fixture();
  await record(p, 1);
  p[`${Q}/01-more.md`] = p[`${Q}/01-more.md`].replace("reworded", "re-reworded");
  const byProposal = await apply(p);
  assert.deepEqual(byProposal.files, []);
  assert.deepEqual(byProposal.refused.map((r) => r.record), [rec]);
  assert.equal(byProposal.report, `${rec}: refused — the proposal changed after it was approved — open it again`);

  // Expected: the SPEC section changed after approval — no file, the record named with the reason.
  const s = fixture();
  await record(s, 1);
  s["SPEC.md"] = s["SPEC.md"].replace("Rule two holds", "Rule 2 holds");
  const bySection = await apply(s);
  assert.deepEqual(bySection.files, []);
  assert.equal(bySection.report, `${rec}: refused — the SPEC section changed after it was approved — open it again`);
  assert.deepEqual(bySection.refused, [{ record: rec, reason: "the SPEC section changed after it was approved — open it again" }]);
});

test("WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — the engine writes what the dashboard's acceptance commit writes, entry by entry in the queue's order", async () => {
  // The decisions file ends without a newline: both routes start the first row on a line of its own.
  for (const decisions of ["# Decisions — queue 2026-10-01a · gates\n\nAppend-only.\n\n", "# Decisions\n\nAppend-only."]) {
    const t = fixture();
    t[`${Q}/entscheidungen.md`] = decisions;
    // The dashboard's acceptance of both entries, shown in the other order, each beside the section that holds now.
    const shown = [];
    for (const nr of [2, 1]) {
      const [file, anchor] = ENTRIES[nr];
      shown.push({ queue: Q, entry: nr, proposalBlob: await blobSha(t[`${Q}/${file}`]), sectionBlob: await blobSha(sectionText(t["SPEC.md"], anchor)) });
    }
    const dashboard = memoryHost(t);
    assert.ok((await acceptEntries(dashboard.host, shown, "alice", WHEN, sources(t))).commit, "the dashboard's commit");
    // The person commits the two records on GitHub's page, naming the sections as the workflow takes them; the workflow runs on that commit.
    for (const nr of [1, 2]) await record(t, nr);
    const out = await apply(t);
    assert.deepEqual(out.refused, []);
    const byDashboard = dashboard.files();
    assert.deepEqual(written(out), { "SPEC.md": byDashboard["SPEC.md"], [`${Q}/entscheidungen.md`]: byDashboard[`${Q}/entscheidungen.md`] },
      JSON.stringify(decisions));
    assert.equal(out.report.split("\n").length, 2);
  }
});

test("WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — a second run writes nothing; a record the dashboard already applied is passed over", async () => {
  const t = fixture();
  await record(t, 1);
  await record(t, 2);
  const first = await apply(t);
  assert.equal(first.files.length, 2);
  const second = await apply({ ...t, ...written(first) });
  assert.deepEqual(second, { files: [], report: "", refused: [] });
});

test("A STALE APPROVAL IS NOT APPLIED — a malformed record is refused and named, and nothing of it is written", async () => {
  const cases = {
    "a missing key": [{ section: "" }, /refused — the record lacks section$/],
    "an entry that is no number": [{ entry: "one" }, /refused — the record's entry “one” is not a number$/],
    "a target that does not exist": [{ target: "NOSPEC.md" }, /refused — the record names the target NOSPEC\.md, not the entry's SPEC\.md$/],
    "a proposal outside its queue": [{ proposal: "SPEC.md" }, /refused — the record names the proposal SPEC\.md, not the entry's \S+$/],
    "an anchor that is not the queue's": [{ anchor: "## It's more" }, /refused — the record's anchor “## It's more” is not the queue's anchor “## 2\. More” for entry 01$/],
  };
  for (const [label, [over, reason]] of Object.entries(cases)) {
    const t = fixture();
    const rec = (await record(t, 1, over)).split("/").pop();
    const out = await apply(t);
    assert.deepEqual(out.files, [], label);
    assert.deepEqual(out.refused.map((r) => r.record), [rec], label);
    assert.match(out.report, reason, label);
  }
});

test("the records are read from the approvals folder: README.md, other kinds and files that are no Markdown are passed over", async () => {
  const t = fixture();
  t["docs/approvals/README.md"] = "# R\n\n```\nkind: spec\nqueue: docs/spec-freigaben/x\n```\n";
  t["docs/approvals/UC-001-aaaaaaaaaaaa.md"] = "kind: use-case\nfile: docs/use-cases/UC-001-x.md\nblob: " + "a".repeat(40) + "\n";
  t["docs/approvals/notes.txt"] = "kind: spec\n";
  assert.deepEqual(await apply(t), { files: [], report: "", refused: [] });
  // Counter-proof: a spec record beside them is found and applied.
  await record(t, 1);
  assert.equal((await apply(t)).files.length, 2);
  // And without an approvals folder there is nothing to apply.
  const none = fixture();
  delete none["docs/approvals/README.md"];
  assert.deepEqual(await apply(none), { files: [], report: "", refused: [] });
});

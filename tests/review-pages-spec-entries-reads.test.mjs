// ITM-478: the list of SPEC change entries (MOD-review-pages, route `spec-entry`) reads the SPEC once and builds no impact list.
// Run: node --test tests/review-pages-spec-entries-reads.test.mjs
//
// Module: MOD-review-pages
// Guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// Level: unit
//
// The product is a SPEC of two sections and a queue of three entries (05 replaces section 1 and creates "1a", 06 starts with "1a", 07 replaces
// section 2), beside 1,400 artifacts (use cases, tests) that name the requirements, as this repository holds. The snapshot counts every read.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const { queueService } = await import("../src/review-pages/spec-entries.mjs");

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const READING = text("## 1. Reading", "", "**A SAMPLE RULE** *(Fixture PO)*", "A reader reads a file whole.", "*Check:* `tests/sample.test.mjs`");
const READING_NEW = READING.replace("whole.", "whole, or says why not.");
const ADDED = text("## 1a. Added", "", "**AN ADDED RULE** *(Fixture PO)*", "A reader sees what was added.", "*Check:* no automatic check; at review");
const ADDED_NEW = ADDED.replace("what was added.", "what was added, and when.");
const WRITING = text("## 2. Writing", "", "**A WRITE RULE** *(Fixture PO)*", "A writer writes a file whole.", "*Check:* no automatic check; at review");
const WRITING_NEW = WRITING.replace("whole.", "entirely.");
const SPEC = text("# Fixture product — Specification", "") + READING + "\n" + WRITING;

const QUEUE = "docs/spec-freigaben/2026-03-01_sample";
const entries = [
  { nr: "05", anchor: "## 1. Reading", proposal: READING_NEW + "\n" + ADDED },
  { nr: "06", anchor: "## 1a. Added", proposal: ADDED_NEW },
  { nr: "07", anchor: "## 2. Writing", proposal: WRITING_NEW },
];
const files = {
  "SPEC.md": SPEC,
  [`${QUEUE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · sample", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
    "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
    ...entries.map((item) => `| ${item.nr} | \`SPEC.md\` | ${item.anchor} | — | — |`)),
  [`${QUEUE}/entscheidungen.md`]: text("# Decisions — queue 2026-03-01 sample", "", "Append-only."),
};
for (const item of entries) {
  files[`${QUEUE}/${item.nr}-entry.md`] = item.proposal;
  files[`${QUEUE}/${item.nr}-entry.begruendung.md`] = text(`# ${item.anchor}: a change`, "", "**The change.** A sample change.");
}
for (let n = 0; n < 1400; n += 1) {
  const id = String(n).padStart(4, "0");
  if (n % 2 === 0) {
    files[`docs/use-cases/UC-${id}-x.md`] = text("---", `id: UC-${id}`, "title: X", "area: files", "actors:", "  - Reader", "realises:", "  - A SAMPLE RULE", "---", "# X", "", "**Goal.** X.");
  } else {
    files[`tests/sample-${id}.test.mjs`] = text("// Guards: A SAMPLE RULE; A WRITE RULE", "// Level: unit");
  }
}

function countingSnapshot() {
  const reads = [];
  return {
    reads,
    snapshot: { repository: { server: "github", path: "alice/thesis-tool" }, ref: "main", commit: "c".repeat(40), paths: Object.keys(files).sort(),
      read: async (path) => { reads.push(path); return path in files ? files[path] : null; },
      blob: (path) => (path in files ? blobOf(files[path]) : null) },
  };
}

// TST-478101
// level: unit
// module: MOD-review-pages
// guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// given: a queue of three entries (two open, one waiting for its anchor) over a snapshot of 1,400 artifacts that name the requirements
// input: queueService.groups with a token; the snapshot counts its reads
// expect: fewer than 20 reads, none of the 1,400 artifacts read; the ticks name the proposals' blobs and the sections' blobs
test("TST-478101: groups reads the queue and the SPEC once and builds no impact list", async () => {
  const { snapshot, reads } = countingSnapshot();
  const groups = await queueService.groups({ snapshot, token: { value: "t" } });
  const artifacts = reads.filter((path) => /^(docs\/use-cases|tests)\//.test(path));
  assert.equal(artifacts.length, 0, `failure node: groups read ${artifacts.length} artifacts of the snapshot; reads in all: ${reads.length}`);
  assert.ok(reads.length < 20, `failure node: groups made ${reads.length} reads`);
  const ticks = groups[0].entries.map((item) => item.tick);
  assert.deepEqual(ticks, [
    { queue: QUEUE, entry: 5, proposalBlob: blobOf(entries[0].proposal), sectionBlob: blobOf(READING) },
    { queue: QUEUE, entry: 6, proposalBlob: blobOf(entries[1].proposal), sectionBlob: "" },
    { queue: QUEUE, entry: 7, proposalBlob: blobOf(entries[2].proposal), sectionBlob: blobOf(WRITING) },
  ]);
});

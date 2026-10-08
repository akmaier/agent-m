// Waiting for acceptance — MOD-progress-measures' waitingForAcceptance, as the accepted text of
// docs/architecture/MOD-progress-measures.md states it: what waits for the person's acceptance in one repository — the
// open entries of a SPEC change queue (MOD-spec-changes' queues), and the use cases, architecture decisions and module
// files whose status is open or changed (MOD-approvals' statuses) —, each with its identifier, path and blob; nothing
// for what is accepted, approved or already in SPEC. A release test report that waits is not part of this item: no
// release candidate exists before UC-013's release is built; ITM-239 adds it. Nothing else of the module is part of
// this item (ITM-235, Outcome).
// Run: node --test tests/progress-measures-waiting-for-acceptance.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). waitingForAcceptance is
// given a snapshot already held in memory — paths, blob SHAs and a read() of the texts given, as MOD-repository-hosts'
// Snapshot gives them, exactly as MOD-approvals' and MOD-spec-changes' own fixtures build one (tests/approvals-status.
// test.mjs, tests/spec-changes-queues.test.mjs) — and a host this item's scope never calls: no release test report
// (ITM-239). No readSnapshot, no fetch; nothing sleeps or waits. The combined list carries no order of its own, so
// results are compared sorted by id. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { waitingForAcceptance } from "../src/progress-measures/index.mjs";

const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

// A fixture snapshot (MOD-repository-hosts' Snapshot): paths, a blob SHA for each, and a read() of the texts given —
// null for every other path, as a snapshot answers for a path its commit does not hold.
function fixtureSnapshot(blobs, texts = {}, extraPaths = []) {
  const paths = [...new Set([...Object.keys(blobs), ...Object.keys(texts), ...extraPaths])];
  return {
    paths,
    blob: (path) => blobs[path] ?? null,
    read: async (path) => (Object.hasOwn(texts, path) ? texts[path] : null),
  };
}

// One queue, 2026-03-01_waiting, with three entries — 01 open (no record), 02 approved (a record, no decision) and 03
// in SPEC (a decision names its record) — built as MOD-spec-changes' own fixture does (tests/spec-changes-queues.test.mjs).
function queueFixture() {
  const base = "docs/spec-freigaben/2026-03-01_waiting";
  const texts = {
    [`${base}/index.md`]: [
      "# SPEC approvals — queue 2026-03-01 · waiting queue",
      "",
      "**Zieldatei aller Einträge:** `SPEC.md`",
      "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |",
      "|---|---|---|---|---|",
      "| 01 | `SPEC.md` | ## 1. Open section | — | — |",
      "| 02 | `SPEC.md` | ## 2. Approved section | — | — |",
      "| 03 | `SPEC.md` | ## 3. Accepted section | — | — |",
      "",
    ].join("\n"),
    [`${base}/entscheidungen.md`]: [
      "# Decisions — queue 2026-03-01 waiting queue",
      "",
      "Append-only.",
      "| 2026-03-01 10:00 UTC | 3 | uebernommen | approval:spec-2026-03-01_waiting-03-333333333333.md |",
      "",
    ].join("\n"),
  };
  const blobs = {
    [`${base}/01-open-section.md`]: "1".repeat(40),
    [`${base}/02-approved-section.md`]: "2".repeat(40),
    [`${base}/03-accepted-section.md`]: "3".repeat(40),
  };
  const records = [
    "docs/approvals/spec-2026-03-01_waiting-02-222222222222.md",
    "docs/approvals/spec-2026-03-01_waiting-03-333333333333.md",
  ];
  return { texts, blobs, records };
}

// guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; STATUS IS DERIVED FROM THE RECORDS; UC-047
// given: one open SPEC change entry beside an approved and an in-SPEC one (queueFixture), one open use case, one
//        accepted architecture decision and one changed module
// input: waitingForAcceptance(null, snapshot)
// expect: exactly the open entry, the open use case and the changed module, each with its id, path and blob — nothing
//         for the accepted decision, the approved entry or the in-SPEC entry
test("waitingForAcceptance — an open SPEC entry, an open use case and a changed module wait; an accepted decision, an approved and an in-SPEC entry do not", async () => {
  const UC_BLOB = "a1".repeat(20);
  const ARC_BLOB = "b2".repeat(20);
  const MOD_BLOB = "c3".repeat(20);
  const MOD_OLD_BLOB12 = "c3c3c3c3c300"; // an earlier text of MOD-sample-waiting — not MOD_BLOB's own first twelve hex digits
  const queue = queueFixture();

  const blobs = {
    "docs/use-cases/UC-050-sample-flow.md": UC_BLOB,
    "docs/architecture/ARC-060-sample-decision.md": ARC_BLOB,
    "docs/architecture/MOD-sample-waiting.md": MOD_BLOB,
    ...queue.blobs,
  };
  const extraPaths = [
    `docs/approvals/ARC-060-${ARC_BLOB.slice(0, 12)}.md`, // names ARC-060's current blob — accepted
    `docs/approvals/MOD-sample-waiting-${MOD_OLD_BLOB12}.md`, // names an earlier blob — changed
    ...queue.records,
  ];
  const snapshot = fixtureSnapshot(blobs, queue.texts, extraPaths);

  const result = await waitingForAcceptance(null, snapshot);
  result.sort(byId);
  assert.deepEqual(result, [
    { kind: "module", id: "MOD-sample-waiting", path: "docs/architecture/MOD-sample-waiting.md", blob: MOD_BLOB },
    { kind: "use case", id: "UC-050", path: "docs/use-cases/UC-050-sample-flow.md", blob: UC_BLOB },
    {
      kind: "SPEC change",
      id: "spec-2026-03-01_waiting-01",
      path: "docs/spec-freigaben/2026-03-01_waiting/01-open-section.md",
      blob: "1".repeat(40),
    },
  ].sort(byId));
});

// guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; UC-047
// given: one open architecture decision and one changed use case, no SPEC change queue in the repository
// input: waitingForAcceptance(null, snapshot)
// expect: both, each with its id, path and blob; no SPEC change, since the repository holds no queue
test("waitingForAcceptance — an open architecture decision and a changed use case wait, with no SPEC change queue in the repository", async () => {
  const ARC_BLOB = "d4".repeat(20);
  const UC_BLOB = "e5".repeat(20);
  const UC_OLD_BLOB12 = "e5e5e5e5e500"; // an earlier text of UC-051 — not UC_BLOB's own first twelve hex digits

  const blobs = {
    "docs/architecture/ARC-061-another-decision.md": ARC_BLOB,
    "docs/use-cases/UC-051-another-flow.md": UC_BLOB,
  };
  const extraPaths = [`docs/approvals/UC-051-${UC_OLD_BLOB12}.md`];
  const snapshot = fixtureSnapshot(blobs, {}, extraPaths);

  const result = await waitingForAcceptance(null, snapshot);
  result.sort(byId);
  assert.deepEqual(result, [
    {
      kind: "architecture decision", id: "ARC-061", path: "docs/architecture/ARC-061-another-decision.md",
      blob: ARC_BLOB,
    },
    { kind: "use case", id: "UC-051", path: "docs/use-cases/UC-051-another-flow.md", blob: UC_BLOB },
  ].sort(byId));
});

// guards: UC-047
// given: a repository with no reviewed file and no SPEC change queue
// input: waitingForAcceptance(null, snapshot)
// expect: an empty array
test("waitingForAcceptance — an empty repository waits for nothing", async () => {
  const snapshot = fixtureSnapshot({});
  assert.deepEqual(await waitingForAcceptance(null, snapshot), []);
});

// guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// given: a candidate's done run-tests record and its candidate tag, with no release report yet
// input: waitingForAcceptance(host, snapshot)
// expect: the ordinary waiting list gains the release test report, named release-v<version>, at the run record's path
test("waitingForAcceptance — a completed candidate run adds its release test report", async () => {
  const path = "docs/jobs/JOB-20261008-0900-aaaa.md";
  const text = ["---", "id: JOB-20261008-0900-aaaa", "kind: run-tests", "works_on:", "  - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "route: ci hosted", "started_by: akmaier", "start: 2026-10-08 09:00 UTC", "agent_m: unknown, commit unknown", "limit: 1", "---",
    "## Destinations", "", "## Parameters", "", "```json",
    '{"candidate":{"version":"2026.4.0","tag":"v2026.4.0-rc.1","commit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}}', "```", "",
    "## End", "", "at: 2026-10-08 10:00 UTC", "state: done", ""].join("\n");
  const snapshot = fixtureSnapshot({ [path]: "d4".repeat(20) }, { [path]: text });
  const host = { listTags: async () => [{ name: "v2026.4.0-rc.1", commit: "a".repeat(40) }] };
  assert.deepEqual(await waitingForAcceptance(host, snapshot), [{
    kind: "release test report", id: "release-v2026.4.0", path, blob: "d4".repeat(20),
  }]);
});

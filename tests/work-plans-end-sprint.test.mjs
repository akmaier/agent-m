// Ending a team's sprint that has no time box (UC-032 6b) — MOD-work-plans' endSprint as the accepted text of
// docs/architecture/MOD-work-plans.md states it: appends `## Ended` with the day to the sprint's record in one commit on the
// head that was read; refused with NotEndable, nothing written, for a sprint with a time box and for one already ended.
// Run: node --test tests/work-plans-end-sprint.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-032; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; ONE CLICK PER DECISION
// Level: unit
//
// The host is a fake of MOD-repository-hosts' Host with the product's files at one head: readSnapshot, repositoryInfo (its
// default branch main) and commitFiles, each call recorded; nothing reaches the network. The day of `now` is read as UTC.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { endSprint, planSchemas } from "../src/work-plans/index.mjs";

const HEAD = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";
const TRAILERS = ["Agent-M-Job: JOB-20261011-0900-ab12"];
const PATH = "docs/backlog/sprints/team2/01.md";
const record = (end) => `---\nsprint: 1\ngoal: g\nstart: 2026-10-12\nend: ${end}\ncloser: alice\nbranch:\nselection:\n  - ITM-001\n---\n# team2 Sprint 01\n`;

function hostWith(files) {
  const calls = [];
  return {
    calls,
    async repositoryInfo() { calls.push(["repositoryInfo"]); return { defaultBranch: "main" }; },
    async readSnapshot(ref) {
      calls.push(["readSnapshot", ref]);
      return { ref, commit: HEAD, paths: Object.keys(files), blob: (p) => (p in files ? `blob-${p}` : null), read: async (p) => files[p] ?? null };
    },
    async commitFiles(change) { calls.push(["commitFiles", change]); return { commit: "c".repeat(40), url: "https://example.org/c" }; },
  };
}
const committed = (host) => host.calls.filter(([what]) => what === "commitFiles").map(([, change]) => change);
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

// TST-481781 · level: unit · module: MOD-work-plans
// guards: UC-032; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; ONE CLICK PER DECISION
// given: team2's sprint 01, running, with no time box (its end empty); now 2026-10-18T14:30:00Z
// input: endSprint(host, "team2/01", { head: HEAD, now, trailers })
// expect: one commit on main at HEAD of the sprint's file only, its text followed by ## Ended with at 2026-10-18 and the job's trailers in the message; planSchemas.sprint reads it back with that day; the result is the commit
test("endSprint — a sprint without a time box gets ## Ended with the day of now, in one commit on the head that was read", async () => {
  const host = hostWith({ [PATH]: record("") });
  const result = await endSprint(host, "team2/01", { head: HEAD, now: new Date("2026-10-18T14:30:00Z"), trailers: TRAILERS });
  const [change] = committed(host);
  assert.equal(committed(host).length, 1);
  assert.equal(change.branch, "main");
  assert.equal(change.expectedHead, HEAD);
  assert.deepEqual(change.files.map((f) => f.path), [PATH]);
  assert.ok(change.message.endsWith(TRAILERS[0]), change.message);
  assert.ok(change.files[0].text.startsWith(record("")), "the record is only appended to");
  const read = readDocument(planSchemas.sprint, PATH, change.files[0].text);
  assert.deepEqual(read.appended.map((s) => [s.heading, s.fields]), [["## Ended", { at: "2026-10-18" }]]);
  assert.deepEqual(result, { commit: "c".repeat(40) });
});

// TST-481782 · level: unit · module: MOD-work-plans
// guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032 6b
// given: (a) a sprint with a time box, its end 2026-10-18; (b) a sprint without one that holds its ## Ended already
// input: endSprint of each
// expect: NotEndable in both, and nothing committed
test("endSprint — refused with NotEndable, nothing written, for a sprint with a time box and for one already ended", async () => {
  const ended = `${record("")}\n## Ended\n\nat: 2026-10-17\n`;
  for (const text of [record("2026-10-18"), ended]) {
    const host = hostWith({ [PATH]: text });
    const refused = await failure(endSprint(host, "team2/01", { head: HEAD, now: new Date("2026-10-18T14:30:00Z"), trailers: TRAILERS }));
    assert.equal(refused?.name, "NotEndable", String(refused));
    assert.deepEqual(committed(host), []);
  }
});

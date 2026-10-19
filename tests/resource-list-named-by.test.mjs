// MOD-resource-list's namedBy (ITM-1030), as the accepted text of docs/architecture/MOD-resource-list.md states it: "`namedBy(snapshot: Snapshot, name: string) -> { jobs: string[],
// tests: string[] }` — the job records whose `inputs` pin the resource `name` and the test files whose text names it, by the paths of each, read through the snapshot. A job record names a
// resource by the input `<name>` with its pin (MOD-job-ledger); a test names it by its name in its file. It changes nothing (UC-040, a resource removed or moved to a newer state)".
// For UC-040 (1a, 9a).
// Run: node --test tests/resource-list-named-by.test.mjs
//
// Module: MOD-resource-list
// Guards: UC-040; A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
// Level: unit
//
// The snapshot is a fixture of MOD-repository-hosts' Snapshot (paths, commit, read). Where the file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - namedBy is asynchronous, as the snapshot's `read` is; it resolves to the two lists.
//   - A job record is a file `docs/jobs/JOB-*.md`; it names the resource when an entry of the `inputs` list of its front matter is `<name>@<pin>`, the name exactly (not a longer name that begins with it).
//   - A test file is a file under `tests/`; it names the resource when its text holds the name as a whole word (a name of letters, digits, `-`, `_` and `.` is not part of a longer one).
//   - Both lists are in the order of the paths of the snapshot. The function writes nothing: the snapshot it is given has no write.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as resourceList from "../src/resource-list/index.mjs";

const PIN = "b".repeat(40);
const job = (id, ...inputs) => [`docs/jobs/${id}.md`, `---\nid: ${id}\nkind: implement\nworks_on:\n  - UC-040\ninputs:\n${inputs.map((each) => `  - ${each}`).join("\n")}\nlimit: 5\n---\n## Parameters\n\n- dlls is not an input here\n`];
const snapshotOf = (files) => {
  const reads = [];
  return { reads, paths: Object.keys(files), commit: "c".repeat(40), async read(path) { reads.push(path); return files[path] ?? null; } };
};

// TST-1030001 · level: unit · module: MOD-resource-list
// guards: UC-040 step 1a, 9a
// given: job records whose inputs are "dlls@bbbb…" (JOB-1), "SPEC.md@abc" and "other@bbbb…" (JOB-2); tests/uses-dlls.test.mjs, whose text names dlls, and tests/uses-other.test.mjs, whose text names other
// input: namedBy(snapshot, "dlls")
// expect: { jobs: ["docs/jobs/JOB-1.md"], tests: ["tests/uses-dlls.test.mjs"] } and nothing else
test("namedBy — gives the job record whose inputs pin the resource and the test file that names it, and nothing else", async () => {
  const snapshot = snapshotOf(Object.fromEntries([job("JOB-1", `dlls@${PIN}`), job("JOB-2", "SPEC.md@abc", `other@${PIN}`),
    ["tests/uses-dlls.test.mjs", "// guards the library dlls\n"], ["tests/uses-other.test.mjs", "// guards other\n"], ["README.md", "dlls\n"]]));
  assert.deepEqual(await resourceList.namedBy(snapshot, "dlls"), { jobs: ["docs/jobs/JOB-1.md"], tests: ["tests/uses-dlls.test.mjs"] });
});

// TST-1030002 · level: unit · module: MOD-resource-list
// guards: UC-040 step 1a, 9a
// given: the snapshot of TST-1030001 and a record JOB-3 whose input is "dlls-extra@bbbb…"; a test whose text names only dlls-extra
// input: namedBy(snapshot, "dlls")
// expect: the record JOB-3 and the test about dlls-extra are not listed (counter-proof: a record that names another resource fails the test)
test("namedBy — a record or a test that names another resource, even one that begins with the name, is not listed", async () => {
  const snapshot = snapshotOf(Object.fromEntries([job("JOB-1", `dlls@${PIN}`), job("JOB-3", `dlls-extra@${PIN}`),
    ["tests/uses-dlls.test.mjs", "dlls\n"], ["tests/uses-extra.test.mjs", "the resource dlls-extra\n"]]));
  assert.deepEqual(await resourceList.namedBy(snapshot, "dlls"), { jobs: ["docs/jobs/JOB-1.md"], tests: ["tests/uses-dlls.test.mjs"] });
});

// TST-1030003 · level: unit · module: MOD-resource-list
// guards: UC-040 step 1a, 9a
// given: a snapshot with no job record and no test that names "gone"
// input: namedBy(snapshot, "gone")
// expect: { jobs: [], tests: [] }
test("namedBy — a resource nothing names gives two empty lists", async () => {
  const snapshot = snapshotOf(Object.fromEntries([job("JOB-1", `dlls@${PIN}`), ["tests/a.test.mjs", "dlls\n"]]));
  assert.deepEqual(await resourceList.namedBy(snapshot, "gone"), { jobs: [], tests: [] });
});

// TST-1030004 · level: unit · module: MOD-resource-list
// guards: UC-040 step 1a, 9a; A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
// given: a snapshot of one record and one test, whose reads are recorded and which has no write
// input: namedBy(snapshot, "dlls")
// expect: the snapshot's paths and commit are as before, and only paths of docs/jobs/ and tests/ were read
test("namedBy — changes nothing and reads only job records and tests", async () => {
  const snapshot = snapshotOf(Object.fromEntries([job("JOB-1", `dlls@${PIN}`), ["tests/a.test.mjs", "dlls\n"], ["SPEC.md", "dlls\n"], ["docs/resources.md", "dlls\n"]]));
  const before = JSON.stringify([snapshot.paths, snapshot.commit]);
  await resourceList.namedBy(snapshot, "dlls");
  assert.equal(JSON.stringify([snapshot.paths, snapshot.commit]), before);
  assert.ok(snapshot.reads.length > 0);
  assert.ok(snapshot.reads.every((path) => path.startsWith("docs/jobs/") || path.startsWith("tests/")), snapshot.reads.join(", "));
});

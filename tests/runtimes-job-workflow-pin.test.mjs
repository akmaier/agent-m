// Agent M's own job workflow names only entries its pinned instance has (ITM-1296) — the committed `.github/workflows/agent-m-jobs.yml`,
// written by MOD-runtimes' jobWorkflowFiles, checks out the instance at the commit it names and runs `node src/workflow-entries/main.mjs
// <entry>` there (MOD-runtimes, Data: "Each job checks out the instance repository at the commit the file names and runs an entry of
// MOD-workflow-entries with Node"). An entry that main.mjs at that commit does not hold ends the run with "There is no entry <name>."
// Run: node --test tests/runtimes-job-workflow-pin.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-010
// Level: unit
//
// The test reads the committed file and, with git, main.mjs at the commit the file pins, from this checkout's object store. The entries
// main.mjs holds are the names of its `const ENTRIES = { … }`. Nothing reaches the network. Where this checkout does not hold the pinned
// commit, the test fails and names it, since it cannot then say which entries the instance has.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOW = ".github/workflows/agent-m-jobs.yml";
const git = (...args) => spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });

// TST-1296001 · level: unit · module: MOD-runtimes
// guards: UC-010
// given: this repository's committed .github/workflows/agent-m-jobs.yml, each of whose checkouts of the instance akmaier/agent-m names a `ref:` of 40 hexadecimal digits
// input: the commit those checkouts name, and the entries the file runs, each `node src/workflow-entries/main.mjs <entry>`; src/workflow-entries/main.mjs at that commit, read with git
// expect: every checkout of the instance names one and the same commit, which this checkout holds; the file runs at least one entry; every entry it runs is a name of the `const ENTRIES = { … }` of main.mjs at that commit — onPullRequestClosed among them
test("TST-1296001 every entry the committed agent-m-jobs.yml runs is an entry of main.mjs at the commit the file pins", () => {
  const text = readFileSync(join(ROOT, WORKFLOW), "utf8");
  const pins = [...text.matchAll(/repository:\s*akmaier\/agent-m\s*\n\s*ref:\s*(\S+)/g)].map((match) => match[1]);
  assert.ok(pins.length > 0, `${WORKFLOW} checks out the instance akmaier/agent-m at a ref`);
  assert.deepEqual([...new Set(pins)], [pins[0]], `${WORKFLOW} names one commit of the instance`);
  const [pinned] = pins;
  assert.match(pinned, /^[0-9a-f]{40}$/, `${WORKFLOW} pins the instance at a commit of 40 hexadecimal digits`);

  const shown = git("show", `${pinned}:src/workflow-entries/main.mjs`);
  assert.equal(shown.status, 0, `this checkout cannot read the pinned commit ${pinned}: ${shown.stderr.trim()}`);
  const declared = /const ENTRIES = \{([^}]*)\}/.exec(shown.stdout);
  assert.ok(declared, `main.mjs at ${pinned} declares its ENTRIES`);
  const entries = new Set(declared[1].split(",").map((name) => name.trim()).filter(Boolean));

  const run = [...new Set([...text.matchAll(/node src\/workflow-entries\/main\.mjs ([A-Za-z]+)/g)].map((match) => match[1]))];
  assert.ok(run.includes("onPullRequestClosed"), `${WORKFLOW} runs onPullRequestClosed`);
  assert.deepEqual(run.filter((name) => !entries.has(name)), [], `entries ${WORKFLOW} runs that main.mjs at ${pinned} does not hold`);
});

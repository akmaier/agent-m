// MOD-bridge-jobs' testAccess (ITM-406), as the accepted text of docs/architecture/MOD-bridge-jobs.md states it: "testAccess(config: {
// instance: string, products: string[] }) -> Promise<{ repository: string, reachable: boolean, reason: string | null }[]> — whether this
// computer's own git login reaches the instance and each served product: one fetch of each, changing nothing; a repository it does not
// reach is named with the reason git gives (UC-044). Crosses the network to the repository servers." For UC-044 step 3 and UC-011 3c.
// Run: node --test tests/bridge-jobs-access.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: UC-011; UC-044; A LOCAL AGENT USES THE PERSON'S OWN LOGIN
// Level: unit
//
// Deterministic, no network: the repositories are bare repositories in a temporary folder, each with a clone the Bridge holds — the
// instance and two products —, and a repository the computer's login does not reach, a path that is no repository: git says so itself.
// The login is the computer's own: git is given its usual environment and no token, and no prompt. Each test makes its own folder and
// removes it. Where the module file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The answer has one entry for each repository given, the instance first and then the products in the order given; `repository` is
//     the text given, `reachable` true and `reason` null for a repository reached, else `reachable` false and `reason` git's own words.
//   - The fetch is made out of any clone: the test works with its current folder in a clone of the instance, so that a function that
//     fetched in its own folder would change that clone.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the
// pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as bridgeJobs from "../src/bridge-jobs/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
const { testAccess } = bridgeJobs;

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
// A bare repository holding one commit, and a clone of it that the Bridge holds. -> { origin, clone }.
function repository(root, name) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`), clone = join(root, `${name}-clone`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  git(seed, "config", "user.name", "Seed");
  git(seed, "config", "user.email", "seed@example.org");
  mkdirSync(join(seed, "docs"), { recursive: true });
  writeFileSync(join(seed, "docs", "a.md"), `Text of ${name}.\n`);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  git(root, "clone", "-q", origin, clone);
  return { origin, clone };
}
// Everything a clone is: its files with their sizes and times, its branches, its head and its working tree's state.
function stateOf(folder) {
  const files = [];
  (function walk(dir) {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name), stat = statSync(path);
      if (stat.isDirectory()) walk(path); else files.push(`${path.slice(folder.length)}:${stat.size}:${stat.mtimeMs}`);
    }
  })(folder);
  return { files, refs: git(folder, "for-each-ref"), head: git(folder, "rev-parse", "HEAD"), status: git(folder, "status", "--porcelain") };
}
async function withRepositories(run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-access-"));
  const before = process.cwd();
  try {
    return await run({ instance: repository(root, "instance"), a: repository(root, "product-a"), b: repository(root, "product-b"), none: join(root, "missing.git") });
  } finally {
    process.chdir(before);
    rmSync(root, { recursive: true, force: true });
  }
}

// guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-044
// given: the instance and two served products, each a bare repository the computer's login reaches
// input: testAccess({ instance, products: [a, b] })
// expect: three entries, the instance first, then the products in order, each { repository: the text given, reachable: true, reason: null }
test("testAccess — every repository reached", async () => {
  assert.ok(testAccess, "testAccess is provided");
  await withRepositories(async ({ instance, a, b }) => {
    const answer = await testAccess({ instance: instance.origin, products: [a.origin, b.origin] });
    assert.deepEqual(answer, [instance.origin, a.origin, b.origin].map((repository) => ({ repository, reachable: true, reason: null })));
  });
});

// guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-044; UC-011 3c
// given: the instance and a served product the login reaches, and a served product it does not — a path that is no repository
// input: testAccess({ instance, products: [a, missing, b] })
// expect: the one it does not reach is { reachable: false, reason: git's words — "does not appear to be a git repository" —, naming the
//         repository }, the others reached with no reason, in the order given
test("testAccess — a repository it does not reach is named with the reason git gives", async () => {
  assert.ok(testAccess, "testAccess is provided");
  await withRepositories(async ({ instance, a, b, none }) => {
    const answer = await testAccess({ instance: instance.origin, products: [a.origin, none, b.origin] });
    assert.deepEqual(answer.map((entry) => entry.repository), [instance.origin, a.origin, none, b.origin]);
    assert.deepEqual(answer.map((entry) => entry.reachable), [true, true, false, true]);
    assert.deepEqual(answer.filter((entry) => entry.reachable).map((entry) => entry.reason), [null, null, null]);
    const refused = answer[2];
    assert.equal(typeof refused.reason, "string");
    assert.match(refused.reason, /does not appear to be a git repository/);
    assert.ok(refused.reason.includes(none), "git names the repository");
  });
});

// guards: A LOCAL AGENT USES THE PERSON'S OWN LOGIN; UC-044
// given: the instance, two products and a repository it does not reach, each with a clone the Bridge holds, and the Bridge's own folder
//        a clone of the instance
// input: testAccess of all four, with the current folder the instance's clone
// expect: every clone as it was — its files with their sizes and times, its branches, its head and its working tree — and every origin's
//         branches as they were; and, as the known positive, a fetch made in a clone is seen by the same check
test("testAccess — nothing is changed in any clone", async () => {
  assert.ok(testAccess, "testAccess is provided");
  await withRepositories(async ({ instance, a, b, none }) => {
    const clones = [instance.clone, a.clone, b.clone], origins = [instance.origin, a.origin, b.origin];
    const before = clones.map(stateOf), beforeOrigins = origins.map((origin) => git(origin, "for-each-ref"));
    process.chdir(instance.clone);
    const answer = await testAccess({ instance: instance.origin, products: [a.origin, none, b.origin] });
    assert.equal(answer.length, 4, "the call was made");
    assert.deepEqual(clones.map(stateOf), before, "every clone as it was");
    assert.deepEqual(origins.map((origin) => git(origin, "for-each-ref")), beforeOrigins, "every origin as it was");
    // Known positive: the state check sees a change — a fetch in the clone changes it.
    git(a.clone, "fetch", "-q", "origin");
    assert.notDeepEqual(stateOf(a.clone), before[1], "known positive: a fetch in a clone is seen");
  });
});

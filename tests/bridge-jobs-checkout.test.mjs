// MOD-bridge-jobs' checkOut, as docs/architecture/MOD-bridge-jobs.md (Interfaces) states it: "the checkout of every working folder (UC-044, step 3): in each
// agent's working folder the clone of the instance, then in `products/<name>/` the clone of each served product, each made or brought up to its origin as the
// watching does, the agents in the order given and in each the instance first; for each, the commit its clone's default branch holds, or, for a repository not
// reached or a folder refused, `commit` null and the reason in git's words. One repository's failure stops none of the others."
// Run: node --test tests/bridge-jobs-checkout.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: UC-044; UC-011; A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER; EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// Level: unit
//
// Deterministic, no network: the instance and the products are bare repositories in a temporary folder, reached by their paths; a product that does not
// exist is a path that is no repository, of which git says so itself. Each test makes its own folder and removes it. Where the module file leaves a reading
// open, the test states the one it takes:
//   - `repository` is the address given, `folder` the clone's folder: the agent's working folder for the instance, `products/<name>/` in it for a product.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkOut } from "../src/bridge-jobs/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function repository(root, name, files) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  for (const [path, text] of Object.entries(files)) { mkdirSync(join(seed, path, ".."), { recursive: true }); writeFileSync(join(seed, path), text); }
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  return { origin, head: git(seed, "rev-parse", "HEAD") };
}
const INSTANCE_FILES = { "AGENTS.md": "# AGENTS.md of the instance\n", "CLAUDE.md": "@AGENTS.md\n", "products/README.md": "# Products\n", ".gitignore": "/products/*\n!/products/README.md\n" };

// TST-20261110201 · level: unit · module: MOD-bridge-jobs
// guards: UC-044; A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER; EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: the instance and two products, product-a and product-b, as bare repositories; a folder <root>/agents that holds nothing yet
// input: checkOut({ instance, products: [a, b], agents: [{ claude, <root>/agents/claude }, { codex, <root>/agents/codex }] })
// expect: six entries, claude's three and then codex's, each the instance first and the products in the order given, each with the commit its origin's main holds
//   and no reason; each working folder is the instance's clone with AGENTS.md at its root, and holds products/product-a and products/product-b
test("TST-20261110201: checkOut clones the instance into each agent's working folder and each served product into its products folder, and names their commits", async (t) => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-checkout-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const instance = repository(root, "instance", INSTANCE_FILES);
  const a = repository(root, "product-a", { "README.md": "A\n" }), b = repository(root, "product-b", { "README.md": "B\n" });
  const agents = [{ name: "claude", folder: join(root, "agents", "claude") }, { name: "codex", folder: join(root, "agents", "codex") }];

  const answer = await checkOut({ instance: instance.origin, products: [a.origin, b.origin], agents });
  assert.deepEqual(answer, agents.flatMap(({ name, folder }) => [
    { agent: name, repository: instance.origin, folder, commit: instance.head, reason: null },
    { agent: name, repository: a.origin, folder: join(folder, "products", "product-a"), commit: a.head, reason: null },
    { agent: name, repository: b.origin, folder: join(folder, "products", "product-b"), commit: b.head, reason: null }]));
  for (const { folder } of agents) {
    assert.equal(readFileSync(join(folder, "AGENTS.md"), "utf8"), INSTANCE_FILES["AGENTS.md"]);
    assert.equal(readFileSync(join(folder, "products", "product-a", "README.md"), "utf8"), "A\n");
    assert.equal(readFileSync(join(folder, "products", "product-b", "README.md"), "utf8"), "B\n");
  }
});

// TST-20261110202 · level: unit · module: MOD-bridge-jobs
// guards: UC-044; UC-011
// given: the instance and product-a as bare repositories, and a product address that is no repository (<root>/missing.git); one agent
// input: checkOut({ instance, products: [missing, a], agents: [{ claude, <root>/agents/claude }] })
// expect: the instance with its commit; the missing product with commit null and a reason in git's words that names it; product-a, after it, with its commit —
//   the failure stopped none of the others; counter-proof: an agent without a working folder is left out of the answer
test("TST-20261110202: a repository checkOut does not reach is named with git's reason, and the others are still checked out", async (t) => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-checkout-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const instance = repository(root, "instance", INSTANCE_FILES);
  const a = repository(root, "product-a", { "README.md": "A\n" });
  const missing = join(root, "missing.git");
  const folder = join(root, "agents", "claude");

  const answer = await checkOut({ instance: instance.origin, products: [missing, a.origin], agents: [{ name: "claude", folder }, { name: "codex", folder: null }] });
  assert.equal(answer.length, 3, "counter-proof: the agent without a working folder is left out");
  assert.deepEqual(answer[0], { agent: "claude", repository: instance.origin, folder, commit: instance.head, reason: null });
  assert.equal(answer[1].repository, missing);
  assert.equal(answer[1].commit, null);
  assert.match(answer[1].reason, /missing\.git|does not appear to be a git repository|not found/i, "the reason is git's own, naming the repository");
  assert.deepEqual(answer[2], { agent: "claude", repository: a.origin, folder: join(folder, "products", "product-a"), commit: a.head, reason: null });
  assert.equal(existsSync(join(folder, "products", "product-a", "README.md")), true);
});

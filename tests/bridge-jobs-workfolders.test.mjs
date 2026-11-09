// MOD-bridge-jobs — the layout of an agent's working folder, as docs/architecture/MOD-bridge-jobs.md (Data) states it: "the working folder is a
// clone of the instance, made in the folder itself, so that an agent started there ... finds Agent M's `AGENTS.md` at its root as its
// guidance: Codex and opencode read `AGENTS.md`, Claude Code reads `CLAUDE.md`, which in Agent M's repository only imports it (`@AGENTS.md`).
// What the folder already holds stays; git refuses the first checkout where a file of the folder would be overwritten. A folder that holds a
// clone of another repository is refused, naming it"; "one clone per served product in `products/<name>/`, `<name>` the repository's name, the
// folder `git clone` gives it"; "one working clone per running job of that agent in `jobs/<id>/`"; "the agent's home `home/`"; and "`home/` and
// `jobs/` are excluded from the instance's clone in its `.git/info/exclude`".
// Run: node --test tests/bridge-jobs-workfolders.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: UC-011; UC-049; A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER; EVERY MODEL READS AGENT M'S AGENTS.MD FIRST; NO SECRET IN THE REPOSITORY
// Level: unit
//
// Deterministic, no network: the instance and the products are bare repositories in a temporary folder, reached by their paths. Each test makes
// its own folder and removes it.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { cloneOrFetch, foldersOf, instanceClone } from "../src/bridge-jobs/workfolders.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
Object.assign(process.env, { GIT_AUTHOR_NAME: "Seed", GIT_AUTHOR_EMAIL: "seed@example.org", GIT_COMMITTER_NAME: "Seed", GIT_COMMITTER_EMAIL: "seed@example.org" });

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
// A bare repository at <root>/<name>.git whose main holds the files given, and the seed that pushes to it.
function repository(root, name, files) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  push(seed, files);
  return { origin, seed };
}
function push(seed, files) {
  for (const [path, text] of Object.entries(files)) { mkdirSync(join(seed, path, ".."), { recursive: true }); writeFileSync(join(seed, path), text); }
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "files");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  return git(seed, "rev-parse", "HEAD");
}
function world(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-workfolders-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
const INSTANCE_FILES = { "AGENTS.md": "# AGENTS.md of the instance\n", "CLAUDE.md": "@AGENTS.md\n", "products/README.md": "# Products\n", ".gitignore": "/products/*\n!/products/README.md\n" };

// TST-5401001 · level: unit · module: MOD-bridge-jobs
// guards: UC-049; EVERY MODEL READS AGENT M'S AGENTS.MD FIRST; NO SECRET IN THE REPOSITORY
// given: the instance, a bare repository holding AGENTS.md, CLAUDE.md, products/README.md and Agent M's .gitignore; an agent's working folder that already holds its home with a kept login (home/.agent-m/kept.json) and a job's folder
// input: instanceClone(instance, folder); then a commit on the instance's main and instanceClone again
// expect: the working folder itself is the clone — AGENTS.md and CLAUDE.md at its root, HEAD the instance's main —, the kept login is still there, git status in the folder reports nothing, its .git/info/exclude names /home/ and /jobs/, and the second call brings origin/main to the new commit; counter-proof: a working folder that holds an AGENTS.md of its own is refused and its file is unchanged
test("TST-5401001: the working folder becomes a clone of the instance in place, its home and jobs out of git's sight", async (t) => {
  const root = world(t);
  const instance = repository(root, "instance", INSTANCE_FILES);
  const folder = join(root, "work");
  mkdirSync(join(folder, "home", ".agent-m"), { recursive: true });
  writeFileSync(join(folder, "home", ".agent-m", "kept.json"), '{"CLAUDE_CODE_OAUTH_TOKEN":"sk-ant-oat01-fixture"}');
  mkdirSync(join(folder, "jobs", "JOB-1"), { recursive: true });
  writeFileSync(join(folder, "jobs", "JOB-1", "README.md"), "a job's checkout\n");

  assert.equal(await instanceClone(instance.origin, folder), folder);
  assert.equal(readFileSync(join(folder, "AGENTS.md"), "utf8"), INSTANCE_FILES["AGENTS.md"]);
  assert.equal(readFileSync(join(folder, "CLAUDE.md"), "utf8"), "@AGENTS.md\n");
  assert.equal(git(folder, "rev-parse", "HEAD"), git(instance.seed, "rev-parse", "HEAD"));
  assert.equal(readFileSync(join(folder, "home", ".agent-m", "kept.json"), "utf8"), '{"CLAUDE_CODE_OAUTH_TOKEN":"sk-ant-oat01-fixture"}', "what the folder held stays");
  assert.equal(git(folder, "status", "--porcelain", "--untracked-files=all"), "", "neither home/ nor jobs/ is seen by git");
  assert.deepEqual(readFileSync(join(folder, ".git", "info", "exclude"), "utf8").split("\n").filter((line) => line.startsWith("/")).sort(), ["/home/", "/jobs/"]);
  assert.equal(git(folder, "symbolic-ref", "--short", "refs/remotes/origin/HEAD"), "origin/main");

  const next = push(instance.seed, { "marker.md": "v2\n" });
  await instanceClone(instance.origin, folder);
  assert.equal(git(folder, "rev-parse", "refs/remotes/origin/main"), next);

  const crowded = join(root, "crowded");
  mkdirSync(crowded);
  writeFileSync(join(crowded, "AGENTS.md"), "the person's own file\n");
  await assert.rejects(instanceClone(instance.origin, crowded), /AGENTS\.md/);
  assert.equal(readFileSync(join(crowded, "AGENTS.md"), "utf8"), "the person's own file\n", "counter-proof: nothing of the folder is overwritten");
});

// TST-5401002 · level: unit · module: MOD-bridge-jobs
// guards: UC-011; A LOCAL CLONE HOLDS ITS PRODUCTS IN ITS PRODUCTS FOLDER
// given: an agent's working folder /w and the product addresses https://github.com/acme/product-a, https://github.com/acme/product-b.git/ and git@github.com:acme/product-c.git
// input: foldersOf("/w"); and, in a working folder, cloneOrFetch of a product into the folder foldersOf names, then cloneOrFetch of another repository of the same name into it
// expect: the instance's folder is /w itself, the products' folders /w/products/product-a, /w/products/product-b and /w/products/product-c, and a job's /w/jobs/JOB-1; the product's clone holds its file; counter-proof: the other repository of the same name is refused, the refusal naming both, and the clone still holds the first product
test("TST-5401002: each product is cloned under products/ by its repository's name, and a second repository of that name is refused", async (t) => {
  const folders = foldersOf("/w");
  assert.equal(folders.instance, "/w");
  assert.deepEqual(["https://github.com/acme/product-a", "https://github.com/acme/product-b.git/", "git@github.com:acme/product-c.git"].map(folders.product),
    ["/w/products/product-a", "/w/products/product-b", "/w/products/product-c"]);
  assert.equal(folders.job("JOB-1"), "/w/jobs/JOB-1");

  const root = world(t);
  mkdirSync(join(root, "acme"));
  mkdirSync(join(root, "other"));
  const first = repository(join(root, "acme"), "widget", { "README.md": "acme's widget\n" });
  const second = repository(join(root, "other"), "widget", { "README.md": "another widget\n" });
  const folder = foldersOf(join(root, "work")).product(first.origin);
  assert.equal(folder, join(root, "work", "products", "widget"));
  await cloneOrFetch(first.origin, folder);
  assert.equal(readFileSync(join(folder, "README.md"), "utf8"), "acme's widget\n");
  await assert.rejects(cloneOrFetch(second.origin, folder), (error) => error.message.includes(first.origin) && error.message.includes(second.origin));
  assert.equal(git(folder, "config", "--get", "remote.origin.url"), first.origin, "counter-proof: the clone stays the first product's");
});

// TST-5401003 · level: unit · module: MOD-bridge-jobs
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST; UC-049
// given: the root of Agent M's own repository
// input: its CLAUDE.md and AGENTS.md
// expect: CLAUDE.md holds only Claude Code's import of AGENTS.md, `@AGENTS.md`, and AGENTS.md lies beside it; counter-proof: AGENTS.md is not that import itself, so the guidance has one source
test("TST-5401003: Agent M's CLAUDE.md only imports its AGENTS.md", () => {
  const root = new URL("../", import.meta.url);
  assert.equal(readFileSync(new URL("CLAUDE.md", root), "utf8"), "@AGENTS.md\n");
  assert.equal(existsSync(new URL("AGENTS.md", root)), true);
  assert.match(readFileSync(new URL("AGENTS.md", root), "utf8"), /^# AGENTS\.md/, "counter-proof: the guidance itself is in AGENTS.md");
});

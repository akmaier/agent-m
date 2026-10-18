// The instance of the tests of MOD-workflow-entries' onSourcesCommitted that start from a run's input (tests/workflow-entries-sources-newer-version.test.mjs): a temporary git repository holding register entries, the
// environment a workflow gives the entry (with the event file of a run started by hand, whose inputs name a source), and a fixture of the EU's publication repository that replaces global fetch. It is code only; it holds no
// expected result.
//
// Module: MOD-workflow-entries
// Level: unit

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

export const TOKEN = "ghp_fixtureWorkflowToken0123456789abcdef";
export const NOW = new Date("2026-03-01T10:00:00Z");

export function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${result.stderr}`);
  return result.stdout.trim();
}

function write(root, files) {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
}

// An instance: a bare origin with one commit of `files`, and a clone of it, which is the checkout the workflow runs in.
export async function withInstance(files, run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-sources-newer-"));
  const origin = join(root, "origin.git"), seed = join(root, "seed"), clone = join(root, "clone");
  try {
    git(root, "init", "-q", "--bare", "-b", "main", origin);
    git(root, "clone", "-q", origin, seed);
    git(seed, "config", "user.name", "Alice Source");
    git(seed, "config", "user.email", "alice@example.org");
    write(seed, files);
    git(seed, "add", "-A");
    git(seed, "commit", "-q", "-m", "source register fixture");
    git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
    git(root, "clone", "-q", origin, clone);
    git(clone, "config", "user.name", "agent-m sources");
    git(clone, "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");
    return await run({ root, origin, clone, head: git(clone, "rev-parse", "HEAD") });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// The environment of the workflow. With `inputs`, the run was started by hand (workflow_dispatch) and its event file holds them; without, it is a push.
export function envOf(instance, inputs) {
  const env = { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_WORKSPACE: instance.clone, GITHUB_SERVER_URL: "https://github.com",
    GITHUB_REPOSITORY: "alice/agent-m", GITHUB_REF_NAME: "main", GITHUB_SHA: instance.head, GITHUB_TOKEN: TOKEN };
  if (inputs) {
    const path = join(instance.root, "event.json");
    writeFileSync(path, JSON.stringify({ inputs }));
    Object.assign(env, { GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_EVENT_PATH: path });
  }
  return env;
}

export const headOf = (instance) => git(instance.origin, "rev-parse", "main");

// The publication repository: global fetch answers `body` as one XHTML file named 32024R1689.xhtml with the ETag `etag`; `calls()` counts the requests. `throw` makes the repository unreachable.
export async function withPublication({ body, etag = "cellar-2024-07-12", throw: unreachable } = {}, run) {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (unreachable) throw new Error(unreachable);
    return new Response(body, { status: 200, headers: { "content-type": "application/xhtml+xml", "content-disposition": "attachment; filename=\"32024R1689.xhtml\"",
      date: "Tue, 16 Jul 2024 12:00:00 GMT", etag: `"${etag}"` } });
  };
  try { return await run(() => calls); } finally { globalThis.fetch = original; }
}

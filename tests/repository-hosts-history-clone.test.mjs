// MOD-repository-hosts' readHistory through a clone without a token, as the text of docs/architecture/MOD-repository-hosts.md
// states it: "With `clone` … without a token, `readHistory` is answered by the clone with `git log` — each commit, its date, its
// message and its changes with `--name-status -M` —, as `containsCommit` is through the clone". Deterministic, no network: the
// clone is a real repository in a temporary folder, and `fetch` throws if anything asks a server.
// Run: node --test tests/repository-hosts-history-clone.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-010; A REQUIREMENT SHOWS ITS HISTORY
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}

// TST-HISTORY-CLONE-1 · level: unit · module: MOD-repository-hosts
// guards: UC-010; A REQUIREMENT SHOWS ITS HISTORY
// given: a clone whose main holds two commits by Clone Owner — "first" adds a.md, "second" renames a.md to b.md (unchanged text) and adds c.md; a host connected with the clone and no token
// input: readHistory(null, {}), then readHistory(null, { changes: false, limit: 1 })
// expect: both commits newest first, each with its parents, author { account: null, name: "Clone Owner" }, an ISO date, its message and its changes — second: c.md added and b.md renamed from a.md; first: a.md added; with changes false and limit 1 only second, with no changes; no request to a server
test("readHistory through a clone without a token — git log gives the commits and their changes", async () => {
  const root = mkdtempSync(join(tmpdir(), "agent-m-history-clone-"));
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("a clone asks no server"); };
  try {
    git(root, "init", "-q", "-b", "main");
    git(root, "config", "user.name", "Clone Owner");
    git(root, "config", "user.email", "clone@example.org");
    writeFileSync(join(root, "a.md"), "a text that stays the same across the rename\n");
    git(root, "add", "-A");
    git(root, "commit", "-q", "-m", "first");
    const first = git(root, "rev-parse", "HEAD");
    renameSync(join(root, "a.md"), join(root, "b.md"));
    writeFileSync(join(root, "c.md"), "c\n");
    git(root, "add", "-A");
    git(root, "commit", "-q", "-m", "second\n\nwith a body");
    const second = git(root, "rev-parse", "HEAD");

    const host = connect(parseAddress("https://github.com/alice/thesis-tool"), { clone: root });
    const history = await host.readHistory(null, {});
    for (const entry of history) assert.match(entry.date, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
    const byPath = (changes) => [...changes].sort((x, y) => x.path.localeCompare(y.path));
    assert.deepEqual(history.map(({ date, ...rest }) => ({ ...rest, changes: byPath(rest.changes) })), [
      { commit: second, parents: [first], author: { account: null, name: "Clone Owner" }, message: "second\n\nwith a body",
        changes: [{ path: "b.md", change: "renamed", from: "a.md" }, { path: "c.md", change: "added" }] },
      { commit: first, parents: [], author: { account: null, name: "Clone Owner" }, message: "first", changes: [{ path: "a.md", change: "added" }] },
    ]);

    const short = await host.readHistory(null, { changes: false, limit: 1 });
    assert.deepEqual(short.map((e) => [e.commit, e.changes]), [[second, []]]);
  } finally {
    globalThis.fetch = realFetch;
    rmSync(root, { recursive: true, force: true });
  }
});


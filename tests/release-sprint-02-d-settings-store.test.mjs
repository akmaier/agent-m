// Release tests of sprint 02, strand D — what the export notice says each stored secret grants (ITM-125), from the settings
// store's own list (ITM-145). Written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who implemented none
// of the strand's items, from the SPEC rules they realise; started on sprint/02 at a22de0a, 2026-10-02.
//
// Module: MOD-settings-store
// Guards: ONE GITHUB TOKEN SERVES EVERY FEATURE; AN EXPORT STATES THAT IT CONTAINS SECRETS
// Level: release
//
// AN EXPORT STATES THAT IT CONTAINS SECRETS: "the file contains every token, key and password it holds, and what each of them
// grants". ONE GITHUB TOKEN SERVES EVERY FEATURE: the one GitHub token carries Contents, Issues and Pull requests read and write,
// Actions and Workflows read and write, Metadata read. The writes those permissions carry, as a person reads them: Contents —
// commits; Issues — issues; Pull requests — pull requests (a job opens and merges them); Actions — workflow runs; Workflows —
// commits to the CI configuration. The permission list itself is taken from the one list the dashboard builds its token link
// from (MOD-git-host requiredPermissions), so that a permission added there without a word in the grant fails this test.

import test from "node:test";
import assert from "node:assert/strict";
import { settingKeys, TOKEN_KEY, KEYS } from "../docs/assets/settings-store.mjs";
import { requiredPermissions } from "../docs/assets/git-host.mjs";

// The write each GitHub permission carries, as the grant must name it.
const WRITE_OF = { contents: /\bcommits?\b/i, issues: /\bissues?\b/i, pull_requests: /\bpull requests?\b/i,
  actions: /\bworkflow runs?\b/i, workflows: /\bcommits?\b/i };

// ONE GITHUB TOKEN SERVES EVERY FEATURE · AN EXPORT STATES THAT IT CONTAINS SECRETS: the GitHub token's grant names every write
// the one token carries. Expected: commits, issues, pull requests and workflow runs, under the person's account; every permission
// with write access in the one list has its word; the permission list is the one the SPEC names — no write permission the grant
// would not know.
test("ITM-125 · the GitHub token's grant names every write the one token carries — pull requests included", () => {
  const github = settingKeys.find((s) => s.key === TOKEN_KEY);
  assert.ok(github?.secret, "the GitHub token is a secret of the export");
  const grant = String(github.grants ?? "");
  for (const w of ["commits", "issues", "pull requests", "workflow runs"]) assert.match(grant, new RegExp(`\\b${w}\\b`, "i"), w);
  assert.match(grant, /your account/i, "under the person's account");
  const writes = requiredPermissions("github.com").github.filter((p) => p.access === "write");
  assert.deepEqual(writes.map((p) => p.permission).sort(), ["Actions", "Contents", "Issues", "Pull requests", "Workflows"],
    "the write permissions ONE GITHUB TOKEN SERVES EVERY FEATURE names");
  for (const p of writes) {
    assert.ok(WRITE_OF[p.param], `${p.permission}: a permission this test does not know the write of`);
    assert.match(grant, WRITE_OF[p.param], `${p.permission}: its write is named in the grant`);
  }
});

// AN EXPORT STATES THAT IT CONTAINS SECRETS — "every token, key and password it holds, and what each of them grants". Expected:
// every key the store writes is named; every secret among them states a grant of its own; the GitLab project tokens name their
// one project, the remote sessions' tokens the CLI session behind them.
test("ITM-125 · every secret the store keeps says what it grants", () => {
  assert.deepEqual([...KEYS].sort(), settingKeys.map((s) => s.key).sort(), "every key the store writes has its place");
  const secrets = settingKeys.filter((s) => s.secret);
  assert.ok(secrets.length >= 3, "the GitHub token, the GitLab project tokens and the sessions' bridge tokens");
  for (const s of secrets) assert.ok(String(s.grants ?? "").trim().length > 20, `${s.label}: what it grants`);
  const gitlab = secrets.find((s) => /gitlab/i.test(s.label)), sessions = secrets.find((s) => /session/i.test(s.label));
  assert.match(gitlab.grants, /\bproject\b/i);
  assert.match(sessions.grants, /\bsession\b/i);
});

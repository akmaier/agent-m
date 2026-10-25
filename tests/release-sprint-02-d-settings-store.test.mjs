// Release tests of sprint 02, strand D — what the export notice says each stored secret grants (ITM-125), from the browser
// store's own list of its settings (MOD-browser-store listSettings, ITM-145). Written by tester-opus (claude-opus-5-5), the Release
// tester of docs/process.md, who implemented none of the strand's items, from the SPEC rules they realise; started on sprint/02 at
// a22de0a, 2026-10-02.
//
// Module: MOD-browser-store
// Guards: ONE GITHUB TOKEN SERVES EVERY FEATURE; AN EXPORT STATES THAT IT CONTAINS SECRETS
// Level: release
//
// AN EXPORT STATES THAT IT CONTAINS SECRETS: "the file contains every token, key and password it holds, and what each of them
// grants". ONE GITHUB TOKEN SERVES EVERY FEATURE: the one GitHub token carries Contents, Issues and Pull requests read and write,
// Actions and Workflows read and write, Metadata read. The writes those permissions carry, as a person reads them: Contents —
// commits; Issues — issues; Pull requests — pull requests (a job opens and merges them); Actions — workflow runs; Workflows —
// commits to the CI configuration. The permission list itself is taken from the one list the dashboard builds its token link
// from (MOD-git-host requiredPermissions), so that a permission added there without a word in the grant fails this test. The
// grants are those the settings page's export notice names (MOD-settings-pages, from listSettings).

import test from "node:test";
import assert from "node:assert/strict";
import { openStore, writeSetting, listSettings } from "../src/browser-store/index.mjs";
import { requiredPermissions } from "../docs/assets/git-host.mjs";

// The write each GitHub permission carries, as the grant must name it.
const WRITE_OF = { contents: /\bcommits?\b/i, issues: /\bissues?\b/i, pull_requests: /\bpull requests?\b/i,
  actions: /\bworkflow runs?\b/i, workflows: /\bcommits?\b/i, secrets: /\bsecrets?\b/i };

// A browser holding one setting of every family of secrets the store keeps: the instance's and a GitHub product's token, a
// GitLab project's token, a Bridge under its name, an endpoint's key, a resource's key. -> its listSettings
function everySecret() {
  const mem = new Map();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, writable: true, value: { getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null } });
  const store = openStore("akmaier/agent-m");
  const token = (value) => ({ value, name: "Agent M", expires: null, stored: "2026-10-02" });
  writeSetting(store, "github-token", token("github_pat_INSTANCE"));
  writeSetting(store, "github-token:alice/thesis", token("github_pat_PRODUCT"));
  writeSetting(store, "gitlab-token:gitlab.example.org/grp/proj", token("glpat-PROJECT"));
  writeSetting(store, "bridge:lab-pc", { port: 20001, token: "bridge-token" });
  writeSetting(store, "endpoint:hub", { url: "https://m.example/v1", kind: "openai-compatible", model: "m", key: "k", place: "EU", context: 8000 });
  writeSetting(store, "resource-key:hub", { value: "hub-key", stored: "2026-10-02" });
  return listSettings(store);
}

// ONE GITHUB TOKEN SERVES EVERY FEATURE · AN EXPORT STATES THAT IT CONTAINS SECRETS: the GitHub token's grant names every write
// the one token carries. Expected: commits, issues, pull requests, workflow runs and Actions secrets, under the person's account; every permission
// with write access in the one list has its word; the permission list is the one the SPEC names — no write permission the grant
// would not know.
test("ITM-125 · the GitHub token's grant names every write the one token carries — pull requests included", () => {
  const settings = everySecret();
  for (const key of ["github-token", "github-token:alice/thesis"]) {
    const github = settings.find((s) => s.key === key);
    assert.ok(github?.secret, `${key}: a secret of the export`);
    const grant = String(github.grants ?? "");
    for (const w of ["commits", "issues", "pull requests", "workflow runs", "secrets"]) assert.match(grant, new RegExp(`\\b${w}\\b`, "i"), `${key}: ${w}`);
    assert.match(grant, /your account/i, `${key}: under the person's account`);
    const writes = requiredPermissions("github.com").github.filter((p) => p.access === "write");
    assert.deepEqual(writes.map((p) => p.permission).sort(), ["Actions", "Contents", "Issues", "Pull requests", "Secrets", "Workflows"],
      "the write permissions ONE GITHUB TOKEN SERVES EVERY FEATURE names");
    for (const p of writes) {
      assert.ok(WRITE_OF[p.param], `${p.permission}: a permission this test does not know the write of`);
      assert.match(grant, WRITE_OF[p.param], `${key}: ${p.permission}: its write is named in the grant`);
    }
  }
});

// AN EXPORT STATES THAT IT CONTAINS SECRETS — "every token, key and password it holds, and what each of them grants". Expected:
// every setting stored is listed; every secret among them states a grant of its own; the GitLab project token names its one
// project, a Bridge's token the CLI sessions behind it.
test("ITM-125 · every secret the store keeps says what it grants", () => {
  const settings = everySecret();
  for (const key of ["github-token", "github-token:alice/thesis", "gitlab-token:gitlab.example.org/grp/proj", "bridge:lab-pc", "endpoint:hub", "resource-key:hub"]) {
    assert.ok(settings.some((s) => s.key === key), `${key}: every key the store writes has its place`);
  }
  const secrets = settings.filter((s) => s.secret);
  assert.ok(secrets.length >= 6, "the GitHub tokens, the GitLab project token, the Bridge's token and the keys");
  for (const s of secrets) assert.ok(String(s.grants ?? "").trim().length > 10, `${s.label}: what it grants`);
  assert.match(settings.find((s) => s.key === "gitlab-token:gitlab.example.org/grp/proj").grants, /\bproject\b/i);
  assert.match(settings.find((s) => s.key === "bridge:lab-pc").grants, /\bsessions?\b/i);
});

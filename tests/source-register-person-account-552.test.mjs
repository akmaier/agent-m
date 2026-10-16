// The account of the person who gives an instruction (ITM-552) — MOD-source-register's personAccount(instance), as the accepted text of
// docs/architecture/MOD-source-register.md states it: the account `<server>/<account>` that personSource takes — the owner of the
// instance's repository on its server's host, `github.com` on GitHub —, `null` where the snapshot names no owner, and no request made
// (THE PERSON WHO PROMPTS IS A SOURCE). The review pages' and the trace pages' callers are not part of these tests.
// Run: node --test tests/source-register-person-account-552.test.mjs
//
// Module: MOD-source-register
// Guards: UC-019; THE PERSON WHO PROMPTS IS A SOURCE
// Level: unit
//
// Each snapshot is built here with the fields of MOD-repository-hosts' Snapshot that the function reads — `repository.server`,
// `repository.origin` and `repository.path`. A name the module does not provide yet is undefined here, so that each test fails by
// itself. Each test states its input and its expected result before it runs (given / input / expect); where a test asserts a null,
// the same function is first shown to give an account on a known positive. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import * as sourceRegister from "../src/source-register/index.mjs";

const { personAccount } = sourceRegister;

const snapshotOf = (repository) => ({ ref: "main", commit: "c0ffee", repository, paths: [], read: async () => null });
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "akmaier/agent-m", web: "https://github.com/akmaier/agent-m" };
const ON_GITLAB = { server: "gitlab", origin: "https://gitlab.example.org", path: "team/product", web: "https://gitlab.example.org/team/product" };

// TST-552001 · level: unit · module: MOD-source-register
// guards: THE PERSON WHO PROMPTS IS A SOURCE; UC-019
// given: a snapshot of the GitHub repository akmaier/agent-m at origin https://github.com
// input: personAccount of it; and of the same repository with no origin in the address
// expect: "github.com/akmaier" for both — the owner on the host github.com, which GitHub supplies when the address names no origin
test("personAccount — a GitHub instance gives github.com/<owner>", () => {
  assert.equal(personAccount(snapshotOf(ON_GITHUB)), "github.com/akmaier");
  assert.equal(personAccount(snapshotOf({ server: "github", path: "akmaier/agent-m" })), "github.com/akmaier", "no origin: GitHub's own host");
});

// TST-552002 · level: unit · module: MOD-source-register
// guards: THE PERSON WHO PROMPTS IS A SOURCE; UC-019
// given: snapshots of GitLab repositories: team/product at https://gitlab.example.org; the group path fau-ai-taskforce/tools/thesis-tool at https://gitlab.rrze.fau.de; and alice/thesis-tool at https://git.example.org:8443
// input: personAccount of each
// expect: "gitlab.example.org/team"; "gitlab.rrze.fau.de/fau-ai-taskforce", the first segment of the path alone; "git.example.org:8443/alice", the host of the origin as the address writes it
test("personAccount — a GitLab instance gives <host>/<owner>, the owner being the first segment of the path", () => {
  assert.equal(personAccount(snapshotOf(ON_GITLAB)), "gitlab.example.org/team");
  assert.equal(personAccount(snapshotOf({ server: "gitlab", origin: "https://gitlab.rrze.fau.de", path: "fau-ai-taskforce/tools/thesis-tool" })),
    "gitlab.rrze.fau.de/fau-ai-taskforce");
  assert.equal(personAccount(snapshotOf({ server: "gitlab", origin: "https://git.example.org:8443", path: "alice/thesis-tool" })),
    "git.example.org:8443/alice");
});

// TST-552003 · level: unit · module: MOD-source-register
// guards: THE PERSON WHO PROMPTS IS A SOURCE; UC-019
// given: a snapshot of a GitHub repository, and of a GitLab one, each as the known positive; then snapshots naming no owner: an empty path, a path of a slash alone, no path, and no repository; and a GitLab snapshot whose address gives no origin, and one whose origin is no address
// input: personAccount of each
// expect: "github.com/akmaier" and "gitlab.example.org/team" for the positives; null for every other — no owner, or a GitLab server whose host the snapshot does not name
test("personAccount — null where the snapshot names no owner", () => {
  assert.equal(personAccount(snapshotOf(ON_GITHUB)), "github.com/akmaier", "known positive: GitHub");
  assert.equal(personAccount(snapshotOf(ON_GITLAB)), "gitlab.example.org/team", "known positive: GitLab");

  assert.equal(personAccount(snapshotOf({ ...ON_GITHUB, path: "" })), null, "an empty path");
  assert.equal(personAccount(snapshotOf({ ...ON_GITHUB, path: "/" })), null, "a path of a slash alone");
  assert.equal(personAccount(snapshotOf({ server: "github", origin: "https://github.com" })), null, "no path");
  assert.equal(personAccount(snapshotOf(undefined)), null, "no repository");
  assert.equal(personAccount(snapshotOf({ server: "gitlab", path: "team/product" })), null, "GitLab without an origin");
  assert.equal(personAccount(snapshotOf({ server: "gitlab", origin: "not an address", path: "team/product" })), null, "GitLab with an origin that is no address");
});

// TST-552004 · level: unit · module: MOD-source-register
// guards: THE PERSON WHO PROMPTS IS A SOURCE; UC-019
// given: a spy in place of fetch, and snapshots whose read records its call; a GitHub and a GitLab snapshot
// input: personAccount of each, with the spy installed; and, as the known positive that the spy sees a request, a call of fetch itself
// expect: the accounts "github.com/akmaier" and "gitlab.example.org/team"; no call of the spy and no call of read from personAccount; one call of the spy from the fetch call
test("personAccount — makes no request", async () => {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (...args) => { calls.push(args); return { ok: true }; };
  try {
    await globalThis.fetch("https://example.invalid/");
    assert.equal(calls.length, 1, "known positive: the spy sees a request");
    calls.length = 0;
    const reading = [];
    const snapshots = [ON_GITHUB, ON_GITLAB].map((repository) => ({ ...snapshotOf(repository), read: async (path) => { reading.push(path); return null; } }));
    assert.deepEqual(snapshots.map((snapshot) => personAccount(snapshot)), ["github.com/akmaier", "gitlab.example.org/team"]);
    assert.deepEqual(calls, [], "no fetch");
    assert.deepEqual(reading, [], "no read of the snapshot");
  } finally {
    globalThis.fetch = original;
  }
});

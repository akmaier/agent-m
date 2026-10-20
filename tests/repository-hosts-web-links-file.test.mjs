// MOD-repository-hosts' WebLinks `file` (ITM-767), as the accepted text of docs/architecture/MOD-repository-hosts.md states it: "`WebLinks` — { …, file(path: string, ref: string) -> string, … }: … `file` the page
// that shows one file as it stands at a branch, a tag or a commit, to read and not to edit". MOD-trace-pages links a test's code to it (UC-029 step 4).
// Run: node --test tests/repository-hosts-web-links-file.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-029; A CREDENTIAL IS NEVER PLACED IN A URL
// Level: unit
//
// No server is reached: webLinks() makes no request, and the test replaces fetch with one that fails the test if it is called. The links are read through the public export, `connect(parseAddress(url)).webLinks()`.
// Readings the texts leave open, which the tests state (the pull request names them): GitHub's page of a file at a ref is <repository>/blob/<ref>/<path>, GitLab's <project>/-/blob/<ref>/<path>, each folder and file
// name and each part of the ref encoded with the slashes kept, as `editFile` and `branch` build theirs; the page is the one `editFile` is not (it has no `edit` in it), and the same for a branch, a tag and a commit.
// Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const links = (url, credentials = {}) => connect(parseAddress(url), credentials).webLinks();
async function withoutNetwork(run) {
  const real = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("webLinks reaches no server"); };
  try { return await run(); } finally { globalThis.fetch = real; }
}

// TST-767101 · level: unit · module: MOD-repository-hosts
// guards: UC-029; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the repository https://github.com/akmaier/agent-m; known positive: its editFile page is there
// input: webLinks().file("tests/alpha.test.mjs", "main"), and at the tag v2026.1.0 and at a commit
// expect: https://github.com/akmaier/agent-m/blob/main/tests/alpha.test.mjs, …/blob/v2026.1.0/tests/alpha.test.mjs, …/blob/<the commit>/tests/alpha.test.mjs; not the editor page; no request is made
test("webLinks.file — a GitHub repository gives the page of a file at a branch, a tag or a commit", async () => {
  await withoutNetwork(() => {
    const given = links("https://github.com/akmaier/agent-m");
    assert.equal(given.editFile("tests/alpha.test.mjs"), "https://github.com/akmaier/agent-m/edit/main/tests/alpha.test.mjs", "known positive: the editor page is another");
    assert.equal(given.file("tests/alpha.test.mjs", "main"), "https://github.com/akmaier/agent-m/blob/main/tests/alpha.test.mjs");
    assert.equal(given.file("tests/alpha.test.mjs", "v2026.1.0"), "https://github.com/akmaier/agent-m/blob/v2026.1.0/tests/alpha.test.mjs");
    const commit = "a".repeat(40);
    assert.equal(given.file("tests/alpha.test.mjs", commit), `https://github.com/akmaier/agent-m/blob/${commit}/tests/alpha.test.mjs`);
  });
});

// TST-767102 · level: unit · module: MOD-repository-hosts
// guards: UC-029
// given: the GitLab project https://gitlab.example.org/space/group/release-tool, in a group inside a group; known positive: its editFile page is there
// input: webLinks().file("tests/alpha.test.mjs", "main")
// expect: https://gitlab.example.org/space/group/release-tool/-/blob/main/tests/alpha.test.mjs; no request is made
test("webLinks.file — a GitLab project gives the page of a file under its -/blob", async () => {
  await withoutNetwork(() => {
    const given = links("https://gitlab.example.org/space/group/release-tool");
    assert.equal(given.editFile("tests/alpha.test.mjs"), "https://gitlab.example.org/space/group/release-tool/-/edit/main/tests/alpha.test.mjs", "known positive: the editor page is another");
    assert.equal(given.file("tests/alpha.test.mjs", "main"), "https://gitlab.example.org/space/group/release-tool/-/blob/main/tests/alpha.test.mjs");
  });
});

// TST-767103 · level: unit · module: MOD-repository-hosts
// guards: UC-029; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a GitHub repository, connected with a token; a path with a space and a ref with a slash and a space (a branch "feature/x y")
// input: webLinks().file("tests/a file.test.mjs", "feature/x y")
// expect: …/blob/feature/x%20y/tests/a%20file.test.mjs (the slashes kept, the spaces encoded) and the token nowhere in the address
test("webLinks.file — the parts of the path and the ref are encoded with the slashes kept, and no credential is in the address", async () => {
  await withoutNetwork(() => {
    const token = `github_pat_${"A".repeat(40)}`;
    const address = links("https://github.com/akmaier/agent-m", { token }).file("tests/a file.test.mjs", "feature/x y");
    assert.equal(address, "https://github.com/akmaier/agent-m/blob/feature/x%20y/tests/a%20file.test.mjs");
    assert.ok(!address.includes(token));
  });
});

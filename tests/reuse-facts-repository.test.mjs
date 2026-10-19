// MOD-reuse-facts' repositoryFacts (ITM-1027), as docs/architecture/MOD-reuse-facts.md states it: "`repositoryFacts(host: Host, productLicence: string | null) -> Promise<{ facts: Fact[], licence:
// "compatible" | "not known to be compatible" | "not checked" }>` — what a resource repository says about itself, through the host its caller connected with the stored token of that server: the
// licence file at the default branch's head (`readSnapshot`, the file `LICENSE`, `LICENCE` or `COPYING` with or without an extension), the date of the last commit, and the number of distinct authors
// of the commits of the last year (`readHistory` with `changes: false`, newest first, until a commit older than a year), each with its address and date; the licence against `productLicence` by
// `licenceVerdict`. A repository without a licence file gives the fact `licence file` with the value `none`. Fails as the host fails." For UC-040 (a repository resource).
// Run: node --test tests/reuse-facts-repository.test.mjs
//
// Module: MOD-reuse-facts
// Guards: UC-040; DUE DILIGENCE IS FETCHED, NOT RECALLED
// Level: unit
//
// The host is a fake of MOD-repository-hosts' Host (repositoryInfo, readSnapshot, readHistory), whose history honours `limit` and is newest first; no request is made. Where the texts leave a reading open,
// the tests state the one they take, and the pull request names it:
//   - A fact's `candidate` is the repository's path and its `ecosystem` is `repository`; its `read` is the day it is read, given as `options.now` as registryFacts takes it.
//   - A committer is told apart by the account the server names for the author, else by the author's name; a year is 365 days before `now`.
//   - The facts are `licence file` (the file's name, its address at the default branch), `last commit` (the newest commit's date, its address) and `committers in the last year` (the number, the address of the commits).
//   - The licence the verdict is made for is the one the licence file's text names (its title, such as "MIT License"); a text that names none is `not checked`.
// Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { repositoryFacts } from "../src/reuse-facts/index.mjs";

const WEB = "https://github.com/alice/dlls";
const NOW = new Date("2026-10-19T12:00:00Z");
const daysAgo = (days) => new Date(NOW.getTime() - days * 86400000).toISOString();
const MIT = "MIT License\n\nCopyright (c) 2025 Alice\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\n";

function fakeHost({ files, commits }) {
  const asked = [];
  return { asked, host: {
    async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: false, archived: false, description: "" }; },
    async readSnapshot(ref) { return { repository: { server: "github", origin: "https://github.com", path: "alice/dlls", web: WEB }, ref, commit: "c".repeat(40), paths: Object.keys(files), read: async (p) => files[p] ?? null, blob: () => null }; },
    async readHistory(path, options = {}) { asked.push({ path, options }); return commits.slice(0, options.limit ?? commits.length); },
  } };
}
const commit = (sha, account, name, days) => ({ commit: sha, parents: [], author: { account, name }, date: daysAgo(days), message: "m", changes: [] });
// Three authors in the last year (bob twice) and, older than a year, a fourth and a fifth.
const COMMITS = [commit("1".repeat(40), "alice", "Alice", 3), commit("2".repeat(40), "bob", "Bob", 40), commit("3".repeat(40), "bob", "Bob", 90), commit("4".repeat(40), null, "Carol", 200),
  commit("5".repeat(40), "dave", "Dave", 400), commit("6".repeat(40), "erin", "Erin", 800)];

// TST-1027001 · level: unit · module: MOD-reuse-facts
// guards: UC-040; DUE DILIGENCE IS FETCHED, NOT RECALLED
// given: a repository with the file LICENSE (MIT), commits by alice, bob (twice), the name Carol (no account) in the last year, and by dave and erin more than a year ago; the product's licence MIT
// input: repositoryFacts(host, "MIT", { now })
// expect: the facts `licence file` = LICENSE, `last commit` = 2026-10-16 (3 days before now), `committers in the last year` = 3, each of candidate alice/dlls, ecosystem repository, with an address under the repository and read 2026-10-19; the verdict "compatible"
test("repositoryFacts — a licence file, the last commit and the committers of the last year, each with its address and date, and the verdict", async () => {
  const { host } = fakeHost({ files: { LICENSE: MIT, "README.md": "# dlls\n" }, commits: COMMITS });
  const result = await repositoryFacts(host, "MIT", { now: NOW });
  assert.deepEqual(result.facts.map(({ what, value }) => [what, value]), [["licence file", "LICENSE"], ["last commit", "2026-10-16"], ["committers in the last year", "3"]]);
  for (const found of result.facts) {
    assert.equal(found.candidate, "alice/dlls");
    assert.equal(found.ecosystem, "repository");
    assert.equal(found.read, "2026-10-19");
    assert.ok(found.address.startsWith(WEB), found.address);
  }
  assert.equal(result.licence, "compatible");
});

// TST-1027002 · level: unit · module: MOD-reuse-facts
// guards: UC-040; DUE DILIGENCE IS FETCHED, NOT RECALLED
// given: the repository of TST-1027001
// input: repositoryFacts(host, "MIT", { now })
// expect: the committers of the last year are 3 and not 5 (counter-proof: counting the authors of every commit, not only the last year's, fails); the history was asked with changes: false
test("repositoryFacts — only the authors of the last year are counted, and the history is asked without changes", async () => {
  const { host, asked } = fakeHost({ files: { LICENSE: MIT }, commits: COMMITS });
  const result = await repositoryFacts(host, "MIT", { now: NOW });
  assert.equal(result.facts.find((found) => found.what === "committers in the last year").value, "3");
  assert.notEqual(result.facts.find((found) => found.what === "committers in the last year").value, "5");
  assert.ok(asked.length >= 1 && asked.every(({ options }) => options.changes === false));
});

// TST-1027003 · level: unit · module: MOD-reuse-facts
// guards: UC-040; DUE DILIGENCE IS FETCHED, NOT RECALLED
// given: a repository with no licence file (only README.md) and one commit
// input: repositoryFacts(host, "MIT", { now })
// expect: the fact `licence file` has the value none, and the verdict is "not checked"
test("repositoryFacts — a repository without a licence file gives `none`", async () => {
  const { host } = fakeHost({ files: { "README.md": "# dlls\n" }, commits: COMMITS.slice(0, 1) });
  const result = await repositoryFacts(host, "MIT", { now: NOW });
  assert.equal(result.facts.find((found) => found.what === "licence file").value, "none");
  assert.equal(result.licence, "not checked");
});

// TST-1027004 · level: unit · module: MOD-reuse-facts
// guards: UC-040
// given: repositories whose file is COPYING, LICENCE.md, and licence.txt in a folder; one with a long history of 250 commits of one author in the last year
// input: repositoryFacts for each
// expect: COPYING and LICENCE.md are the licence file; the file in a folder is not (only the root's); for 250 commits the committers are 1 and the whole year is read (more than one request of the history)
test("repositoryFacts — the licence file's names, and a history longer than one request", async () => {
  const named = async (files) => (await repositoryFacts(fakeHost({ files, commits: COMMITS.slice(0, 1) }).host, "MIT", { now: NOW })).facts[0].value;
  assert.equal(await named({ COPYING: MIT }), "COPYING");
  assert.equal(await named({ "LICENCE.md": MIT }), "LICENCE.md");
  assert.equal(await named({ "docs/licence.txt": MIT }), "none");
  const many = Array.from({ length: 250 }, (_, at) => commit(String(at).padStart(40, "0"), "alice", "Alice", 1 + at / 10));
  const { host, asked } = fakeHost({ files: { LICENSE: MIT }, commits: many });
  const result = await repositoryFacts(host, "MIT", { now: NOW });
  assert.equal(result.facts.find((found) => found.what === "committers in the last year").value, "1");
  assert.ok(asked.length > 1);
});

// TST-1027005 · level: unit · module: MOD-reuse-facts
// guards: UC-040; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host whose history cannot be read (it fails with Unreachable)
// input: repositoryFacts(host, "MIT", { now })
// expect: the same failure, Unreachable, and no facts
test("repositoryFacts — fails as the host fails", async () => {
  const { host } = fakeHost({ files: { LICENSE: MIT }, commits: COMMITS });
  host.readHistory = async () => { throw Object.assign(new Error("down"), { name: "Unreachable" }); };
  await assert.rejects(repositoryFacts(host, "MIT", { now: NOW }), (error) => error.name === "Unreachable");
});

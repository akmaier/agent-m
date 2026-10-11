// MOD-repository-hosts' adapter for a local clone (ITM-312), as the accepted text of docs/architecture/MOD-repository-hosts.md
// states it: "connect(address, credentials) … With `clone`, files are read and committed in that clone and pushed with the clone's
// own credentials, and every other function uses the REST adapter where a token is given, or throws NotSupported"; "readSnapshot
// … Through a clone, a commit the clone does not hold is first fetched from the clone's origin by its identifier, with the
// clone's own credentials … NotFound then means that the origin does not hold it either"; "commitFiles … through a clone, a
// commit pushed only if the push fast-forwards … Moved"; "Before anything is sent, a file whose text holds a
// configured secret refuses the whole commit with SecretRefused". In Node, through the `git` command.
// Run: node --test tests/repository-hosts-clone.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-006; UC-010; UC-011; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; NO SECRET IN THE REPOSITORY; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// Deterministic, no network: the origin is a bare repository in a temporary folder, the clone a clone of it, another clone —
// the seed — stands for another writer. Each test makes its own, in its own folder, and removes it. The tests give git no
// global configuration, no prompt and no identity but the clone's own. Each test states its input and its expected result
// before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseAddress, connect, HostError } from "../src/repository-hosts/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const ADDRESS = parseAddress("https://github.com/carol/release-tool");
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function write(root, files) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  }
}
// Another writer's commit: the files written in the seed clone, committed, pushed to `branch` of the origin -> the commit.
function land(seed, branch, files, message = "another writer") {
  write(seed, files);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", message);
  git(seed, "push", "-q", "origin", `HEAD:refs/heads/${branch}`);
  return git(seed, "rev-parse", "HEAD");
}

// A bare origin whose `main` holds a README and docs/a.md, a seed clone that wrote them, and the clone the host works in, made
// after them. -> { root, origin, seed, clone, first }.
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "agent-m-clone-"));
  const origin = join(root, "origin.git"), seed = join(root, "seed"), clone = join(root, "clone");
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  git(seed, "config", "user.name", "Seed Writer");
  git(seed, "config", "user.email", "seed@example.org");
  const first = land(seed, "main", { "README.md": "# Release tool\n", "docs/a.md": "Text of a.\n" }, "first");
  git(root, "clone", "-q", origin, clone);
  git(clone, "config", "user.name", "Clone Owner");
  git(clone, "config", "user.email", "clone@example.org");
  return { root, origin, seed, clone, first };
}
async function withFixture(run) {
  const f = fixture();
  try { return await run(f); } finally { rmSync(f.root, { recursive: true, force: true }); }
}

// given: a clone of an origin whose `main` holds README.md and docs/a.md at one commit; a tag v1 on it
// input: connect(address, { clone }).readSnapshot("main"), and the same at the tag and at the commit's identifier
// expect: a snapshot of that commit, its ref as asked, its repository the address, its paths README.md and docs/a.md, the blob
//         SHA of each as git gives it, the text of docs/a.md "Text of a.\n", and null for a path the commit does not hold
test("MOD-repository-hosts clone — a snapshot at a branch, a tag and a commit, with its paths and a file's text", async () => {
  await withFixture(async ({ seed, clone, first }) => {
    git(seed, "tag", "v1");
    git(seed, "push", "-q", "origin", "v1");
    git(clone, "fetch", "-q", "--tags", "origin");
    const host = connect(ADDRESS, { clone });
    for (const ref of ["main", "v1", first]) {
      const snap = await host.readSnapshot(ref);
      assert.deepEqual([snap.commit, snap.ref, snap.repository], [first, ref, ADDRESS], ref);
      assert.deepEqual([...snap.paths].sort(), ["README.md", "docs/a.md"], `${ref}: the paths`);
      assert.equal(snap.blob("docs/a.md"), git(clone, "rev-parse", `${first}:docs/a.md`), `${ref}: the blob SHA`);
      assert.equal(await snap.read("docs/a.md"), "Text of a.\n", `${ref}: the text`);
      assert.equal(await snap.read("docs/none.md"), null, `${ref}: a path the commit does not hold`);
    }
  });
});

// given: a commit another writer pushed to a branch of the origin after the clone was made, so that the clone does not hold it;
//        and an identifier no commit of the origin has
// input: readSnapshot(the commit's identifier); readSnapshot(the other identifier)
// expect: the first a snapshot of that commit with its new file read, fetched from the origin with the clone's own access; the
//         second HostError NotFound — the origin lacks it too
test("MOD-repository-hosts clone — a commit the clone lacks is fetched from the origin, and one the origin lacks is NotFound", async () => {
  await withFixture(async ({ seed, clone }) => {
    const later = land(seed, "topic", { "docs/b.md": "Text of b.\n" }, "on a branch");
    assert.notEqual(spawnSync("git", ["cat-file", "-e", `${later}^{commit}`], { cwd: clone }).status, 0, "known positive: the clone lacks it");
    const host = connect(ADDRESS, { clone });
    const snap = await host.readSnapshot(later);
    assert.equal(snap.commit, later);
    assert.equal(await snap.read("docs/b.md"), "Text of b.\n", "the new file");
    const e = await failure(host.readSnapshot("a".repeat(40)));
    assert.ok(e instanceof HostError, `a HostError, not ${e}`);
    assert.equal(e.name, "NotFound", "the origin lacks it too");
  });
});

// given: the clone, whose snapshot of `main` was read; a change of two files — one new, one changed — at that commit
// input: commitFiles({ branch: "main", expectedHead: that commit, files, message })
// expect: one commit on the origin's `main`, whose parent is the commit it was made on, holding the two files with their texts
//         and the old ones as they were, its message as given; the result { commit: that commit, url: GitHub's page of the commit }
test("MOD-repository-hosts clone — two files committed and pushed in one commit while the origin's branch stands at the expected head", async () => {
  await withFixture(async ({ origin, clone, first }) => {
    const host = connect(ADDRESS, { clone });
    const snap = await host.readSnapshot("main");
    const files = [{ path: "docs/a.md", text: "Text of a, changed.\n" }, { path: "docs/new/c.md", text: "Text of c.\n" }];

    const result = await host.commitFiles({ branch: "main", expectedHead: snap.commit, files, message: "Change two files" });

    assert.equal(git(origin, "rev-parse", "refs/heads/main"), result.commit, "the origin's main is the commit");
    assert.equal(git(origin, "rev-list", "--count", "main"), "2", "one commit more");
    assert.equal(git(origin, "rev-parse", "main^"), first, "made on the expected head");
    assert.equal(git(origin, "show", "main:docs/a.md"), "Text of a, changed.", "the changed file");
    assert.equal(git(origin, "show", "main:docs/new/c.md"), "Text of c.", "the new file");
    assert.equal(git(origin, "show", "main:README.md"), "# Release tool", "the file left alone");
    assert.equal(git(origin, "log", "-1", "--format=%B", "main"), "Change two files", "the message as given");
    assert.equal(result.url, `${ADDRESS.web}/commit/${result.commit}`, "the address of the commit on GitHub");
  });
});

// given: the snapshot of `main` read, then another writer's commit pushed to `main` of the origin
// input: commitFiles({ branch: "main", expectedHead: the commit that was read, files, message })
// expect: HostError Moved naming the head the origin's branch stands at now; the origin's `main` still at the other writer's
//         commit, the new commit on no branch of the origin: nothing pushed
test("MOD-repository-hosts clone — Moved, with nothing pushed, after another commit landed first", async () => {
  await withFixture(async ({ origin, seed, clone }) => {
    const host = connect(ADDRESS, { clone });
    const snap = await host.readSnapshot("main");
    const theirs = land(seed, "main", { "docs/a.md": "Text of a, by another.\n" });
    const refsBefore = git(origin, "for-each-ref");

    const e = await failure(host.commitFiles({ branch: "main", expectedHead: snap.commit,
      files: [{ path: "docs/c.md", text: "Mine.\n" }], message: "Too late" }));

    assert.ok(e instanceof HostError, `a HostError, not ${e}`);
    assert.deepEqual([e.name, e.head], ["Moved", theirs]);
    assert.equal(git(origin, "rev-parse", "main"), theirs, "the origin's main is the other writer's");
    assert.equal(git(origin, "for-each-ref"), refsBefore, "no ref of the origin changed");
    assert.equal(git(origin, "rev-list", "--all", "--count"), "2", "no commit reached the origin");
  });
});

// given: a host connected with the clone and a configured secret; a change whose second file holds that secret
// input: commitFiles(the change)
// expect: HostError SecretRefused naming the second file by its path and not the secret; nothing pushed
test("MOD-repository-hosts clone — a file holding a configured secret is refused by its path, and nothing is pushed", async () => {
  await withFixture(async ({ origin, clone, first }) => {
    const SECRET = "s3cr3t-value-0123456789";
    const host = connect(ADDRESS, { clone, secrets: [SECRET] });
    const e = await failure(host.commitFiles({ branch: "main", expectedHead: first,
      files: [{ path: "docs/ok.md", text: "Fine.\n" }, { path: "config/env.md", text: `key = ${SECRET}\n` }], message: "With a secret" }));
    assert.ok(e instanceof HostError, `a HostError, not ${e}`);
    assert.deepEqual([e.name, e.path], ["SecretRefused", "config/env.md"]);
    assert.ok(!String(e.message).includes(SECRET), "the secret is not in the message");
    assert.equal(git(origin, "rev-parse", "main"), first, "the origin's main is where it was");
  });
});

// given: a host connected with the clone and no token
// input: openPullRequest(…), and, as the other functions that need the server's API, repositoryInfo() and listTags()
// expect: HostError NotSupported from each: the clone has no pull requests, and the REST adapter is used only where a token is given
test("MOD-repository-hosts clone — a pull request through the clone, and the other functions without a token, are NotSupported", async () => {
  await withFixture(async ({ clone }) => {
    const host = connect(ADDRESS, { clone });
    for (const [label, call] of [
      ["openPullRequest", () => host.openPullRequest({ branch: "topic", base: "main", title: "A change", body: "Why." })],
      ["repositoryInfo", () => host.repositoryInfo()],
      ["listTags", () => host.listTags()],
    ]) {
      const e = await failure(call());
      assert.ok(e instanceof HostError, `${label}: a HostError, not ${e}`);
      assert.equal(e.name, "NotSupported", label);
    }
  });
});

// given: a clone whose origin cannot be reached any more — its folder is gone — and an identifier the clone lacks
// input: readSnapshot(that identifier)
// expect: HostError Unreachable giving git's reason, not NotFound: the origin could not be asked, which is not that it lacks the commit
test("MOD-repository-hosts clone — an origin that cannot be reached is Unreachable, not a commit it lacks", async () => {
  await withFixture(async ({ origin, clone }) => {
    rmSync(origin, { recursive: true, force: true });
    const e = await failure(connect(ADDRESS, { clone }).readSnapshot("b".repeat(40)));
    assert.ok(e instanceof HostError, `a HostError, not ${e}`);
    assert.equal(e.name, "Unreachable");
    assert.match(String(e.reason), /\S/, "git's reason is given");
  });
});

// given: the clone, and a change that deletes docs/a.md and writes docs/blob.bin as bytes (0, 255, 1, 128), for a product on GitLab
// input: commitFiles({ branch: "main", expectedHead, files, message })
// expect: the origin's `main` without docs/a.md, with docs/blob.bin holding exactly those four bytes; the result's url GitLab's
//         page of the commit, the server's address followed by /-/commit/ and the commit
test("MOD-repository-hosts clone — a file deleted and a file written as bytes, for a GitLab product", async () => {
  await withFixture(async ({ origin, clone, first }) => {
    const gitlab = parseAddress("https://gitlab.example.org/space/release-tool");
    const result = await connect(gitlab, { clone }).commitFiles({ branch: "main", expectedHead: first,
      files: [{ path: "docs/a.md", delete: true }, { path: "docs/blob.bin", bytes: new Uint8Array([0, 255, 1, 128]) }], message: "Delete and write" });
    assert.equal(git(origin, "ls-tree", "-r", "--name-only", "main").split("\n").sort().join(","), "README.md,docs/blob.bin", "a.md deleted");
    const bytes = spawnSync("git", ["cat-file", "blob", "main:docs/blob.bin"], { cwd: origin }).stdout;
    assert.deepEqual([...bytes], [0, 255, 1, 128], "the bytes as given");
    assert.equal(result.url, `${gitlab.web}/-/commit/${result.commit}`, "GitLab's page of the commit");
  });
});

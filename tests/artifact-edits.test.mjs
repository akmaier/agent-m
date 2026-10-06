// The review layout of a new product (ITM-206, ITM-211) — MOD-artifact-edits' reviewLayoutCommit(host), as docs/architecture/
// MOD-artifact-edits.md states it: the missing parts of the review layout — the README of each of the folders of use cases,
// architecture, approvals and SPEC change queues, a SPEC.md skeleton and a CHANGELOG.md — written into the default branch
// that the host's repositoryInfo names, in one commit without a pull request, whose message names no one; the commit
// returned with its sha and its address as the host's commitFiles returns them, `{ sha, url }`, with the parts written;
// nothing when the layout is complete; a refused write named as the host names it, with nothing written (UC-001 step 5, 5a,
// 5b).
// Run: node --test tests/artifact-edits.test.mjs
//
// Module: MOD-artifact-edits
// Guards: ADDING A PRODUCT CREATES ITS LAYOUT; ONE REVIEW LAYOUT FOR EVERY PRODUCT; UC-001
// Level: unit
//
// The product is a fake host that keeps to MOD-repository-hosts' interface as docs/architecture/MOD-repository-hosts.md
// states it: one repository in memory, whose default branch is `trunk`; repositoryInfo, readSnapshot and commitFiles as the
// interface describes them — a commit of all its files together, made only if the branch still stands at the expected head,
// else `Moved { head }`, answered with `{ commit, url }`, the url the server's own page of the commit —; every other
// function refused with `NotSupported`; every call recorded, and what commitFiles returned. A failure is an error whose name
// is the one the interface gives it, with its fields. Each test states its input and its expected result before it runs.
// The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { reviewLayoutCommit } from "../src/artifact-edits/index.mjs";
import { specSkeleton } from "../src/spec-document/index.mjs";

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool",
  web: "https://github.com/alice/thesis-tool" };
const ON_GITLAB = { server: "gitlab", origin: "https://gitlab.rrze.fau.de", path: "fau-ai-taskforce/tools/thesis-tool",
  web: "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool" };

// The parts of the review layout, as the module file's table names them.
const FOLDERS = ["docs/use-cases/", "docs/architecture/", "docs/approvals/", "docs/spec-freigaben/"];
const LAYOUT = [...FOLDERS.map((f) => `${f}README.md`), "SPEC.md", "CHANGELOG.md"];
// What each folder's paragraph says the folder holds.
const HOLDS = {
  "docs/use-cases/": /\buse cases?\b/i,
  "docs/architecture/": /\b(?:architecture|decisions?)\b/i,
  "docs/approvals/": /\bapproval records?\b/i,
  "docs/spec-freigaben/": /\bchange queues?\b/i,
};

const sorted = (xs) => [...xs].sort();

// A git blob SHA, as a snapshot's blob() gives it from the tree.
const blobSha = (text) => {
  const body = Buffer.from(text, "utf8");
  return createHash("sha1").update(`blob ${body.length}\0`).update(body).digest("hex");
};

// A failure as MOD-repository-hosts names it: an error with the failure's name and its fields.
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name }, fields);

// The fake host. files: the default branch at its head, { path: text }. refuse: a failure commitFiles answers with instead
// of writing. onRead(fake): called once, right after the first snapshot is read — another writer's commit lands there.
function fakeHost({ repository = ON_GITHUB, defaultBranch = "trunk", files = {}, refuse = null, onRead = null } = {}) {
  const calls = [], commits = new Map(), branches = new Map();
  let made = 0;
  const commitOf = (parent, tree, message) => {
    const sha = createHash("sha1").update(`commit ${++made}`).digest("hex");
    commits.set(sha, { parent, tree, message });
    return sha;
  };
  const treeAt = (sha) => commits.get(sha).tree;
  branches.set(defaultBranch, commitOf(null, new Map(Object.entries(files)), "the product as it stands"));

  const fake = {
    calls,
    head: () => branches.get(defaultBranch),
    files: () => Object.fromEntries(treeAt(branches.get(defaultBranch))),
    writes: () => calls.filter((c) => c.fn === "commitFiles"),
    // Another writer's commit on the default branch.
    land(changed, message) {
      const head = branches.get(defaultBranch), tree = new Map(treeAt(head));
      for (const [path, text] of Object.entries(changed)) tree.set(path, text);
      branches.set(defaultBranch, commitOf(head, tree, message));
    },
    host: {
      async repositoryInfo() {
        calls.push({ fn: "repositoryInfo" });
        return { defaultBranch, visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        calls.push({ fn: "readSnapshot", ref });
        const commit = branches.get(ref) ?? (commits.has(ref) ? ref : null);
        if (!commit) throw failure("NotFound", { what: ref });
        const tree = treeAt(commit);
        const snapshot = { repository, ref, commit, paths: sorted(tree.keys()),
          read: async (path) => (tree.has(path) ? tree.get(path) : null),
          blob: (path) => (tree.has(path) ? blobSha(tree.get(path)) : null) };
        if (onRead) { const then = onRead; onRead = null; then(fake); }
        return snapshot;
      },
      async commitFiles(change) {
        const call = { fn: "commitFiles", change: structuredClone(change) };
        calls.push(call);
        if (refuse) throw refuse;
        const head = branches.get(change.branch) ?? null;
        if (head !== change.expectedHead) throw failure("Moved", { head });
        const tree = new Map(treeAt(head));
        for (const f of change.files) {
          if (f.delete) tree.delete(f.path);
          else tree.set(f.path, f.text);
        }
        const commit = commitOf(head, tree, change.message);
        branches.set(change.branch, commit);
        // The server's own page of the commit: GitHub's `…/commit/<sha>`, a GitLab server's `…/-/commit/<sha>`.
        call.returned = { commit, url: `${repository.web}${repository.server === "gitlab" ? "/-" : ""}/commit/${commit}` };
        return { ...call.returned };
      },
      webLinks() {
        calls.push({ fn: "webLinks" });
        throw failure("NotSupported", { what: "webLinks" });
      },
    },
  };
  for (const fn of ["readHistory", "listTags", "createBranch", "openPullRequest", "listPullRequests", "pullRequestFacts",
    "mergePullRequest", "listCiRuns", "startWorkflow", "cancelCiRun", "ciRunLog", "listIssues", "createIssue", "commentOnIssue",
    "setIssueLabels", "setIssueState", "createTag", "listReleaseAssets", "publishRelease", "setPipelineSchedule", "issueCounts"]) {
    fake.host[fn] = async () => { calls.push({ fn }); throw failure("NotSupported", { what: fn }); };
  }
  return fake;
}

// given: a product on GitHub, of the account alice, whose default branch `trunk` holds a README and code, and none of the
//        layout
// input: reviewLayoutCommit(host)
// expect: one commit on `trunk`, on the head that was read, holding every part of the layout — each folder's README a single
//         paragraph saying what the folder holds and that its status is derived from the approval records, SPEC.md the
//         skeleton MOD-spec-document gives this product, CHANGELOG.md its title and nothing else —; the result names that
//         commit by its sha and its page, `https://github.com/alice/thesis-tool/commit/<sha>`, and the six paths; the
//         product's own files unchanged; no branch, no pull request; the message names no one — not alice
test("reviewLayoutCommit — a product without any of the layout gets every part, in one commit on its default branch", async () => {
  const own = { "README.md": "# Thesis tool\n", "src/main.py": "print('thesis')\n" };
  const fake = fakeHost({ files: own });
  const read = fake.head();

  const result = await reviewLayoutCommit(fake.host);

  assert.equal(fake.writes().length, 1, "one commit");
  const { change } = fake.writes()[0];
  assert.equal(change.branch, "trunk", "on the default branch the host names");
  assert.equal(change.expectedHead, read, "on the head that was read");
  assert.deepEqual(sorted(change.files.map((f) => f.path)), sorted(LAYOUT));
  assert.deepEqual(result, { commit: { sha: fake.head(), url: `https://github.com/alice/thesis-tool/commit/${fake.head()}` },
    written: result.written });
  assert.notEqual(result.commit.sha, read);
  assert.deepEqual(sorted(result.written), sorted(LAYOUT));

  const text = Object.fromEntries(change.files.map((f) => [f.path, f.text]));
  for (const folder of FOLDERS) {
    const readme = text[`${folder}README.md`];
    assert.equal(readme.trim().split(/\n[ \t]*\n/).length, 1, `${folder}: one paragraph`);
    assert.doesNotMatch(readme, /^#/m, `${folder}: a paragraph, not a heading`);
    assert.match(readme, HOLDS[folder], `${folder}: says what the folder holds`);
    assert.match(readme, /\bstatus\b[^.]*\bderived from the approval records\b/i, `${folder}: its status comes from the records`);
  }
  assert.equal(text["SPEC.md"], specSkeleton("alice/thesis-tool"));
  assert.match(text["CHANGELOG.md"], /^# [^\n]*\bchangelog\b[^\n]*\n$/i, "CHANGELOG.md: its title and nothing else");

  assert.deepEqual(Object.fromEntries(Object.keys(own).map((p) => [p, fake.files()[p]])), own);
  assert.deepEqual(fake.calls.filter((c) => c.fn === "createBranch" || c.fn === "openPullRequest"), []);
  assert.doesNotMatch(change.message, /\balice\b/, "the commit names no one — not alice, whose account holds the repository");
});

// given: a product on a GitLab server whose default branch holds SPEC.md (its own text), a use case in docs/use-cases/ and a
//        change queue entry in docs/spec-freigaben/ — but no docs/architecture/, no docs/approvals/, no CHANGELOG.md
// input: reviewLayoutCommit(host)
// expect: one commit holding only docs/architecture/README.md, docs/approvals/README.md and CHANGELOG.md; SPEC.md, the use case
//         and the queue entry byte for byte as they were; the result names that commit by its sha and those three paths
test("reviewLayoutCommit — a product with part of the layout gets only the missing parts", async () => {
  const have = {
    "SPEC.md": "# Thesis tool — Specification\n\nOur own preamble.\n\n## Export\n",
    "docs/use-cases/UC-001-export-a-thesis.md": "---\nid: UC-001\ntitle: Export a thesis\n---\n# UC-001 Export a thesis\n",
    "docs/spec-freigaben/2026-10-06_alice/01-export.md": "## Export\n",
  };
  const fake = fakeHost({ repository: ON_GITLAB, files: have });

  const result = await reviewLayoutCommit(fake.host);

  const missing = ["docs/architecture/README.md", "docs/approvals/README.md", "CHANGELOG.md"];
  assert.equal(fake.writes().length, 1, "one commit");
  assert.deepEqual(sorted(fake.writes()[0].change.files.map((f) => f.path)), sorted(missing));
  assert.deepEqual(sorted(result.written), sorted(missing));
  assert.equal(result.commit.sha, fake.head());
  for (const [path, text] of Object.entries(have)) assert.equal(fake.files()[path], text, `${path} as it was`);
});

// given: (1) a product whose default branch holds SPEC.md, CHANGELOG.md and files in each of the four folders, none of them a
//        README; (2) an empty product into which reviewLayoutCommit has just written the layout
// input: reviewLayoutCommit(host)
// expect: { complete: true }; no commit is attempted, and the branch stays at its head
test("reviewLayoutCommit — a product with the complete layout gets no commit", async () => {
  const full = fakeHost({ files: {
    "SPEC.md": "# Thesis tool — Specification\n",
    "CHANGELOG.md": "# Changelog\n",
    "docs/use-cases/UC-001-export-a-thesis.md": "# UC-001 Export a thesis\n",
    "docs/architecture/ARC-001-the-exporter.md": "# ARC-001 The exporter\n",
    "docs/approvals/use-case-UC-001-0123456789ab.md": "kind: use-case\n",
    "docs/spec-freigaben/2026-10-06_alice/index.md": "# Queue\n",
  } });
  const head = full.head();
  assert.deepEqual(await reviewLayoutCommit(full.host), { complete: true });
  assert.equal(full.writes().length, 0, "no commit attempted");
  assert.equal(full.head(), head);

  // Known positive: the same host takes a commit when a part is missing — and after it, the layout is complete.
  const empty = fakeHost({ files: { "README.md": "# Thesis tool\n" } });
  assert.equal((await reviewLayoutCommit(empty.host)).commit.sha, empty.head(), "the layout is written");
  const written = empty.head();
  assert.deepEqual(await reviewLayoutCommit(empty.host), { complete: true });
  assert.equal(empty.writes().length, 1, "no second commit");
  assert.equal(empty.head(), written);
});

// given: a product without the layout, whose write is refused — (1) PermissionMissing: a public repository the token does not
//        reach yet (UC-001 5a); (2) TokenRefused; (3) Moved: another commit lands on the branch after the layout was read
// input: reviewLayoutCommit(host)
// expect: it fails with the host's failure — the same name and the same fields —, and nothing of the layout is on the branch:
//         its files are those it held before, with the other writer's commit in (3)
test("reviewLayoutCommit — a refused write is named as the host names it, and nothing is written", async () => {
  const own = { "README.md": "# Thesis tool\n" };
  const renewal = "https://github.com/settings/personal-access-tokens";
  const cases = [
    { refusal: { name: "PermissionMissing", fields: { permission: "Contents: read and write", renewal } } },
    { refusal: { name: "TokenRefused", fields: { tokenName: "Agent M · alice/agent-m", renewal } } },
    { refusal: { name: "Moved" }, other: { "SPEC.md": "# Thesis tool — Specification\n\nWritten meanwhile.\n" } },
  ];
  for (const { refusal, other } of cases) {
    const fake = other
      ? fakeHost({ files: own, onRead: (f) => f.land(other, "another writer's commit") })
      : fakeHost({ files: own, refuse: failure(refusal.name, refusal.fields) });

    await assert.rejects(reviewLayoutCommit(fake.host), (e) => {
      assert.equal(e.name, refusal.name);
      if (other) assert.equal(e.head, fake.head(), "Moved names the head the branch stands at now");
      else for (const [key, value] of Object.entries(refusal.fields)) assert.equal(e[key], value, `${refusal.name}.${key}`);
      return true;
    });
    assert.equal(fake.writes().length, 1, `${refusal.name}: the write was tried once`);
    assert.deepEqual(fake.files(), { ...own, ...(other ?? {}) }, `${refusal.name}: nothing of the layout written`);
  }
});

// ---------------------------------------------------------------- ITM-211: the commit with its address, the host alone

// given: the function as the module exports it; two products alike, of the account alice, without the layout
// input: reviewLayoutCommit.length; reviewLayoutCommit(host) for the one product, and for the other with a person handed in
//        beside the host, as callers of the old signature did — reviewLayoutCommit(host, "bob")
// expect: one declared parameter, the host; and the two commits alike — the same files, the same message — and the two results
//         alike: nothing beside the host has a part in what is written or returned
test("reviewLayoutCommit — takes the host alone", async () => {
  assert.equal(reviewLayoutCommit.length, 1, "one parameter: the host");
  const own = { "README.md": "# Thesis tool\n" };
  const alone = fakeHost({ files: own }), handed = fakeHost({ files: own });

  const a = await reviewLayoutCommit(alone.host);
  const b = await reviewLayoutCommit(handed.host, "bob");

  assert.deepEqual(handed.writes().map((w) => w.change), alone.writes().map((w) => w.change), "the same commit");
  assert.deepEqual(b, a, "the same result");
});

// given: a product without the layout on GitHub, and one on a GitLab server, whose hosts' commitFiles answer with the commit's
//        sha and its page — GitHub's `…/commit/<sha>`, GitLab's `…/-/commit/<sha>`
// input: reviewLayoutCommit(host)
// expect: { commit: { sha, url }, written } — sha and url exactly those the host's commitFiles returned, and written the paths
//         of that commit
test("reviewLayoutCommit — returns the commit's sha and url as the host's commitFiles returns them, with the parts written", async () => {
  for (const repository of [ON_GITHUB, ON_GITLAB]) {
    const fake = fakeHost({ repository, files: { "README.md": "# Thesis tool\n" } });

    const result = await reviewLayoutCommit(fake.host);

    const [{ change, returned }] = fake.writes();
    assert.deepEqual(result, { commit: { sha: returned.commit, url: returned.url }, written: result.written }, repository.server);
    assert.deepEqual(sorted(result.written), sorted(change.files.map((f) => f.path)), `${repository.server}: the parts written`);
  }
});

// given: a product whose repository is held by the account alice on GitHub, and one of the group fau-ai-taskforce on a GitLab
//        server; a caller that hands a person beside the host, bob, as callers of the old signature did
// input: reviewLayoutCommit(host, "bob") for each
// expect: a message that is not empty and names no one — not the account or group that holds the repository, not bob
test("reviewLayoutCommit — the commit's message names no one", async () => {
  for (const repository of [ON_GITHUB, ON_GITLAB]) {
    const fake = fakeHost({ repository, files: { "README.md": "# Thesis tool\n" } });

    await reviewLayoutCommit(fake.host, "bob");

    const { message } = fake.writes()[0].change;
    assert.notEqual(message.trim(), "", `${repository.server}: a message`);
    for (const name of [repository.path.split("/")[0], "bob"]) {
      assert.doesNotMatch(message, new RegExp(`\\b${name}\\b`), `${repository.server}: the message names ${name}`);
    }
  }
});

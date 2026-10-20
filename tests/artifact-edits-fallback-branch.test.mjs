// The file pages a caller links name the repository's default branch (ITM-1076) — MOD-artifact-edits' fallbackEditLinks(files, snapshot), as docs/architecture/MOD-artifact-edits.md states it: one GitHub page per file, "the editor for an existing
// file, the new-file page for a new one", and `differs` says the file on "the default branch" is no longer what the edit started from; the snapshot a caller hands in is the default branch as it read it. MOD-repository-hosts' `connect` builds
// `webLinks` on the default branch its credentials name, else `main` (ITM-452); the callers hand `fallbackEditLinks` the snapshot they read at `RepositoryInfo`'s `defaultBranch`, so the branch reaches `connect` through the snapshot's `ref`, and the
// function passes it. For UC-006 4b, UC-008 3b and UC-018 4a.
// Run: node --test tests/artifact-edits-fallback-branch.test.mjs
//
// Module: MOD-artifact-edits
// Guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL; UC-006; UC-008; UC-018
// Level: unit
//
// No host and no request: the function is given the snapshot of the default branch as a caller reads it (MOD-repository-hosts' Snapshot: repository, ref, commit, paths). Each test states its input and its expected result before it runs. The
// counter-proofs are run as mutations and recorded in the pull request.
//
// Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - The snapshot's `ref` names the default branch when the caller read the snapshot at it (readSnapshot(defaultBranch)); a `ref` that is a commit (forty hexadecimal digits) names no branch, and the pages are then built on `main`, as connect does
//     for a repository whose default branch it is not told.

import test from "node:test";
import assert from "node:assert/strict";
import { fallbackEditLinks } from "../src/artifact-edits/index.mjs";

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const snapshotAt = (ref) => ({ repository: ON_GITHUB, ref, commit: "c".repeat(40), paths: ["docs/use-cases/UC-041-check-out-a-book.md"], read: async () => null, blob: () => null });
const FILES = [
  { path: "docs/use-cases/UC-041-check-out-a-book.md", text: "# UC-041\n", existing: true },
  { path: "docs/groups/use-cases.md", text: "# Use cases — groups\n", existing: false },
];

// TST-1076001 · level: unit · module: MOD-artifact-edits
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL; UC-018 (4a)
// given: a GitHub repository whose default branch is `master`, and the snapshot a caller read at it (ref `master`); an existing file and a new one
// input: fallbackEditLinks(FILES, snapshot)
// expect: the editor page is https://github.com/alice/thesis-tool/edit/master/docs/use-cases/UC-041-check-out-a-book.md; the new-file page begins https://github.com/alice/thesis-tool/new/master?filename=docs%2Fgroups%2Fuse-cases.md and holds no text; no address names `main`
test("TST-1076001 the pages are built on the repository's default branch, master", () => {
  const links = fallbackEditLinks(FILES, snapshotAt("master"));
  assert.equal(links[0].url, "https://github.com/alice/thesis-tool/edit/master/docs/use-cases/UC-041-check-out-a-book.md");
  assert.equal(links[1].url.startsWith("https://github.com/alice/thesis-tool/new/master?filename=docs%2Fgroups%2Fuse-cases.md"), true, links[1].url);
  for (const { url } of links) assert.equal(url.includes("/main"), false, url);
});

// TST-1076002 · level: unit · module: MOD-artifact-edits
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
// given: the same files, and a snapshot read at `main`, then one whose ref is a commit (forty hexadecimal digits)
// input: fallbackEditLinks for each
// expect: the pages are built on `main` for both (the counter-proof of TST-1076001: the branch comes from the snapshot, and a commit names none)
test("TST-1076002 a default branch called main, and a snapshot at a commit, give pages on main", () => {
  for (const ref of ["main", "a".repeat(40)]) {
    const links = fallbackEditLinks(FILES, snapshotAt(ref));
    assert.equal(links[0].url, "https://github.com/alice/thesis-tool/edit/main/docs/use-cases/UC-041-check-out-a-book.md", ref);
    assert.equal(links[1].url.startsWith("https://github.com/alice/thesis-tool/new/main?filename="), true, ref);
  }
});

// TST-1076003 · level: unit · module: MOD-artifact-edits
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
// given: a default branch with a slash in its name, `release/2026`
// input: fallbackEditLinks(FILES, snapshot at release/2026)
// expect: the editor page names the branch as webLinks writes a branch, https://github.com/alice/thesis-tool/edit/release/2026/docs/use-cases/UC-041-check-out-a-book.md
test("TST-1076003 a default branch with a slash is named as the web links write it", () => {
  const links = fallbackEditLinks(FILES, snapshotAt("release/2026"));
  assert.equal(links[0].url, "https://github.com/alice/thesis-tool/edit/release/2026/docs/use-cases/UC-041-check-out-a-book.md");
});

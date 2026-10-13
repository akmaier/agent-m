// An edited file keeps its identifier (ITM-335) — MOD-artifact-edits' saveFile(host, edit), as docs/architecture/MOD-artifact-edits.md
// states it: "a file whose identifier differs from the one it was opened with is refused (AN EDITED FILE KEEPS ITS IDENTIFIER)",
// the result being { refused: "identifier changed", openedId: string, nowId: string | null }, `Edit` being { path, text, openedBlob,
// openedId, trailers? }. The identifier a saved text declares is read by its kind's schema (MOD-documents: readDocument, with
// artifactSchemaOf giving the schema of a path): the `id` of its front matter, null where it has none, and null for a path of no
// schema, whose identifier the module cannot read. The refusal applies to a file opened with an identifier, one the caller passes
// as openedId — a caller that passes none, or null, saves what it saved before: the settings and process pages, its callers
// today, pass none. Nothing is written when it refuses. For UC-018 3b, 6 and UC-008 3a.
// Run: node --test tests/artifact-edits-identifier.test.mjs
//
// Module: MOD-artifact-edits
// Guards: AN EDITED FILE KEEPS ITS IDENTIFIER; UC-018; UC-008
// Level: unit
//
// The repository server is replaced by a fixture: a fake host that keeps to MOD-repository-hosts' interface as
// docs/architecture/MOD-repository-hosts.md states it — one repository in memory, whose default branch is `trunk`;
// repositoryInfo, readSnapshot and commitFiles as the interface describes them, a commit of all its files made only if the
// branch still stands at the expected head, else `Moved { head }` —; every write recorded. Nothing reaches the network. Each
// test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { saveFile } from "../src/artifact-edits/index.mjs";

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool",
  web: "https://github.com/alice/thesis-tool" };
const README = { "README.md": "# Thesis tool\n" };
const USE_CASE = "docs/use-cases/UC-041-check-out-a-book.md";
const MODULE = "docs/architecture/MOD-lending.md";

// A git blob SHA, as a snapshot's blob() gives it from the tree: the SHA-1 of `blob <length in bytes>`, a zero byte and the bytes.
const blobSha = (text) => {
  const body = Buffer.from(text, "utf8");
  return createHash("sha1").update(`blob ${body.length}\0`).update(body).digest("hex");
};

// A failure as MOD-repository-hosts names it: an error with the failure's name and its fields.
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name }, fields);

// The fake host. files: the default branch `trunk` at its head, { path: text }.
function fakeHost(files) {
  const trees = new Map(), writes = [];
  let made = 0;
  const commitOf = (tree) => {
    const sha = createHash("sha1").update(`commit ${++made}`).digest("hex");
    trees.set(sha, tree);
    return sha;
  };
  let head = commitOf(new Map(Object.entries(files)));
  return {
    writes,
    head: () => head,
    host: {
      async repositoryInfo() {
        return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        if (ref !== "trunk") throw failure("NotFound", { what: ref });
        const commit = head, tree = trees.get(commit);
        return { repository: ON_GITHUB, ref, commit, paths: [...tree.keys()].sort(),
          read: async (path) => tree.get(path) ?? null,
          blob: (path) => (tree.has(path) ? blobSha(tree.get(path)) : null) };
      },
      async commitFiles(change) {
        writes.push(structuredClone(change));
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", { head });
        const tree = new Map(trees.get(head));
        for (const f of change.files) tree.set(f.path, f.text);
        head = commitOf(tree);
        return { commit: head, url: `${ON_GITHUB.web}/commit/${head}` };
      },
    },
  };
}

// A use case and a module file, as the editor opened them; the identifier each declares, and the one sentence a person edits.
const useCase = (id, sentence) => ["---", `id: ${id}`, "title: Check out a book", "area: lending", "actors:", "  - Member",
  "realises:", "  - A LOAN HAS A DUE DATE", "---", `# ${id} Check out a book`, "", "## Actors", "", "- Member", "", "## Precondition", "",
  "- The member holds a valid card.", "", "## Main flow", "", `1. ${sentence}`, "", "## Alternative flows", "",
  "- 1a. The card has expired: the librarian renews it first.", "", "## Postcondition", "", "- The book is on loan to the member.", ""]
  .join("\n");
const moduleFile = (id, sentence) => ["---", `id: ${id}`, "title: Lending", "folder: src/lending/", "realises:", "  - A LOAN HAS A DUE DATE",
  "follows:", "  - ARC-004", "uses:", "provides:", "  - lend", "---", `# ${id} Lending`, "", "## Responsibility", "", sentence, ""]
  .join("\n");

const OPENED_USE_CASE = useCase("UC-041", "The member presents the book at the desk.");
const OPENED_MODULE = moduleFile("MOD-lending", "It records which member holds which book.");

// TST-472029 · level: unit · module: MOD-artifact-edits
// guards: AN EDITED FILE KEEPS ITS IDENTIFIER; UC-018; UC-008
// given: a product on GitHub whose default branch `trunk` holds a README, the use case UC-041 and the module file MOD-lending, each opened by the editor at its blob, with the identifier it declared (openedId); the person saved (1) the use case with `id: UC-042` in its front matter, (2) the module file with `id: MOD-borrowing`, (3) the use case with the `id:` line deleted — whatever else was edited
// input: saveFile(host, { path, text: the edited text, openedBlob: the blob it was opened at, openedId: UC-041 / MOD-lending })
// expect: { refused: "identifier changed", openedId: the identifier it was opened with, nowId: the identifier the text declares — UC-042, MOD-borrowing, null for the text without one }, and nothing written: no commit is attempted, the default branch stays at the head it had
test("saveFile — a use case and a module file saved under another identifier are refused with both identifiers, and nothing is written", async () => {
  for (const [label, path, opened, edited, openedId, nowId] of [
    ["a use case under another identifier", USE_CASE, OPENED_USE_CASE, useCase("UC-042", "The member shows the book at the desk."),
      "UC-041", "UC-042"],
    ["a module file under another identifier", MODULE, OPENED_MODULE, moduleFile("MOD-borrowing", "It records who holds which book."),
      "MOD-lending", "MOD-borrowing"],
    ["a use case without its identifier", USE_CASE, OPENED_USE_CASE,
      useCase("UC-041", "The member shows the book at the desk.").replace("id: UC-041\n", ""), "UC-041", null],
  ]) {
    const fake = fakeHost({ ...README, [path]: opened });
    const before = fake.head();

    const result = await saveFile(fake.host, { path, text: edited, openedBlob: blobSha(opened), openedId });

    assert.deepEqual(result, { refused: "identifier changed", openedId, nowId }, label);
    assert.deepEqual(fake.writes, [], `${label}: nothing written`);
    assert.equal(fake.head(), before, `${label}: the branch stays at its head`);
  }
});

// TST-472030 · level: unit · module: MOD-artifact-edits
// guards: AN EDITED FILE KEEPS ITS IDENTIFIER; UC-018; UC-008
// given: the same product, the same two files opened at their blobs with the identifier each declared; the person edited a sentence and left the identifier as it was
// input: saveFile(host, { path, text: the edited text, openedBlob, openedId: UC-041 / MOD-lending })
// expect: the file saved: one commit on `trunk`, on the head that was read, holding that file alone with the edited text, and the result { commit: the commit commitFiles returned, blob: the git blob SHA of the edited text }
test("saveFile — a use case and a module file saved under the identifier they were opened with are written", async () => {
  for (const [label, path, opened, edited, openedId] of [
    ["a use case", USE_CASE, OPENED_USE_CASE, useCase("UC-041", "The member shows the book at the desk."), "UC-041"],
    ["a module file", MODULE, OPENED_MODULE, moduleFile("MOD-lending", "It records who holds which book."), "MOD-lending"],
  ]) {
    const fake = fakeHost({ ...README, [path]: opened });
    const read = fake.head();

    const result = await saveFile(fake.host, { path, text: edited, openedBlob: blobSha(opened), openedId });

    assert.equal(fake.writes.length, 1, `${label}: one commit`);
    assert.equal(fake.writes[0].expectedHead, read, `${label}: on the head that was read`);
    assert.deepEqual(fake.writes[0].files, [{ path, text: edited }], `${label}: the file alone, with the edited text`);
    assert.deepEqual(result, { commit: fake.head(), blob: blobSha(edited) }, `${label}: the commit and the blob of the text`);
  }
});

// TST-472031 · level: unit · module: MOD-artifact-edits
// guards: AN EDITED FILE KEEPS ITS IDENTIFIER; UC-018; UC-008
// given: the same product, whose `trunk` holds a README and a test file tests/lending.test.mjs, which the editor opened at its blob with the identifier TST-014 — a file of a kind that MOD-documents' schemas do not cover, so that the module cannot read the identifier its text declares; the person edited a line
// input: saveFile(host, { path: the test file, text: the edited text, openedBlob, openedId: "TST-014" })
// expect: { refused: "identifier changed", openedId: "TST-014", nowId: null }, and nothing written: a file that was said to have an identifier, and whose identifier cannot be read, is not saved unchecked
test("saveFile — a file whose identifier the module cannot read is refused when it was opened with one, and nothing is written", async () => {
  const path = "tests/lending.test.mjs";
  const opened = "// TST-014 · level: unit · module: MOD-lending\ntest(\"lend\", () => {});\n";
  const fake = fakeHost({ ...README, [path]: opened });
  const before = fake.head();

  const result = await saveFile(fake.host, { path, text: opened.replace('test("lend"', 'test("lend a book"'), openedBlob: blobSha(opened),
    openedId: "TST-014" });

  assert.deepEqual(result, { refused: "identifier changed", openedId: "TST-014", nowId: null });
  assert.deepEqual(fake.writes, [], "nothing written");
  assert.equal(fake.head(), before, "the branch stays at its head");
});

// TST-472032 · level: unit · module: MOD-artifact-edits
// guards: AN EDITED FILE KEEPS ITS IDENTIFIER; UC-018; UC-008
// given: the product above, and the use case UC-041 opened at its blob by (1) a caller that gives no openedId — the settings and process pages, the callers of saveFile today, give none —, (2) a caller that gives null, a file opened without an identifier; the text saved declares UC-042
// input: saveFile(host, { path: the use case, text: the text with `id: UC-042`, openedBlob }) and the same with openedId: null
// expect: the file saved as before, whatever identifier its text declares: one commit holding it alone, and the result { commit: the commit commitFiles returned, blob: the git blob SHA of the text }
test("saveFile — a caller that gives no openedId, or null, is not asked for the identifier", async () => {
  for (const [label, given] of [["no openedId", {}], ["openedId null", { openedId: null }]]) {
    const fake = fakeHost({ ...README, [USE_CASE]: OPENED_USE_CASE });
    const edited = useCase("UC-042", "The member shows the book at the desk.");

    const result = await saveFile(fake.host, { path: USE_CASE, text: edited, openedBlob: blobSha(OPENED_USE_CASE), ...given });

    assert.equal(fake.writes.length, 1, `${label}: one commit`);
    assert.deepEqual(fake.writes[0].files, [{ path: USE_CASE, text: edited }], `${label}: the file alone, with the text as saved`);
    assert.deepEqual(result, { commit: fake.head(), blob: blobSha(edited) }, `${label}: the commit and the blob of the text`);
  }
});

// Saving a group file (ITM-722) — MOD-artifact-edits' saveGroupFile(host, { kind, text, openedBlob }), as docs/architecture/
// MOD-artifact-edits.md states it: saveFile for the group file docs/groups/<kind>.md, that file and nothing else, in one commit on
// the default branch, only while the file's blob there is still openedBlob (null: created only while it does not exist), and
// refused with `not one place` and the items while an item stands in more than one place (MOD-group-document's parseGroupFile
// and hierarchy). Run: node --test tests/artifact-edits-group-file.test.mjs
//
// Module: MOD-artifact-edits
// Guards: UC-021; A REGROUPING IS COMMITTED DIRECTLY; REGROUPING LEAVES THE GROUPED FILE UNCHANGED; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; AN ITEM HAS ONE PLACE IN ITS HIERARCHY
// Level: unit
//
// The repository server is replaced by a fixture: a fake host that keeps to MOD-repository-hosts' interface — one repository in
// memory, default branch `trunk`; repositoryInfo, readSnapshot and commitFiles, a commit made only if the branch still stands at
// the expected head, else `Moved { head }` —; every write recorded. Nothing reaches the network. The counter-proofs are recorded
// in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as artifactEdits from "../src/artifact-edits/index.mjs";

// A name the module does not provide is undefined here, so that each test fails by itself, not the whole file at once.
const { saveGroupFile } = artifactEdits;

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool",
  web: "https://github.com/alice/thesis-tool" };
const PATH = "docs/groups/use-cases.md";
const FILES = { "README.md": "# Thesis tool\n", "docs/groups/requirements.md": "# Requirements\n\n- Basics\n  - A\n" };

// The group file of the use cases: two groups with UC-006 and UC-008, UC-005 and UC-007; as opened, as edited, as edited with
// UC-006 listed a second time (line 11, first on line 6), and as another writer changed it meanwhile.
const OPENED = "# Use cases\n\n- Review\n  - UC-006\n  - UC-008\n- Derivation\n  - UC-005\n  - UC-007\n";
const EDITED = "# Use cases\n\n- Review\n  - UC-006\n- Derivation\n  - UC-005\n  - UC-007\n  - UC-008\n";
const TWICE = `${EDITED}  - UC-006\n`;
const NEWER = `${OPENED}\n- Extra\n`;

const blobSha = (text) => {
  const body = Buffer.from(text, "utf8");
  return createHash("sha1").update(`blob ${body.length}\0`).update(body).digest("hex");
};
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name }, fields);

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
    land: (changed) => { head = commitOf(new Map([...trees.get(head), ...Object.entries(changed)])); },
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

// TST-722001 · level: unit · module: MOD-artifact-edits
// guards: UC-021; A REGROUPING IS COMMITTED DIRECTLY
// given: a product on GitHub whose `trunk` holds a README and docs/groups/requirements.md, but no docs/groups/use-cases.md; the editor opened the group file of the use cases as a new file, openedBlob null
// input: saveGroupFile(host, { kind: "use-cases", text: the edited group file, openedBlob: null })
// expect: one commit on `trunk`, on the head that was read, holding docs/groups/use-cases.md alone with the edited text, its message not empty; the result { commit: the commit commitFiles returned, blob: the git blob SHA of the edited text }
test("saveGroupFile — a group file opened as new is created in one commit holding only that path", async () => {
  const fake = fakeHost(FILES);
  const read = fake.head();

  const result = await saveGroupFile(fake.host, { kind: "use-cases", text: EDITED, openedBlob: null });

  assert.equal(fake.writes.length, 1, "one commit");
  const [change] = fake.writes;
  assert.equal(change.branch, "trunk", "on the default branch");
  assert.equal(change.expectedHead, read, "on the head that was read");
  assert.deepEqual(change.files, [{ path: PATH, text: EDITED }], "the group file alone");
  assert.match(change.message, /\S/, "a message");
  assert.deepEqual(result, { commit: fake.head(), blob: blobSha(EDITED) });
});

// TST-722002 · level: unit · module: MOD-artifact-edits
// guards: UC-021; A REGROUPING IS COMMITTED DIRECTLY; REGROUPING LEAVES THE GROUPED FILE UNCHANGED
// given: a product whose `trunk` holds a README, docs/groups/requirements.md and docs/groups/use-cases.md, which the editor opened at its blob
// input: saveGroupFile(host, { kind: "use-cases", text: the regrouped file, openedBlob: the blob of the opened text })
// expect: one commit on `trunk` whose files are exactly [docs/groups/use-cases.md with the regrouped text] — no other path —; the result { commit, blob: the blob of the regrouped text }; the other files of the tree are as before
test("saveGroupFile — an existing group file is saved on its blob, with no other path in the commit", async () => {
  const fake = fakeHost({ ...FILES, [PATH]: OPENED });

  const result = await saveGroupFile(fake.host, { kind: "use-cases", text: EDITED, openedBlob: blobSha(OPENED) });

  assert.equal(fake.writes.length, 1, "one commit");
  assert.deepEqual(fake.writes[0].files, [{ path: PATH, text: EDITED }], "the group file alone");
  assert.deepEqual(result, { commit: fake.head(), blob: blobSha(EDITED) });
  const snapshot = await fake.host.readSnapshot("trunk");
  assert.equal(await snapshot.read("docs/groups/requirements.md"), FILES["docs/groups/requirements.md"], "another group file untouched");
  assert.equal(await snapshot.read("README.md"), FILES["README.md"], "the README untouched");
});

// TST-722003 · level: unit · module: MOD-artifact-edits
// guards: UC-021; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
// given: a product whose `trunk` holds docs/groups/use-cases.md, which the editor opened at its blob (1) and another writer's commit changed meanwhile; (2) as a new file, openedBlob null, and another writer's commit created meanwhile
// input: saveGroupFile(host, { kind: "use-cases", text: the edited group file, openedBlob })
// expect: { refused: "changed meanwhile", current: the other writer's text, currentBlob: its git blob SHA }, and nothing written: no commit is attempted
test("saveGroupFile — a changed blob is refused with the newer text, and nothing is written", async () => {
  for (const [label, files, openedBlob] of [
    ["changed meanwhile", { ...FILES, [PATH]: OPENED }, blobSha(OPENED)],
    ["created meanwhile", FILES, null],
  ]) {
    const fake = fakeHost(files);
    fake.land({ [PATH]: NEWER });

    const result = await saveGroupFile(fake.host, { kind: "use-cases", text: EDITED, openedBlob });

    assert.deepEqual(result, { refused: "changed meanwhile", current: NEWER, currentBlob: blobSha(NEWER) }, label);
    assert.deepEqual(fake.writes, [], `${label}: nothing written`);
  }
});

// TST-722004 · level: unit · module: MOD-artifact-edits
// guards: UC-021; AN ITEM HAS ONE PLACE IN ITS HIERARCHY
// given: a product whose `trunk` holds docs/groups/use-cases.md, which the editor opened at its blob; the edited text names UC-006 twice (a known positive first: the same text with UC-006 once is saved)
// input: saveGroupFile(host, { kind: "use-cases", text: the text naming UC-006 twice, openedBlob })
// expect: { refused: "not one place", items: ["UC-006"] } and nothing written; the same text with UC-006 once is committed
test("saveGroupFile — a member placed twice is refused with its items, and nothing is written", async () => {
  const once = await (async () => {
    const fake = fakeHost({ ...FILES, [PATH]: OPENED });
    const result = await saveGroupFile(fake.host, { kind: "use-cases", text: EDITED, openedBlob: blobSha(OPENED) });
    return { result, writes: fake.writes.length };
  })();
  assert.equal(once.writes, 1, "known positive: the text with UC-006 once is committed");
  assert.ok(once.result.commit, "known positive: a commit");

  const fake = fakeHost({ ...FILES, [PATH]: OPENED });
  const result = await saveGroupFile(fake.host, { kind: "use-cases", text: TWICE, openedBlob: blobSha(OPENED) });

  assert.deepEqual(result, { refused: "not one place", items: ["UC-006"] });
  assert.deepEqual(fake.writes, [], "nothing written");
});

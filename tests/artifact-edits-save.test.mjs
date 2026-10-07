// Saving a file a person edited (ITM-219) — MOD-artifact-edits' saveFile(host, edit), as docs/architecture/MOD-artifact-edits.md
// states it, for UC-002 step 9, which saves a product's docs/process.md: the file written in one commit on the default branch
// that the host's repositoryInfo names, on the head that was read, only while that branch holds the blob the file was opened
// on — null for a file that did not exist then, which is created only while it still does not exist —; otherwise nothing
// written, and the text and the blob the branch holds now returned, for the caller to keep the edit beside them.
// Run: node --test tests/artifact-edits-save.test.mjs
//
// Module: MOD-artifact-edits
// Guards: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-002
// Level: unit
//
// Not tested here, since ITM-219 leaves them out: the refusal of a file whose identifier changed, and of a group file whose
// items stand in more than one place.
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
const PROCESS = "docs/process.md";
const README = { "README.md": "# Thesis tool\n" };

// A product's declaration (UC-002): as the editor opened it, as the person edited it, and as another writer changed it meanwhile.
const OPENED = "---\nmodel: scrum\n---\n# How the thesis tool is developed\n\n## Practices\n\n- none\n";
const EDITED = OPENED.replace("- none", "- DevOps");
const NEWER = `${OPENED}\n## Definition of Done\n\nReviewed by a second developer.\n`;

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
    // Another writer's commit on `trunk`, each path set to its text.
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

// given: a product on GitHub, of the account alice, whose default branch `trunk` holds a README and — (1) — its declaration
//        docs/process.md, which the editor opened at its blob; (2) a product without docs/process.md, which the editor opened as
//        a new file, openedBlob null
// input: saveFile(host, { path: "docs/process.md", text: the edited declaration, openedBlob, openedId: null })
// expect: one commit on `trunk`, on the head that was read, holding docs/process.md alone with the edited text, its message not
//         empty and naming no one — not alice —; the result { commit: the commit commitFiles returned, blob: the git blob SHA of
//         the edited text }
test("saveFile — a file saved on the blob it was opened on, in one commit on the default branch", async () => {
  for (const [label, files, openedBlob] of [
    ["opened at its blob", { ...README, [PROCESS]: OPENED }, blobSha(OPENED)],
    ["opened as a new file", README, null],
  ]) {
    const fake = fakeHost(files);
    const read = fake.head();

    const result = await saveFile(fake.host, { path: PROCESS, text: EDITED, openedBlob, openedId: null });

    assert.equal(fake.writes.length, 1, `${label}: one commit`);
    const [change] = fake.writes;
    assert.equal(change.branch, "trunk", `${label}: on the default branch`);
    assert.equal(change.expectedHead, read, `${label}: on the head that was read`);
    assert.deepEqual(change.files, [{ path: PROCESS, text: EDITED }], `${label}: the file alone, with the edited text`);
    assert.match(change.message, /\S/, `${label}: a message`);
    assert.doesNotMatch(change.message, /\balice\b/, `${label}: the message names no one`);
    assert.deepEqual(result, { commit: fake.head(), blob: blobSha(EDITED) }, `${label}: the commit and the blob of the text`);
  }
});

// given: a product whose `trunk` holds a README and — (1) — docs/process.md, which the editor opened at its blob and another
//        writer's commit changed meanwhile; (2) a product without docs/process.md, which the editor opened as a new file,
//        openedBlob null, and another writer's commit created meanwhile
// input: saveFile(host, { path: "docs/process.md", text: the edited declaration, openedBlob, openedId: null })
// expect: { refused: "changed meanwhile", current: the other writer's text, currentBlob: its git blob SHA }, and nothing
//         written: no commit is attempted
test("saveFile — a file that changed meanwhile is refused with its current text, and nothing is written", async () => {
  for (const [label, files, openedBlob] of [
    ["changed meanwhile", { ...README, [PROCESS]: OPENED }, blobSha(OPENED)],
    ["created meanwhile", README, null],
  ]) {
    const fake = fakeHost(files);
    fake.land({ [PROCESS]: NEWER });

    const result = await saveFile(fake.host, { path: PROCESS, text: EDITED, openedBlob, openedId: null });

    assert.deepEqual(result, { refused: "changed meanwhile", current: NEWER, currentBlob: blobSha(NEWER) }, label);
    assert.deepEqual(fake.writes, [], `${label}: nothing written`);
  }
});

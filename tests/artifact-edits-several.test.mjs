// Several files saved in one commit, and a drafted change's identifier kept (ITM-395) — MOD-artifact-edits' saveFile(host, edit |
// edits) and keptIdentifier(text, openedId), as docs/architecture/MOD-artifact-edits.md states them: "Given several edits — the
// files one instruction changed by prompt (UC-019 8b) —, it saves them in one commit, each only on its own openedBlob, or none of
// them, returning the refusal of the first one refused, and else each file's new blob in the order of the edits"; the commit's
// message "ends with trailers — a job's provenance lines when a person saves the draft of a change by prompt (UC-019 step 9),
// none for the person's own edit"; and "keptIdentifier(text, openedId) -> string — the text with its front matter's id set back
// to openedId, every other byte unchanged: a drafted change whose loop left a changed identifier opens in the editor with the
// identifier it was opened with (UC-019 7a). A text whose id is openedId comes back unchanged." Read as: the trailers of the
// edits stand at the end of the message after a blank line, each line once; the blobs come as a list when the edits come as a
// list. For UC-019 steps 7a, 8b, 9, 9a.
// Run: node --test tests/artifact-edits-several.test.mjs
//
// Module: MOD-artifact-edits
// Guards: UC-019; AN EDITED FILE KEEPS ITS IDENTIFIER; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
// Level: unit
//
// The repository server is replaced by a fixture: a fake host that keeps to MOD-repository-hosts' interface as
// docs/architecture/MOD-repository-hosts.md states it — one repository in memory, whose default branch is `trunk`; repositoryInfo,
// readSnapshot and commitFiles as the interface describes them, a commit of all its files made only if the branch still stands at
// the expected head, else `Moved { head }` —; every write recorded; another writer's commit lands with `land`. Nothing reaches
// the network. Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as edits from "../src/artifact-edits/index.mjs";

const { saveFile } = edits;

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool",
  web: "https://github.com/alice/thesis-tool" };
const README = { "README.md": "# Thesis tool\n" };
const FIRST = "docs/use-cases/UC-041-check-out-a-book.md";
const SECOND = "docs/use-cases/UC-042-return-a-book.md";

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

// A use case with its identifier and one sentence; the same use case after one instruction by prompt changed a sentence in it.
const useCase = (id, title, sentence) => ["---", `id: ${id}`, `title: ${title}`, "area: lending", "actors:", "  - Member", "---",
  `# ${id} ${title}`, "", "## Main flow", "", `1. ${sentence}`, ""].join("\n");
const OPENED_FIRST = useCase("UC-041", "Check out a book", "The member presents the book at the desk.");
const OPENED_SECOND = useCase("UC-042", "Return a book", "The member hands the book back at the desk.");
const DRAFT_FIRST = useCase("UC-041", "Check out a book", "The member presents the book and the card at the desk.");
const DRAFT_SECOND = useCase("UC-042", "Return a book", "The member hands the book and the card back at the desk.");
const BRANCH = { ...README, [FIRST]: OPENED_FIRST, [SECOND]: OPENED_SECOND };
const EDITS = [
  { path: FIRST, text: DRAFT_FIRST, openedBlob: blobSha(OPENED_FIRST), openedId: "UC-041" },
  { path: SECOND, text: DRAFT_SECOND, openedBlob: blobSha(OPENED_SECOND), openedId: "UC-042" },
];
// The provenance lines of a job (MOD-job-runner), as git trailers.
const TRAILERS = ["Agent-M-Job: JOB-20261011-1030-a1b2", "Agent-M-Kind: use-cases-change", "Agent-M-Participant: drafter-1"];

// given: a product on GitHub whose default branch `trunk` holds a README and the use cases UC-041 and UC-042, which one
//        instruction by prompt changed, both opened at their blobs with their identifiers; the person saves the drafts
// input: saveFile(host, [the edit of UC-041, the edit of UC-042])
// expect: one commit on `trunk`, on the head that was read, holding the two files with the drafted texts and nothing else, its
//         message not empty and naming no one, and the result { commit: the commit commitFiles returned, blob: [the blob of
//         UC-041's text, the blob of UC-042's text] } in the order of the edits
test("saveFile — two files saved in one commit, each blob returned in the order of the edits", async () => {
  const fake = fakeHost(BRANCH);
  const read = fake.head();

  const result = await saveFile(fake.host, EDITS);

  assert.equal(fake.writes.length, 1, "one commit");
  const [change] = fake.writes;
  assert.equal(change.branch, "trunk");
  assert.equal(change.expectedHead, read, "on the head that was read");
  assert.deepEqual(change.files, [{ path: FIRST, text: DRAFT_FIRST }, { path: SECOND, text: DRAFT_SECOND }], "the two files, nothing else");
  assert.match(change.message, /\S/, "a message");
  assert.doesNotMatch(change.message, /\balice\b/, "the message names no one");
  assert.deepEqual(result, { commit: fake.head(), blob: [blobSha(DRAFT_FIRST), blobSha(DRAFT_SECOND)] });
});

// given: the same two edits, and another writer's commit that changed (1) the second file, (2) the first file, after they were
//        opened
// input: saveFile(host, [the edit of UC-041, the edit of UC-042])
// expect: { refused: "changed meanwhile", current: the other writer's text, currentBlob: its blob } for the file that changed —
//         in (1) the second, in (2) the first —, and nothing written: not the file that did not change either
test("saveFile — one file of two changed meanwhile refuses both, and nothing is written", async () => {
  for (const [label, path] of [["the second file changed", SECOND], ["the first file changed", FIRST]]) {
    const fake = fakeHost(BRANCH);
    const newer = useCase(path === FIRST ? "UC-041" : "UC-042", "Changed by another", "Someone else reworded this.");
    fake.land({ [path]: newer });

    const result = await saveFile(fake.host, EDITS);

    assert.deepEqual(result, { refused: "changed meanwhile", current: newer, currentBlob: blobSha(newer) }, label);
    assert.deepEqual(fake.writes, [], `${label}: nothing written`);
  }
});

// given: the two edits, the second of which declares another identifier than the one UC-042 was opened with
// input: saveFile(host, [the edit of UC-041, the edit of UC-042 under UC-043])
// expect: { refused: "identifier changed", openedId: "UC-042", nowId: "UC-043" }, and nothing written: not UC-041 either
test("saveFile — one file of two under another identifier refuses both, and nothing is written", async () => {
  const fake = fakeHost(BRANCH);
  const result = await saveFile(fake.host, [EDITS[0], { ...EDITS[1], text: useCase("UC-043", "Return a book", "The member hands it back.") }]);
  assert.deepEqual(result, { refused: "identifier changed", openedId: "UC-042", nowId: "UC-043" });
  assert.deepEqual(fake.writes, [], "nothing written");
});

// given: the two edits of the first test, each carrying the job's provenance lines as trailers — and, as the person's own edit,
//        a single edit with none
// input: saveFile(host, edits) with the trailers; saveFile(host, one edit) without
// expect: the message of the commit ends with the three lines, after a blank line, each once though both edits carry them, and
//         the files hold none of them; the person's own edit has a message without any trailer
test("saveFile — the trailers end the commit's message and stand in no file", async () => {
  const fake = fakeHost(BRANCH);
  await saveFile(fake.host, EDITS.map((e) => ({ ...e, trailers: TRAILERS })));
  const [change] = fake.writes;
  assert.ok(change.message.endsWith(`\n\n${TRAILERS.join("\n")}`), `the trailers end the message: ${JSON.stringify(change.message)}`);
  assert.equal(change.message.split("\n").filter((l) => TRAILERS.includes(l)).length, 3, "each line once");
  for (const f of change.files) assert.ok(!TRAILERS.some((t) => f.text.includes(t)), `${f.path}: no trailer in the file`);

  const own = fakeHost(BRANCH);
  await saveFile(own.host, EDITS[0]);
  assert.ok(!own.writes[0].message.includes("Agent-M-"), "the person's own edit carries no trailer");
});

// given: a single edit, as the callers of today give it
// input: saveFile(host, { path, text, openedBlob, openedId })
// expect: as before: one commit holding the file alone, the message "edit UC-041-check-out-a-book.md (Agent M dashboard)", and
//         the result { commit, blob: the blob of the text } with one blob, not a list
test("saveFile — a single edit is saved as before", async () => {
  const fake = fakeHost(BRANCH);
  const result = await saveFile(fake.host, EDITS[0]);
  assert.equal(fake.writes[0].message, "edit UC-041-check-out-a-book.md (Agent M dashboard)");
  assert.deepEqual(fake.writes[0].files, [{ path: FIRST, text: DRAFT_FIRST }]);
  assert.deepEqual(result, { commit: fake.head(), blob: blobSha(DRAFT_FIRST) });
});

// given: a drafted use case opened as UC-041 whose loop left `id: UC-099` in the front matter; its body holds a line
//        `id: UC-099` of its own, trailing spaces, and a text with Windows line ends; and, as the known positive, a text whose id
//        is the one it was opened with
// input: keptIdentifier(text, "UC-041")
// expect: the text with the front matter's id line `id: UC-041` and every other byte as it was — the body's line included; the
//         text whose id is UC-041 comes back as it is
test("keptIdentifier — a changed id is set back to the one the file was opened with, every other byte unchanged", () => {
  const { keptIdentifier } = edits;
  const drafted = (id, eol = "\n") => ["---", `id: ${id}`, "title: Check out a book  ", "---", "# UC-099 Check out a book", "",
    "A line that looks like a field:", "id: UC-099", ""].join(eol);
  assert.equal(keptIdentifier(drafted("UC-099"), "UC-041"), drafted("UC-041"), "the front matter's id restored, the body's line left");
  assert.equal(keptIdentifier(drafted("UC-099", "\r\n"), "UC-041"), drafted("UC-041", "\r\n"), "Windows line ends kept");
  const kept = drafted("UC-041");
  assert.equal(keptIdentifier(kept, "UC-041"), kept, "a kept id comes back unchanged");
});

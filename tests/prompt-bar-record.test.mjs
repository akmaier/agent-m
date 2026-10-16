// The recording switch and the conversation record (ITM-503) — MOD-prompt-bar's recordingSchema and recordingOf, and record.mjs's
// appending of a conversation to its record, as the accepted text of docs/architecture/MOD-prompt-bar.md states them (Data: the
// recording switch and the conversation record; Interfaces: recordingSchema, recordingOf, and startPromptBar's recording).
// Run: node --test tests/prompt-bar-record.test.mjs
//
// Module: MOD-prompt-bar
// Guards: UC-049; UC-042; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD
// Guards: A RECORD IS EVIDENCE, NOT A PROPOSAL; NO SECRET IN THE REPOSITORY; NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
// Level: unit
//
// The module file names no function that appends to the record; record.mjs gives `conversationPath(at, hex)` and
// `appendToConversation(host, conversation, entry)`, which these tests call directly (the gap is named in the pull request). The
// conversation is { path, startedBy }; an entry is { at, who, page, model?, text, withheld? } for a message — `withheld` the
// reason the page's subject withholds it with — or { at, job } for a job handed over. The repository server is replaced by a fixture:
// a fake host keeping to MOD-repository-hosts' interface — one repository in memory whose default branch is `trunk`;
// repositoryInfo, readSnapshot and commitFiles, a commit made only if the branch still stands at the expected head, else
// `Moved { head }` —, every commit attempt recorded, a hook that lets another writer's commit land just before the first attempt,
// and a refusal for a stored secret raised by a function of the commit. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import * as bar from "../src/prompt-bar/index.mjs";
import * as record from "../src/prompt-bar/record.mjs";
import { documentFindings, loadSchema, readDocument } from "../src/documents/index.mjs";

const { recordingOf, recordingSchema } = bar;
const { conversationPath, appendToConversation } = record;
const SWITCH = "docs/conversation-recording.md";

// A snapshot of an instance holding the given files.
const snapshotOf = (files) => ({ paths: Object.keys(files), read: async (path) => files[path] ?? null, blob: () => null });

// TST-600001 · level: unit · module: MOD-prompt-bar
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; UC-042
// given: instances holding docs/conversation-recording.md with `recording: on`, with `recording: off`, with front matter and no recording key, and no such file at all
// input: recordingOf(snapshot) for each
// expect: true for the first; false for the other three
test("recordingOf — on is true; off, a missing key and a missing file are false", async () => {
  const file = (front) => `---\n${front}---\n# Recording of conversations\n`;
  assert.equal(await recordingOf(snapshotOf({ [SWITCH]: file("recording: on\n") })), true);
  assert.equal(await recordingOf(snapshotOf({ [SWITCH]: file("recording: off\n") })), false);
  assert.equal(await recordingOf(snapshotOf({ [SWITCH]: file("note: x\n") })), false);
  assert.equal(await recordingOf(snapshotOf({ "README.md": "# Instance\n" })), false);
});

// TST-600002 · level: unit · module: MOD-prompt-bar
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; UC-042
// given: nothing
// input: recordingSchema()
// expect: a schema of MOD-documents' language named `recording`, for the path docs/conversation-recording.md, whose one front matter key is `recording`, an enum of `on` and `off`; a switch file with `recording: on` reads with it and has no finding
test("recordingSchema — the schema of the switch, for the settings page's form", () => {
  const schema = recordingSchema();
  assert.equal(schema.schema, "recording");
  assert.equal(schema.path, SWITCH);
  assert.deepEqual(Object.keys(schema.frontMatter), ["recording"]);
  assert.deepEqual(schema.frontMatter.recording.values, ["on", "off"]);
  const text = "---\nrecording: on\n---\n# Recording of conversations\n";
  assert.deepEqual(documentFindings(schema, readDocument(schema, SWITCH, text)), []);
});

// ---------------------------------------------------------------- the fixture host

const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name }, fields);
const sha = (n) => createHash("sha1").update(`commit ${n}`).digest("hex");

// files: the default branch `trunk` at its head, { path: text }. beforeFirstCommit(fake): called once as the first attempt
// arrives. refuse(change): an error to throw for that attempt, or null.
function fakeHost({ files, beforeFirstCommit = null, refuse = () => null }) {
  const commits = new Map(), attempts = [];
  let made = 0, head = null, hook = beforeFirstCommit;
  const commitOf = (tree) => { const id = sha(++made); commits.set(id, tree); return id; };
  head = commitOf(new Map(Object.entries(files)));
  const fake = {
    attempts,
    head: () => head,
    treeAt: (id) => commits.get(id),
    land(changes) {
      const tree = new Map(commits.get(head));
      for (const [path, text] of Object.entries(changes)) tree.set(path, text);
      head = commitOf(tree);
    },
    host: {
      async repositoryInfo() {
        return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        const id = ref === "trunk" ? head : ref;
        if (!commits.has(id)) throw failure("NotFound", { what: ref });
        const tree = commits.get(id);
        return { ref, commit: id, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
          blob: () => null };
      },
      async commitFiles(change) {
        attempts.push(structuredClone(change));
        if (attempts.length > 10) throw new Error("the host is asked again and again");
        if (hook) { const then = hook; hook = null; then(fake); }
        const refused = refuse(change);
        if (refused) throw refused;
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", { head });
        head = commitOf(new Map([...commits.get(head), ...change.files.map((file) => [file.path, file.text])]));
        return { commit: head, url: `https://github.com/alice/product/commit/${head}` };
      },
    },
  };
  return fake;
}

const SCHEMA_FILE = new URL("../src/prompt-bar/conversation.schema.md", import.meta.url);
const conversationSchema = () => loadSchema(readFileSync(SCHEMA_FILE, "utf8"), "MOD-prompt-bar");
const T = (hhmm) => new Date(`2026-10-07T${hhmm.slice(0, 2)}:${hhmm.slice(2)}:30Z`);
const PATH = conversationPath(T("0900"), "a1b2");
const MESSAGES = [
  { at: T("0900"), who: "alice", page: "The main page", text: "Please shorten the introduction." },
  { at: T("0901"), who: "alice", page: "Mail MAIL-17", text: "Reply to Dana Example, dana@example.org, about the visit.",
    withheld: "the page is a mail and the text holds an address" },
  { at: T("0902"), who: "drafter-a", page: "The main page", model: "example-model", text: "I shortened it to two sentences." },
];
const CONVERSATION = { path: PATH, startedBy: "alice" };

// TST-600003 · level: unit · module: MOD-prompt-bar
// guards: A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD; A RECORD IS EVIDENCE, NOT A PROPOSAL; NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY; UC-049; UC-042
// given: an empty fixture repository, a conversation path docs/conversations/20261007-0900-a1b2.md, and three messages — the person's, one of them withheld by its page because it holds an address, and the participant's answer — and then a job handed over
// input: appendToConversation(host, conversation, entry) for each entry in turn
// expect: conversationPath gives the path from the first message's UTC date and time and the four digits; after the three messages one file under docs/conversations/ exists and no other file was written; each append is its own commit on the head the one before made, and the file after each begins with the whole file before it; its front matter holds started and started_by; the sections read `## 2026-10-07 09:00 UTC — alice`, with `page:`, then the text as written, for the participant `model:` too, and for the withheld one `withheld:` with the reason and none of its text anywhere in any commit; then `## 2026-10-07 09:03 UTC — handed over` with `job:`; the schema finds nothing wrong with it
test("appendToConversation — three messages, one withheld, one record, each append its own commit and nothing earlier changed", async () => {
  assert.equal(PATH, "docs/conversations/20261007-0900-a1b2.md");
  const fake = fakeHost({ files: { "README.md": "# Product\n" } });
  const heads = [fake.head()], texts = [];
  for (const entry of [...MESSAGES, { at: T("0903"), job: "JOB-20261007-0903-beef" }]) {
    const { commit } = await appendToConversation(fake.host, CONVERSATION, entry);
    assert.notEqual(commit, heads.at(-1));
    heads.push(commit);
    assert.equal(fake.head(), commit);
    texts.push(fake.treeAt(commit).get(PATH));
  }
  assert.equal(fake.attempts.length, 4, "one commit per append");
  fake.attempts.forEach((attempt, i) => {
    assert.equal(attempt.expectedHead, heads[i]);
    assert.equal(attempt.branch, "trunk");
    assert.deepEqual(attempt.files.map((file) => file.path), [PATH]);
  });
  assert.deepEqual([...fake.treeAt(fake.head()).keys()].sort(), ["README.md", PATH]);
  texts.slice(1).forEach((text, i) => assert.ok(text.startsWith(texts[i]) && text.length > texts[i].length, `append ${i + 2} keeps the bytes before it`));

  const text = texts.at(-1);
  assert.match(text, /^---\nstarted: 2026-10-07 09:00 UTC\nstarted_by: alice\n---\n/);
  assert.match(text, /## 2026-10-07 09:00 UTC — alice\npage: The main page\n\nPlease shorten the introduction\./);
  assert.match(text, /## 2026-10-07 09:01 UTC — alice\npage: Mail MAIL-17\nwithheld: the page is a mail and the text holds an address\n/);
  assert.match(text, /## 2026-10-07 09:02 UTC — drafter-a\npage: The main page\nmodel: example-model\n\nI shortened it to two sentences\./);
  assert.match(text, /## 2026-10-07 09:03 UTC — handed over\njob: JOB-20261007-0903-beef\n/);
  for (const commit of heads) for (const [, content] of fake.treeAt(commit)) assert.ok(!/Dana|dana@example/.test(content));
  for (const attempt of fake.attempts) assert.ok(!/Dana|dana@example/.test(attempt.message));
  const schema = conversationSchema();
  assert.deepEqual(documentFindings(schema, readDocument(schema, PATH, text)), []);
});

// TST-600004 · level: unit · module: MOD-prompt-bar
// guards: A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD; A RECORD IS EVIDENCE, NOT A PROPOSAL; UC-049
// given: a repository whose record holds the first message, and another writer's commit on the default branch that lands, changing README.md, just as the next append is first tried
// input: appendToConversation(host, conversation, the participant's answer)
// expect: the host answers Moved with the new head; the module reads the record again at that head and commits on it — two attempts, the second with expectedHead the new head — and the other writer's README.md change stands beside the record, which holds the answer once, the text before it byte for byte as before
test("appendToConversation — a moved head is read again and the message appended on the new head", async () => {
  const first = fakeHost({ files: { "README.md": "# Product\n" } });
  await appendToConversation(first.host, CONVERSATION, MESSAGES[0]);
  const before = first.treeAt(first.head()).get(PATH);
  let landed = null;
  const moving = fakeHost({ files: { "README.md": "# Product\n", [PATH]: before },
    beforeFirstCommit: (f) => { f.land({ "README.md": "# Product, changed\n" }); landed = f.head(); } });
  const { commit } = await appendToConversation(moving.host, CONVERSATION, MESSAGES[2]);
  assert.equal(moving.attempts.length, 2);
  assert.equal(moving.attempts[1].expectedHead, landed);
  assert.equal(moving.head(), commit);
  const tree = moving.treeAt(commit);
  assert.equal(tree.get("README.md"), "# Product, changed\n");
  assert.ok(tree.get(PATH).startsWith(before));
  assert.equal(tree.get(PATH).split("I shortened it to two sentences.").length, 2);
});

// TST-600005 · level: unit · module: MOD-prompt-bar
// guards: NO SECRET IN THE REPOSITORY; A RECORDED CONVERSATION IS KEPT WHERE IT WAS HELD; UC-049
// given: a repository whose host refuses with SecretRefused any commit whose file holds the text `sk-test-0123456789`, and a message of the person that holds it
// input: appendToConversation(host, conversation, that message)
// expect: the first attempt, with the text, is refused; the second attempt appends the same message as withheld — a section with `page:` and `withheld:` naming that the host refused the text for a stored secret, and none of the secret — and is committed; the result names the reason; the record holds no `sk-test-0123456789` and no commit message does
test("appendToConversation — a refusal for a stored secret appends the message as withheld", async () => {
  const SECRET = "sk-test-0123456789";
  const refuse = (change) => (change.files.some((file) => file.text.includes(SECRET)) ? failure("SecretRefused", { path: PATH }) : null);
  const fake = fakeHost({ files: { "README.md": "# Product\n" }, refuse });
  const result = await appendToConversation(fake.host, CONVERSATION,
    { at: T("0900"), who: "alice", page: "The main page", text: `Use the key ${SECRET} for the endpoint.` });
  assert.equal(fake.attempts.length, 2);
  assert.ok(fake.attempts[0].files[0].text.includes(SECRET));
  const text = fake.treeAt(fake.head()).get(PATH);
  assert.match(text, /## 2026-10-07 09:00 UTC — alice\npage: The main page\nwithheld: .*secret/i);
  assert.ok(!text.includes(SECRET));
  assert.ok(!fake.attempts[1].message.includes(SECRET));
  assert.match(result.withheld, /secret/i);
  assert.equal(result.commit, fake.head());
});

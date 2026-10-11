// Accepting the files that were shown (ITM-333) — MOD-approvals' acceptShown, acceptanceBlockers and fallbackAcceptLink, as the
// accepted text of docs/architecture/MOD-approvals.md states them (UC-008 steps 3 to 5, 3b to 3e and 4a; UC-006 4b): every file
// that was shown is accepted in one commit, made with the person's token on the head that was read, with one record per file
// naming the blob that was shown; a file whose blob on the head differs, or that rests on a requirement or use case that is not
// accepted, gets no record and is named with the reason; without a token GitHub's new-file page is prefilled with the record's
// path and the record and nothing else, and for a GitLab product there is none. statusOf and lastAcceptedText (ITM-334),
// approvalStrategies (ITM-332) and the records of SPEC entries (MOD-spec-changes) are not part of this item.
// Run: node --test tests/approvals-accept.test.mjs
//
// Module: MOD-approvals
// Guards: UC-008; UC-006
// Guards: AN APPROVAL NAMES THE EXACT TEXT; ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; SEVERAL FILES ARE ACCEPTED IN ONE CLICK
// Guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; THE GATE IS RECORDED
// Guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
// Level: unit
//
// The repository server is replaced by a fixture: a fake host that keeps to MOD-repository-hosts' interface as docs/architecture/
// MOD-repository-hosts.md states it — one repository in memory, whose default branch is `trunk`; repositoryInfo, readSnapshot and
// commitFiles as the interface describes them, a commit of all its files together made only if the branch still stands at the
// expected head, else `Moved { head }` —; every call recorded. Its other functions do not exist, so that a call the module has no
// business making fails by itself. A failure is an error whose name is the one the interface gives it, with its fields. The
// product is the small repository this file holds: a SPEC of two requirements; a change queue holding a third, still open; four
// use cases, UC-001 accepted, UC-002 open, UC-003 changed and UC-004 open and realising the open requirement; two architecture
// decisions; a module file; and the approval records. The module file does not say in what order `recorded`, `leftOut` and the
// names stand, what `names` holds for a file that changed, what the commit's message says, or what NothingToAccept carries:
// this file reads the files in the order they were shown, the names in the order the reviewed file names them, `names` empty
// for a file that changed, a message that names the person and the files accepted, and the list `leftOut` on the error. A name
// the module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once. Nothing
// reaches the network. Each test states its input and its expected result before it runs. The counter-proofs are recorded in
// the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as approvalsModule from "../src/approvals/index.mjs";
import { readDocument } from "../src/documents/index.mjs";

const { acceptShown, acceptanceBlockers, fallbackAcceptLink, approvalSchema, statuses } = approvalsModule;

// ---------------------------------------------------------------- the product

const text = (...lines) => `${lines.join("\n")}\n`;
// The blob SHA git gives a text, as MOD-repository-hosts' snapshot gives a file's.
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
const ON_GITLAB = { server: "gitlab", origin: "https://gitlab.example.org", path: "team/product",
  web: "https://gitlab.example.org/team/product" };

const SPEC = text("# Fixture product — Specification", "", "## Section", "",
  "**A SAMPLE RULE** *(Product Owner)*", "A sample rule that a use case realises.", "*Check:* `tests/sample.test.mjs`", "",
  "**ANOTHER SAMPLE RULE** *(Product Owner)*", "Another rule that two use cases realise.", "*Check:* `tests/another.test.mjs`");
// A requirement that stands only in an open queue: it is in no SPEC section yet.
const QUEUE = "docs/spec-freigaben/2026-10-01_fixture";
const QUEUE_INDEX = text("# SPEC approvals — queue 2026-10-01 · a proposed rule", "", "| Nr | Datei | Anker |", "|---|---|---|",
  "| 01 | `SPEC.md` | ## Section |");
const PROPOSAL = text("**A PROPOSED RULE** *(Product Owner)*", "A rule that waits in an open queue.",
  "*Check:* `tests/proposed.test.mjs`");

const useCase = (id, title, realises, sentence) => text("---", `id: ${id}`, `title: ${title}`, "area: files", "actors:",
  "  - Reader", "realises:", ...realises.map((name) => `  - ${name}`), "---", `# ${id} ${title}`, "", `**Goal.** ${sentence}`);
const UC1_PATH = "docs/use-cases/UC-001-read-a-file.md";
const UC1 = useCase("UC-001", "Read a file", ["A SAMPLE RULE"], "The reader opens a file and reads it.");
const UC2_PATH = "docs/use-cases/UC-002-write-a-file.md";
const UC2 = useCase("UC-002", "Write a file", ["A SAMPLE RULE", "ANOTHER SAMPLE RULE"], "The reader writes a file and saves it.");
const UC3_PATH = "docs/use-cases/UC-003-delete-a-file.md";
const UC3 = useCase("UC-003", "Delete a file", ["ANOTHER SAMPLE RULE"], "The reader deletes a file for good.");
const UC3_EARLIER = useCase("UC-003", "Remove a file", ["ANOTHER SAMPLE RULE"], "The reader removes a file for now.");
const UC3_EDITED = useCase("UC-003", "Delete a file", ["ANOTHER SAMPLE RULE"], "The reader deletes a file and cannot get it back.");
const UC4_PATH = "docs/use-cases/UC-004-share-a-file.md";
const UC4 = useCase("UC-004", "Share a file", ["A PROPOSED RULE"], "The reader shares a file with a colleague.");

const decision = (id, title, forcedBy) => text("---", `id: ${id}`, `title: ${title}`, "forced_by:",
  ...forcedBy.map((name) => `  - ${name}`), "---", `# ${id} ${title}`);
const ARC1_PATH = "docs/architecture/ARC-001-reading-files.md";
const ARC1 = decision("ARC-001", "Reading files", ["UC-001", "A SAMPLE RULE"]);
// Forced by an accepted use case and an accepted requirement, and by what is not accepted: UC-002 is open, A PROPOSED RULE
// stands in an open queue, UC-003 is changed and UC-099 is no use case of the product.
const ARC2_PATH = "docs/architecture/ARC-002-writing-files.md";
const ARC2 = decision("ARC-002", "Writing files",
  ["UC-001", "UC-002", "A PROPOSED RULE", "UC-003", "UC-099", "A SAMPLE RULE"]);

// A module file, which realises one requirement that is accepted and one that is not.
const MOD_PATH = "docs/architecture/MOD-sample.md";
const MODULE = text("---", "id: MOD-sample", "title: Sample", "folder: src/sample/", "realises:", "  - A SAMPLE RULE",
  "  - A PROPOSED RULE", "follows:", "  - ARC-001", "---", "# MOD-sample Sample");

const recordOf = (id, kind, file, body) => [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`,
  text(`kind: ${kind}`, `file: ${file}`, `blob: ${blobOf(body)}`)];
const UC3_EARLIER_RECORD = recordOf("UC-003", "use-case", UC3_PATH, UC3_EARLIER)[0];
const PRODUCT = { "README.md": "# Fixture product\n", "SPEC.md": SPEC, [`${QUEUE}/index.md`]: QUEUE_INDEX,
  [`${QUEUE}/01-a-proposed-rule.md`]: PROPOSAL, [UC1_PATH]: UC1, [UC2_PATH]: UC2, [UC3_PATH]: UC3, [UC4_PATH]: UC4,
  [ARC1_PATH]: ARC1, [ARC2_PATH]: ARC2, [MOD_PATH]: MODULE, ...Object.fromEntries([recordOf("UC-001", "use-case", UC1_PATH, UC1),
    recordOf("UC-003", "use-case", UC3_PATH, UC3_EARLIER)]) };

// What a page shows of a file: its path and the blob of the text it rendered.
const shownOf = (path, body) => ({ path, blob: blobOf(body) });
// The path of the record that accepts a text.
const recordPath = (id, body) => `docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`;
const NOT_ACCEPTED = "rests on what is not accepted";

// ---------------------------------------------------------------- the fake host

// A failure as MOD-repository-hosts names it: an error with the failure's name and its fields.
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name }, fields);

// The fake host. files: the default branch `trunk` at its head, { path: text }. refuse: a failure commitFiles answers with instead
// of writing. onRead(fake): called once, right after the first snapshot is read — another writer's commit lands there.
function fakeHost({ files, refuse = null, onRead = null }) {
  const calls = [], commits = new Map();
  let made = 0, head = null, hook = onRead;
  const commitOf = (tree) => {
    const sha = createHash("sha1").update(`commit ${++made}`).digest("hex");
    commits.set(sha, tree);
    return sha;
  };
  head = commitOf(new Map(Object.entries(files)));
  const fake = {
    head: () => head,
    files: () => Object.fromEntries(commits.get(head)),
    writes: () => calls.filter((call) => call.fn === "commitFiles"),
    // Another writer's commit on `trunk`: each path of `changed` set to its text, each path of `removed` gone.
    land(changed, removed = []) {
      const tree = new Map([...commits.get(head), ...Object.entries(changed)]);
      for (const path of removed) tree.delete(path);
      head = commitOf(tree);
    },
    host: {
      async repositoryInfo() {
        calls.push({ fn: "repositoryInfo" });
        return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        calls.push({ fn: "readSnapshot", ref });
        if (ref !== "trunk") throw failure("NotFound", { what: ref });
        const commit = head, tree = commits.get(commit);
        const snapshot = { repository: ON_GITHUB, ref, commit, paths: [...tree.keys()].sort(),
          read: async (path) => (tree.has(path) ? tree.get(path) : null),
          blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) };
        if (hook) { const then = hook; hook = null; then(fake); }
        return snapshot;
      },
      async commitFiles(change) {
        calls.push({ fn: "commitFiles", change: structuredClone(change) });
        if (refuse) throw refuse;
        if (!change.files.length) throw new TypeError("a change holds at least one file");
        if (new Set(change.files.map((file) => file.path)).size !== change.files.length) throw new TypeError("a change names a path twice");
        if (change.files.some((file) => typeof file.text !== "string")) throw new TypeError("a file is written as text");
        if (!/\S/.test(change.message)) throw new TypeError("a change has a message");
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", { head });
        head = commitOf(new Map([...commits.get(head), ...change.files.map((file) => [file.path, file.text])]));
        return { commit: head, url: `${ON_GITHUB.web}/commit/${head}` };
      },
    },
  };
  return fake;
}

// The fields of a record, as MOD-documents reads it by the record's schema.
const fieldsOf = (path, body) => readDocument(approvalSchema, path, body).fields;

// ---------------------------------------------------------------- accepting what was shown

// guards: SEVERAL FILES ARE ACCEPTED IN ONE CLICK; ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; AN APPROVAL NAMES THE EXACT TEXT;
//         THE GATE IS RECORDED; UC-008
// given: the product above, on GitHub, of the account alice, whose default branch `trunk` holds UC-001 (accepted), UC-002 (open)
//        and UC-003 (changed), and the person bob, who was shown UC-002 and UC-003 as they stand
// input: acceptShown(host, the two files with the blobs shown, "bob")
// expect: one commit on `trunk`, on the head that was read, that holds the two records and nothing else — each at
//         docs/approvals/<id>-<the first twelve digits of its blob>.md and of three lines, kind use-case, the use case's path and
//         the 40-digit blob shown —; its message names bob, who accepted, and UC-002 and UC-003, what he accepted; the result is
//         { commit: that commit, recorded: the two paths in the order shown, leftOut: [] }; the use cases themselves are
//         unchanged, and the head's statuses give both accepted
test("acceptShown — two use cases shown are accepted in one commit, one record each naming the blob that was shown", async () => {
  const fake = fakeHost({ files: PRODUCT });
  const read = fake.head();

  const result = await acceptShown(fake.host, [shownOf(UC2_PATH, UC2), shownOf(UC3_PATH, UC3)], "bob");

  assert.equal(fake.writes().length, 1, "one commit for both files");
  const { change } = fake.writes()[0];
  assert.equal(change.branch, "trunk", "on the default branch the host names");
  assert.equal(change.expectedHead, read, "on the head that was read");
  assert.deepEqual(change.files.map((file) => file.path), [recordPath("UC-002", UC2), recordPath("UC-003", UC3)],
    "the two records and no other file");
  change.files.forEach((file, at) => {
    const [path, body] = [[UC2_PATH, UC2], [UC3_PATH, UC3]][at];
    assert.deepEqual(fieldsOf(file.path, file.text), { kind: "use-case", file: path, blob: blobOf(body) }, file.path);
    assert.equal(file.text.trimEnd().split("\n").length, 3, `${file.path} is a record of three lines`);
  });
  assert.match(change.message, /\bbob\b/, "the commit names who accepted");
  assert.ok(change.message.includes("UC-002") && change.message.includes("UC-003"), `and what: ${change.message}`);
  assert.deepEqual(result, { commit: fake.head(), recorded: [UC2_PATH, UC3_PATH], leftOut: [] });
  assert.deepEqual(fake.files(), { ...PRODUCT, ...Object.fromEntries(change.files.map((file) => [file.path, file.text])) },
    "records are added and nothing else changes");
  const after = statuses(await fake.host.readSnapshot("trunk"));
  assert.deepEqual([UC2_PATH, UC3_PATH].map((path) => after.get(path).status), ["accepted", "accepted"]);
});

// guards: SEVERAL FILES ARE ACCEPTED IN ONE CLICK; AN APPROVAL NAMES THE EXACT TEXT; UC-008
// given: the same product; bob was shown UC-002, UC-003 and UC-004, and after that another writer's commit changed UC-003 on
//        `trunk` and removed UC-004 from it
// input: acceptShown(host, the three files with the blobs that were shown, "bob")
// expect: one commit holding the record of UC-002 alone, whose message names UC-002 and neither UC-003 nor UC-004; the result is
//         { commit, recorded: UC-002's path, leftOut: UC-003's path and UC-004's, in the order shown, each with the reason
//         "changed since shown" and no name }; UC-003 has no record of the text shown nor of the text it has now — only the
//         earlier record it had — and UC-004 has none
test("acceptShown — a file that changed after it was shown is left out and named, and the others are recorded", async () => {
  const fake = fakeHost({ files: PRODUCT });
  const shown = [shownOf(UC2_PATH, UC2), shownOf(UC3_PATH, UC3), shownOf(UC4_PATH, UC4)];
  fake.land({ [UC3_PATH]: UC3_EDITED }, [UC4_PATH]);
  const read = fake.head();

  const result = await acceptShown(fake.host, shown, "bob");

  assert.equal(fake.writes().length, 1, "one commit");
  const { change } = fake.writes()[0];
  assert.equal(change.expectedHead, read, "on the head that was read, which holds the other writer's text");
  assert.deepEqual(change.files.map((file) => file.path), [recordPath("UC-002", UC2)], "the record of UC-002 alone");
  assert.ok(change.message.includes("UC-002") && !/UC-00[34]/.test(change.message), `the message names what was accepted: ${change.message}`);
  assert.deepEqual(result, { commit: fake.head(), recorded: [UC2_PATH], leftOut: [
    { path: UC3_PATH, reason: "changed since shown", names: [] }, { path: UC4_PATH, reason: "changed since shown", names: [] }] });
  assert.deepEqual(Object.keys(fake.files()).filter((path) => /^docs\/approvals\/UC-00[34]-/.test(path)), [UC3_EARLIER_RECORD],
    "UC-003 has no record of the text shown or of the text it has now, and UC-004 none");
});

// guards: ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; SEVERAL FILES ARE ACCEPTED IN ONE CLICK; AN APPROVAL NAMES THE EXACT TEXT; UC-008
// given: the same product, in which A SAMPLE RULE is in the SPEC and A PROPOSED RULE stands only in an open queue; UC-004
//        realises A PROPOSED RULE; ARC-001 is forced by UC-001 and A SAMPLE RULE, both accepted; ARC-002 is forced by UC-001,
//        UC-002, A PROPOSED RULE, UC-003, UC-099 and A SAMPLE RULE — UC-002 is open, UC-003 is changed, UC-099 is no use case of
//        the product; MOD-sample realises A SAMPLE RULE and A PROPOSED RULE; bob was shown UC-004, ARC-001 and ARC-002
// input: acceptanceBlockers(path, the head's snapshot) for each of those and for MOD-sample; then acceptShown(host, the three files
//        with the blobs shown, "bob"); then acceptShown(host, UC-004 and ARC-002 alone, "bob")
// expect: the blockers are A PROPOSED RULE for UC-004, none for ARC-001, UC-002, A PROPOSED RULE, UC-003 and UC-099 for ARC-002,
//         in the order the file names them — neither UC-001 nor A SAMPLE RULE —, and A PROPOSED RULE for MOD-sample; the first
//         acceptShown makes one commit holding the record of ARC-001 alone, whose kind is architecture-decision, and returns
//         recorded: ARC-001's path and leftOut: UC-004 and ARC-002 in the order shown, each with the reason "rests on what is not
//         accepted" and its blockers as names; the second rejects with NothingToAccept, which carries that leftOut, and writes
//         nothing
test("acceptShown — a file that rests on what is not accepted is left out and named with it, and a click that accepts nothing is refused", async () => {
  const fake = fakeHost({ files: PRODUCT });
  const snapshot = await fake.host.readSnapshot("trunk");
  const ARC2_BLOCKERS = ["UC-002", "A PROPOSED RULE", "UC-003", "UC-099"];

  assert.deepEqual(await acceptanceBlockers(UC4_PATH, snapshot), ["A PROPOSED RULE"]);
  assert.deepEqual(await acceptanceBlockers(ARC1_PATH, snapshot), [], "known positive: a file that rests on accepted artifacts only");
  assert.deepEqual(await acceptanceBlockers(ARC2_PATH, snapshot), ARC2_BLOCKERS);
  assert.deepEqual(await acceptanceBlockers(MOD_PATH, snapshot), ["A PROPOSED RULE"], "a module's realises count the same");

  const result = await acceptShown(fake.host,
    [shownOf(UC4_PATH, UC4), shownOf(ARC1_PATH, ARC1), shownOf(ARC2_PATH, ARC2)], "bob");

  assert.equal(fake.writes().length, 1, "one commit");
  const [file, ...others] = fake.writes()[0].change.files;
  assert.deepEqual(others, [], "the record of ARC-001 alone");
  assert.equal(file.path, recordPath("ARC-001", ARC1));
  assert.deepEqual(fieldsOf(file.path, file.text), { kind: "architecture-decision", file: ARC1_PATH, blob: blobOf(ARC1) });
  const leftOut = [{ path: UC4_PATH, reason: NOT_ACCEPTED, names: ["A PROPOSED RULE"] },
    { path: ARC2_PATH, reason: NOT_ACCEPTED, names: ARC2_BLOCKERS }];
  assert.deepEqual(result, { commit: fake.head(), recorded: [ARC1_PATH], leftOut });

  const written = fake.head();
  await assert.rejects(acceptShown(fake.host, [shownOf(UC4_PATH, UC4), shownOf(ARC2_PATH, ARC2)], "bob"), (error) => {
    assert.equal(error.name, "NothingToAccept");
    assert.deepEqual(error.leftOut, leftOut);
    return true;
  });
  assert.equal(fake.writes().length, 1, "no second commit");
  assert.equal(fake.head(), written);
});

// guards: ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; THE GATE IS RECORDED; UC-008
// given: the same product; bob was shown UC-002; (1) the host refuses the write with PermissionMissing — bob has no write access
//        (UC-008 4a) —; (2) another writer's commit lands on `trunk` after the head was read
// input: acceptShown(host, UC-002 with the blob shown, "bob")
// expect: (1) it rejects with PermissionMissing, with the host's fields, for the caller to offer GitHub's route; (2) it rejects
//         with Moved, naming the head the branch stands at now; in both the host's write was tried once and no record of bob's is
//         on the branch
test("acceptShown — a write the host refuses or the branch has moved past is named as the host names it, and nothing is written", async () => {
  const renewal = "https://github.com/settings/personal-access-tokens";
  const cases = [
    { name: "PermissionMissing", fields: { permission: "Contents: read and write", renewal } },
    { name: "Moved", other: { "README.md": "# Fixture product\n\nWritten meanwhile.\n" } },
  ];
  for (const { name, fields, other } of cases) {
    const fake = other
      ? fakeHost({ files: PRODUCT, onRead: (f) => f.land(other) })
      : fakeHost({ files: PRODUCT, refuse: failure(name, fields) });

    await assert.rejects(acceptShown(fake.host, [shownOf(UC2_PATH, UC2)], "bob"), (error) => {
      assert.equal(error.name, name);
      if (other) assert.equal(error.head, fake.head(), "Moved names the head the branch stands at now");
      else for (const [key, value] of Object.entries(fields)) assert.equal(error[key], value, `${name}.${key}`);
      return true;
    });

    assert.equal(fake.writes().length, 1, `${name}: the write was tried once`);
    assert.deepEqual(fake.files(), { ...PRODUCT, ...(other ?? {}) }, `${name}: nothing of bob's is on the branch`);
  }
});

// ---------------------------------------------------------------- without a token

// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL; UC-008; UC-006
// given: the record that accepts UC-002 — its path and its three lines —, and the snapshot of the product on GitHub, which holds
//        UC-002's text
// input: fallbackAcceptLink(the record, the snapshot)
// expect: { url, path, text } with the record's path and text as they are, for a copy button; the url GitHub's new-file page of
//         alice/product, whose only parameters are the file name — the record's path — and the file's content — the record —;
//         nothing of UC-002's text anywhere in it
test("fallbackAcceptLink — without a token, GitHub's new-file page carries the record's path and the record, and no reviewed text", async () => {
  const fake = fakeHost({ files: PRODUCT });
  const snapshot = await fake.host.readSnapshot("trunk");
  const [path, body] = recordOf("UC-002", "use-case", UC2_PATH, UC2);
  const record = { path, text: body };

  const link = fallbackAcceptLink(record, snapshot);

  assert.deepEqual(Object.keys(link).sort(), ["path", "text", "url"]);
  assert.equal(link.path, record.path);
  assert.equal(link.text, record.text);
  const url = new URL(link.url);
  assert.equal(url.origin, "https://github.com");
  assert.match(url.pathname, /^\/alice\/product\/new\/[^/]+$/, "the new-file page of the repository");
  assert.deepEqual([...url.searchParams.keys()].sort(), ["filename", "value"], "the path and the record and nothing else");
  assert.equal(url.searchParams.get("filename"), record.path);
  assert.equal(url.searchParams.get("value"), record.text);
  const carried = [url.pathname, ...url.searchParams.values()].join("\n");
  assert.ok(carried.includes(record.path) && carried.includes(record.text), "known positive: the check finds what the link carries");
  const reviewed = UC2.split("\n").filter((line) => line.length > 12);
  assert.ok(reviewed.length >= 4, "the reviewed text has lines to look for");
  for (const line of reviewed) assert.ok(!carried.includes(line), `no reviewed text travels in the link: ${line}`);
});

// guards: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; UC-008
// given: the same record, and the snapshot of a product on a GitLab server, team/product on gitlab.example.org
// input: fallbackAcceptLink(the record, that snapshot); and, as the known positive, with the snapshot of the product on GitHub
// expect: { refused: "gitlab" } and no link for the GitLab product; a link for the GitHub product
test("fallbackAcceptLink — for a GitLab product there is no page to prefill, and the link is refused", async () => {
  const fake = fakeHost({ files: PRODUCT });
  const onGithub = await fake.host.readSnapshot("trunk");
  const [path, body] = recordOf("UC-002", "use-case", UC2_PATH, UC2);
  const record = { path, text: body };

  assert.equal(typeof fallbackAcceptLink(record, onGithub).url, "string", "known positive: GitHub gives a link");
  assert.deepEqual(fallbackAcceptLink(record, { ...onGithub, repository: ON_GITLAB }), { refused: "gitlab" });
});

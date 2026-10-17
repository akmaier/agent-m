// ITM-651: pure known-thread matching through the public MailRecords entry, not mailbox intake or issue attachment.
// Module: MOD-mail-records
// Guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// Level: unit
// Run: node --test tests/mail-records-threads.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import * as records from "../src/mail-records/index.mjs";
import { sha256 } from "../src/text-tools/index.mjs";

// Only the intended missing method is optional; entry and transitive import errors are never caught.
// Header values, identifiers and issue numbers are synthetic literals, independent of threadMatch.
async function knownListedIssue(t) {
  assert.equal(await sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(await records.mailId({ messageId: "<abc>", bytes: null }), "MAIL-ba7816bf8f01cfea");
  assert.equal(await records.mailId({ messageId: "<sample@example.invalid>", bytes: null }), "MAIL-ca171c6d1e8e76f0");
  const issue = { number: 7, body: "Neutral report.\n\nMails: `MAIL-ba7816bf8f01cfea`, `MAIL-ca171c6d1e8e76f0`", comments: [] };
  const ids = records.listedMailIds(issue);
  assert.deepEqual(ids, ["MAIL-ba7816bf8f01cfea", "MAIL-ca171c6d1e8e76f0"]);
  const listed = new Map(ids.map((id) => [id, issue.number]));
  assert.deepEqual(listed, new Map([["MAIL-ba7816bf8f01cfea", 7], ["MAIL-ca171c6d1e8e76f0", 7]]));
  t.diagnostic("Known-positive public sha256, mailId and listedMailIds/map controls passed before threadMatch.");
  return listed;
}

// TST-651001
// level: unit
// module: MOD-mail-records
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: public hash/mailId and issue-list reader controls pass; the literal map lists MAIL-ba7816bf8f01cfea and MAIL-ca171c6d1e8e76f0 for issue 7
// input: threadMatch({ inReplyTo: "<abc>", references: [] }, that map)
// expect: a Promise resolving to literal issue number 7, derived from the bracket contents as mailId does
test("TST-651001 a listed In-Reply-To resolves asynchronously to its issue", async (t) => {
  const listed = await knownListedIssue(t);
  const result = records.threadMatch?.({ inReplyTo: "<abc>", references: [] }, listed);
  assert.equal(await result, 7);
  assert.ok(result instanceof Promise);
});

// TST-651002
// level: unit
// module: MOD-mail-records
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: public controls pass; MAIL-ca171c6d1e8e76f0 is listed for issue 7; no In-Reply-To
// input: threadMatch({ inReplyTo: null, references: ["<sample@example.invalid>"] }, map of both literal identifiers to 7)
// expect: issue number 7 from References alone
test("TST-651002 a References-only mail finds its listed issue", async (t) => {
  const listed = await knownListedIssue(t);
  assert.equal(await records.threadMatch?.({ inReplyTo: null, references: ["<sample@example.invalid>"] }, listed), 7);
});

// TST-651003
// level: unit
// module: MOD-mail-records
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: public controls pass; other@example.invalid is unlisted; sample@example.invalid is listed for issue 7
// input: threadMatch({ inReplyTo: null, references: ["<other@example.invalid>", "<sample@example.invalid>"] }, map of both literal listed identifiers to 7)
// expect: issue number 7; the unlisted earlier reference does not hide the later match
test("TST-651003 a later matching reference is found after an unlisted reference", async (t) => {
  const listed = await knownListedIssue(t);
  assert.equal(await records.threadMatch?.({ inReplyTo: null,
    references: ["<other@example.invalid>", "<sample@example.invalid>"] }, listed), 7);
});

// TST-651004
// level: unit
// module: MOD-mail-records
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: public controls pass; MAIL-ba7816bf8f01cfea and MAIL-ca171c6d1e8e76f0 both name issue 7, with no distinct-issue tie
// input: threadMatch({ inReplyTo: "<abc>", references: ["<sample@example.invalid>", "<abc>"] }, map of both identifiers to 7)
// expect: issue number 7 for the several matching header identifiers; no precedence between different issues is asserted
test("TST-651004 several matching identifiers for the same issue remain unambiguous", async (t) => {
  const listed = await knownListedIssue(t);
  assert.equal(await records.threadMatch?.({ inReplyTo: "<abc>",
    references: ["<sample@example.invalid>", "<abc>"] }, listed), 7);
});

// TST-651005
// level: unit
// module: MOD-mail-records
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: public controls pass; the map lists the two literal identifiers for issue 7 but no reply headers are present
// input: threadMatch({ inReplyTo: null, references: [] }, that nonempty map)
// expect: null, not an issue number or undefined
test("TST-651005 absent reply headers yield null", async (t) => {
  const listed = await knownListedIssue(t);
  assert.equal(await records.threadMatch?.({ inReplyTo: null, references: [] }, listed), null);
});

// TST-651006
// level: unit
// module: MOD-mail-records
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: public controls establish the runtime and a working listed map; the actual call receives an empty map
// input: threadMatch({ inReplyTo: "<abc>", references: ["<sample@example.invalid>"] }, new Map())
// expect: null because neither header's identifier is in the supplied map
test("TST-651006 an empty supplied map yields null", async (t) => {
  await knownListedIssue(t);
  assert.equal(await records.threadMatch?.({ inReplyTo: "<abc>", references: ["<sample@example.invalid>"] }, new Map()), null);
});

// TST-651007
// level: unit
// module: MOD-mail-records
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: public controls pass; neither other@example.invalid nor unlisted@example.invalid is in the literal map for issue 7
// input: threadMatch({ inReplyTo: "<other@example.invalid>", references: ["<unlisted@example.invalid>"] }, map of the two listed identifiers to 7)
// expect: null because none of the supplied header values matches
test("TST-651007 nonmatching header values yield null", async (t) => {
  const listed = await knownListedIssue(t);
  assert.equal(await records.threadMatch?.({ inReplyTo: "<other@example.invalid>",
    references: ["<unlisted@example.invalid>"] }, listed), null);
});

// TST-651008
// level: unit
// module: MOD-mail-records
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: public controls pass; consecutive calls use an issue-7 map, an issue-11 map, then changed headers and the issue-11 map
// input: <abc> with the known map; <abc> with {MAIL-ba7816bf8f01cfea:11}; <other@example.invalid> with the latter; <abc> with the latter again; all references []
// expect: exactly [7, 11, null, 11]; each call uses its current headers and map rather than an earlier result
test("TST-651008 consecutive calls use their current map and header values", async (t) => {
  const listed = await knownListedIssue(t);
  const otherMap = new Map([["MAIL-ba7816bf8f01cfea", 11]]);
  const headers = { inReplyTo: "<abc>", references: [] };
  const first = await records.threadMatch?.(headers, listed);
  const second = await records.threadMatch?.(headers, otherMap);
  const third = await records.threadMatch?.({ inReplyTo: "<other@example.invalid>", references: [] }, otherMap);
  const fourth = await records.threadMatch?.(headers, otherMap);
  assert.deepEqual([first, second, third, fourth], [7, 11, null, 11]);
});

// TST-651009
// level: unit
// module: MOD-mail-records
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: public controls pass; only headers and an in-memory map are supplied, no model/mailbox/host/file/store; fetch and browser-setting access are trapped
// input: threadMatch({ inReplyTo: null, references: ["<other@example.invalid>", "<sample@example.invalid>"] }, map of both literal identifiers to 7)
// expect: 7; header object, original reference array and map unchanged; zero network requests or browser-setting accesses
test("TST-651009 matching is pure over unchanged headers, references and listed map", async (t) => {
  const listed = await knownListedIssue(t);
  const accesses = [];
  const fetch = globalThis.fetch;
  const storage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  t.after(() => {
    globalThis.fetch = fetch;
    if (storage) Object.defineProperty(globalThis, "localStorage", storage);
    else delete globalThis.localStorage;
  });
  globalThis.fetch = (...args) => { accesses.push(["fetch", ...args]); throw new Error("No network in threadMatch"); };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() {
    accesses.push("localStorage");
    throw new Error("No browser settings in threadMatch");
  } });
  const references = ["<other@example.invalid>", "<sample@example.invalid>"];
  const headers = { inReplyTo: null, references };
  assert.equal(await records.threadMatch?.(headers, listed), 7);
  assert.deepEqual(headers, { inReplyTo: null, references: ["<other@example.invalid>", "<sample@example.invalid>"] });
  assert.equal(headers.references, references);
  assert.deepEqual(references, ["<other@example.invalid>", "<sample@example.invalid>"]);
  assert.deepEqual(listed, new Map([["MAIL-ba7816bf8f01cfea", 7], ["MAIL-ca171c6d1e8e76f0", 7]]));
  assert.deepEqual(accesses, []);
});

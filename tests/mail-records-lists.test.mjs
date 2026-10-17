// ITM-647: pure issue mail-list text through the public MailRecords entry.
// Module: MOD-mail-records
// Guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-038
// Level: unit
// Run: node --test tests/mail-records-lists.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import * as records from "../src/mail-records/index.mjs";
import { sha256 } from "../src/text-tools/index.mjs";

// Only calls to the two intended missing functions are optional. Entry/transitive import failures are not caught.
// Fixtures and expected values are literals, independent of the writer, reader and runtime documents.

// TST-647001
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; UC-038
// given: public sha256, mailId and delivered undecided controls work; one valid synthetic identifier names a neutral report
// input: withMailIds("The build stops after validation.", [MAIL-1111111111111111])
// expect: a synchronous string preserving the neutral text and ending in Mails: `MAIL-1111111111111111`; ids unchanged
test("TST-647001 writer preserves neutral text and lists one identifier after working public controls", async (t) => {
  assert.equal(await sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(await records.mailId({ messageId: "<abc>", bytes: null }), "MAIL-ba7816bf8f01cfea");
  assert.deepEqual(records.undecided(["MAIL-1111111111111111", "MAIL-2222222222222222", "MAIL-3333333333333333"],
    new Set(["MAIL-1111111111111111"]), new Set(["MAIL-2222222222222222"])), ["MAIL-3333333333333333"]);
  t.diagnostic("Known-positive public sha256, mailId and delivered undecided controls passed before the new writer.");
  const text = "The build stops after validation.";
  const ids = ["MAIL-1111111111111111"];
  const output = records.withMailIds?.(text, ids);
  assert.equal(typeof output, "string");
  assert.equal(output.slice(0, text.length), "The build stops after validation.");
  assert.equal(output.trimEnd().split("\n").at(-1), "Mails: `MAIL-1111111111111111`");
  assert.deepEqual(ids, ["MAIL-1111111111111111"]);
});

// TST-647002
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; UC-038
// given: a neutral two-paragraph report and three valid identifiers in a non-alphabetical order
// input: withMailIds("Observed: validation stops.\n\nExpected: the build completes.", [MAIL-bbbbbbbbbbbbbbbb, MAIL-aaaaaaaaaaaaaaaa, MAIL-cccccccccccccccc])
// expect: unchanged report prefix; final line Mails: `MAIL-bbbbbbbbbbbbbbbb`, `MAIL-aaaaaaaaaaaaaaaa`, `MAIL-cccccccccccccccc`; ids unchanged
test("TST-647002 writer lists several identifiers in supplied order without changing the technical text", () => {
  const text = "Observed: validation stops.\n\nExpected: the build completes.";
  const ids = ["MAIL-bbbbbbbbbbbbbbbb", "MAIL-aaaaaaaaaaaaaaaa", "MAIL-cccccccccccccccc"];
  const output = records.withMailIds?.(text, ids);
  assert.equal(typeof output, "string");
  assert.equal(output.slice(0, text.length), "Observed: validation stops.\n\nExpected: the build completes.");
  assert.equal(output.trimEnd().split("\n").at(-1), "Mails: `MAIL-bbbbbbbbbbbbbbbb`, `MAIL-aaaaaaaaaaaaaaaa`, `MAIL-cccccccccccccccc`");
  assert.deepEqual(ids, ["MAIL-bbbbbbbbbbbbbbbb", "MAIL-aaaaaaaaaaaaaaaa", "MAIL-cccccccccccccccc"]);
});

// TST-647003
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; UC-038
// given: a valid writer call succeeds before identifiers outside the declared prefix, length or hexadecimal form
// input: valid MAIL-4444444444444444, then BAD-4444444444444444, MAIL-444444444444444 and MAIL-gggggggggggggggg
// expect: the valid call ends in Mails: `MAIL-4444444444444444`; every invalid call throws NotAnIdentifier; input arrays unchanged
test("TST-647003 writer refuses out-of-form identifiers after a usable writer control", () => {
  const valid = records.withMailIds?.("Neutral report.", ["MAIL-4444444444444444"]);
  assert.equal(typeof valid, "string");
  assert.equal(valid.trimEnd().split("\n").at(-1), "Mails: `MAIL-4444444444444444`");
  for (const bad of ["BAD-4444444444444444", "MAIL-444444444444444", "MAIL-gggggggggggggggg"]) {
    const ids = [bad];
    assert.throws(() => records.withMailIds?.("Neutral report.", ids), { name: "NotAnIdentifier" });
    assert.deepEqual(ids, [bad]);
  }
});

// TST-647004
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-038
// given: an independently written issue body with the accepted Mails line and no comments
// input: IssueText number 7, body "Neutral report.\n\nMails: `MAIL-cccccccccccccccc`, `MAIL-aaaaaaaaaaaaaaaa`", comments []
// expect: synchronously [MAIL-cccccccccccccccc, MAIL-aaaaaaaaaaaaaaaa]; IssueText unchanged
test("TST-647004 reader takes identifiers from an independent literal Mails line", () => {
  const issue = { number: 7, body: "Neutral report.\n\nMails: `MAIL-cccccccccccccccc`, `MAIL-aaaaaaaaaaaaaaaa`", comments: [] };
  const before = structuredClone(issue);
  assert.deepEqual(records.listedMailIds?.(issue), ["MAIL-cccccccccccccccc", "MAIL-aaaaaaaaaaaaaaaa"]);
  assert.deepEqual(issue, before);
});

// TST-647005
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-038
// given: a body without a Mails line and two accepted added-mail comments
// input: IssueText number 8, body "Neutral report.", comments adding MAIL-5555555555555555 on 2026-10-15 and MAIL-2222222222222222 on 2026-10-16
// expect: synchronously [MAIL-5555555555555555, MAIL-2222222222222222] in listing order; IssueText unchanged
test("TST-647005 reader takes added-mail comments in listing order without requiring a body list", () => {
  const issue = { number: 8, body: "Neutral report.", comments: [
    { body: "Mail `MAIL-5555555555555555` added on 2026-10-15.", createdAt: "2026-10-15T12:00:00Z" },
    { body: "Mail `MAIL-2222222222222222` added on 2026-10-16.", createdAt: "2026-10-16T12:00:00Z" },
  ] };
  const before = structuredClone(issue);
  assert.deepEqual(records.listedMailIds?.(issue), ["MAIL-5555555555555555", "MAIL-2222222222222222"]);
  assert.deepEqual(issue, before);
});

// TST-647006
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-038
// given: independent literal body and added comments repeat identifiers within and across both sources
// input: body lists MAIL-cccccccccccccccc, MAIL-aaaaaaaaaaaaaaaa, MAIL-cccccccccccccccc; comments add MAIL-aaaaaaaaaaaaaaaa, MAIL-bbbbbbbbbbbbbbbb, MAIL-bbbbbbbbbbbbbbbb, MAIL-dddddddddddddddd
// expect: synchronously [MAIL-cccccccccccccccc, MAIL-aaaaaaaaaaaaaaaa, MAIL-bbbbbbbbbbbbbbbb, MAIL-dddddddddddddddd], each once in first listing order; IssueText unchanged
test("TST-647006 reader combines both sources once per identifier in first listing order", () => {
  const issue = { number: 9, body: "Neutral report.\n\nMails: `MAIL-cccccccccccccccc`, `MAIL-aaaaaaaaaaaaaaaa`, `MAIL-cccccccccccccccc`", comments: [
    { body: "Mail `MAIL-aaaaaaaaaaaaaaaa` added on 2026-10-15.", createdAt: "2026-10-15T12:00:00Z" },
    { body: "Mail `MAIL-bbbbbbbbbbbbbbbb` added on 2026-10-16.", createdAt: "2026-10-16T12:00:00Z" },
    { body: "Mail `MAIL-bbbbbbbbbbbbbbbb` added on 2026-10-17.", createdAt: "2026-10-17T10:00:00Z" },
    { body: "Mail `MAIL-dddddddddddddddd` added on 2026-10-17.", createdAt: "2026-10-17T11:00:00Z" },
  ] };
  const before = structuredClone(issue);
  assert.deepEqual(records.listedMailIds?.(issue), ["MAIL-cccccccccccccccc", "MAIL-aaaaaaaaaaaaaaaa", "MAIL-bbbbbbbbbbbbbbbb", "MAIL-dddddddddddddddd"]);
  assert.deepEqual(issue, before);
});

// TST-647007
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-038
// given: no Mails line or added-mail comment; prose and unrelated reply/question/no-reply notes mention identifiers
// input: IssueText number 10, neutral body, unrelated prose and reply-sent/question-sent/no-reply comments containing MAIL-6666666666666666 through MAIL-9999999999999999
// expect: synchronously []; unrelated mentions and other note kinds are not listings; IssueText unchanged
test("TST-647007 reader leaves unrelated text and other note forms out when no mail is listed", () => {
  const issue = { number: 10, body: "Neutral report.", comments: [
    { body: "The diagnostic mentions MAIL-6666666666666666 without adding it.", createdAt: "2026-10-15T11:00:00Z" },
    { body: "Reply sent to `MAIL-7777777777777777` on 2026-10-15.", createdAt: "2026-10-15T12:00:00Z" },
    { body: "Question sent to `MAIL-8888888888888888` on 2026-10-16.", createdAt: "2026-10-16T12:00:00Z" },
    { body: "No reply to `MAIL-9999999999999999`, decided on 2026-10-17.", createdAt: "2026-10-17T12:00:00Z" },
  ] };
  const before = structuredClone(issue);
  assert.deepEqual(records.listedMailIds?.(issue), []);
  assert.deepEqual(issue, before);
});

// TST-647008
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-038
// given: writer and reader share their public issue-list format; independent literal reader cases above are separate oracles
// input: withMailIds("Neutral report for roundtrip.", [MAIL-eeeeeeeeeeeeeeee, MAIL-ffffffffffffffff]), then listedMailIds of that text with no comments
// expect: synchronously [MAIL-eeeeeeeeeeeeeeee, MAIL-ffffffffffffffff]; text/ids/IssueText unchanged; no network or browser-setting access
test("TST-647008 public writer output is readable without I/O or input mutation", (t) => {
  const accesses = [];
  const fetch = globalThis.fetch;
  const storage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  t.after(() => {
    globalThis.fetch = fetch;
    if (storage) Object.defineProperty(globalThis, "localStorage", storage);
    else delete globalThis.localStorage;
  });
  globalThis.fetch = (...args) => { accesses.push(["fetch", ...args]); throw new Error("No network in mail lists"); };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() {
    accesses.push("localStorage");
    throw new Error("No browser settings in mail lists");
  } });
  const text = "Neutral report for roundtrip.";
  const ids = ["MAIL-eeeeeeeeeeeeeeee", "MAIL-ffffffffffffffff"];
  const body = records.withMailIds?.(text, ids);
  assert.equal(typeof body, "string");
  const issue = { number: 11, body, comments: [] };
  const before = structuredClone(issue);
  assert.deepEqual(records.listedMailIds?.(issue), ["MAIL-eeeeeeeeeeeeeeee", "MAIL-ffffffffffffffff"]);
  assert.equal(text, "Neutral report for roundtrip.");
  assert.deepEqual(ids, ["MAIL-eeeeeeeeeeeeeeee", "MAIL-ffffffffffffffff"]);
  assert.deepEqual(issue, before);
  assert.deepEqual(accesses, []);
});

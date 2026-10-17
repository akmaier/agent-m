// ITM-661: pure handling-note text through the public MailRecords entry, not its consumers.
// Module: MOD-mail-records
// Guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; A SENT REPLY IS NOTED IN THE ISSUE; UC-033; UC-038; UC-039
// Level: unit
// Run: node --test tests/mail-records-note-text.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import * as records from "../src/mail-records/index.mjs";
import { sha256 } from "../src/text-tools/index.mjs";

// Only the intended missing method is optional; entry and transitive import failures are never caught.
// Every expected note below is literal, independent of runtime documents, production helpers and roundtrips.

// TST-661001
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-038
// given: public hash, mailId, list writer/reader, undecided and threadMatch controls work; a valid supplied mail identifier and date
// input: noteText("mail-added", "MAIL-1111111111111111", "2026-10-17")
// expect: synchronously "Mail `MAIL-1111111111111111` added on 2026-10-17.", with the stated quoting and full stop
test("TST-661001 mail-added has its literal text after working public controls", async (t) => {
  assert.equal(await sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(await records.mailId({ messageId: "<abc>", bytes: null }), "MAIL-ba7816bf8f01cfea");
  assert.equal(records.withMailIds("Neutral report.", ["MAIL-ba7816bf8f01cfea"]),
    "Neutral report.\n\nMails: `MAIL-ba7816bf8f01cfea`");
  assert.deepEqual(records.listedMailIds({ number: 7, body: "Neutral report.\n\nMails: `MAIL-ba7816bf8f01cfea`", comments: [] }),
    ["MAIL-ba7816bf8f01cfea"]);
  assert.deepEqual(records.undecided(["MAIL-1111111111111111", "MAIL-2222222222222222", "MAIL-3333333333333333"],
    new Set(["MAIL-1111111111111111"]), new Set(["MAIL-2222222222222222"])), ["MAIL-3333333333333333"]);
  assert.equal(await records.threadMatch({ inReplyTo: "<abc>", references: [] }, new Map([["MAIL-ba7816bf8f01cfea", 7]])), 7);
  t.diagnostic("Known-positive public sha256, mailId, withMailIds, listedMailIds, undecided and threadMatch controls passed before noteText.");
  assert.equal(records.noteText?.("mail-added", "MAIL-1111111111111111", "2026-10-17"),
    "Mail `MAIL-1111111111111111` added on 2026-10-17.");
});

// TST-661002
// level: unit
// module: MOD-mail-records
// guards: A SENT REPLY IS NOTED IN THE ISSUE; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-039
// given: a valid supplied mail identifier and calendar date, with no mail text or people supplied
// input: noteText("reply-sent", "MAIL-2222222222222222", "2026-10-16")
// expect: synchronously "Reply sent to `MAIL-2222222222222222` on 2026-10-16.", with no additional text
test("TST-661002 reply-sent names only the identifier and supplied date", () => {
  assert.equal(records.noteText?.("reply-sent", "MAIL-2222222222222222", "2026-10-16"),
    "Reply sent to `MAIL-2222222222222222` on 2026-10-16.");
});

// TST-661003
// level: unit
// module: MOD-mail-records
// guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-039
// given: a valid supplied mail identifier and calendar date for a sent question
// input: noteText("question-sent", "MAIL-3333333333333333", "2026-10-15")
// expect: synchronously "Question sent to `MAIL-3333333333333333` on 2026-10-15."
test("TST-661003 question-sent has its literal text", () => {
  assert.equal(records.noteText?.("question-sent", "MAIL-3333333333333333", "2026-10-15"),
    "Question sent to `MAIL-3333333333333333` on 2026-10-15.");
});

// TST-661004
// level: unit
// module: MOD-mail-records
// guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-039
// given: a valid supplied mail identifier and calendar date for a decision not to answer
// input: noteText("no-reply", "MAIL-4444444444444444", "2026-10-14")
// expect: synchronously "No reply to `MAIL-4444444444444444`, decided on 2026-10-14.", including the comma
test("TST-661004 no-reply has its literal decision text", () => {
  assert.equal(records.noteText?.("no-reply", "MAIL-4444444444444444", "2026-10-14"),
    "No reply to `MAIL-4444444444444444`, decided on 2026-10-14.");
});

// TST-661005
// level: unit
// module: MOD-mail-records
// guards: UC-033
// given: a valid supplied item identifier, calendar date and synthetic dashboard address
// input: noteText("item-added", "ITM-123", "2026-10-17", "https://example.invalid/agent-m/#item/ITM-123")
// expect: synchronously "Backlog item `ITM-123` added: https://example.invalid/agent-m/#item/ITM-123", with no trailing full stop or date
test("TST-661005 item-added has its literal dashboard-link text", () => {
  assert.equal(records.noteText?.("item-added", "ITM-123", "2026-10-17", "https://example.invalid/agent-m/#item/ITM-123"),
    "Backlog item `ITM-123` added: https://example.invalid/agent-m/#item/ITM-123");
});

// TST-661006
// level: unit
// module: MOD-mail-records
// guards: UC-033
// given: a valid supplied item identifier, calendar date and synthetic closing pull-request address
// input: noteText("closed-with", "ITM-456", "2026-10-17", "https://example.invalid/product/pull/7")
// expect: synchronously "Closed with https://example.invalid/product/pull/7; item `ITM-456`.", including the semicolon and quoted supplied item
test("TST-661006 closed-with has its literal closing-link and item text", () => {
  assert.equal(records.noteText?.("closed-with", "ITM-456", "2026-10-17", "https://example.invalid/product/pull/7"),
    "Closed with https://example.invalid/product/pull/7; item `ITM-456`.");
});

// TST-661007
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-033; UC-038; UC-039
// given: each kind's valid supplied subject produces its stated literal note before an out-of-form supplied subject is tried
// input: all six kinds with date 2026-10-17; mail subject MAIL-5555555555555555 or item ITM-789, then subject not-an-identifier; item links https://example.invalid/item/789 and https://example.invalid/commit/abc
// expect: the six stated literal control strings, then NotAnIdentifier for each out-of-form supplied subject; no error message or subclass prescribed
test("TST-661007 out-of-form subjects throw NotAnIdentifier after valid writer controls", (t) => {
  const controls = [
    ["mail-added", "MAIL-5555555555555555", undefined, "Mail `MAIL-5555555555555555` added on 2026-10-17."],
    ["reply-sent", "MAIL-5555555555555555", undefined, "Reply sent to `MAIL-5555555555555555` on 2026-10-17."],
    ["question-sent", "MAIL-5555555555555555", undefined, "Question sent to `MAIL-5555555555555555` on 2026-10-17."],
    ["no-reply", "MAIL-5555555555555555", undefined, "No reply to `MAIL-5555555555555555`, decided on 2026-10-17."],
    ["item-added", "ITM-789", "https://example.invalid/item/789", "Backlog item `ITM-789` added: https://example.invalid/item/789"],
    ["closed-with", "ITM-789", "https://example.invalid/commit/abc", "Closed with https://example.invalid/commit/abc; item `ITM-789`."],
  ];
  for (const [kind, subject, link, expected] of controls) {
    assert.equal(records.noteText?.(kind, subject, "2026-10-17", link), expected, `${kind} valid writer control`);
    t.diagnostic(`${kind} literal valid writer control passed before its out-of-form subject.`);
    assert.throws(() => records.noteText?.(kind, "not-an-identifier", "2026-10-17", link), { name: "NotAnIdentifier" });
  }
});

// TST-661008
// level: unit
// module: MOD-mail-records
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-038
// given: the delivered reader first reads an independently literal added-mail comment; writer literals are checked separately
// input: noteText("mail-added", "MAIL-7777777777777777", "2026-10-17") placed in IssueText number 8's comments, then listedMailIds(issue)
// expect: a synchronous string; listedMailIds returns exactly [MAIL-7777777777777777]; the supplied issue body and comments remain unchanged
test("TST-661008 mail-added output interoperates with the delivered public list reader", (t) => {
  assert.deepEqual(records.listedMailIds({ number: 8, body: "Neutral report.", comments: [
    { body: "Mail `MAIL-6666666666666666` added on 2026-10-16.", createdAt: "2026-10-16T12:00:00Z" },
  ] }), ["MAIL-6666666666666666"]);
  t.diagnostic("Known-positive independently literal added-mail comment is readable before noteText interoperability.");
  const body = records.noteText?.("mail-added", "MAIL-7777777777777777", "2026-10-17");
  assert.equal(typeof body, "string", "mail-added writer returns text before reader interoperability");
  const issue = { number: 8, body: "Neutral report.", comments: [{ body, createdAt: "2026-10-17T12:00:00Z" }] };
  const before = structuredClone(issue);
  assert.deepEqual(records.listedMailIds(issue), ["MAIL-7777777777777777"]);
  assert.deepEqual(issue, before);
});

// TST-661009
// level: unit
// module: MOD-mail-records
// guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; A SENT REPLY IS NOTED IN THE ISSUE; UC-033; UC-038; UC-039
// given: only frozen in-memory kind/identifier/date/link tuples are supplied; fetch and browser-storage access are trapped
// input: all six kinds with MAIL-8888888888888888 or ITM-321, date 2026-10-13, item link https://example.invalid/item/321 or closing link https://example.invalid/commit/def, followed by the first call again
// expect: the seven literal strings below returned synchronously; input tuples unchanged; zero network or browser-storage accesses; no model, mailbox or issue operation supplied
test("TST-661009 note writing is synchronous and pure across consecutive kinds", (t) => {
  const accesses = [];
  const fetch = globalThis.fetch;
  const storage = ["localStorage", "sessionStorage"].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  t.after(() => {
    globalThis.fetch = fetch;
    for (const [name, descriptor] of storage) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  globalThis.fetch = (...args) => { accesses.push(["fetch", ...args]); throw new Error("No network in noteText"); };
  for (const [name] of storage) Object.defineProperty(globalThis, name, { configurable: true, get() {
    accesses.push(name);
    throw new Error("No browser storage in noteText");
  } });
  const inputs = Object.freeze([
    Object.freeze(["mail-added", "MAIL-8888888888888888", "2026-10-13"]),
    Object.freeze(["reply-sent", "MAIL-8888888888888888", "2026-10-13"]),
    Object.freeze(["question-sent", "MAIL-8888888888888888", "2026-10-13"]),
    Object.freeze(["no-reply", "MAIL-8888888888888888", "2026-10-13"]),
    Object.freeze(["item-added", "ITM-321", "2026-10-13", "https://example.invalid/item/321"]),
    Object.freeze(["closed-with", "ITM-321", "2026-10-13", "https://example.invalid/commit/def"]),
  ]);
  const before = structuredClone(inputs);
  const output = inputs.map((args) => records.noteText?.(...args));
  output.push(records.noteText?.(...inputs[0]));
  assert.deepEqual(output, [
    "Mail `MAIL-8888888888888888` added on 2026-10-13.",
    "Reply sent to `MAIL-8888888888888888` on 2026-10-13.",
    "Question sent to `MAIL-8888888888888888` on 2026-10-13.",
    "No reply to `MAIL-8888888888888888`, decided on 2026-10-13.",
    "Backlog item `ITM-321` added: https://example.invalid/item/321",
    "Closed with https://example.invalid/commit/def; item `ITM-321`.",
    "Mail `MAIL-8888888888888888` added on 2026-10-13.",
  ]);
  assert.deepEqual(inputs, before);
  assert.deepEqual(accesses, []);
});

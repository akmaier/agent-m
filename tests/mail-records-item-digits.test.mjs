// An issue's marks name backlog items of three or more digits (ITM-1092), as MOD-identifiers' accepted text gives an item's identifier (docs/architecture/MOD-identifiers.md:54, `ITM-<nnn>`, three or more
// digits) to the notes of MOD-mail-records (docs/architecture/MOD-mail-records.md:72-73): "Backlog item `ITM-…` added: <address>" and "Closed with <address>; item `ITM-…`." Through the public MailRecords entry.
// Run: node --test tests/mail-records-item-digits.test.mjs
//
// Module: MOD-mail-records
// Guards: A SENT REPLY IS NOTED IN THE ISSUE; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-039
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect); each pairs the case under test with a three-digit item, still read. The reader keeps the comments in
// the order they come: it orders no items, so no ordering is asserted. A closing note that names a malformed item is read as a closing note without an item (the module's own reading: "the item part only where there is one").
// The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { noteText, notesOf } from "../src/mail-records/index.mjs";

const issue = (...bodies) => ({ number: 5, body: "Neutral report.", comments: bodies.map((body) => ({ body, createdAt: "2026-10-19T08:00:00Z" })) });

// TST-1092101 · level: unit · module: MOD-mail-records
// guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-039
// given: an issue with the comments "Backlog item `ITM-100` added: …", the same for ITM-999 and ITM-1000, and one for ITM-99
// input: notesOf(issue)
// expect: three notes of kind item-added, subjects ITM-100, ITM-999 and ITM-1000 in comment order, each with the date of its comment; none for ITM-99
test("notesOf — a Backlog item note is read for ITM-100, ITM-999 and ITM-1000, not for ITM-99", () => {
  const notes = notesOf(issue("Backlog item `ITM-100` added: https://example.test/#item/ITM-100", "Backlog item `ITM-999` added: https://example.test/#item/ITM-999",
    "Backlog item `ITM-1000` added: https://example.test/#item/ITM-1000", "Backlog item `ITM-99` added: https://example.test/#item/ITM-99"));
  assert.deepEqual(notes, ["ITM-100", "ITM-999", "ITM-1000"].map((subject) => ({ kind: "item-added", subject, date: "2026-10-19" })));
});

// TST-1092102 · level: unit · module: MOD-mail-records
// guards: A SENT REPLY IS NOTED IN THE ISSUE; UC-039
// given: an issue with the comments "Closed with <address>; item `ITM-…`." for ITM-100, ITM-999 and ITM-1000, and one for ITM-99
// input: notesOf(issue)
// expect: four notes of kind closed-with, the first three with the subjects ITM-100, ITM-999 and ITM-1000, the fourth with the empty subject — ITM-99 is no item
test("notesOf — a Closed with note names ITM-100, ITM-999 and ITM-1000 as its item, and ITM-99 as none", () => {
  const notes = notesOf(issue("Closed with https://example.test/pull/1; item `ITM-100`.", "Closed with https://example.test/pull/2; item `ITM-999`.",
    "Closed with https://example.test/pull/3; item `ITM-1000`.", "Closed with https://example.test/pull/4; item `ITM-99`."));
  assert.deepEqual(notes.map(({ kind, subject }) => [kind, subject]), [["closed-with", "ITM-100"], ["closed-with", "ITM-999"], ["closed-with", "ITM-1000"], ["closed-with", ""]]);
});

// TST-1092103 · level: unit · module: MOD-mail-records
// guards: A SENT REPLY IS NOTED IN THE ISSUE; UC-039
// given: the item identifiers ITM-100, ITM-999 and ITM-1000, and ITM-99
// input: noteText("item-added", id, "2026-10-19", link) and noteText("closed-with", id, "2026-10-19", link) for each
// expect: for the first three, "Backlog item `<id>` added: <link>" and "Closed with <link>; item `<id>`."; for ITM-99 an error named NotAnIdentifier from both
test("noteText — an item note is written for ITM-100, ITM-999 and ITM-1000, refused for ITM-99", () => {
  for (const id of ["ITM-100", "ITM-999", "ITM-1000"]) {
    assert.equal(noteText("item-added", id, "2026-10-19", "https://example.test/x"), `Backlog item \`${id}\` added: https://example.test/x`);
    assert.equal(noteText("closed-with", id, "2026-10-19", "https://example.test/x"), `Closed with https://example.test/x; item \`${id}\`.`);
  }
  for (const kind of ["item-added", "closed-with"]) {
    assert.throws(() => noteText(kind, "ITM-99", "2026-10-19", "https://example.test/x"), (error) => error.name === "NotAnIdentifier");
  }
});

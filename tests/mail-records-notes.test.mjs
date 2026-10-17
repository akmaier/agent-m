// ITM-824: notesOf and issueLabels through the public MailRecords entry.
// Module: MOD-mail-records
// Level: unit
// Run: node --test tests/mail-records-notes.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import * as records from "../src/mail-records/index.mjs";

// Every input and expected value below is a literal; none is read from a document or produced by noteText,
// except in the one round-trip test, which says so.

// TST-824001 · level: unit · module: MOD-mail-records
// guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; A SENT REPLY IS NOTED IN THE ISSUE; UC-039
// given: an issue with one comment of each of the six kinds of the notes table, each with a createdAt
// input: notesOf(issue)
// expect: six notes in comment order, with kinds mail-added, reply-sent, question-sent, no-reply, item-added, closed-with; the four mail kinds carry their identifier and the date of their text, item-added and closed-with carry ITM-801
test("TST-824001 a comment of each of the six kinds is read as a note", () => {
  const issue = {
    number: 5,
    body: "Neutral report.",
    comments: [
      { body: "Mail `MAIL-aaaaaaaaaaaaaaaa` added on 2026-10-01.", createdAt: "2026-10-01T08:00:00Z" },
      { body: "Reply sent to `MAIL-bbbbbbbbbbbbbbbb` on 2026-10-02.", createdAt: "2026-10-02T08:00:00Z" },
      { body: "Question sent to `MAIL-cccccccccccccccc` on 2026-10-03.", createdAt: "2026-10-03T08:00:00Z" },
      { body: "No reply to `MAIL-dddddddddddddddd`, decided on 2026-10-04.", createdAt: "2026-10-04T08:00:00Z" },
      { body: "Backlog item `ITM-801` added: https://example.test/dashboard/ITM-801", createdAt: "2026-10-05T08:00:00Z" },
      { body: "Closed with https://example.test/pull/9; item `ITM-801`.", createdAt: "2026-10-06T08:00:00Z" },
    ],
  };
  const notes = records.notesOf(issue);
  assert.equal(notes.length, 6);
  assert.deepEqual(notes.map((n) => n.kind),
    ["mail-added", "reply-sent", "question-sent", "no-reply", "item-added", "closed-with"]);
  assert.deepEqual(notes.slice(0, 4), [
    { kind: "mail-added", subject: "MAIL-aaaaaaaaaaaaaaaa", date: "2026-10-01" },
    { kind: "reply-sent", subject: "MAIL-bbbbbbbbbbbbbbbb", date: "2026-10-02" },
    { kind: "question-sent", subject: "MAIL-cccccccccccccccc", date: "2026-10-03" },
    { kind: "no-reply", subject: "MAIL-dddddddddddddddd", date: "2026-10-04" },
  ]);
  assert.equal(notes[4].subject, "ITM-801");
  assert.equal(notes[5].subject, "ITM-801");
});

// TST-824002 · level: unit · module: MOD-mail-records
// guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; UC-038
// given: an issue whose comments are free text, a near-miss of a note form and a quoted note, between two real notes
// input: notesOf(issue)
// expect: only the two real notes, in order; the other comments are left out
test("TST-824002 a comment in no form of the table is left out", () => {
  const issue = {
    number: 6,
    body: "Neutral report.",
    comments: [
      { body: "Thanks, looking into it.", createdAt: "2026-10-01T08:00:00Z" },
      { body: "Reply sent to `MAIL-1111111111111111` on 2026-10-02.", createdAt: "2026-10-02T08:00:00Z" },
      { body: "Reply sent to `MAIL-123` on 2026-10-02.", createdAt: "2026-10-02T09:00:00Z" },
      { body: "Please note: Reply sent to `MAIL-2222222222222222` on 2026-10-03.", createdAt: "2026-10-03T08:00:00Z" },
      { body: "No reply to `MAIL-3333333333333333`, decided on 2026-10-04.", createdAt: "2026-10-04T08:00:00Z" },
    ],
  };
  assert.deepEqual(records.notesOf(issue), [
    { kind: "reply-sent", subject: "MAIL-1111111111111111", date: "2026-10-02" },
    { kind: "no-reply", subject: "MAIL-3333333333333333", date: "2026-10-04" },
  ]);
});

// TST-824003 · level: unit · module: MOD-mail-records
// guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
// given: an issue with no comments
// input: notesOf(issue)
// expect: an empty array
test("TST-824003 an issue with no comments has no notes", () => {
  assert.deepEqual(records.notesOf({ number: 7, body: "Neutral report.", comments: [] }), []);
});

// TST-824004 · level: unit · module: MOD-mail-records
// guards: AN ISSUE WAITING FOR A REPORTER IS LABELLED; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
// given: the public entry
// input: records.issueLabels
// expect: { defect: "defect", change: "change", notReproducible: "not-reproducible", waitingForReporter: "waiting-for-reporter", backlog: "backlog" }
test("TST-824004 the five label names are the constants of the table", () => {
  assert.deepEqual({ ...records.issueLabels }, {
    defect: "defect",
    change: "change",
    notReproducible: "not-reproducible",
    waitingForReporter: "waiting-for-reporter",
    backlog: "backlog",
  });
});

// TST-824005 · level: unit · module: MOD-mail-records
// guards: A SENT REPLY IS NOTED IN THE ISSUE; UC-039
// given: texts written by noteText for the four mail kinds and for item-added, each as a comment
// input: notesOf(issue) over those comments
// expect: kind and subject of each note equal what was given to noteText, in order, and the four mail kinds carry the given date
test("TST-824005 a text written by noteText is read back by notesOf", () => {
  const given = [
    ["mail-added", "MAIL-0123456789abcdef", "2026-10-11"],
    ["reply-sent", "MAIL-fedcba9876543210", "2026-10-12"],
    ["question-sent", "MAIL-0123456789abcdef", "2026-10-13"],
    ["no-reply", "MAIL-fedcba9876543210", "2026-10-14"],
  ];
  const comments = given.map(([kind, subject, date]) => ({ body: records.noteText(kind, subject, date), createdAt: `${date}T00:00:00Z` }));
  comments.push({ body: records.noteText("item-added", "ITM-802", "2026-10-15", "https://example.test/ITM-802"), createdAt: "2026-10-15T00:00:00Z" });
  const notes = records.notesOf({ number: 8, body: "Neutral report.", comments });
  assert.deepEqual(notes.slice(0, 4), given.map(([kind, subject, date]) => ({ kind, subject, date })));
  assert.equal(notes[4].kind, "item-added");
  assert.equal(notes[4].subject, "ITM-802");
});

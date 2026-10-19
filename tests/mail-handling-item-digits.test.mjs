// A reply reads the closing item of three or more digits (ITM-1093), as MOD-identifiers' accepted text gives an item's identifier (docs/architecture/MOD-identifiers.md:54, `ITM-<nnn>`, three or more digits)
// to the closing note MOD-mail-handling reads for the address that solved an issue (docs/architecture/MOD-mail-records.md:73, "Closed with <address>; item `ITM-…`."): repliesDue's `closedBy`.
// Run: node --test tests/mail-handling-item-digits.test.mjs
//
// Module: MOD-mail-handling
// Guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// Level: unit
//
// Over a fake mailbox and a fake host of the accepted issue functions, as tests/mail-handling-replies.test.mjs has them. Each test states its input and its expected result before it runs (given / input / expect); each pairs the case
// under test with a three-digit item, still read. Where the note names no item the module reads — ITM-99 is none —, the part after "Closed with " up to the closing period is the address it takes, as for a note that names none; the
// test states that reading. The reader orders no items, so no ordering is asserted. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { repliesDue } from "../src/mail-handling/index.mjs";

const A = { id: "MAIL-ca171c6d1e8e76f0", messageId: "<sample@example.invalid>" };
const PULL = "https://github.com/example/thesis-tool/pull/31";
const mailbox = { drafts: async () => [], sent: async () => [], find: async () => null };
const closedIssue = (number, closing) => ({ number, title: `Issue ${number}`, body: `Export fails.\n\nMails: \`${A.id}\``, labels: [], state: "closed", url: `https://example.invalid/${number}`,
  comments: [{ author: "agent-m", body: closing, date: "2026-10-12T09:00:00Z" }] });
const dueOf = async (...issues) => (await repliesDue(mailbox, [{ address: "https://github.com/example/thesis-tool", host: { listIssues: async () => issues, commentOnIssue: async () => {}, listPullRequests: async () => [], listTags: async () => [], containsCommit: async () => false } }])).toAnswer;

// TST-1093101 · level: unit · module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: closed issues 1 to 3 that list a mail with no reply note and whose closing notes read "Closed with <pull request>; item `ITM-…`." for ITM-100, ITM-999 and ITM-1000
// input: repliesDue(mailbox, products)
// expect: toAnswer holds the three issues in the host's order, each with closedBy the pull request's address alone
test("repliesDue — a closing note naming ITM-100, ITM-999 or ITM-1000 gives the pull request as closedBy", async () => {
  const due = await dueOf(closedIssue(1, `Closed with ${PULL}; item \`ITM-100\`.`), closedIssue(2, `Closed with ${PULL}; item \`ITM-999\`.`), closedIssue(3, `Closed with ${PULL}; item \`ITM-1000\`.`));
  assert.deepEqual(due.map(({ issue, closedBy }) => [issue, closedBy]), [[1, PULL], [2, PULL], [3, PULL]]);
});

// TST-1093102 · level: unit · module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: a closed issue whose closing note names ITM-99, and one that names no item ("Closed with <pull request>.")
// input: repliesDue(mailbox, products)
// expect: the second has closedBy the pull request's address; the first, whose item part is none the module reads, has the whole text up to the period: "<pull request>; item `ITM-99`"
test("repliesDue — a closing note naming ITM-99 does not give the pull request alone; one naming no item does", async () => {
  const due = await dueOf(closedIssue(1, `Closed with ${PULL}; item \`ITM-99\`.`), closedIssue(2, `Closed with ${PULL}.`));
  assert.deepEqual(due.map(({ issue, closedBy }) => [issue, closedBy]), [[1, `${PULL}; item \`ITM-99\``], [2, PULL]]);
});

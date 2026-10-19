// A mail marked not an issue is kept in the browser's store (ITM-956) — MOD-mail-handling's `decideMail` with the decision `not-an-issue`, as the accepted text of docs/architecture/MOD-mail-handling.md states it (:87-94, blob 6cd79c5ff469):
// "`decideMail(mail: { id: string, people: People }, decision: MailDecision, host: Host | null, store: Store) -> Promise<{ issue: number | null }>` ... *not an issue* adds the identifier to this browser's marks in `store`, the
// store the page opened for the instance." The marks are the setting `not-an-issue` of MOD-browser-store (MOD-browser-store.md:75, ITM-957); `readNewMail` leaves a marked mail out (`A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN`).
// Run: node --test tests/mail-handling-mark.test.mjs
//
// Module: MOD-mail-handling
// Guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; MAIL STAYS IN THE MAILBOX; UC-038
// Level: unit
//
// A store made by MOD-browser-store's openStore over a Map-backed localStorage; the fake mailbox and host of the accepted interfaces, as tests/mail-handling-intake.test.mjs. No request leaves the process.
// Readings the texts leave open, which the tests state: the marks are a list of identifiers in the order marked, without repeats; a decision `not-an-issue` needs a store and takes no host (it writes to none); nothing but the identifier
// is stored. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { openStore, readSetting } from "../src/browser-store/index.mjs";

const handling = await import("../src/mail-handling/index.mjs");

const FIRST = "MAIL-1111111111111111";
const SECOND = "MAIL-2222222222222222";
const ERIKA = { name: "Erika Mustermann", address: "erika@example.invalid" };
const PEOPLE = { names: ["Erika Mustermann"], addresses: ["erika@example.invalid"], phones: [], accounts: [] };
const mail = (id) => ({ id, messageId: `<${id.toLowerCase()}@mail.example.invalid>`, inReplyTo: null, references: [], from: ERIKA, replyTo: [], to: [{ name: null, address: "reports@example.invalid" }], cc: [],
  subject: "Thank you", date: "2026-10-18T08:00:00Z", text: "Thanks a lot.\nKind regards\nErika Mustermann", attachments: [], folder: "INBOX" });
const mailbox = (mails) => ({ read: async () => mails });
function fakeHost() {
  const calls = [];
  const note = (name) => async (...args) => { calls.push([name, ...args]); return { number: 1 }; };
  return { calls, listIssues: async () => [], createIssue: note("createIssue"), commentOnIssue: note("commentOnIssue"), setIssueLabels: note("setIssueLabels"), setIssueState: note("setIssueState") };
}
function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => (values.has(key) ? values.get(key) : null), setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key),
    get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null, values };
}
function fresh() {
  const storage = memoryStorage();
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  return { storage, store: openStore("akmaier/agent-m") };
}
const PRODUCT = "https://github.com/example/thesis-tool";

// TST-956001 · level: unit · module: MOD-mail-handling
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; MAIL STAYS IN THE MAILBOX
// given: an empty store of the instance and a host that records its calls
// input: decideMail(mail, { kind: "not-an-issue" }, host, store); and the same with no host
// expect: the answer is { issue: null }; the store holds the list [the identifier] under not-an-issue and nothing else (no text, no sender); the host received no call
test("a mail marked not an issue is added to the marks of the store, and nothing is written to any host", async () => {
  const { storage, store } = fresh();
  const host = fakeHost();
  assert.deepEqual(await handling.decideMail({ id: FIRST, people: PEOPLE }, { kind: "not-an-issue" }, host, store), { issue: null });
  assert.deepEqual(readSetting(store, "not-an-issue"), [FIRST]);
  assert.deepEqual([...storage.values.values()], [JSON.stringify([FIRST])]);
  assert.deepEqual(host.calls, []);
  const other = fresh();
  assert.deepEqual(await handling.decideMail({ id: SECOND, people: PEOPLE }, { kind: "not-an-issue" }, null, other.store), { issue: null });
  assert.deepEqual(readSetting(other.store, "not-an-issue"), [SECOND]);
});

// TST-956002 · level: unit · module: MOD-mail-handling
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
// given: a store that holds the mark of the first mail
// input: the second mail marked; then the first marked again
// expect: the marks are [first, second], in that order, and the first is not listed twice
test("a second mark keeps the first, and a mail is marked once", async () => {
  const { store } = fresh();
  await handling.decideMail({ id: FIRST, people: PEOPLE }, { kind: "not-an-issue" }, null, store);
  await handling.decideMail({ id: SECOND, people: PEOPLE }, { kind: "not-an-issue" }, null, store);
  assert.deepEqual(readSetting(store, "not-an-issue"), [FIRST, SECOND]);
  await handling.decideMail({ id: FIRST, people: PEOPLE }, { kind: "not-an-issue" }, null, store);
  assert.deepEqual(readSetting(store, "not-an-issue"), [FIRST, SECOND]);
});

// TST-956003 · level: unit · module: MOD-mail-handling
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
// given: a mailbox with the two mails; the first marked through decideMail
// input: readNewMail(mailbox, [{ address, host }], the marks read from the store); and the same with no marks
// expect: with the marks the first mail is left out and counted as decided, the second proposed; with none both are proposed
test("readNewMail with the marks of the store leaves the marked mail out", async () => {
  const { store } = fresh();
  await handling.decideMail({ id: FIRST, people: PEOPLE }, { kind: "not-an-issue" }, null, store);
  const products = [{ address: PRODUCT, host: fakeHost() }];
  const marked = await handling.readNewMail(mailbox([mail(FIRST), mail(SECOND)]), products, readSetting(store, "not-an-issue") ?? []);
  assert.deepEqual([marked.proposable.map((each) => each.mail.id), marked.decided], [[SECOND], 1]);
  const none = await handling.readNewMail(mailbox([mail(FIRST), mail(SECOND)]), products, []);
  assert.deepEqual([none.proposable.map((each) => each.mail.id), none.decided], [[FIRST, SECOND], 0]);
});

// TST-956004 · level: unit · module: MOD-mail-handling
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
// given: no store
// input: decideMail with { kind: "not-an-issue" } with null, with undefined and with a host but no store
// expect: each rejects with a TypeError and nothing is written to the host
test("without a store the mark is refused with a TypeError", async () => {
  const host = fakeHost();
  for (const store of [null, undefined]) {
    await assert.rejects(handling.decideMail({ id: FIRST, people: PEOPLE }, { kind: "not-an-issue" }, host, store), (error) => error instanceof TypeError && /browser.s store/.test(error.message));
  }
  assert.deepEqual(host.calls, []);
});

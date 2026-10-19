---
id: ITM-956
title: A mail marked not an issue is kept in the browser's store
level: module
realises:
  - UC-038
  - A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
modules:
  - MOD-mail-handling
builds_on:
  - ITM-952
  - ITM-957
tests:
  - unit
origin:
  - the split of ITM-952 at its start, sprint team2/94 (developer-sonnet-h's stop, rule 1)
---
# ITM-956 A mail marked not an issue is kept in the browser's store

**REGISTER**

## Outcome

Rests on the draft `0fbe0bf0`, MOD-mail-handling.md:87-94. It starts when akmaier has accepted it, and the quote is checked
against the accepted blob first. "`decideMail(mail: { id: string, people: People }, decision: MailDecision, host: Host |
null, store: Store)` ... *not an issue* adds the identifier to this browser's marks in `store`, the store the page opened
for the instance."

The mark is the setting `not-an-issue` of MOD-browser-store's catalogue (MOD-browser-store.md:75), which ITM-957 adds to
the code.

## Acceptance

- Unit tests that name MOD-mail-handling, over a store made by MOD-browser-store's `openStore` on a fake `localStorage`:
  - *not an issue* adds the identifier to `not-an-issue`, writes nothing to any host, and gives `{ issue: null }`;
  - a second mark keeps the first;
  - `readNewMail` with those marks leaves the mail out.
- Counter-proof: a `decideMail` that does not write the mark fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/mail-handling/` and the tests that name MOD-mail-handling change.

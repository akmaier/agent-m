---
id: ITM-828
title: What waits and what is built name every row the old page showed
level: module
realises:
  - UC-046
modules:
  - MOD-progress-measures
builds_on:
  - ITM-685
tests:
  - unit
origin:
  - the count of the main page's requests before ITM-684 (sprint team1/76), by developer-sonnet-e
---
# ITM-828 What waits and what is built name every row the old page showed

**REGISTER**

## Outcome

The old main page shows architecture files among *What waits for a person*, and *blocked* and *done* rows among what is
being built. `waitingForAPerson` omits the architecture files, and `buildInProgress` omits *blocked* and *done*.

At the start, each is read against MOD-progress-measures' text (`waitingForAPerson`, `buildInProgress`) and UC-046:
- where the text asks for the row, it is a fault, built here with a test;
- where no text asks for it, the row goes with the old page, and the item says so.

## Acceptance

- Both functions give what their text and UC-046 say, with tests, and the rows that go are named.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

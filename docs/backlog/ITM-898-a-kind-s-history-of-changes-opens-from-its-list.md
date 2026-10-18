---
id: ITM-898
title: A kind's history of changes opens from its list
level: module
realises:
  - UC-008
  - UC-023
modules:
  - MOD-review-pages
builds_on:
  - ITM-879
tests:
  - unit
origin:
  - ITM-879's stop (sprint team1/87), from developer-sonnet-d's reading
---
# ITM-898 A kind's history of changes opens from its list

**REGISTER**

## Outcome

MOD-review-pages.md, as akmaier accepted it (`257db304`):
- `<k>` ends "and a link to `<k>/history`";
- `<k>/history` is "the history of the kind's changes: its approval records, newest first, each with the file it names,
  the person who committed it and the date; opened only from the link on `<k>`".
No function in MOD-review-pages' Uses gives the committer and the date of a record. MOD-repository-hosts' `readHistory`
does (`HistoryEntry`: `author`, `date`, `changes`; MOD-repository-hosts.md:117-118, :177). So a draft adds it to
MOD-review-pages' Uses, "on `<k>/history` only", committed for akmaier with this item. developer-sonnet-d found this at
ITM-879's stop.

**The address** follows the module's other routes: `<k>/history` in the text is `#<route>/id=history` in the address, as
`<k>/all` is `#<route>/id=all`. ITM-878's *History of SPEC changes* opens `#spec-entry/id=history`.

## Acceptance

- `<k>` ends with a link to `<k>/history`, and that page lists the kind's approval records newest first, each with the file,
  the person who committed it and the date, through `readHistory`. Tests check this, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- It waits for akmaier's acceptance of the draft in MOD-review-pages.md.

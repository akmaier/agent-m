---
id: ITM-879
title: The use case and architecture lists show open changes first, then every file; their history opens on request
level: module
realises:
  - UC-008
  - UC-023
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-18 on the use case and architecture pages' layout, relayed by scrum-master-opus
---
# ITM-879 The use case and architecture lists show open changes first, then every file; their history opens on request

**REGISTER**

## Outcome

akmaier: "Use cases: Same first: Changes open? Yes display, otherwise omit; Then show list of use cases; history of changes
on a sub page; Same for Architecture."

**What the text stated before this item's draft** (MOD-review-pages.md, the route `<k>`): "the files of the kind with
their status — open, accepted, changed since acceptance —, each with a tick". There was no part for open changes first,
and no history page. The route serves the use cases (`use-case`) and the architecture (`decision`, `module`) alike
(`src/review-pages/kinds.mjs:17-25`). So one item builds it for every kind, with no special first case.

**The draft, committed to MOD-review-pages.md for akmaier:**
- `<k>`: "first, only while a file of the kind is open or changed since acceptance, those files, each with its status
  and a tick, and no such part where none is; then every file of the kind with its status — open, accepted, changed since
  acceptance —; and a link to `<k>/history`".
- `<k>/history`: "the history of the kind's changes: its approval records, newest first, each with the file it names, the
  person who committed it and the date; opened only from the link on `<k>`".

"History of changes" is read as the kind's approval records, the accepted changes. akmaier decides that reading by
accepting or changing the draft.

## Acceptance

- The list of a kind shows its open and changed files first, and no such part when there are none; then every file with
  its status. Tests check both cases for the use cases and the architecture, each with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Split at its stop clause (sprint team1/87).** No interface in MOD-review-pages' Uses gives an approval record's
committer and date, so `<k>/history` and the link to it are ITM-898's. This item builds the list's two parts.


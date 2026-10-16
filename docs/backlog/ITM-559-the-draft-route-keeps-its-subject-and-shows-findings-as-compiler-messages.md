---
id: ITM-559
title: The route draft keeps its subject, and shows findings as compiler messages
level: module
realises:
  - UC-019
  - A FINDING READS LIKE A COMPILER MESSAGE
modules:
  - MOD-review-pages
builds_on:
  - ITM-507
  - ITM-514
tests:
  - unit
origin:
  - ITM-514's findings S11 (TST-377012) and S14 (TST-418126), gate docs/gates/20261016-1655-development-release-testing-70c2.md
  - architecture draft for akmaier: MOD-review-pages uses MOD-text-tools.formatFinding
---
# ITM-559 The route draft keeps its subject, and shows findings as compiler messages

**REGISTER**

## Outcome

- **S11, the subject.** The route `draft` gives the subject of the draft it shows: the draft's subject key, its kind
  and target, and `draft/subject=<key>` as its draft route. MOD-review-pages says a further change "is asked for in the
  prompt bar, which sends the draft as it stands with the follow-up, and this route then shows the newer draft". Today
  the route has the frame's default, a `converse` subject without a draft route, so a follow-up offers no *Review the
  draft*.
- **S14, the findings.** The rounds and the findings the loop left are shown in the one fixed text form of `A FINDING
  READS LIKE A COMPILER MESSAGE`, with MOD-text-tools' `formatFinding`. Today `roundsAndLeft`
  (`src/review-pages/conversation-draft.mjs`) writes `<rule>: <what> — <fix>`.
  - `formatFinding` is not among MOD-review-pages' uses. A draft adds it, and S14 waits for its acceptance.

ITM-514's todo tests TST-377012 and TST-418126 then pass, and are turned into plain tests by a developer who implements
none of this item.

**Cut at sprint team1/48's start.** S11 is built there. S14 stays here and waits for the draft of `formatFinding`'s use.
- **The address.** The route's own draft route is `draft/subject=<key>`, with the key encoded by `encodeURIComponent`,
  as `src/review-pages/subjects.mjs:122` writes it. `src/review-pages/conversation-draft.mjs:68` reads it back as
  `params.subject`.
- **No existing test changes.**

## Acceptance

- **S11.** In a small DOM with a fixture draft, the route's subject is the draft's, and a follow-up offers *Review the
  draft*.
- **S14.** Each finding shown matches `formatFinding`'s form for it.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.

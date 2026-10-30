---
id: ITM-1315
title: Accept stays on a file's page, disabled, while the file rests on what is not accepted
level: module
realises:
  - UC-023
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - ONE CLICK PER DECISION
modules:
  - MOD-review-pages
builds_on:
  - ITM-739
tests:
  - unit
origin:
  - po-opus-c's gate of ITM-739 (PR #1510), docs/gates/20261030-0753-development-release-testing-c739.md, finding UC023-S5; the close of sprint team1/126, feedback
---
# ITM-1315 Accept stays on a file's page, disabled, while the file rests on what is not accepted

**REGISTER**

## Outcome

UC-023 4b: "The changed file names a requirement or use case that is not accepted. *Accept* stays disabled and names
it." MOD-review-pages lists *Accept* on the page of one file, `<k>/<id>` (MOD-review-pages.md:200-201), and ITM-729's
Acceptance reads it so: "*Accept* stays as it is: disabled while the file names what is not accepted (4b, ITM-440)".

`offerAcceptance` (`src/review-pages/flow.mjs:610-618`) draws the section "Rests on what is not accepted" with the names
`acceptanceBlockers` gives, and returns before it draws any *Accept*. The page names what is open, as 4b asks, but shows
no *Accept* at all. The system test of UC-023 holds this as the finding UC023-S5 (TST-739012, `todo`).

With this item, a file that rests on what is not accepted shows the same section and, beside it, *Accept* disabled.
Pressing it writes nothing. Once every name it rests on is accepted, *Accept* is offered as today. Nothing else of the
page changes: *Accept all N shown* on Review all keeps leaving such a file out and naming why (TST-739104).

## Acceptance

- A unit case of the decision's page:
  - a decision that rests on a use case no record names is drawn with the section "Rests on what is not accepted",
    naming the use case, and with a button *Accept* that is disabled;
  - a click on it writes nothing;
  - known positive: with a record naming the use case, *Accept* is enabled, and its click writes the record, as today.
- Counter-proof: on the code as it stands, the page holds no button *Accept*.
- TST-739012 (`tests/system-uc-023-modify-the-architecture.test.mjs`) loses its `todo` and passes, and TST-739001's
  `FLOW_FINDINGS` entry `4b-accept-disabled` moves to `FLOW_EVIDENCE` with TST-739012 as its evidence. Both are changed on
  the item's branch, in a commit of their own, by a participant who implemented none of this item.
- TST-739104 stays as it is: the page "offers no Accept that can be pressed".
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change, with the system test named above. The
  planning run names any other test before selection.

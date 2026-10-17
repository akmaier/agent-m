---
id: ITM-731
title: Check this edit, before an architecture edit is saved
level: module
realises:
  - UC-023
  - AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT
  - A REVIEW FINDING IS WEIGHED BEFORE IT IS ACTED ON
  - NO REVIEWER IS THE DRAFTER
  - A REVIEWER'S FINDING IS A WARNING
  - THE PAGE NAMES WHERE IT SENDS
modules:
  - MOD-review-pages
builds_on:
  - ITM-728
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-731 Check this edit, before an architecture edit is saved

**REGISTER**

## Outcome

UC-023 step 3: "Before saving an edit, the author may have it checked in the same way." MOD-review-pages states it on
`<k>/<id>/edit`: "*Check this edit* runs the kind `review-architecture` on the edited files as its draft, and its
findings stand beside them for the author to weigh". The editor of ITM-728 offers it: the reviewing participant chosen
among those that can draft text, the run panel naming what is sent where, *Run*, and the findings in the compiler form
beside the edit, each a warning. Nothing is saved by the check.

## Acceptance

- In a small DOM with a fixture reviewer: the run panel names the destination; the reviewer receives the edited file as
  its draft; its findings stand beside the editor as warnings; *Save* stays offered; nothing is committed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

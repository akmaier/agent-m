---
id: ITM-727
title: Propose groups on the arrangement
level: module
realises:
  - UC-021
  - THE PAGE NAMES WHERE IT SENDS
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - ONE CLICK PER DECISION
modules:
  - MOD-review-pages
builds_on:
  - ITM-723
  - ITM-726
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-727 Propose groups on the arrangement

**REGISTER**

## Outcome

*Propose groups* on the route `arrange/<group kind>` (UC-021 1b), as MOD-review-pages states it: the author chooses a
participant that can draft text, sees in the run panel what is sent where — titles and identifiers of the items, with
their text for requirements (ITM-723) —, and presses *Run*. The kind `propose-groups` runs in the tab with its check
`group-rules` (ITM-388). Its moves arrive as pending changes of ITM-726, which the author edits before *Save
arrangement*. Nothing is written by the job.

## Acceptance

- In a small DOM with a fixture participant: the run panel names the destination and the parts; *Run* starts the job;
  the returned moves stand as pending changes and the group file is unchanged until *Save arrangement*.
- Without *Run*, nothing is sent.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

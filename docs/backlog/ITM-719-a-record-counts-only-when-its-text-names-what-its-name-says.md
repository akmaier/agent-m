---
id: ITM-719
title: A record counts only when its text names what its name says
level: unit
realises:
  - STATUS IS DERIVED FROM THE RECORDS
  - AN APPROVAL NAMES THE EXACT TEXT
modules:
  - MOD-approvals
builds_on:
  - ITM-680
tests:
  - unit
origin:
  - ITM-680's second round (sprint team1/73), from developer-sonnet-d's stop 1
---
# ITM-719 A record counts only when its text names what its name says

**REGISTER**

## Outcome

The removed review views checked an approval record's content against its file name. MOD-review-pages "derives no
status of its own", so the check is not rebuilt on the pages. It is MOD-approvals' to give, if anyone gives it.

`STATUS IS DERIVED FROM THE RECORDS` reads: "A reviewed file counts as accepted exactly when an approval record names
its current blob SHA". `AN APPROVAL NAMES THE EXACT TEXT` says what a record names: "the file it approves and the git
blob SHA of the text the reviewer saw".

MOD-approvals' `statusOf` matches records "by the identifier in the file name", and `statuses` is computed in one pass
over `docs/approvals/`. At the start, a unit test plants a record whose name gives one blob and whose text names
another. It shows whether such a record counts.
- If it counts, `statuses` reads the records' texts in the same snapshot, in batches.
- If that is a change of MOD-approvals' text, it is drafted for akmaier.

The start measures the requests on this repository.

## Acceptance

- A record whose text names another file or blob than its name does not make a file accepted. The test pins it.
- The requests of `statuses` with a token are one batch per hundred records.

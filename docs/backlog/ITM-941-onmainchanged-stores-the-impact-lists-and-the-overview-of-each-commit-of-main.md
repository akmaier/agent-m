---
id: ITM-941
title: onMainChanged stores the impact lists and the overview of each commit of main
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-908
  - ITM-939
  - ITM-940
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("The dependency walk can be triggered automatically ... this is only required after a mere into main")
---
# ITM-941 onMainChanged stores the impact lists and the overview of each commit of main

**REGISTER**

## Outcome

Rests on the draft `c6baba33`, MOD-workflow-entries.md:198-207 (`onMainChanged`). It starts when akmaier has accepted it,
and the quote is checked against the accepted blob first. In outline: on every push to the default branch of the
instance, it reads the commit's snapshot once. It hands `publishGraph` the not-accepted decision and module files, with
their last accepted texts from MOD-approvals' `statuses` and `lastAcceptedText`, and it calls `publishOverview` with the
facts of the scope `all`. A file already stored is `nothing to do`. A failure of one record leaves the other written and
ends the entry `failed`, naming it.

ITM-908 adds the workflow file and the entry for the graph alone. This item hands over the files and adds the overview.

## Acceptance

- Unit tests that name MOD-workflow-entries, over a fake host with one changed module file, one accepted one and an
  approval record history:
  - the entry hands `publishGraph` exactly the changed file, with its last accepted text and that text's commit;
  - it calls `publishOverview` once;
  - a second run on the same commit is `nothing to do`;
  - a failing `publishOverview` leaves the impacts written and ends `failed`, naming it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change.

## Read at sprint team2/94's second plan (po-opus-b)

The draft `c6baba33` is accepted in `8bf67a3b`. Each module's current blob is the draft's blob, so the quotes and their lines
stand.

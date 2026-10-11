---
id: ITM-364
title: The instance's workflow entry that applies approvals
level: module
realises:
  - UC-006
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - A STALE APPROVAL IS NOT APPLIED
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-312
  - ITM-340
tests:
  - unit
origin:
  - UC-006 4c
---
# ITM-364 The instance's workflow entry that applies approvals

**REGISTER**

## Outcome

The module's folder `src/workflow-entries/`, as MOD-workflow-entries' file states it, as far as this entry needs it:

- `main.mjs` reads the entry's name from the command line and the environment, runs the entry, and ends with its
  status.
- The instance's part of `compose.mjs` connects the checkout through the local clone (ITM-312), with the workflow's
  own token from the environment.
- `CiEnvironment` and `EntryStatus` cover what this entry reads.
- `instance.mjs`'s `onApprovalsCommitted` applies, in one commit, every approval of the instance's own SPEC that no
  decision row names yet, with `applyApproved` (ITM-340); its status names what was applied and what was stale, and
  nothing stale is written.

Making `.github/workflows/apply-approvals.yml` run `node src/workflow-entries/main.mjs onApprovalsCommitted` instead of
`tools/apply_approvals.py` is a change between jobs. The entries of a product's job workflow (ITM-365) are not part of
this item.

## Acceptance

- Unit tests that name MOD-workflow-entries state, before the code exists, on a temporary git repository holding a
  fixture instance: an approval committed without the dashboard applied in one commit — section and decision row —
  byte for byte as `acceptEntries` writes it; a stale approval writing nothing and named in the status; nothing to
  apply giving `nothing to do`; a missing token giving `not run`, naming it, before anything is written.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request; the tests finish within CI's two minutes.
- The existing tests stay green, with no expected result changed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change.

---
id: ITM-690
title: The old review core goes
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-approvals
builds_on:
  - ITM-680
  - ITM-685
  - ITM-692
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-690 The old review core goes

**REGISTER**

## Outcome

`docs/assets/review-core.mjs` repeats MOD-approvals' records and status, MOD-spec-document's sections and
MOD-text-tools' hashes. Once the review views, the main page's progress and the old trace graph no longer import it, it
goes.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- It is declared as refactoring: CI is green on every commit.

**Noted at sprint team1/89's end gates.** `tests/release-sprint-02-c-review-core.test.mjs:204` failed once on CI (run
39127567347, job 117675817449) in its own cleanup: "ENOTEMPTY: directory not empty, rmdir '…/.git/objects/pack'", from
`rmSync` at `:227`. It looks like a race between the cleanup and git still writing pack files. MOD-approvals.md:58 names the
file as taken over, so this job, when it rewrites or removes the file, makes its cleanup wait for git or retry.


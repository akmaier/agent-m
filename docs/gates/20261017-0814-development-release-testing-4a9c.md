---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 75a216bfb2c92452f9679f0ef5e1bbb6cc429ed2
  - https://github.com/akmaier/agent-m/pull/707
date: 2026-10-17 08:14 UTC
---
# Development → Release testing: ITM-636, Two changes of one requirement are refused, not lost

**REGISTER**

## Reason

ITM-636, pull request #707 into `sprint/team1/68`, at head `75a216bf`. developer-sonnet-a wrote it.

**What holds.**
- **Red.** The tests-only commit `ddf8ed6a` was red in run 39015625702 (`failure` on `ddf8ed6a`), with 10 failures on
  behaviour: TST-636001, 002, 005, 007, 008, 010 and 011, and TST-634003, 004 and 008, which the item named.
- **CI and merging.** CI is green, ten of ten in run 39016380290, and the pull request is mergeable.
- **Other checks.**
  - Three planted faults are caught.
  - The draft turned exactly the named or found tests red.
  - The head fails the same 30 node and 2 Python local tests as the base.
  - The UC-019 table is identical, with 29 receipts. ITM-018 passes, and no read is added.

**Rulings.**
1. **The implementer's change to TST-418112 does not stand.** It is in `tests/release-uc-019-change-requirements-by-
   prompt.test.mjs`, a release test, and this is why the gate is rejected.
   - The header names MOD-review-pages and MOD-spec-changes, so `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` allows
     the file.
   - But `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` (SPEC.md:1471) reads: "A test of level `release` is generated
     or written by a participant other than the one that implemented the behaviour it tests." The refusal of a second
     `change` is developer-sonnet-a's behaviour.
   - This is ITM-643's case, and it is settled the same way: **ITM-645's pattern.** ITM-664, registered with this gate,
     goes first: another participant changes the choice to `new`. That passes on `sprint/team1/68` as it stands and on
     this head. Then #707 drops its own edit of that test.
2. **TST-361003/584011 is accepted as changed.** Its fixture had the same second-change pattern, and now changes A BOOK
   IS SHELVED. The draft run found it, as sprint 64's agreement intends. It is a unit test of MOD-review-pages, so no
   rule of authorship applies.
3. **`queueEntries` composing both repositories' sections before the first commit is within the item.** The item's
   acceptance reads: "A draft with two `change` candidates of one requirement writes nothing." With the old loop per
   repository, a `TwoChanges` in the instance left the product's queue committed. TST-636008 and its counter-proof show
   the difference.
4. **`TwoChanges { requirement, candidates }` is accepted, and a one-word draft for akmaier is committed with this
   gate.** This is the same reason as `NoteMissing { file }` at ITM-576's gate: a field `name` would overwrite
   `error.name`, which is every error's kind in the module. The draft changes the text to `TwoChanges { requirement,
   candidates }`.

**What is asked.**
1. **ITM-664 is merged into `sprint/team1/68` first,** written by a participant other than developer-sonnet-a.
2. **Then #707 drops its edit of TST-418112 in a new commit,** with the sprint branch merged in, not rebased. Nothing
   else changes, and the gate is decided again on the new head, with CI green.

**Process.** Two commands chained git with `git status`, against sprint 67's agreement that a shell command does one
action. Nothing was refused or worked around. It is for sprint 68's feedback.

**Findings** (sprint 63's agreement):
- **Nothing tells the person how to go on after `TwoChanges`.** This is registered as ITM-665. It is the panel's own
  wording of a refusal it already shows, so no use case needs a draft.
- **The other refusals of the second repository still leave the first written**: `RationaleInvalid`, `NoHost` and
  `Moved`. This is registered as ITM-666.
- **Item history in `accept.mjs`, `queues.mjs`, `strategies.mjs` and `propose.mjs:322, :413`: no item.** Sprint 67's
  agreement covers the header of a file an item touches, and those lines are in other files or below the header. Each
  goes with the next item that touches its file's header.

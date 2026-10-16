---
id: ITM-536
title: A product's facts, read once
level: module
realises:
  - UC-032
  - UC-049
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-progress-measures
builds_on:
  - ITM-522
  - ITM-516
tests:
  - unit
origin:
  - MOD-progress-measures, Interfaces: Facts, productFacts (accepted at 83312204 with containsCommit and undecidedHeads)
  - sprint team1/43's start decision: ITM-505 lets a hand-over start only where `startable` finds no reason on the states
    `itemStates` derives from the facts `productFacts` reads, and `productFacts` is not built
---
# ITM-536 A product's facts, read once

**REGISTER**

## Outcome

MOD-progress-measures' `productFacts` with the scope `work`, and `Facts` as it then holds them. It builds against the
draft of MOD-progress-measures' file committed on `main` for akmaier's acceptance with sprint 45's swap, and waits for
that acceptance.
- **Why a draft.** Reading what `itemStates`, `startable` and `holdsRole` take needs schemas and functions the module's
  Uses did not name: `artifactSchemas` for the items and module files, `roleAssignmentSchema`, `participantsOf` and
  `modelSchema`. `docs/role-assignments/` was missing from its Reads.
- **The scope.** A cut that leaves facts out needs the interface to say so. The draft adds the scope `work`, in which
  every fact outside that set is `"unknown"`, and lets those fields' types hold `"unknown"`.

What is built, with the scope `work`. `productFacts` reads once, from the product's default branch through its host:
- the approval statuses (MOD-approvals) and the change queues (MOD-spec-changes);
- the declaration with its model and workflow, read with `instanceAt` at the commit the declaration names;
- the instance's participants (`participantsOf`);
- the plan or the backlog — items read with `artifactSchemas().item`, the order with `planSchemas` — and the sprints;
- the role assignments (`roleAssignmentSchema`);
- the gate records and `gateStates`;
- the job records as `JobRow`s, without asking a live state;
- the pull requests.
From them it derives `plan.states` with `itemStates`, and `held` with `heldItems`, asking `containsCommit` for exactly the
heads `undecidedHeads` names, with the module files read by `artifactSchemas().module`. Every other field is
`"unknown"`.

The scope `all` is left to a later item. Until then the module's header names it as not built, as it names its other
unbuilt parts.

The draft was accepted with `90ed6d66` (`docs/approvals/MOD-progress-measures-8b1263eaba0c.md`).

**Existing tests: none change.** A grep of `tests/` for `productFacts` finds two hits:
- `tests/test_main_page.py:51` calls `progress.productFacts`, which is `src/home/progress.mjs`, not this module;
- a `todo` text in `tests/system-uc-019-change-by-prompt.test.mjs:421`.

A new file in `src/progress-measures/` takes a name that `tests/jsrun.py` reaches by no other file, since jsrun refuses
two files of one name.

## Acceptance

- Against a fixture product and instance, `productFacts` reads the facts its file names once each, and `held` is computed
  with `containsCommit` for exactly the heads `undecidedHeads` names.
- Each test states its expected values in its own text.

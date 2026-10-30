---
id: ITM-1319
title: Accepting a use case puts the modules it changes into the backlog
level: module
realises:
  - UC-008
  - ACCEPTING A USE CASE PUTS THE MODULES IT CHANGES INTO THE BACKLOG
  - ONE CLICK PER DECISION
  - THE PAGE NAMES WHERE IT SENDS
modules:
  - MOD-review-pages
  - MOD-job-catalogue
  - MOD-work-plans
builds_on:
  - ITM-739
tests:
  - unit
origin:
  - po-opus-c's gate of ITM-739 (PR #1510), finding UC023-S4; akmaier's ruling ("When I accept the use case, I want the affected modules to be checked and entered into the backlog as tasks automatically."), accepted as the SPEC requirement in cc22de1e7
---
# ITM-1319 Accepting a use case puts the modules it changes into the backlog

**REGISTER**

## Outcome

The SPEC, §13: "In a model that pulls its work from a backlog, accepting a use case adds one backlog item for each module
whose implementation its accepted text changes, unless an item not yet done names that module." Its check is
`tests/test_backlog_from_acceptance.py`, which does not exist yet.

UC-008 step 6 says the same: "the same click has Agent M check which modules the accepted text changes — by the
participant that the page named, with its processing place, beside **Accept** — and add one backlog item for each of
them that no item not yet done names, realising the use case (UC-032), under the reviewer's account."

The accepted architecture states it in three modules. The code builds none of it yet.
- **MOD-job-catalogue** has the kind `check-affected-modules` (MOD-job-catalogue.md:96).
  - It serves UC-008, needs *draft text*, and has the precondition `rests-on-accepted`.
  - Its recipes are `use-case-with-neighbours` and `whole-architecture`, and its check is `backlog-checks`.
  - Its step is `leave-out-named-modules`, its review `none`, and its writer `backlog-items`.
  - Its result is one item for each module whose implementation the accepted text changes.
- **MOD-work-plans** gives the step `leave-out-named-modules`. It leaves out of the drafted items each item for a module
  that an item not yet done names — one whose state `itemStates` gives is not `done` —, with a finding naming that item
  and the module.
- **MOD-review-pages:**
  - In a product whose workflow's model is `pulled`, every *Accept* of a use case names beside it the participant that
    will check which modules each use case changes, with its place, as `prepareJob` of `check-affected-modules` gives
    it. This holds for the *Accept* of one file, of the ticked ones, and *Accept all N shown*.
  - Once the acceptance's commit is written, the same click runs one job of that kind in this tab for each use case it
    recorded. Its writer commits the items under the person's account.
  - In a `planned` model, none is named and nothing runs. The model's kind comes from
    `MOD-product-process.productWorkflow`, which its Uses now name.
  - MOD-approvals does not change: the acceptance stays its one commit, and the items follow as a second commit of the
    same click.

## Readiness

It is ready. akmaier accepted both texts it waited for:
- UC-008, at the blob `310103869e` its text has on `main` (`a52aff870`);
- the architecture above: MOD-job-catalogue, MOD-review-pages and MOD-work-plans, each at the blob its file has on `main`
  (`1b539d0fe`).

NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED holds for every text the item names. Its planning stand-in and run are still
to be made before it is selected (below).

## Acceptance

- `tests/test_backlog_from_acceptance.py`, the check the SPEC names, with its case and both counter-proofs:
  - accepting a fixture use case in a Scrum fixture, whose checking fixture participant names two modules its text
    changes, commits two items, each naming the use case and one of the modules, under the accepting person's account;
  - a module that an item not yet done names gets no item;
  - accepting the same use case in a V-model fixture adds none.
- Unit cases of the page `uc/<id>`:
  - the checking participant is named with its place beside *Accept* before the click;
  - nothing is sent before the click.
- UC-023's TST-739013 (UC023-S4) stays as it is, `todo`.
  - It asks for UC-023 step 6, a list of the affected modules after a decision's *Accept*.
  - The accepted texts state UC-008 step 6, a use case's *Accept*. UC-023 step 6 keeps its text, and no module states
    it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Before selection: the planning stand-in and its run name the tests of other modules the change moves.

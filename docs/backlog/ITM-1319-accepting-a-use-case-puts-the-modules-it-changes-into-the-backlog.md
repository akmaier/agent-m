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

UC-008 step 6, in its text on `main`, says the same: "the same click has Agent M check which modules the accepted text
changes — by the participant that the page named, with its processing place, beside **Accept** — and add one backlog
item for each of them that no item not yet done names, realising the use case (UC-032), under the reviewer's account."

No module of the architecture states this:
- MOD-review-pages' page of a use case names no checking participant beside *Accept*, and starts nothing after it.
- MOD-job-catalogue has no kind that checks which modules a use case's text changes.
- MOD-work-plans' writer `backlog-items` writes drafted items through `saveItems` (MOD-work-plans.md:281). No rule
  leaves out a module that an item not yet done names.

## Readiness

It is not ready. Two texts come first:
- **UC-008's current text is open.** No approval record names its blob on `main` (`310103869e`). NOTHING IS IMPLEMENTED
  BEFORE IT IS ACCEPTED holds for the use case the item names.
- **The architecture, the smallest draft for akmaier.** Each part names the principle it rests on (AGENTS.md §2,
  *Designing*).
  - **MOD-job-catalogue: one row of the table**, a kind that checks a use case:
    - it serves UC-008, needs *draft text*, and has the precondition `rests-on-accepted`;
    - its recipes are the accepted use case and the whole architecture, as `whole-architecture` gives them already;
    - its result is the modules the text changes, as drafted items;
    - its writer is `backlog-items`, and its review is `none`, since the click on *Accept* is the person's decision
      (ONE CLICK PER DECISION).
    - It adds one kind and changes no other (principle 4), and reuses the recipe and the writer that exist (principle 2).
  - **MOD-work-plans: one sentence for `backlog-items`, or for a check it runs:** a drafted item for a module that an
    item not yet done names is left out, with that item named. The rule of item states stays in the one module that
    owns it (principle 1; DON'T REPEAT YOURSELF).
  - **MOD-review-pages: the use case's page `uc/<id>`.**
    - In a product whose model works from a backlog, the page names beside *Accept* the participant that will check
      the modules, with its processing place (THE PAGE NAMES WHERE IT SENDS).
    - After the acceptance's commit, the same click runs that kind in the tab, and its writer commits the items under
      the reviewer's account. In a model that plans its work, nothing runs.
    - The page's interface `view` does not change.
  - MOD-approvals does not change: the acceptance stays its one commit, and the items follow as a second commit of the
    same click.

## Acceptance

- `tests/test_backlog_from_acceptance.py`, the check the SPEC names, with its case and both counter-proofs:
  - accepting a fixture use case in a Scrum fixture, whose checking fixture participant names two modules its text
    changes, commits two items, each naming the use case and one of the modules, under the accepting person's account;
  - a module that an item not yet done names gets no item;
  - accepting the same use case in a V-model fixture adds none.
- Unit cases of the page `uc/<id>`:
  - the checking participant is named with its place beside *Accept* before the click;
  - nothing is sent before the click.
- UC-023's TST-739013 (UC023-S4) stays as it is. It asks for UC-023 step 6, a list after a decision's *Accept*. Whether
  that step changes with this requirement is the draft's question, not this item's.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Before selection: UC-008 is accepted, the draft above is accepted, and the planning stand-in and its run name the
  tests of other modules the change moves.

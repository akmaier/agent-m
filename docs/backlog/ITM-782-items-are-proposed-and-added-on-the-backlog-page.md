---
id: ITM-782
title: Items are proposed, written by hand and added on the backlog page
level: module
realises:
  - UC-032
  - A BACKLOG ITEM NAMES WHAT IT REALISES
  - A BACKLOG ITEM NAMES THE MODULES IT CHANGES
  - A GENERATED ARTIFACT IS A PROPOSAL
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - THE PAGE NAMES WHERE IT SENDS
  - ONE CLICK PER DECISION
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-681
  - ITM-615
  - ITM-616
  - ITM-617
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-782 Items are proposed, written by hand and added on the backlog page

**REGISTER**

## Outcome

UC-032 steps 2 to 4, 2a and 1a. The module's route `backlog` (`src/implementation-pages/backlog.mjs`) offers
neither *Propose items* nor *+ Item*. This item adds them as MOD-implementation-pages'
file states the route:
- *Propose items for uncovered requirements* with its run panel (`prepareJob` of the kind `propose-items`), whose
  drafts wait for the Product Owner, with their findings from `backlogFindings`; *Add to backlog* lets them go on as
  edited, through the writer of the kind (`writeResult`);
- *+ Item*, a form from the item schema, saved with `saveItems` as the person's own input;
- an item whose requirement was withdrawn or changed pointed at the replacing requirement, or removed, with `saveItems`.

## Acceptance

- A drafted item that realises nothing, names no module of the architecture or builds on an item that does not exist is
  shown with its finding and cannot be added; a restatement is flagged.
- *+ Item* and *Add to backlog* each write one commit of item files under `docs/backlog/`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

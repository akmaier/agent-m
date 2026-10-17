---
id: ITM-726
title: The arrangement of one kind, and Save arrangement
level: module
realises:
  - UC-021
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
  - A GROUP HOLDS ONE KIND OF ARTIFACT
  - AN ITEM HAS ONE PLACE IN ITS HIERARCHY
  - AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
  - A REGROUPING IS COMMITTED DIRECTLY
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-review-pages
builds_on:
  - ITM-722
  - ITM-725
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-726 The arrangement of one kind, and Save arrangement

**REGISTER**

## Outcome

MOD-review-pages' route `arrange/<group kind>`, in its part `arrange.mjs`, as its file states it, for requirements, use
cases, decisions, modules and tests. Neither the part nor the route exists: `src/review-pages/index.mjs` names no
`arrange` route. MOD-group-document's `parseGroupFile`, `groupFileText`, `applyMoves` and `hierarchy` are built
(ITM-300, ITM-381, ITM-695).

The route shows:
- the hierarchy of the kind, every item once, an item no group names at the top level marked *not yet placed* (3b), a
  member that matches no item as *unknown member* (3a), and a member named twice in both places until one is kept (3c);
- **+ Group**, renaming in place, and moving an item or a group by dragging and by **Move to …**, reachable by keyboard and
  screen reader; a move `applyMoves` refuses shown with its reason (2a, 2b), and *move content up one level*;
- the pending changes beside the tree;
- **Save arrangement**, one click, through `saveGroupFile` (ITM-722), on the blob read when the route opened; the commit as
  a link and the new hierarchy afterwards; without a group file, the first save creates it (1a);
- on `changed meanwhile`, the newer hierarchy with the pending changes applied where they still apply, and those that
  no longer apply named (5a);
- without a token on GitHub, the group file on the clipboard and GitHub's editor or new-file page through
  `fallbackEditLinks`; on GitLab without a token, no save (5c);
- the folded *What is this?* (ITM-725).

The lists `use-case`, `decision` and `module` link **Arrange** to the route of their kind. *Propose groups* is ITM-727.

## Acceptance

- In a small DOM with a fixture snapshot, for a kind with a group file and one without: the tree, 3a, 3b and 3c as
  stated; each kind of move, and a refused one with its reason.
- *Save arrangement* commits only `docs/groups/<kind>.md`; a changed blob writes nothing and shows the newer hierarchy
  with the pending changes named; without a token, a link without text and the file for the clipboard.
- No request leaves the fixtures.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

---
id: ITM-730
title: A restructuring of the architecture reviewed as a whole
level: module
realises:
  - UC-023
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
modules:
  - MOD-review-pages
builds_on:
  - ITM-729
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-730 A restructuring of the architecture reviewed as a whole

**REGISTER**

## Outcome

UC-023 step 5: a change that touches many files is accepted on the architecture's review page — "every changed file
with its difference and its impact list, every new file in full, every removed decision with its impact list, and
**Accept all N shown** for all of them in one commit". `decision/all` (ITM-441) shows the changed files with their
difference and the new ones in full; it shows no impact list and no removed decision.

This item adds to `decision/all` the impact list of ITM-729 beside each changed file, and each decision or module file
removed since its last acceptance — an approval record names it and the default branch no longer holds it — with its
impact list (`architectureImpact` with `after: null`). *Accept all N shown* is unchanged.

## Acceptance

- In a small DOM with a fixture snapshot holding a changed decision, a new module file and a removed module file: each
  changed and removed file with its impact list, the new file in full, and one commit with one record per file shown.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (b), a module text change, not drafted now

The question sprint 88 left for akmaier (`docs/backlog/sprints/team2/88.md:77-82`): what does the acceptance of a removal
record? It needs no SPEC or use case change: UC-023:98-100 asks for "every removed decision with its impact list, and
**Accept all N shown** for all of them in one commit", and SPEC.md:1034-1037 for "one approval record per file, each
naming the text shown". What lacks is the form of that record and how a removed file is found, both MOD-approvals':
- its statuses are those of files present (MOD-approvals.md:96-98);
- `acceptShown` leaves a removed file out as "changed since shown", since the head holds no blob of it
  (`src/approvals/accept.mjs:77`; sprint 88's call `kp88-730.mjs`).

**The draft to write**, in the form of the module files:
- MOD-approvals, `blob`: for a removed decision or module file, the blob of the empty text, which is what the default
  branch holds of it. So a record keeps one format, and a removal is no special case.
- MOD-approvals, a new interface `removedFiles(snapshot)`: every decision or module file a record names whose identifier
  the snapshot holds no file of, and whose removal no record accepts. It is computed in the same pass as `statuses`.
- MOD-approvals, `acceptShown`: a shown file with the empty text's blob is a removal, recorded while the head holds no
  file of its identifier.
- MOD-review-pages, `<k>/all`: for the architecture, every file `removedFiles` names, with its impact list
  (`architectureImpact` with `after: null`); its Uses gain `MOD-approvals.removedFiles`.

Principles: *no special first case* (one record form); *one responsibility* (the records' owner finds the removals);
*nothing twice* (one pass over `docs/approvals/`).

**Not drafted now.** MOD-review-pages is changed by team 1's sprint 87 (ITM-874 to ITM-879), so its file is not drafted
while that sprint runs. The draft of both files is written once that sprint is merged, and the item builds on its
acceptance.

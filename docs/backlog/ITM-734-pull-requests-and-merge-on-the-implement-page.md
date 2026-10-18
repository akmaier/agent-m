---
id: ITM-734
title: The jobs' pull requests and Merge on the implementation page
level: module
realises:
  - UC-024
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - ONE CLICK PER DECISION
  - UC-034
  - WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET
  - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-733
  - ITM-748
  - ITM-789
  - ITM-891
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-734 The jobs' pull requests and Merge on the implementation page

**REGISTER**

## Outcome

The route `implement` gains UC-024 steps 11 to 13, as MOD-implementation-pages states it: for each pull request of a
job it started, its CI runs (`listCiRuns`) — the red run of the tests-only commit, the green run of the last —, and
whether the Definition of Done holds (`doneCheck` over `pullRequestFacts`), naming each condition that does not;
**Merge**, one click, offered only once CI is green and the Definition of Done holds, through `mergePullRequest` (ITM-748)
on the head shown; a repository without branch protection named, with the server's page for it (12a); a merged step
shown as done with its branch, red run, green run and merge, and the steps that waited for it now ready.

The same holds for the pull request of an item started from the backlog (UC-034 step 8 and 8a): it targets the
sprint's branch where the product sets one, and the default branch otherwise.

## Acceptance

- In a small DOM with a fixture host: a pull request with a red first run and a green last run, the Definition of Done
  holding, merged on its head; one missing a condition shows it and offers no *Merge*; a moved head refused with
  `NotMergeable` and nothing claimed merged.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): which gate records the done check reads (a)

Sprint 87's record left for akmaier which of the product's gate records a pull request's done check reads
(`docs/backlog/sprints/team2/87.md:57-68`): with all 918 records, `doneCheck` reported #834 "not recorded as passed:
rejected", because the newest record of the gate was #835's. The texts answer it. SPEC.md:1807-1811: a pull request is
done when "every gate the workflow places before the merge is recorded" — its own gates; THE GATE IS RECORDED: "who
decided, when, and on which text" (SPEC.md:845-846); a record's `on` names "`<path>@<blob>` per artifact, or the commit"
(MOD-product-process.md:116). `gates` are "the product's gate records" (:192), handed to the check; the sentence does not
say each of them counts for every pull request (AGENTS.md §6a.7).

**The reading:** a record counts for a pull request when its `on` names one of the pull request's commits or the pull
request itself. ITM-891 fixes `doneCheck` so; this item builds on it.

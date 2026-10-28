---
id: ITM-990
title: The increment of a sprint branch is merged with Merge increment
level: module
realises:
  - UC-041
  - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
  - ONE CLICK PER DECISION
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-989
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-041-4, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-990 The increment of a sprint branch is merged with Merge increment

**REGISTER**

## Outcome

MOD-implementation-pages.md:184-185: "*Merge increment* as a pull request whose CI must be green, for a sprint with a
branch of its own". UC-041 step 7 (UC-041.md:88-91), 7a (UC-041.md:144-145) and 7c (UC-041.md:150-153): the sprint branch is
merged through a pull request whose CI must be green; with red CI it is not merged and the failing tests are shown; when
another team's increment came first the pull request is brought up to date, and a conflict names its files.

The host functions are built: `openPullRequest` and `mergePullRequest` (`src/repository-hosts/github.mjs:498`, `:506`),
`listCiRuns` (`:451`). No page opens a pull request of a sprint branch.

## Acceptance

- Unit tests that name MOD-implementation-pages, over a fake host:
  - a closed sprint with a branch offers *Merge increment*; one click opens the pull request of the sprint branch into
    the default branch and merges it once its CI is green;
  - with red CI nothing is merged and the failing runs are named;
  - a conflict with the default branch merges nothing and names the files.
- A sprint without a branch offers no *Merge increment*. Counter-proof: merging on red CI fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change.

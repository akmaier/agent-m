---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - dcd98d598fb2a2d06f987e701d6f8c63526a8368
  - https://github.com/akmaier/agent-m/pull/1078
date: 2026-10-19 13:50 UTC
---
# Development → Release testing: ITM-726, rejected — the route calls an interface its module does not use

**REGISTER**

## Reason

ITM-726 (MOD-review-pages), pull request #1078 into `sprint/team1/95`, is rejected on `dcd98d59`.

**What holds.**
- Six commits, all with the trailer `developer-sonnet-c`. `79903f79` merges `sprint/team1/95`.
- **The red,** run 39261700258, job 118090721175 on `59858d56`: `# fail 8`, `# cancelled 0`, exactly TST-726001 to
  TST-726008.
  - `6371e01c` and `ad477830` add tests, and are red too.
  - `dcd98d59` adds the route to `tests/site-usability.d/routes.mjs`, the helper of `tests/site-usability.test.mjs`.
    Both are of level `system`.
  - `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` (SPEC.md:1501-1503) covers level `release` only, so the
    implementer may change them.
  - `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST` (SPEC.md:1426-1428) asks it of the first commit, which is red.
- `arrange.mjs` is a part (MOD-review-pages.md:135), and the route is :250-252.
- CI passes 20 of 20 checks on the head (run 39262987874). `git merge-tree --write-tree` onto `sprint/team1/95`
  (`c2e08336`) is clean.
- sonnet-c's readings are kept:
  - `arrange/<group kind>` is the route `arrange` with the parameter `kind`;
  - an unplaced item joins the file only when a move takes it;
  - lifting a group leaves it empty.

**What fails.**
- `src/review-pages/arrange.mjs:20` imports, and `:43` calls, MOD-test-document's `isTestFile`.
- MOD-review-pages' uses name `MOD-test-document.testDeclarations` (:35), but not `isTestFile`.
- So the route calls an interface its accepted text does not let it use, as at ITM-657's and ITM-1037's gates.
- A grep of MOD-review-pages.md for `isTestFile` finds nothing. The same grep finds `saveGroupFile` (:64), its known
  positive.

**What passes on the next head.**
- The items of a kind come through a use the module names: MOD-trace-graph's `traceGraph` (:40).
- Its nodes of the kind `requirement`, `UC`, `ARC`, `MOD` or `TST` are the items a group file arranges, as
  MOD-artifact-edits' `itemsOfKind` reads them for the same files (`src/artifact-edits/strategies.mjs:166-181`).
- So no module text changes, and none is drafted (AGENTS.md §6a.6). The next head is gated again.

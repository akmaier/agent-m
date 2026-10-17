---
id: ITM-634
title: A split part is shown as it is written
level: module
realises:
  - UC-005
modules:
  - MOD-review-pages
builds_on:
  - ITM-578
tests:
  - unit
origin:
  - ITM-578's gate (docs/gates/20261017-0307-development-release-testing-7a2c.md)
---
# ITM-634 A split part is shown as it is written

**REGISTER**

## Outcome

UC-005 6a: "The author splits a flagged candidate. Each part becomes an entry of its own."

Two parts that change one requirement cannot both be written, because the second change replaces the first's block.
ITM-578 handles this in `editedResult` (`src/review-pages/candidates.mjs`): it writes such a part as `new`, with an
empty `of`. The panel still shows `change`, though, so what is written differs from what the person left, and the
person is not told.

This item makes the panel and the write agree:
- On *Split*, the second part of a `change` candidate shows the class `new` with an empty `of`. Every other class is
  copied as it is now.
- A part set to change what another part of the same candidate changes is refused before anything is written. The
  refusal is shown the way a duplicate name is.
- `editedResult` writes every part with the class and `of` the panel shows. The rewrite to `new` goes, together with its
  test's expectation of a silent rewrite.

**The readings, settled at sprint team1/63's start:**
- **The part's class on *Split*.** `splitPart` (`src/review-pages/candidates.mjs`) is given `new` and an empty `of`
  when the candidate's class is `change`. Its comment stops saying "of its class and `of` as the candidate stands" for
  that case. This changes ITM-578's settled reading of "the same class, `of`" for a `change` only.
- **The refusal.** It is in `splitProblem`, beside the two refusals already there. Among a candidate and its parts, two
  that are both `change` with one `of` keep the parts from being written. The message names the requirement:
  "Two parts of <candidate> change <of>: nothing was written."
- **The rewrite goes.** `editedResult` loses its `origin` parameter and the line that rewrites to `new`.
- **No rule of another module.** The panel, the refusal and `editedResult` are MOD-review-pages' own. The writer
  `queue-entries` stays as it is.
- **The grep of what goes** (sprint 58), in `src` and `tests`, release tests included:
  - The rewrite is found once, `src/review-pages/candidates.mjs:151` at `0f9cca92`, by `git grep "origin.of"`. No test
    names it.
  - TST-578008 asserts the part shows `change` of A LOAN HAS A DUE DATE after *Split*. That expected result changes
    to `new` with an empty `of`, and the test still writes both blocks.
  - The release test `tests/release-uc-019-change-requirements-by-prompt.test.mjs` plants faults in `candidates.mjs`.
    None of them is in the rewrite, so the developer runs its table on the base and on the head, and the two must
    match. ITM-578's planted faults were the developer's own runs, not in a test file, so the new refusal and the new
    *Split* values get counter-proofs of their own.
- **Every behaviour it alters gets a test** (sprint 62):
  - the shown class and `of` on *Split* of a `change` (TST-578008 changed, and a new test);
  - the refusal, with nothing written (a new test);
  - an unsplit `change` and a split `new` candidate are written as before. TST-578009 and TST-578003 to 005 stay, and
    they run unchanged.
- **Measurement:** no effect is claimed.
- **Reachable through the real host:** a real loop's remaining finding flags a `change` candidate, as in ITM-578.

## Acceptance

- After *Split* of a `change` candidate, the second part shows `new` with an empty `of`, and both parts are written as
  they are shown.
- Setting a part to change its candidate's `of` is refused, and nothing is written.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

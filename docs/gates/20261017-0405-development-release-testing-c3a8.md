---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7186790eed3ca66f3cf3482476c1300c94c08454
  - https://github.com/akmaier/agent-m/pull/680
date: 2026-10-17 04:05 UTC
---
# Development → Release testing: ITM-634, A split part is shown as it is written

**REGISTER**

## Reason

ITM-634, pull request #680 into `sprint/team1/63`, at head `7186790e`. developer-sonnet-d wrote it.

**Red.**
- The tests-only commit `15781b23` was red in run 38998485997. Node (4) shows `# fail 4` and `# todo 0`, and the failures
  are TST-578008, 634001, 634003 and 634004.
  - TST-578008's expected class and `of` after *Split* is the change the start decision named.
- The second tests-only commit, `7241edf6`, adds TST-634007 to 634009, which pin the refusal's scope. They pass on the
  base, as tests of what must stay. Run 38998654015 shows the same four failures.
- No expected value changed after a red.

**The code against the readings in the item.** The code diff is `src/review-pages/candidates.mjs` alone.
- `splitCandidate` gives the part of a `change` the class `new` with an empty `of`, and every other class as it stands.
- `splitProblem` refuses two of a candidate and its parts that are both `change` with one `of`. Its message is
  "Two parts of <candidate> change <of>: nothing was written.", as the item reads.
- `editedResult` lost the rewrite and its `origin` parameter.

**What else holds.**
- CI is green, ten of ten on the head, and GitHub reports the pull request mergeable.
- Seven planted faults are caught. Three of them showed gaps in the developer's own tests first, which TST-634007 to
  634009 close.
- The UC-019 table is the same on the base `320c339a` and on the head.
- 229 of 229 review-pages tests pass, and so does ITM-018.

**Readings taken.**
- **An empty `of` is no `of`.** A `change` whose `of` is empty names no requirement, so two of them change no one
  requirement and are not refused (TST-634009). The refusal is for two blocks under one name, and an empty `of` makes no
  such block.
- **The grep's prose hits.** `origin.of` matched six texts besides the removed line:
  - the DOMPurify licence;
  - `products.mjs:195`;
  - two lines of a release test;
  - a bridges test;
  - `test_no_backend.py`.

  The pattern's `.` matches any character, and it was the start decision's own pattern. Sprint 58's agreement asks that
  every hit be listed. A hit whose text is not the thing that goes is listed with the reason it is unrelated, and is not
  a stop. A stop is a hit that names what goes and is left unhandled. The developer named all six and read each as prose
  about an origin, and none is the rewrite.

**After it.** The lead the developer measured goes beyond one candidate: two different candidates changing one
requirement still lose one block in `entrySections`. It is registered as ITM-636, with a draft for akmaier, and it does
not block this item, whose scope was a candidate and its parts.

**Correction (2026-10-17, po-opus).** This decision was made at 03:31 UTC, the time of its commit `d9194c39`. The time 04:05 in its name and its `date` is wrong.

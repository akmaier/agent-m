---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - e258b6e7f8347c21b6f7bc1bfac401b67c71c2e7
  - https://github.com/akmaier/agent-m/pull/611
date: 2026-10-16 17:52 UTC
---
# Development → Release testing: ITM-551, The old prompt routes and Change by prompt are removed

**REGISTER**

## Reason

ITM-551, pull request #611 into `sprint/team1/48`, at head `e258b6e7`. developer-sonnet-c wrote it. The gate before
(`bf2f`, on `65a55cd4`) was rejected for one reason: the routes' remains stayed behind. One commit follows `65a55cd4`,
and nothing was rewritten.

1. **Red first, carried over.** The tests-only commit `f7e0ee02` failed exactly TST-399001–003, the changed TST-507009,
   and TST-551001–003 (run 38940776723). The new commit only removes code, as `bf2f` set.
2. **CI is green on the head**: run 38942773939, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The remains are gone.** `git grep -F` over `src/` and `tests/` counts each before and after:

   | Remain | `65a55cd4` | `e258b6e7` |
   |---|---|---|
   | `refineOnTab` | 2 | 0 |
   | `params.prompt` | 3 | 0 |
   | `prompt: "change-` | 2 | 0 |
   | `instruction: "change-instruction"` | 2 | 0 |

   The first figure for `refineOnTab` was checked by the Product Owner on `65a55cd4` itself. The guard in `factsOf` is
   now `if (!kind.change) return null;`. No test asserted any of them, so no test changed.
4. **Nothing else moved.**
   - The review pages' and the trace pages' tests pass, 453 of 453.
   - UC-019's system and release tests give 112 pass, 0 fail and 10 todo, as before.
   - ITM-018 passes 8 of 8.
   - The listing of `/private/tmp/claude-501/` was the same before and after the work.
   - The four earlier counter-proofs are caught as recorded.
5. **The Acceptance holds.** No route, file, link, button or remain of the old prompt pages is left in `src/`. A change
   is asked for only in the prompt bar and shown on `draft`.

`change-instruction` now stands only in MOD-site-frame's topic and its tests, which are ITM-562's. It also stands in the
text of TST-377116 in a release test, which is ITM-563's, and the item ITM-562 now says so.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0c3cbba55bc416148994787275986d23b395d833
  - https://github.com/akmaier/agent-m/pull/1248
date: 2026-10-20 21:57 UTC
---
# Development → Release testing: ITM-768, the audit view of a release

**REGISTER**

## Reason

Pull request #1248 into `sprint/team1/102` passes on `0c3cbba5`. CI is green on 23 of 23 checks (run 39504196153). CI
on a sprint branch leaves release tests out.

1. **The two numbers that cannot open their rows: cut, not a stop.** UC-030 step 3 reads "Each number opens the rows it
   counts".
   - `auditRows`' rows carry each test's `id`, `level`, `outcome` and `counterProof` (MOD-release-evidence.md:136-143).
     Nothing in them tells which rows `worse` and `byImplementer` count.
   - ITM-768 may change only `src/trace-pages/` and its tests, so it cannot add that to the rows.
   - The view shows all six numbers, and the four that the rows tell open their rows. That meets ITM-768's acceptance,
     "the tests state the summary".
   - The rest is cut into **ITM-1163**, which begins with a draft for akmaier of `auditRows`' rows. This is the way
     ITM-601 was cut into ITM-658.
2. **The existing tests changed.** In `trace-pages-gaps`, `trace-pages-subject` and
   `system-itm-599-gaps-view`, the example of a key the route does not draw was `audit`, which the route now draws.
   - Each swaps it for `timeline`, and no expected value changes.
   - The system test's swap came after the code. It was red at the merge `a33051de` (job 118905914869, `not ok 263`) and
     is green since `25d64a5e`.
   - All three name MOD-trace-pages.
3. **sonnet-a's readings, judged.** Each follows ITM-768's Outcome or an accepted text, and none adds a rule:
   - the gates come through `gateStates` at the tag;
   - the acceptance is the commit that added the approval record;
   - a gap is a row that is not passing;
   - *Accept* is a link to `#release`, as the item's reading of 2a says;
   - the run link is `webLinks().commitRuns`, and the approval link `webLinks().file`, accepted at `da4ee072`;
   - a ref that is no release tag shows the newest tag, since the descriptor offers tags only.
4. **Parts.** MOD-trace-pages' `## Parts` names neither `audit.mjs` nor `tests.mjs`, which ITM-766 added. The module text
   is akmaier's to accept, so this is registered as **ITM-1164**, a draft. It is not a failure of this change.
5. **The red first commits.** The raw job logs show:
   - `2f44c4a6`: job 118902495998, `not ok 305` to `319`, "# fail 15", "# cancelled 0";
   - `b55b61ba`: job 118904289422, `not ok 305` to `323`, "# fail 19";
   - `804accc4` changes only tests.
   - `88cec924` is the code: `audit.mjs`, the descriptor in `views.mjs`, and the dispatch in `flow.mjs`.
   - The merges `a33051de` and `0c3cbba5` have an empty `git show --cc`.
6. **The replay**, in a clean worktree at `0c3cbba5`, with a private `TMPDIR`:
   - **The module's tests:** `tests/trace-pages*.test.mjs` and `tests/system-itm-599-gaps-view.test.mjs`, 175 of 175
     pass, none `todo`.
   - **The counter-proof:** with `src/` checked out at the sprint branch `4158de2a`, `tests/trace-pages-audit.test.mjs`
     fails 19 of 19.
   - **The release tests that name MOD-trace-pages:** 7 files and 50 cases. 48 pass and none fails. The two `todo` cases
     are the known findings ITM-657 and UC019-S10.
7. **The merge.** `git merge-tree` with `sprint/team1/102` at `4158de2a` is clean. #1249 (ITM-658) merges the sprint
   branch in first.

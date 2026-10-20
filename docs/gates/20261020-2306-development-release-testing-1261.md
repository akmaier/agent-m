---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 68e6f216
  - https://github.com/akmaier/agent-m/pull/1261
date: 2026-10-20 23:06 UTC
---
# Development → Release testing: ITM-649, a guards entry names a requirement or a use case, nothing else

**REGISTER**

## Reason

Pull request #1261 into `sprint/team1/102` does not pass on `68e6f216`. Five release tests fail there and pass on the base.

1. **The five failures.** All 72 release-test files were run in clean worktrees, with a private `TMPDIR`:
   - **At the base `83ee5208`:** 435 pass, 0 fail, 9 `todo`.
   - **At `68e6f216`:** 430 pass, 5 fail, 9 `todo`.
   - **At `a8d7973c`,** before sonnet-b's change, the Scrum Master's run finds the same five.
   - **The five:** TST-375101 (UC-017), TST-965201 (UC-038), TST-969201 (UC-039), TST-1041101 (UC-040) and TST-513201
     (UC-049).

   Each checks that the use case's system tests walk its flows. Each finds the flows in the system tests' declarations,
   and the cleanup took the steps out of their `guards` lines.
2. **No text needs to change.** MOD-test-document's rule binds the `guards` entries only. A test's `given`, `input` and
   `expect` are its precondition, input and expected result (MOD-test-document.md, the declaration's table). Prose there
   may say which flow of a use case the test walks.
   - Four of the five already read `given`, `input` and `expect` beside `guards`:
     - `release-uc-017-configure-participants.test.mjs:166`;
     - `release-uc-038-turn-mails-into-issues.test.mjs:82`;
     - `release-uc-039-reply-to-the-mails-of-an-issue.test.mjs:105`;
     - `release-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs:125`.
   - TST-1041101 reads only the `guards` entries that begin "UC-040 step" or "UC-040 alternative"
     (`release-uc-040-declare-the-products-resources.test.mjs:144`).
3. **The way back.**
   - **developer-sonnet-d, ITM-649's implementer,** restates the flows in the system tests whose `guards` lost them:
     those of UC-017, UC-038, UC-039, UC-040 and UC-049. Each declaration says, in its `given`, `input` or `expect`,
     which flow or step it walks, in the words the cleanup removed (for example "UC-017 main flow", "alternative 3a",
     "UC-040 steps 1 to 3"). No `guards` entry carries a step.
   - **developer-sonnet-b, who built none of ITM-649,** changes TST-1041101 in a commit of its own to read `given`,
     `input` and `expect` beside `guards`, as the other four do (SPEC.md:1501-1503). Its expected values do not change.
   - Then the whole release suite runs locally again, and the gate replays it.
4. **The 16 descriptive entries sonnet-b dropped** ("every requirement UC-nnn realises", and the like) are neither a
   requirement's name nor a use case's identifier. So each is the finding ITM-649 adds. The same line's `UC-nnn` stays,
   and dropping them is the cleanup the item asks for.
5. **What was checked.** The tests-only commit `0bec84c4` is red: job 118929571558 reads `not ok 191` to `194`, then
   "# fail 4" and "# cancelled 0". The head's run 39512108912 is green; CI on a sprint branch leaves release tests out.

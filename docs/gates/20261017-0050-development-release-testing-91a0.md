---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 06ec7e68110be2dd6c591bc04dbb549bcc55a28c
  - https://github.com/akmaier/agent-m/pull/660
date: 2026-10-17 00:50 UTC
---
# Development → Release testing: ITM-570, UC-019's hand-over from the bar is tested

**REGISTER**

## Reason

ITM-570, pull request #660 into `sprint/team1/58`, at head `06ec7e68`. developer-sonnet-d wrote it. It implemented
none of ITM-505 or ITM-626, as the item requires.

1. **The test commit is red.** `e2e0ec28` holds the expected values and none of the fixture, and run 38986917843 failed
   on it. The Scrum Master read the saved log: node (7) shows `# fail 1`, TST-377013, on the first fixture gap. The two
   `todo` are TST-377010 and 377011, untouched.
2. **CI is green on the head**: run 38987975696 passed ten of ten jobs. GitHub reports the pull request mergeable. The
   head merges the sprint branch after ITM-623, and no pushed commit was rewritten.
3. **The changes are test files only**, as the item allows. No defect of the product appeared beyond ITM-626, which is
   merged.
4. **Four planted faults in `src` are caught**, among them `isTrusted` removed and a conversation path written into the
   record. A fifth plant did not fail, since the ledger does not take that field. The pull request says so, and it is
   no counter-proof.
5. **The Acceptance holds.**
   - TST-377013 passes plain: a person's click queues one job record of `change-use-case` on UC-007, on `ci hosted`,
     naming no message of the conversation, in one commit.
   - It starts one dispatch of `agent-m-jobs.yml` carrying the task byte for byte and the recorded job.
   - A scripted click writes and starts nothing.
   - The UC-019 table gives no failure and 29 receipts on the base and on the head.

**Departures, judged.**
- **A release test's content changed.**
  - TST-377001 and TST-377101 required TST-377013's `todo` text. With the `todo` gone, TST-377013 moves from the
    findings maps to the evidence maps of both files.
  - The item's own change forces it, and it is the same fact recorded in its new place.
  - "No release test changes" in `58.md` overlooked this, which is the Product Owner's miss.
- **An assertion was made stricter after the red run** (`ab0a6380`): the record names no conversation, by a line's
  pattern.
  - It states the same expected value as before, more exactly. The planted conversation path shows it failing on the
    fault.
  - It still breaks sprint 56's agreement, which asks for a red again before the code. It goes to the feedback.
- **Keeping the bar's follow poll from holding the process** is test hygiene: in the test the job never ends, so the poll
  would run on. Taken.
- **The import of another test file stays.** `tests/system-uc-019-change-by-prompt.test.mjs` takes its harness from
  `./system-uc-019-change-requirements-by-prompt.test.mjs`, as it did before this item. Sprint 56's agreement asks for a
  helper of its own, and ITM-629 makes it. It updates the counter-proof harness's list of copied files, as ITM-623 did.
- **The headers' `Module:` lines** name MOD-review-pages, MOD-artifact-edits and MOD-runtimes, and in the release file
  MOD-workflow-entries too, but not MOD-prompt-bar. The test now exercises MOD-prompt-bar's hand-over, so ITM-629 adds
  it to both headers.

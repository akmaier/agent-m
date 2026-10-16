---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6e57b055ddc1701c3d72e171deda8b97b3504b81
  - https://github.com/akmaier/agent-m/pull/626
date: 2026-10-16 19:54 UTC
---
# Development → Release testing: ITM-555, A saved or discarded draft is dropped, and a route without a subject of its own takes the frame's default

**REGISTER**

## Reason

ITM-555, pull request #626 into `sprint/team1/51`, at head `6e57b055`. developer-sonnet-b wrote it, as `51.md` assigns.
It lists AGENTS.md, SPEC.md, MOD-prompt-bar, MOD-site-frame, MOD-review-pages, UC-019, UC-049, the item, `51.md` and
chapters 9, 11, 12 and 13 as read in full.

1. **The tests-only commit is red.** `e5d3ba7d` was pushed alone. Run 38957357678's failures that are not `todo` are
   exactly nine:
   - TST-507008, TST-555001 and TST-555002;
   - the six tests of *Save* and *Discard*.

   One of them is a missing export, and the rest fail on behaviour, so no stub was needed. The listing of
   `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38957970558. GitHub was recomputing mergeability after two merges. `git merge-tree`
   merges the head into `sprint/team1/51` without a conflict.
3. **The changes stay in the item's modules.** MOD-prompt-bar (`bar.mjs`, `index.mjs`), MOD-site-frame (`subject.mjs`,
   `index.mjs`) and MOD-review-pages (`conversation-draft`, `file-drafts`, `requirements-draft`, `subjects`, `flow`), and
   their tests.
   - TST-507008 changes, as the item names. The six tests of *Save* and *Discard* gain only the assertion on
     `latestDraft`.
   - ITM-018 passes, and the review pages' tests assert that nothing was fetched.
4. **Each fault is caught.** Four planted faults are each caught. Restored, the tests pass 75 of 75.
5. **The Acceptance holds.**
   - After *Save* and after *Discard*, `latestDraft` gives `null`, and the route says that there is no draft.
   - A route whose `subject` gives `null` has the frame's default, menu label included.
   - The review pages hold no copy of the default.

The readings are within the item:
- a draft is dropped only when *Save* made its commit, so a refused save, or one without a token that opens the server's
  pages, keeps it for the person;
- "says that there is no draft" is the route's existing line.

**Found here, taken up in ITM-552.** `src/trace-pages/subject.mjs:72` keeps its own default subject, which is another
copy of the frame's default (AGENTS.md §2, "Nothing twice"). ITM-552 already changes that file, and now names this too.

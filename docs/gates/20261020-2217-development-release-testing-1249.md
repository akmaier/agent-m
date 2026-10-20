---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 5f3c46a4267aeb4094578aa3d6d41fa111f711f1
  - https://github.com/akmaier/agent-m/pull/1249
date: 2026-10-20 22:17 UTC
---
# Development → Release testing: ITM-658, the specification view names a failed read through the frame

**REGISTER**

## Reason

Pull request #1249 into `sprint/team1/102` does not pass on `5f3c46a4`. One acceptance sentence fails on the head.

1. **The failure: a failed `listTags` on `#audit`.** ITM-658's acceptance reads: "A failed `listTags` never says that no
   release is tagged." The sentence names no view.
   - After the merge of ITM-768, `tagsOf` returns `{ names, failure }`. The audit dispatch reads only `.names`
     (`src/trace-pages/flow.mjs:783`).
   - On a failed `listTags`, `names` is empty, so `drawAudit` writes "No release is tagged yet (UC-013); there is
     nothing to audit." (`src/trace-pages/audit.mjs:198`).
   - The change that made `tagsOf` say whether it failed is this item's, and the dispatch that drops `failure` is
     written by this pull request (`5f3c46a4`).
   - So the fix belongs here, not in a new item. Within `src/trace-pages/`, a failed `listTags` on `#audit` is named the
     way the specification view names it: what failed, followed by `readProblem(failure, tokenStored)`.
2. **The way back.**
   - First, a commit that holds only tests: the audit route on a host whose `listTags` fails shows the failure through
     `readProblem` and never "No release is tagged". Its CI is red.
   - Then the fix.
   - Then the merge of the sprint branch, if it has moved.
3. **Judged, and found within the item:**
   - **The changed expectations.** TST-594001, 594005, 597010 and 597011 are those the item names. TST-668004, the
     chosen-version failure, follows the item's first reading: "<ref> could not be read:" followed by `readProblem`'s
     element.
   - **A missing `tokenStored` reads as "a token may be stored"**, so the private-or-missing sentence is not shown. That
     is the item's third reading.
   - **Gaps and Modules keep `problemLine`.** The first acceptance sentence speaks of "every failed read of the
     specification view".
4. **What was checked.** The reds of `218c460e` (job 118903566131, "# fail 5", "# cancelled 0") and `5703ee4b` (job
   118907194590, "# fail 6") were read from the raw logs by the Scrum Master. Run 39505730635 is green on the head. The
   replay waits for the fixed head.

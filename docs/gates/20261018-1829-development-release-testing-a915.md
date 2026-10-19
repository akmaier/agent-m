---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 804b1313af34bd1b8b4f2690ea7af614ca6c18b8
  - https://github.com/akmaier/agent-m/pull/922
date: 2026-10-18 18:29 UTC
---
# Development → Release testing: ITM-915, the explanation of a new version fits each kind of source

**REGISTER**

## Reason

ITM-915 (MOD-site-frame), pull request #922 into `sprint/team1/92`, passes on `804b1313`.

1. **The participant trailer is present** on both commits: `developer-sonnet-d`.
2. **The red is `b99ae80c`.** It holds tests only, and run 39153668307 fails TST-915001 and 915002 there.
3. **The change** is the topic `source-new-version` in `src/site-frame/explanations.md`, and nothing else. It says what a
   new version records for each kind of source:
   - documents and standards record their files with their SHA-256;
   - a repository records the commit it stands at, and no file;
   - a fetched EU legal text starts the fetch run.
   The refusal now also covers a commit that an existing version already records.
4. **Each sentence rests on accepted text:**
   - MOD-source-register.md:153, a repository source's `commit`;
   - MOD-source-register.md:155, `SameBytes` for "its files' hashes, or for a repository its commit";
   - MOD-settings-pages.md:183, *+ New version* of a fetched legal text starts the fetch run.
5. **How the Acceptance's "against the route" is read.** The tests check the topic's text against what the route does, as
   these texts state it and as the library's own tests guard it. They do not run the route. The panel's folding of the
   topic stays guarded by TST-591316, which is unchanged.
6. **Counter-proofs, replayed by me in a clean checkout of the head:**
   - the file passes 5 of 5;
   - with the repository bullet planted back to "select its files", TST-915001 fails.
7. **Green.** CI run 39153888258 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/92` without a conflict (tree `051bf386`).
   - node (5) passed on its second attempt.
   - Attempt 1 failed TST-498005 on the cleanup race that ITM-949 is registered for. #922 does not touch that test file.
8. **The fetch run's own step** is ITM-951's, not this item's.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2456ebd010aba753bff3dc58e372641f81dfe70e
  - https://github.com/akmaier/agent-m/pull/644
date: 2026-10-16 23:09 UTC
---
# Development → Release testing: ITM-592, Without a token, a requirement edit's GitHub pages carry each file's text and warn when one differs

**REGISTER**

## Reason

ITM-592, pull request #644 into `sprint/team1/55`, at head `2456ebd0`. developer-sonnet-d wrote it.

1. **The tests-only commit is red.** `b2bc1fa8` was pushed alone, and run 38978671916 failed on it. The Scrum Master
   read the saved log: node (1) failed exactly the two new tests, TST-592001 and 592002, on behaviour.
2. **CI is green on the head**: run 38979554317 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module**: `edit.mjs` and `file-edit.mjs` of MOD-review-pages, and one new test
   file. No existing test changed, and no release test.
   - `fallbackPages` is exported from `file-edit.mjs` and called by `edit.mjs`, not copied (nothing twice).
   - The UC-019 table, which plants a fault in `edit.mjs`, gives the same result on the base and on the head: 29 of 29
     receipts.
   - ITM-018 passes, and the fetch spy saw no request.
4. **Each of the four planted faults is caught.**
5. **The Acceptance holds.** Each page shows its file's text, and a file that differs is warned about, as on the
   use-case path.

**The fixture of TST-592002 is taken.** Through a real host, `differs` cannot arise today:
- `proposeSection` computes each file's `existing` from the same snapshot that `fallbackEditLinks` compares against
  (`src/spec-changes/propose.mjs:386-388`), so `differs` is always false.
- MOD-artifact-edits says `differs` is "that the file on the default branch is no longer what the edit started from".

So the page part this item owns is shown with a stand-in snapshot, which the test's header names. The missing source is
MOD-spec-changes' defect, and ITM-611 holds it.

**The shared wording is left, and given its own item.** `fallbackPages` says "GitHub's page opens for the file", while a
requirement's entry has two files. The use-case path shares that sentence, and no test asserts it. ITM-612 words it for
each file.

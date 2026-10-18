---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4c46e89fc75f25f225677305b0b0c175531469b1
  - https://github.com/akmaier/agent-m/pull/910
date: 2026-10-18 15:48 UTC
---
# Development → Release testing: ITM-929, the time of an acceptance is read without the commit's changes

**REGISTER**

## Reason

ITM-929 (MOD-approvals), pull request #910 into `sprint/team1/91`, passes on `4c46e89f`.

1. **The participant trailers are present.** All three commits carry `Agent-M-Participant: developer-sonnet-c`.
2. **Red first, twice, tests only.**
   - `446b811e` is red in run 39140179893 on TST-929001 to 929003.
   - `d4922619` drops `"era changes"` at `tests/load-per-view.test.mjs:370`, as ruled in `c5bb6da3`. Run 39141239196 is red on
     the three and that test.
3. **The change:** `changes: false` in `lastAcceptedText` (`src/approvals/status.mjs:137`), and the item history removed
   from the headers of `status.mjs` and `index.mjs` (AGENTS.md §1). That is MOD-repository-hosts.md:179-182's option.
4. **Green.** Run 39141788951 on `4c46e89f` passes all twelve jobs, with no rerun. `git merge-tree --write-tree` merges the
   head into `sprint/team1/91` without a conflict (tree `412618b7`).
5. **The Acceptance holds:** "the count falls by one request per record read".
   - I replayed the counter-proof in a clean checkout of the head: without the option, TST-929001 to 929003 fail. Restored,
     `src/` is clean.
   - Measured: a MOD-source-register page goes from 31 requests to 19, and Review all over four changed files from 90 to 59.
6. **Release tests (agreement 83).** I ran on the head, with the Bridge packages installed as CI does: the approvals tests,
   `load-per-view`, `review-pages-changed-file-rendered`, `notifications`, `release-sprint-01-dashboard-app` and both
   `release-uc-019` files. That was 129 tests, 125 pass, 0 fail, 4 todo.

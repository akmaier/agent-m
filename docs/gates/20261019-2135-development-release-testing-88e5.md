---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 2dd1ccb80926384c2e325d68ebb52bfc86081b20
  - https://github.com/akmaier/agent-m/pull/1165
date: 2026-10-19 21:35 UTC
---
# Development → Release testing: ITM-1084, the workflow-entries tests remove their repositories without failing

**REGISTER**

## Reason

ITM-1084, pull request #1165 into `sprint/team2/97`, passes on `2dd1ccb8`. CI is green, on 20 of 20 jobs. Only the
helpers `repository()` of `tests/workflow-entries-gitlab-547.test.mjs` and `tests/workflow-entries-hand-over.test.mjs`
change.

1. **No red, as the item asks.** ITM-1084's acceptance declares it a refactoring: "no expected result changes, and CI is
   green on every commit". The failing removal has a window of about 1 ms and did not recur in about 2,950 repetitions.
   So the evidence is the writer, counted before and after, not a red run.
2. **The writer, named.** `git push` (`src/repository-hosts/local-git.mjs:107`) starts receive-pack, which starts `git
   maintenance run --auto --detach`. Its forked child writes into the repository after the command returns, and
   `rmSync(root)` then meets an entry made in between (ENOTEMPTY). The fix switches maintenance off in the tests'
   repositories. Nothing in `src/` changes.
3. **Checked by me, locally (git 2.54).** Both files, run with `GIT_TRACE2_EVENT`, start the maintenance process 171
   times on `sprint/team2/97`, which is the known positive and matches g's 11 and 160. On the head they start it 0 times.
   25 of 25 tests pass in both.
4. **The same pattern elsewhere** — design-kinds, check-completed, job-workflow and resume-gate — is ITM-1140.

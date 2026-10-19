---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - cc53c9863dbef779efbebf525dda54e5dddd550e
  - https://github.com/akmaier/agent-m/pull/1038
date: 2026-10-19 11:52 UTC
---
# Development → Release testing: ITM-950, passed — webLinks gives the fork, Pages settings and pipeline schedules pages

**REGISTER**

## Reason

ITM-950 (MOD-repository-hosts), pull request #1038 into `sprint/team1/93`, passes on `cc53c986`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-d`.**
  - `5023b8bc` holds only tests: `tests/repository-hosts-web-links-pages.test.mjs`.
  - `cc53c986` holds the code: `src/repository-hosts/web-links.mjs`.
- **The red,** run 39247219519, job 118041964828: `# fail 3`, `# cancelled 0`, exactly TST-950001 to 003. The one todo is a
  known finding.
- **The code meets `webLinks` (MOD-repository-hosts.md:149).**
  - GitHub gives `<repo>/fork` and `<repo>/settings/pages`, and no pipeline schedules.
  - GitLab gives `<project>/-/forks/new`, `<project>/-/pages` and `<project>/-/pipeline_schedules`.
  - Each address is the server's page as sonnet-d reads it.
- **A slip on another branch.** sonnet-d reports one merge started on `item/ITM-581-issues` and aborted before any commit.
  Nothing was pushed from it.
- **CI:** 20 of 20 checks passed on the head (run 39247447620).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`8c0efc49`) is clean.
- **Replayed in a clean worktree at the head:**
  - The test file passes 3 of 3.
  - Counter-proof, run here since none was run as a mutation: with GitLab's address planted as `/-/schedules`, exactly
    TST-950002 fails.

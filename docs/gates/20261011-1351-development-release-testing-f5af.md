---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 86559ea0410c2d4c416916aabee9dc7ba5593da9
  - https://github.com/akmaier/agent-m/pull/357
date: 2026-10-11 13:51 UTC
---
# Development → Release testing: ITM-309

**REGISTER**

## Reason

ITM-309, pull request #357 by developer-sonnet-d into `sprint/team1/15`, on head `86559ea`, against the item and
MOD-repository-hosts' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `c37ce3a`, holds only `tests/repository-hosts-history.test.mjs`, and CI was red on it (run
  38143365434): node failed on exactly its 6 tests — 1352 tests, 6 failed. After the code went green (`bf038d9`, run
  38143622298), the tests-only commit `ccb2f05` made the fake GitLab follow a renamed file, as GitLab does by default,
  with no expected result changed, and CI was red on the rename case alone (run 38144296325) until `86559ea`.
- CI is green on the head (run 38144442529): node 1369 tests, 0 failed; python 441 tests, OK.
- Only MOD-repository-hosts' folder — `history` in `github.mjs` and `gitlab.mjs`, `readHistory` and the header of
  `index.mjs` — and the new test whose header names the module change; no existing test or expected result changes.
- The 6 new tests name what they guard — among them `A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT`, `A
  PERSON'S EDITS COLLECT IN ONE OPEN QUEUE` and `THE NAME IS THE ID AND IT SURVIVES` — and MOD-repository-hosts, with 33
  planted faults recorded.
- The Acceptance holds, on constructed answers of both servers, with nothing reaching the network: a file's commits
  newest first with their changes; a rename with its earlier path; `limit` honoured; the repository's history for a
  `null` path; an empty list for a path no commit touched; `TokenRefused`, `NotFound`, `RateLimited` and `Unreachable`
  as `readSnapshot` names them.

Noted for the sprint's review, no condition of this gate: the readings the pull request names — the date a commit was
committed, every file of a commit as its changes, `follow=false` sent to a GitLab server with a path — and two gaps it
names: a GitLab entry's account is always `null`, so a caller that needs the person's account on a GitLab product has
none from here; and `readHistory` of an empty GitHub repository fails with `Unreachable`, where `readSnapshot` reads
the repository as empty and the module file's text gives no commit.

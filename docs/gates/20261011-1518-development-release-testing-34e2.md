---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - dd571b94b3cb01dd593f1a7e001e56c97fe3ed18
  - https://github.com/akmaier/agent-m/pull/373
date: 2026-10-11 15:18 UTC
---
# Development → Release testing: ITM-434

**REGISTER**

## Reason

ITM-434, pull request #373 by developer-sonnet-d into `sprint/team1/16`, on head `dd571b9`, against the item and
MOD-repository-hosts' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `126ea17`, holds only `tests/repository-hosts-issue-counts.test.mjs`, and CI was red on it (run
  38150008448): node failed on exactly its 4 tests. The second tests-only commit, `071465c`, adds the case a fault
  planted on the draft left standing, the token sent to GitHub's search, red on 5 tests (run 38150200476).
- CI is green on the head (run 38150346825): node 1440 tests, 0 failed; python 441 tests, OK.
- Only MOD-repository-hosts' folder — `issueCounts` in `github.mjs`, `gitlab.mjs` and `index.mjs`, and in `failures.mjs`
  a gate that takes several token addresses, the search's own limit and a search's 422 as `NotFound`, each for a search
  alone, so the module's other requests are refused as before — and the new test whose header names the module change;
  no existing test or expected result changes.
- The 5 new tests name what they guard — among them `DUE DILIGENCE IS FETCHED, NOT RECALLED`, `A TOKEN GOES ONLY TO THE
  SERVER THAT ISSUED IT` and `A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN` — and MOD-repository-hosts, with 22
  faults planted on the draft first.
- The Acceptance holds, on a fake server for each host: the two counts; pull requests not counted; the search limit
  named when it is used up; each error.

The token now goes to GitHub's search, `api.github.com/search/issues`, too: an address of the API of the server that
issued it, as the authorisation header only, so `A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT` holds. Noted for the
sprint's review, no condition of this gate: GitHub's 422 for a repository it does not hold or the client may not see is
read as `NotFound`; GitLab's statistics counted as issues alone; a search's `incomplete_results` not read; and a 403
that is no used-up limit is `PermissionMissing`, which `issueCounts`' entry does not list.

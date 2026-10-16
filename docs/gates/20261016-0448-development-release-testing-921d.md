---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 77515086fda5d547e5f62b156e34f59128211726
  - https://github.com/akmaier/agent-m/pull/544
date: 2026-10-16 04:48 UTC
---
# Development → Release testing: ITM-522, Whether a branch holds a commit

**REGISTER**

## Reason

ITM-522, pull request #544 into `sprint/team1/33`, at head `77515086`. developer-sonnet-d made both commits.

1. **The red commit.** The tests-only commit `cc7d7b25` holds only `tests/repository-hosts-contains-commit.test.mjs`, and
   CI was red on it (run 38852120067), with `host.containsCommit is not a function`.
   - To see that the tests fail for the item's behaviour and not only for the absent function, I gave the red commit's
     host a stub `containsCommit` that always answers `false`.
   - Then all five tests, TST-522001 to TST-522005, still fail: the GitHub, GitLab and clone cases, the failures, and the
     token's destination. So the check holds.
2. **CI is green on the head**: ten of ten jobs, run 38852287956. On the head, every `tests/repository-hosts*.test.mjs`
   passes: 88 tests, none failing. The developer lists the release tests of MOD-repository-hosts passing.
3. **The changes stay in the item's scope.**
   - `src/repository-hosts/index.mjs`, `github.mjs`, `gitlab.mjs` and `local-git.mjs` are the item's module.
   - The one new test file names it. No existing test changed, as the item states.
   - The requests go through the adapters' existing `read` and origin gate, and no `fetch` is added.
4. **The new tests.** They state their values in their own text. Eleven counter-proofs are recorded in #544, with the
   documentation pages and real known positives from GitHub and gitlab.com.
5. **The Acceptance holds.**
   - A commit on the branch is contained; one off the branch, or an unknown one, is not.
   - A refused token is `TokenRefused`, and a used-up limit is `RateLimited`.
   - The token goes only to its own server, in the header.

**The gaps the developer names are within the accepted text**, "A commit the server does not know is not contained.
Crosses the network; fails as `readSnapshot`":
- **GitLab answers 400 for an unknown commit.** Its documentation names no status for that, and the answer was seen live.
  It is the server saying it does not know the commit, so it is not contained.
- **A clone whose git cannot run reads as not contained.** `readSnapshot` through a clone behaves the same way, because
  its `resolve` tolerates git's failure and yields no commit; so this fails as `readSnapshot` does.
- **A GitHub 404 on a private repository without a token reads as not contained.** That is the server's answer for a
  commit it does not show. A caller without a token has already met `NotFound` from `readSnapshot`.

Noted for the review: the clone's `containsCommit` passes `commit` and `branch` to `git merge-base` without the leading-`-`
guard that `resolve` uses. Its callers pass a pull request's head SHA and a branch name, so it is not reachable today; a
later item may add the guard.

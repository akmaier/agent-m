---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 71e9e4d39f82ef4d3db9fbb1bc2125cea0ab6332
  - https://github.com/akmaier/agent-m/pull/468
date: 2026-10-12 22:45 UTC
---
# Development → Release testing: ITM-296, read-only pull request facts

**REGISTER**

## Reason

ITM-296, pull request #468 by developer-sonnet-a into `sprint/team1/24`, head `71e9e4d`. The tests-only commits
`6d210d1` and `032368e` were red on the new tests alone (runs 38316543364, 38316779520), and `71e9e4d` is green (run
38316993013, 2176 tests, 0 failures). The code changes only `src/repository-hosts/` — `listPullRequests` and
`pullRequestFacts`, and `history` calling the shared `commitChanges` helper, a change within the module whose existing
tests stay unchanged and green —; the new test names MOD-repository-hosts and its guards, and 28 faults are recorded, all
killed. Over this repository, read-only and without a token, 468 pull requests are listed, and #463's facts give its
three commits in order, its files, one review and the two checks.

The readings weighed: the review verdicts from GitHub's GraphQL enum `PullRequestReviewState`, read at the gate —
APPROVED, CHANGES_REQUESTED, COMMENTED, DISMISSED and PENDING —, since the REST page lists none; no error mapped from a
message text; GitLab's `locked` counted as open; GitLab's approvals placed on the merge request's head commit; commits
ordered by their parents and dates, no page stating an order; `read(path, side)` by commit, never by branch. That GitLab
is tested against fakes only is noted for the review.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8974f101d233afd335134e2dd705bdce33ec0a96
  - https://github.com/akmaier/agent-m/pull/435
date: 2026-10-11 21:46 UTC
---
# Development → Release testing: ITM-406, whether this computer's git login reaches the repositories

**REGISTER**

## Reason

ITM-406, pull request #435 by developer-sonnet-d into `sprint/team1/21`, head `8974f10`. The tests-only commits
`9c6cd7f` and `e274320` were red on the three new tests alone (runs 38177029613, 38177265309); CI is green on
`8974f10` (run 38177519213, 2003 tests, 0 failures). The code changes only `src/bridge-jobs/`; the new test, on bare
repositories in a temporary folder, names MOD-bridge-jobs and its guards, and 11 faults are recorded, 9 killed. The
Acceptance holds: every repository reached; one that refuses named with git's reason; nothing changed in any clone.

The points weighed:
- `testAccess` fetches each address into an empty temporary repository with `git`, not through MOD-repository-hosts.
  MOD-bridge-jobs' file gives it "one fetch of each, changing nothing" from addresses, and names `connect` and
  `readSnapshot` for the served products read "through the local clone" — a clone the Bridge already holds. The local
  clone's adapter fetches from a clone's origin and needs that clone; no existing function reaches an address with the
  computer's own login without one, so this is no second way to the same thing (AGENTS.md §6a item 1).
- Prompts off and one minute as unreachable: a test that waits for a password it cannot be given would never answer.
- An empty repository counts as reached: the login reached it and it has nothing to fetch, which is what the Outcome
  asks. F04 (an empty repository) and F11 (a failing `git init`) survive untested, outside the Acceptance, and are
  noted for the review, as is `access.mjs`, a file MOD-bridge-jobs' Parts does not list, with the Parts lists that wait
  for akmaier.

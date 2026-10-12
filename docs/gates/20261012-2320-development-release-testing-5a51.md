---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a5e94de5254827c6be15c2c91d9b91e7e88c412e
  - https://github.com/akmaier/agent-m/pull/474
date: 2026-10-12 23:20 UTC
---
# Development → Release testing: ITM-464, clearing a Bridge names the resources that name it

**REGISTER**

## Reason

ITM-464, pull request #474 by developer-sonnet-a into `sprint/team1/25`, head `a5e94de`. The tests-only commits
`5d28ed0` and `7fa598d` were red on the new tests alone (runs 38320852835, 38321059940), and `a5e94de` is green (run
38321281522, 2304 tests, 0 failures). The code changes only `src/settings-pages/settings.mjs` and uses MOD-resource-list
through `resourceSchema` alone; the new test names MOD-settings-pages and its guards, and 12 faults are recorded, all
killed, the one that survived on the draft killed by the second tests commit. No existing test changes. The Acceptance
holds, and with it the resources part of UC-042 2a that ITM-405 and ITM-456 left open is closed.

The readings weighed: a resource names a Bridge when its route is `bridge <name>` for it, the form MOD-resource-list
gives a route, and is named by its Name with the list it stands in; a list that cannot be read is said with its reason
and the question still asked; a repository whose snapshot holds no `docs/resources.md` has no resources and is not
read, which leaves ITM-456's test, whose host is asked for `docs/participants.md` alone, as it was.

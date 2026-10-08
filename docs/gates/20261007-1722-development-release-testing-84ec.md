---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b13c7d629933ae5d5b87f319134b1a3e0e9b2df6
  - https://github.com/akmaier/agent-m/pull/190
date: 2026-10-07 17:22 UTC
---
# Development → Release testing: ITM-246

**REGISTER**

## Reason

ITM-246, the check of the notifications that `SPEC.md` names: pull request #190 by developer-sonnet-e, who implemented
none of UC-047, on head `b13c7d6`, branched from `sprint/11` at `2295551`.
- It is an item of release tests and adds no behaviour, so no red first commit is asked of it. Its one commit holds only
  the new file.
- CI is green on the head (run 37657850894): node 866 tests, 0 fail, 11 todo; python 396, OK.
- Only `tests/dashboard-notifications.test.mjs` is added, as the Acceptance says. Its header names MOD-notifications and
  both requirements, and each of its four tests names the requirement it guards. The pull request records a
  counter-proof for each, and each turns its test red when re-run on the head.
- The Acceptance holds for `A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`. Between two checks of a fixture instance,
  a newly open use case and a newly open SPEC change are notified once each, naming the file and the repository, and
  linking where each is accepted: `#uc/UC-930` and `#spec/2026-10-07_sample/01`. A file already notified yields none,
  and so do notifications switched off.
- The Acceptance holds for `NOTIFICATIONS ARE SWITCHED ON BY THE PERSON`. Neither the main page nor the review pages
  ask for the permission before *Switch on*, and the click asks once. The token comes through `openDashboard`.
- The reason of the first rejection (`20261007-1603-…-9980.md`) is met. Run on the head, a permission request planted
  where each page starts the checks turns the test red:
  - `src/home/home.mjs`: "the main page alone does not ask", 1 !== 0;
  - `docs/assets/dashboard-app.mjs`: "the review page alone does not ask either", 1 !== 0.

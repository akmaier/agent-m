---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 51747aaab8f36eb33fa094e29f4929d47a51e246
  - https://github.com/akmaier/agent-m/pull/181
date: 2026-10-07 16:03 UTC
---
# Development → Release testing: ITM-246

**REGISTER**

## Reason

ITM-246, the check of the notifications that `SPEC.md` names: pull request #181 by developer-sonnet-e, who implemented
none of UC-047, on head `51747aa`, branched from `sprint/10` at `515622d`. What holds:
- It is an item of release tests and adds no behaviour, so no red first commit is asked of it. Its one commit holds only
  the new file.
- CI is green on the head (python and node, run 37648190828).
- Only `tests/dashboard-notifications.test.mjs` is added, as the Acceptance says. Its header names MOD-notifications and
  both requirements, and the pull request records a counter-proof for each of its four tests.
- The Acceptance's cases for `A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE` hold. Between two checks of a fixture
  instance, a newly open use case and a newly open SPEC change are notified once each, naming the file and linking where
  it is accepted. A file already notified yields none, and so does notifications switched off. The token comes through
  `openDashboard`, as the start decision asks.

Why it is rejected: check 5. The Acceptance's "no page of the dashboard asks for the permission before the click that
switches them on" does not hold for the main page.
- The test opens only the review pages, at `#uc` and `#settings`. The main page, `src/home/home.mjs`, also runs
  MOD-notifications (UC-047 step 2; MOD-site-frame), and the file's own header names it among the pages.
- Run on the head:
  - a permission request planted at the start of `docs/assets/dashboard-app.mjs`'s `startNotifications` turns the test
    red, so the method sees such a fault;
  - the same request planted in `src/home/home.mjs`'s `startNotifications` leaves all four tests green.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint. No item of this
sprint builds on it.

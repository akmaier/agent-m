---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b18fdebcc98398ac8737a90fcaf0881772e5a377
  - https://github.com/akmaier/agent-m/pull/418
date: 2026-10-11 20:30 UTC
---
# Development → Release testing: sprint team1/20, between jobs — NO SERVER permits MOD-mail-routes' Graph requests

**REGISTER**

## Reason

The change between jobs the sprint's record names for ITM-425, pull request #418 by developer-sonnet-c into
`sprint/team1/20`, head `b18fdeb`. It changes only `tests/test_no_backend.py`, of the kind
`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` names: it lets the whole repository's check allow `src/mail-routes/` the
requests to Microsoft Graph that MOD-mail-routes' file states its `Mailbox` makes — the mail provider's API, which
`NO SERVER` permits and the check already lists as a host — beside #400's one lookup, as the record says. The test
commit `920067d` was red on its new test alone (run 38172059660); CI is green on `b18fdeb` (run 38172321940). The new
test names MOD-mail-routes, with 14 guard faults recorded.

The points weighed:
- The guard permits the Graph requests narrowly — one request function, its address the file's one constant for
  `https://graph.microsoft.com/v1.0` —, as the check permits every channel by its form (#400, #407). It decides no
  behaviour the texts give: Graph's version 1.0 is the one its documentation offers for the mail permissions ITM-424
  asks; a later need of another version is a change between jobs of its own. Noted for the review, so that ITM-425 is
  built to it.
- One expected result of #400's counter-proof changes, in the green commit: the lookup with a further fetch at a variable
  address gives one finding, not two, since the folder's count is now two. The further fetch is still found; the count
  follows from the allowance the record names, in the file this change owns.
- No method or path is checked: `NO SERVER` concerns where a request goes; what a request may change is ITM-425's to
  test (UC-037 step 7, "changing nothing").

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - e0d9a695be13502d652fd65ba907b6844e1c7bc3
  - https://github.com/akmaier/agent-m/pull/399
date: 2026-10-11 18:47 UTC
---
# Development → Release testing: ITM-423, a mailbox's route and its connection

**REGISTER**

## Reason

ITM-423, pull request #399 by developer-sonnet-d into `sprint/team1/18`, head `e0d9a69`. The condition that does
not hold: only the item's scope changes (check 3) — `tests/test_no_backend.py`, whose header names no module, is
changed to permit MOD-mail-routes' lookup at `login.microsoftonline.com` and the hosts `entra.microsoft.com` and
`myapps.microsoft.com`. `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`: such a file is changed by no implementation
job, but by a pull request of its own that "lets a check of the whole repository allow a module what the module's file
states that it uses". #398 kept to the same rule.

The change itself needs no decision of akmaier: `NO SERVER`'s check names "the mail provider's API and sign-in", and
`login.microsoftonline.com` is already a permitted host; MOD-mail-routes' `routeFor` asks "Microsoft's sign-in
service, the provider's one origin the page names", and `providerLinks` gives Microsoft's pages, which are only linked.
So it can be a change between jobs, merged before the rework, which then leaves `tests/test_no_backend.py` alone.
Read too, and standing: known providers asked before Microsoft, since the texts fix no order and a Gmail domain would
otherwise be asked as well; the servers and pages taken from the providers' own documentation.

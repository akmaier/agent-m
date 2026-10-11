---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f6b442dcf483ceea7cfcf0f22cc3a4d0de120541
  - https://github.com/akmaier/agent-m/pull/422
date: 2026-10-11 20:48 UTC
---
# Development → Release testing: ITM-425, a mailbox tested on both routes

**REGISTER**

## Reason

ITM-425, pull request #422 by developer-sonnet-d into `sprint/team1/20`, head `f6b442d`. The tests-only commits
`d6ba0c6` and `ba483d3` were red on the new tests alone (runs 38173020058, 38173253747); CI is green on `f6b442d`
(run 38173484858, node 1915 tests, 0 failures; python OK). The code changes only `src/mail-routes/`, and Microsoft
Graph is reached through one request function on the constant `https://graph.microsoft.com/v1.0`, the form #418
permits; `tests/test_no_backend.py` is untouched. The new test names MOD-mail-routes and its guards, and 26 faults are
recorded, 25 killed and one equivalent. The Acceptance holds: with a fake Graph, the counts of two named folders and
Drafts and Sent found, the token only in Graph's requests, every request a read; with a fake Bridge client, one
`test` call with the connection and its answer, each Bridge error mapped to the file's; `BridgeNeeded` without a Bridge.

The readings weighed:
- Graph's resources for `test()` — the inbox, the top-level folders by display name, Drafts and Sent Items — and the
  token from the library's accounts and silent acquisition are how Graph and ARC-053's library serve what the module
  file asks, reading only.
- On the Microsoft route, "whether sending works" is that the token holds `Mail.Send`: `test()` changes nothing
  (UC-037 step 7), so it sends nothing, as the Bridge route's SMTP login sends nothing.
- The five Graph errors mapped without tests: the Acceptance names none of them; noted for the review.
- `errors.mjs`, one function that builds a failure by the module file's names, is a file of one responsibility shared
  by the two routes; MOD-mail-routes' **Parts** does not list it, as MOD-browser-store's does not list `sign-in.mjs`
  (#413). That a module's Parts lists every file is noted for the review, to be settled by a change of those files.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1fd4ddea002fc5650bad36474599d53d324bb68f
  - https://github.com/akmaier/agent-m/pull/432
date: 2026-10-11 21:30 UTC
---
# Development → Release testing: ITM-457, TST-276002 sends its new work to a route nothing serves

**REGISTER**

## Reason

ITM-457, pull request #432 by developer-sonnet-c into `sprint/team1/21`, head `1fd4dde`, one commit that changes one
line of `tests/desktop-shell.test.mjs`: TST-276002's new work goes to `POST /v1/probes/unlisted-kind` in place of
`/v1/probes/agent`, and no expected result changes. The item adds no behaviour, so no red first commit is asked; CI is
green on `1fd4dde` (run 38176428138), TST-276002 run and passing in it. With #430's code, on the closed draft #433,
CI was green too. The Acceptance holds.

The reading weighed: "a route of the Bridge's API that no handler serves". `POST /v1/probes/{kind}` is a route of
MOD-bridge-http's protocol, and `unlisted-kind` is a kind it does not list, so `server.mjs` answers it `not-found`
before any handler is asked, while counting it as new work during a pause; a listed route would gain its handler as
MOD-desktop-shell composes them, which is what the item ends. The counter-proofs — a served route, a pause that does not
refuse, a resume that does not restore — were run by a script over the test's HTTP steps, since the test runs only
under the virtual screen of CI, not through TST-276002 itself as the Acceptance words it; noted for the review.

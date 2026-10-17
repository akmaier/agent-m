---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7747d5d0d4b31124d493094bca11aa8cf5b9ffcc
  - https://github.com/akmaier/agent-m/pull/776
date: 2026-10-17 21:06 UTC
---
# Development → Release testing: ITM-834

**REGISTER**

## Reason

ITM-834, MOD-mail-routes' Bridge route `read`, `find`, `drafts` and `sent`: pull request #776 into `sprint/team2/79`,
decided on head `7747d5d`. The tests-only first commit `84e82d5` was red in CI (run 39069121787), the head is green
(run 39069270324). Only `src/mail-routes/` and the new `tests/mail-routes-bridge-read.test.mjs`, which names
MOD-mail-routes, changed. Four counter-proofs were replayed in a checkout of the head (483406, 483403, 483407, 483401),
and each failed exactly its test. The readings match the accepted text and MOD-mail-protocols' handlers: the arguments,
and find's miss told apart from a missing folder by the Bridge's message prefix. A mailbox that marks no Drafts or Sent
stays `BridgeUnavailable`. The file leaves that open, and the pull request names it untested. It is a matter for a
change request of MOD-mail-routes.

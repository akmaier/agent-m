---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b383af4ee4389bdb6d99b9e919fa0d67ef521e3c
  - https://github.com/akmaier/agent-m/pull/529
date: 2026-10-15 22:59 UTC
---
# Development → Release testing: ITM-520, The Bridge's ask carries one exchange of a tool loop and its calls

**REGISTER**

## Reason

ITM-520, pull request #529 into `sprint/team1/29`, head `b383af4e`. developer-sonnet-a made the item's two commits, and
developer-sonnet-e changed the release case.

1. The tests-only commit `ff896acb` was red (run 38819901153).
2. CI is green on the head, ten of ten jobs. The release case does not run on a pull request into a sprint's branch.
   Run locally on the head, the Bridge's client, wire, release, runtimes and Bridge-ask tests give 36 passing tests and
   none failing.
3. The changes stay in the item's scope:
   - `src/bridge-http/protocol.mjs` and `src/bridge-client/index.mjs`, the item's modules.
   - The three tests ITM-520 names, each changed only where the accepted wire changes what it asserts: TST-323001,
     TST-324003 and its counter-proof needle, and TST-324902.
   - TST-324902 is a release case. It was changed by developer-sonnet-e, who implemented none of the Bridge client.
4. Each changed test states its values in its own text and names its module and requirements. Counter-proofs are
   recorded in #529.
5. The Acceptance holds:
   - `ask` with an exchange sends exactly `{ endpoint, exchange }` and returns the calls the Bridge answered.
   - With an agent or an input, `calls` is empty.
   - The wire declares the three request bodies, and the answer with `calls`.

Noted for the review: the module files leave two things unstated. They do not say how `ask` receives an exchange; it is
built as the target `{ endpoint, exchange }`, with no `input`. Nor do they name an exchange's fields; they are built as
`{ messages, tools }`.

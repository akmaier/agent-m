# 11. Architecture and implementation: the context an architecture prompt must fit is that of the model on its connection

**The change.** The rule of `NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY` names the context of a
participant's model on the connection it runs on, where it named a participant's context. Its name, its check and every
other byte of the section are carried over.

**Why.** akmaier agreed on 2026-11-09 that "Place, capabilities, context, price and route leave the list", that the connections
in the browser's settings each declare "its processing place, its capabilities and the models it offers with their
context (and price where declared)", and that "a member's job runs on a connection that offers the member's model, and
the agent is started with that model" (the design quoted in full in `process-models-and-practices/01`).

As for `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY` (`requirements/01`): the context is declared per model by
the connection the job is sent to.

**Impact list.**
- `NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY`, changed: named by UC-022 and UC-023, ARC-046, and the headers
  of `tests/test_derivation_context.py`, `tests/job-runner-prepare.test.mjs`, `tests/review-pages-draft-architecture.test.mjs`,
  `tests/spec-changes-whole-spec.test.mjs`, `tests/approvals-strategies.test.mjs` and the release and system tests of
  UC-022, UC-023 and ITM-1318. UC-022 3a is drafted beside `process-models-and-practices/01`.
- It names the connection that `process-models-and-practices/01` defines (`A CONNECTION NAMES THE MODELS IT OFFERS`), and
  is accepted together with that entry or after it.

**Origin.** github.com/akmaier, the design agreed on 2026-11-09 in a conversation with Claude Code.

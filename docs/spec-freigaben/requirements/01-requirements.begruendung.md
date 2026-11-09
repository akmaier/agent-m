# 3. Requirements: the context a derivation must fit is that of the model on its connection

**The change.** The rule of `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY` names the context of the deriving
participant's model on the connection it runs on, where it named the participant's context. Its name, its check and every
other byte of the section are carried over.

**Why.** akmaier agreed on 2026-11-09 that "Place, capabilities, context, price and route leave the list", that the connections
in the browser's settings each declare "its processing place, its capabilities and the models it offers with their
context (and price where declared)", and that "a member's job runs on a connection that offers the member's model, and
the agent is started with that model" (the design quoted in full in `process-models-and-practices/01`).

A participant no longer declares a context: the connection declares one for each model it offers, and two connections
may declare different ones for the same model. The context a derivation must fit is the one of the connection the job is
sent to (*Nothing twice*).

**Impact list.**
- `NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`, changed: named by UC-005 and UC-017, ARC-046, MOD-job-runner,
  MOD-spec-changes, ITM-023, and the headers of `tests/test_derivation_context.py`, `tests/job-runner-left-out.test.mjs`,
  `tests/job-runner-prepare.test.mjs`, `tests/participant-list-fit.test.mjs`, `tests/site-frame-run-panel.test.mjs` and the
  release and system tests of UC-005, UC-017 and UC-019. UC-017 no longer realises it (drafted beside
  `process-models-and-practices/01`); MOD-participant-list gives a participant the context of its model on its
  connection. The check is unchanged.
- It names the connection that `process-models-and-practices/01` defines (`A CONNECTION NAMES THE MODELS IT OFFERS`), and
  is accepted together with that entry or after it.

**Origin.** github.com/akmaier, the design agreed on 2026-11-09 in a conversation with Claude Code.

# 7. Configuration and secrets: the page names the place of the connection a participant runs on

**The change.** The rule of `THE PAGE NAMES WHERE IT SENDS` names each destination as a participant with the place where
the connection it runs on processes data, where it named the place where the participant processes data; its check says
so. Its name and every other byte of the section are carried over.

**Why.** akmaier agreed on 2026-11-09 that "Place, capabilities, context, price and route leave the list", that the connections
in the browser's settings each declare "its processing place, its capabilities and the models it offers with their
context (and price where declared)", and that "a member's job runs on a connection that offers the member's model, and
the agent is started with that model" (the design quoted in full in `process-models-and-practices/01`).

A participant no longer declares a place: a member whose model two connections offer processes data where the
connection its job is sent to does, and that place is the one the person must see before anything is sent.

**Impact list.**
- `THE PAGE NAMES WHERE IT SENDS`, changed: named by UC-001, UC-005, UC-019, UC-022, UC-024, UC-026, UC-028, UC-032,
  UC-034, UC-038, UC-039, UC-045 and UC-049, ARC-037, ARC-038, ARC-046, MOD-job-runner, MOD-prompt-bar, MOD-review-pages,
  MOD-site-frame, and the headers of `tests/site-frame-run-panel.test.mjs`, `tests/prompt-bar.test.mjs` and the tests of
  the pages that start jobs. None of their sentences becomes false: each names the participant's place, which the
  architecture now takes from its connection (MOD-participant-list). The check's cases are unchanged.
- It names the connection that `process-models-and-practices/01` defines (`A CONNECTION NAMES THE MODELS IT OFFERS`), and
  is accepted together with that entry or after it.

**Origin.** github.com/akmaier, the design agreed on 2026-11-09 in a conversation with Claude Code.

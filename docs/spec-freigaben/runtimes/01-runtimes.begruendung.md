# 6. Runtimes: a hosted job's key is its connection's, and the Bridge offers its agents as connections

**The change.**
- `A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`: the runner machine the agent works on receives only the key of
  the connection the job runs on, where it named the key of the participant the job names; its check says another
  connection's key where it said another participant's.
- `THE BRIDGE FINDS THE INSTALLED AGENTS`: the Bridge offers the chosen agents as connections, where it offered them as
  participants.

Every other byte of the section is carried over.

**Why.** akmaier agreed on 2026-11-09 that "Place, capabilities, context, price and route leave the list", that the connections
in the browser's settings each declare "its processing place, its capabilities and the models it offers with their
context (and price where declared)", and that "a member's job runs on a connection that offers the member's model, and
the agent is started with that model" (the design quoted in full in `process-models-and-practices/01`).

A key belongs to the endpoint whose CI secret holds it, not to a member of the team; and an agent a Bridge offers is a
connection whose models members are given, no longer a row of the participant list (*One responsibility per file, rule
and use case*).

**Impact list.**
- `A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`, changed: named by UC-010 and UC-049, ARC-039, ARC-046,
  MOD-agent-processes, MOD-checkout-tools, MOD-runtimes, MOD-workflow-entries, ITM-061, and the headers of
  `tests/test_runtime_levels.py` and the tests of those modules. MOD-agent-processes is drafted beside this entry; the
  check's cases are unchanged but for the word.
- `THE BRIDGE FINDS THE INSTALLED AGENTS`, changed: named by UC-011, UC-017 and UC-044, ARC-037, ARC-040, ARC-046,
  ARC-050, ARC-054, MOD-bridge-jobs, MOD-desktop-shell, ITM-101, and `tests/test_bridge_agents.py` and the tests of
  MOD-agent-processes, MOD-bridge-jobs and MOD-desktop-shell. UC-017 no longer realises it; UC-011 and UC-044 are
  drafted beside `process-models-and-practices/01`.
- It names the connection that `process-models-and-practices/01` defines (`A CONNECTION NAMES THE MODELS IT OFFERS`), and
  is accepted together with that entry or after it.

**Origin.** github.com/akmaier, the design agreed on 2026-11-09 in a conversation with Claude Code.

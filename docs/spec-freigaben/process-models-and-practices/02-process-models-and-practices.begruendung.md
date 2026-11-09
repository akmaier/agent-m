# 5. Process models and practices: a coding agent on CI is a connection, and a Bridge keeps its agents' declarations

**The change.**
- `A CONNECTION NAMES THE MODELS IT OFFERS`: a connection is a model endpoint, a coding agent that a Bridge offers, or a
  coding agent on CI; the words "that the browser's settings keep" leave the sentence, since a Bridge keeps the
  declarations of its own agents.
- `THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE`: "from the browser's settings" leaves the
  sentence, for the same reason. Its check is unchanged.

Every other byte of the section is carried over.

**Why.** akmaier agreed on 2026-11-09 to close two gaps of the accepted design (the sprint close of an agent, and the jobs
that need to write and run code on CI) with two additions: a Bridge keeps the declarations of its agents — place,
capabilities, models with their context —, entered once in its window or on the settings page, so that it can run any job
of its agents without a browser; and a third kind of connection, a coding agent on CI — Claude Code, Codex or opencode on
the server's runners or a self-hosted runner by its label, its key in a CI secret —, declared in the browser's settings
like an endpoint. `A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET` (section 6) already gives such an agent its key;
no other requirement needs to change (*Nothing the SPEC already says*).

**Impact list.**
- `A CONNECTION NAMES THE MODELS IT OFFERS`: realised by UC-003, UC-010, UC-017, UC-044 and UC-049; MOD-participant-list
  (the connection type *CI agent*), MOD-prompt-bar (`ciAgentsOffered`, `sessionsOffered` from the Bridge's agent list),
  MOD-browser-store (`ci-agent:<name>`, no `session:` key), MOD-bridge-http, MOD-bridge-client, MOD-desktop-shell and
  MOD-settings-pages are drafted beside it. Its check `tests/prompt-bar-endpoints.test.mjs` gains a coding agent on CI.
- `THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE`: UC-049 follows; the check is unchanged.

**Origin.** github.com/akmaier, agreed on 2026-11-09 through the coordinating session, on the blockers of the
implementation of `process-models-and-practices/01`.

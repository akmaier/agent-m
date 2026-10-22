---
id: ITM-1186
title: The settings page declares an endpoint's place, context and CI secret, and each CLI session a Bridge offers
level: module
realises:
  - UC-003
  - UC-044
  - UC-049
modules:
  - MOD-settings-pages
builds_on:
  - ITM-1185
tests:
  - unit
origin:
  - akmaier's request, accepted in MOD-settings-pages at blob d45280df (f35b9903), UC-003 at 4d58ee7b and UC-044 at 44308017 (9559c14f), 2026-10-22
---
# ITM-1186 The settings page declares an endpoint's place, context and CI secret, and each CLI session a Bridge offers

**REGISTER**

## Outcome

The accepted text, `docs/architecture/MOD-settings-pages.md`:
- `endpoints` (:178-182) asks, beside the address, model and key, the place where the endpoint processes data, the
  model's context in tokens, and the name of the CI secret that holds its key (UC-003 step 2).
- `bridge` (:225-230): for each CLI session a Bridge offers, as MOD-bridge-client's `testBridge` lists it, the page asks
  the place, the context, the model and the capabilities, prefilled as for a CLI agent (UC-017). It keeps them under
  `session:<bridge>:<agent>`. A session lacking a place, a context or a model is named as not offered in the prompt bar
  (UC-049 1b).

## Acceptance

- The endpoint form keeps `place`, `context` and `secret` in `endpoint:<name>`. The CI secret is a name, and its value is
  never asked.
- The `bridge` section lists the CLI sessions of a tested Bridge and keeps each declaration under
  `session:<bridge>:<agent>`. Each lacking place, context or model is named where it is configured.
- Counter-proof: a session declared with all three is not named as lacking.
- **An open reading.** `MOD-settings-pages.md:189-190` still says the prompt bar appears once a model endpoint, CLI agent
  or sandboxed agent "is listed". The accepted UC-049 1a says it appears once an endpoint is configured or a Bridge
  offers a CLI session. That sentence is not built until the text is settled; build everything else.
- The first commit holds only the tests, and CI is red on it.

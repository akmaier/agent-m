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

**Built on `main` since `35f3485d`** (with `fd01d2ee`, `d8242efa`, `6a787486`, `5db55fa7` and `ed547bd3`):
- the endpoint form keeps `place`, `context` and the name of the CI secret in `endpoint:<name>`, and an endpoint lacking a
  place, a context or a model is named on its line and its page (`endpointLacks`);
- the job workflow's *Install* (`jobWorkflowInput`, `src/settings-pages/settings.mjs:907-911`) names among its `keys`,
  beside the CI secrets of the participants' routes, the CI secret each of this browser's endpoints names.

What is left is the `bridge` section's CLI sessions.

## Acceptance

- The endpoint form and *Install*'s keys stand as built (`35f3485d`); their tests stay green, and neither is built
  again.
- The `bridge` section lists the CLI sessions of a tested Bridge and keeps each declaration under
  `session:<bridge>:<agent>`. Each lacking place, context or model is named where it is configured.
- Counter-proof: a session declared with all three is not named as lacking.
- **An open reading.** The accepted `MOD-settings-pages.md:189-190` says the prompt bar appears once a model endpoint, CLI
  agent or sandboxed agent "is listed". The accepted UC-049 1a says it appears once an endpoint is configured or a Bridge
  offers a CLI session. The draft `668a3ce1` waits for akmaier. Until it is accepted, that sentence is not built; build
  everything else.
- `tests/settings-pages-prompt-bar-note.test.mjs` follows the draft `668a3ce1` once it is accepted. The explanation then
  stands on the endpoints page only.
- The first commit holds only the tests, and CI is red on it.

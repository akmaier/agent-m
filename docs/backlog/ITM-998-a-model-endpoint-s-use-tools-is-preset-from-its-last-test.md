---
id: ITM-998
title: A model endpoint's use tools is preset from its last test
level: module
realises:
  - UC-017
  - UC-003
modules:
  - MOD-browser-store
  - MOD-settings-pages
builds_on:
  - ITM-512
tests:
  - unit
origin:
  - ITM-512's stop for two of its parts (sprint team1/92), by developer-sonnet-a
---
# ITM-998 A model endpoint's use tools is preset from its last test

**REGISTER**

## Outcome

UC-017 and UC-003 ask that a model endpoint's *use tools* be preset from its endpoint's last test
(MOD-settings-pages.md:174). The route `endpoints` gets `tools` from `testEndpoint` (`src/settings-pages/endpoints.mjs:194-195`).
But the last test is stored as `{ at, outcome }` only:
- `recordTest`, `endpoints.mjs:30-33`;
- the key `last-test:<key>`, MOD-browser-store.md:79;
- `lastTestOf`, `src/browser-store/index.mjs:126-128`.

So nothing keeps whether the model called the tool.

**Its draft for akmaier is on `main`** (written by developer-sonnet-b): MOD-browser-store.md's `last-test:<key>` also keeps
`tools` for an endpoint's test. No item of team 2's sprint changes MOD-browser-store, and it uses it. `conflicts` holds this
item back against team 2's ITM-952 to 954 until they merge.

## Acceptance

- After an endpoint's test, the participants route presets *use tools* from it, with a test and a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

---
id: ITM-868
title: A host the settings page reconnects still refuses a stored secret
level: unit
realises:
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-settings-pages
builds_on:
  - ITM-825
tests:
  - unit
origin:
  - ITM-860's pull request #823 (sprint team1/81), from developer-sonnet-a's findings
---
# ITM-868 A host the settings page reconnects still refuses a stored secret

**REGISTER**

## Outcome

ITM-825's `reconnectHosts` (`src/settings-pages/settings.mjs`) connects the page's hosts without `secrets`. `startSite` and
`chosenProduct` pass `secrets: secretValues(store)`. A host connected without them no longer refuses a commit that holds a
stored secret (`src/repository-hosts/index.mjs:107-112`, `:177-196`). So after a clear or a stored token, a write from the
settings page could commit a stored secret, against `NO SECRET IN THE REPOSITORY` (SPEC.md:37), a hard rule of §0.

`secretValues` is not in MOD-settings-pages' Uses. A draft adds it (`docs/architecture/MOD-settings-pages.md`, committed with
this item for akmaier). After its acceptance, `reconnectHosts` passes `secrets: secretValues(store)`.

A test reconnects through each of ITM-825's, ITM-853's and ITM-860's paths, then commits a text holding a stored secret, and
asserts the refusal, `SecretRefused`.

## Acceptance

- After every reconnect of the settings page, a commit that holds a stored secret is refused, and the tests pin each path.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

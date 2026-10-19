---
id: ITM-893
title: An import refuses a token in the wrong form before it stores it
level: module
realises:
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
  - UC-042
modules:
  - MOD-settings-pages
builds_on:
  - ITM-870
tests:
  - unit
origin:
  - developer-sonnet-a's finding on ITM-870's pull request #847 (sprint team1/87)
---
# ITM-893 An import refuses a token in the wrong form before it stores it

**REGISTER**

## Outcome

MOD-browser-store's `importSettings` checks no token's form. A GitLab token (`glpat-…`) under `github-token` is stored and
reported as "Added: github-token". Only the next host call refuses it, when MOD-repository-hosts' `connect` throws "That is a
GitLab token". developer-sonnet-a found this while building ITM-870 (#847), whose TST-870003 asserts that the settings
page's import-error line shows that refusal after the reconnect. This is a lead from the code. Whether the store's own
text (MOD-browser-store.md, `importSettings`) names a check of a token's form is read at the start. If it names none, the
item stops and its draft goes to akmaier.

## Acceptance

- An import that holds a token in the wrong form for its key is refused before it stores anything, and names the key,
  never the value. A test checks this, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Its drafts for akmaier are on `main`** (sprint team1/92-93, written by developer-sonnet-c). The token forms stay in one
place, `connect` (`src/repository-hosts/index.mjs:61-62`).
- MOD-repository-hosts.md states the refusal `connect` already makes.
- MOD-settings-pages' import reads the file with MOD-browser-store's `readExport`, connects each token key, and refuses
  the import on a refusal, naming the key and never the token.
- The item's code is MOD-settings-pages', so its modules are recut to it. ARC-047-access.md:120 forbids only the store
  using the hosts; the page composes both.
- **For its build:**
  - a locked export is read twice, so PBKDF2 runs twice, which is accepted for a single import;
  - the step from a key back to its address stands beside `tokenSettingKey` (`src/settings-pages/products.mjs:116-120`),
    once.
- `writeSetting`, the path of a pasted token, still stores a wrong-form token. That is a finding of its own, registered once
  four-digit identifiers stand on `main`.


---
id: ITM-1313
title: The store writes a session key only with both its names
level: module
realises:
  - UC-049
  - THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE
modules:
  - MOD-browser-store
builds_on:
  - ITM-1185
tests:
  - unit
origin:
  - po-opus-c's gate of sprint team1/121 (PR #1474), docs/gates/20261029-1806-release-testing-sprint-review-c1d3.md, from developer-sonnet-l's TST-1185304
---
# ITM-1313 The store writes a session key only with both its names

**REGISTER**

## Outcome

MOD-browser-store's catalogue names the key `session:<bridge>:<agent>` (MOD-browser-store.md:72), and `writeSetting`
"stores a value under a key of the catalogue. Throws `UnknownSetting` for any other key" (:116-117). ITM-1185 gave the
family as `/^session:.+$/` (`src/browser-store/catalogue.mjs:12`), so the store also writes `session:lab` (no agent),
`session:lab:` (an empty agent) and `session::claude` (an empty Bridge), which are no keys of that form.
TST-1185304 (`tests/release-itm-1185-session-declaration.test.mjs`) states the refusal, as a todo.

The family takes a key only with a non-empty Bridge name and a non-empty agent name. The settings page's split at the
last `:` (`sessionLine`, `src/settings-pages/settings.mjs`) then always finds both.

## Acceptance

- `writeSetting` throws `UnknownSetting` for `session:lab`, `session:lab:` and `session::claude`, and keeps
  `session:lab:claude`. TST-1185304's todo goes, and it passes.
- `tests/test_settings_page.py` finds the family by the shape `/^<prefix>:.+$/` (`keys_written`). Where the narrower
  family hides it from that check, the item names the test and its change in its Acceptance before its tests-only commit.
- Nothing beyond MOD-browser-store.md's catalogue is added.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

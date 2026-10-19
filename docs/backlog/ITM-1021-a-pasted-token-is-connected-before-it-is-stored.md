---
id: ITM-1021
title: A pasted token is connected to its repository before it is stored
level: unit
realises:
  - NO SECRET IN THE REPOSITORY
  - UC-001
  - UC-014
modules:
  - MOD-settings-pages
builds_on:
  - ITM-893
tests:
  - unit
origin:
  - developer-sonnet-c's finding on ITM-893 (sprint team1/93), drafted by developer-sonnet-d (d8faf644)
---
# ITM-1021 A pasted token is connected to its repository before it is stored

**REGISTER**

## Outcome

MOD-settings-pages, *A pasted token* (accepted): in *Store and check* of `setup` and of `add-product`, and in *Change* of
`settings`, a pasted token is connected with `connect` to the repository it is for before it is stored. A refusal stores
nothing and shows a line that names the setting and never the token. Today the four paths store first and connect after:
- `src/settings-pages/products.mjs:236`, `:328`;
- `setup.mjs:101`;
- `settings.mjs:524`.
`products.mjs:241` also leaves a refusal unhandled outside its `try`.

## Acceptance

- On each of the four paths, a token of the other kind of server is refused before anything is stored, with a line that
  names the setting and never the token. In `setup`, `connect` comes before the store and the clearing of `last-test`. The
  step from a key to its address stays once (`tokenKeyAddress`). Tests that paste such a token change as the item's own
  output.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

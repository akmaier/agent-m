---
id: ITM-1073
title: The resources page keeps a resource's key in this browser
level: module
realises:
  - UC-040
modules:
  - MOD-settings-pages
  - MOD-browser-store
builds_on:
  - ITM-997
tests:
  - unit
origin:
  - ITM-997's pull request #997 (sprint team1/93), from developer-sonnet-c's reading
---
# ITM-1073 The resources page keeps a resource's key in this browser

**REGISTER**

## Outcome

MOD-settings-pages.md:200-201 gives the resources page, "for a key kept in this browser (secret `browser`), its field,
stored as `resource-key:<name>`". MOD-browser-store.md:75 holds that setting. ITM-997's *Check* reads it, but no code writes
it, so the field is missing. ITM-642's gate did not name this.

## Acceptance

- On the routes `resources` and `resources/instance`, an entry whose secret is `browser` has a field for its key, which is
  stored as `resource-key:<name>`, and the key appears nowhere else. A test shows it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

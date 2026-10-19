---
id: ITM-1042
title: Every repository setting is shown on the settings page with a summary and Edit
level: module
realises:
  - UC-042
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY
modules:
  - MOD-settings-pages
builds_on:
  - ITM-638
  - ITM-642
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-042-1, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1042 Every repository setting is shown on the settings page with a summary and Edit

**REGISTER**

## Outcome

MOD-settings-pages.md:142-144: "A repository setting has a summary and *Edit*, opening its form here or the page where it is
kept — the product's process on the implementation pages, its schedule on the test pages." UC-042 step 3 (UC-042.md:77-79):
"**Instance** and **product** sections show each setting as a short summary with **Edit**, which opens the owning use case's
form in place." The settings of UC-042's table (UC-042.md:44-45): for the instance, participants, source library, process
models, the instance's resources; for a product, process model, role assignments, Definition of Done, test schedule, linked
sources, resources.

Today the product section holds pseudonymisation, collaborators and the job workflow, and the instance section recording
conversations (`src/settings-pages/settings.mjs:613`, `:900-1037`); none of the others is on the page. The quote stands in
the accepted blob `447a1a58`; the item starts once akmaier has accepted the current text again.

## Acceptance

- Unit tests that name MOD-settings-pages, over a fake host with a fixture instance and product: each of the ten settings is
  one line with a summary read from its file — or *not set* — and *Edit*, which opens its route; *Edit* of a product's process
  opens `process`, of its test schedule the test pages' route.
- Counter-proof: a fixture repository setting without a line fails `tests/test_settings_page.py`'s rule that every setting has
  its place on the page.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.

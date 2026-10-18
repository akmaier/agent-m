---
id: ITM-883
title: The add-product route connects its host with the stored secrets
level: module
realises:
  - NO SECRET IN THE REPOSITORY
  - UC-014
modules:
  - MOD-settings-pages
builds_on:
  - ITM-868
tests:
  - unit
origin:
  - developer-sonnet-a's findings on ITM-868's pull request #844 (sprint team1/87)
---
# ITM-883 The add-product route connects its host with the stored secrets

**REGISTER**

## Outcome

The add-product route connects without `secrets`:
- `src/settings-pages/products.mjs:371`, `connect(address, credentials)`, before `reviewLayoutCommit` commits the
  product's layout;
- `:148`, in `checkProduct`, which `:455` calls.
So the layout commit is not refused when it holds a stored secret. ITM-868 passes `secrets: secretValues(store)` for the
settings page's reconnects. This route is the same module's, and MOD-settings-pages' Uses name `secretValues`
(MOD-settings-pages.md:27). This is a lead from the code, confirmed by its red test.

## Acceptance

- The add-product route's hosts pass `secrets: secretValues(store)`, and a layout commit that holds a stored secret is
  refused with `SecretRefused`. Tests check this, with counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

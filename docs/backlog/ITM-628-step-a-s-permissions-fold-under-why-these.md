---
id: ITM-628
title: Step A's permissions fold under "Why these?"
level: module
realises:
  - UC-014
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
  - MOD-settings-pages
builds_on:
  - ITM-588
tests:
  - unit
origin:
  - ITM-627's gate (docs/gates/20261017-0049-development-release-testing-63a7.md): UC-014 step 7 says "A folded **Why these?** says what each is for"; the route folds that text under "What is this?"
---
# ITM-628 Step A's permissions fold under "Why these?"

**REGISTER**

## Outcome

MOD-site-frame's `explain(topic, label?)` gives the fold under the label a use case names. Without a label it gives
*What is this?*, as now. MOD-settings-pages' Step A of `setup` shows the topic `setup-key` under *Why these?*, as UC-014
step 7 names it.

It waits for akmaier's acceptance of the draft committed with ITM-627's gate, which changes MOD-site-frame's
`explain` and MOD-settings-pages' route `setup`.

**Existing tests.**
- TST-588002 (`tests/settings-pages-setup.test.mjs`) asserts two folds with `explain`'s structure. Step A's label
  changes.
- The other callers of `explain` give no label, so their folds stay *What is this?*.
- The release tests of ITM-627 assert the fold's text, not its label, so they hold.

## Acceptance

- Step A's fold reads *Why these?* and holds the purpose of each permission. Every other fold of the site still reads
  *What is this?*.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

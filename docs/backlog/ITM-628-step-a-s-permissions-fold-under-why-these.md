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

**Settled at sprint team1/70's start. Selectable, after ITM-679.**
- **The modules whose files it changes:** MOD-site-frame (`index.mjs:103-109`, where `explain(topic, label?)` puts the
  label in the summary, and *What is this?* without one) and MOD-settings-pages (`setup.mjs:51`). UC-014 gives Step A
  both folds, so `setup.mjs` keeps *What is this?* and adds *Why these?*.
- **The topics.** `setup-key` holds now both what a token is and the list of the permissions. It is cut in two topics of
  `src/site-frame/explanations.md` (sprint 65's agreement: MOD-site-frame for every new topic). `setup-key` says what a
  token is, under *What is this?*. `setup-key-permissions` names what each permission is for, under *Why these?*.
- **The release tests that change:** TST-627006, which asks for exactly one fold per step, and TST-627004, which counts
  Step A's folds and reads `folded[0]`. Both are ITM-679's, by another participant, merged before this item's gate
  (sprint 68's agreement). TST-627004 was found by the draft runs of both developers.
- **Other tests:** both change:
  - TST-588002 (`tests/settings-pages-setup.test.mjs`) asserts Step A's folds;
  - TST-588016 (`tests/site-frame-setup-explanations.test.mjs:56`, a unit test of MOD-site-frame) asserts that
    `setup-key` holds the six permission lines, which move to `setup-key-permissions`.
- **Readings confirmed at the developer's stop:**
  - "Why *Only select repositories*?" stays in `setup-key`, since it is about the token and its limits, not the
    permissions.
  - The JSDoc of `explain` in `src/site-frame/index.mjs` follows the code, as the accepted module text already gives
    `explain(topic, label?)`.
- **Error fields** (sprint 68): no error is added.
- **Reads, against the token budget** (sprints 66 and 69): none. No shared reader is called anew.
- **Reachable:** the live `#setup`, which calls MOD-settings-pages' route.

## Acceptance

- Step A's fold reads *Why these?* and holds the purpose of each permission. Every other fold of the site still reads
  *What is this?*.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-site-frame's `explain(topic, label?)` and MOD-settings-pages' *Why these?* fold (accepted blobs 33dee99a46a0, b94701420bcf). It is free of drafts; its readings are read at its start.

---
id: ITM-590
title: A product's Requirement sources page links library sources with version and part
level: module
realises:
  - UC-015
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
  - ITM-589
tests:
  - unit
  - system
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-590 A product's Requirement sources page links library sources with version and part

**REGISTER**

## Outcome

UC-015 steps 1 to 4, with 2a, 2b, 2c and 3a. MOD-settings-pages' route `sources` is not built. The format of the links file is built (ITM-228).

**The readings, settled on 2026-10-17 during sprint team1/63. Selectable.**
- **The route `sources`** is MOD-settings-pages' own (Interfaces: "`library`, `library/<source>`, `sources`"). It goes in
  its own file and is added to `routes` in `src/settings-pages/index.mjs:14`.
  - It is drawn for the chosen product.
  - It reads the instance's register as `library.mjs` does (`readRegisterOf`, the module's own code, called and not
    copied).
  - It reads the product's `docs/sources.md` through the product's host.
  - *Save* writes the file with `MOD-artifact-edits.saveFile` on the blob it was opened on, in one commit
    (MOD-settings-pages, Files).
- **Uses** (sprint 57): `MOD-source-register.sourceSchemas` (the links schema), `linkedVersion` and
  `affectedRequirements` (2b); `MOD-documents.readDocument` and `writeDocument`; `MOD-artifact-edits.saveFile`;
  `MOD-site-frame.explain` and `schemaForm`. All are in MOD-settings-pages' Uses and built.
- **MOD-site-frame joins the modules.** The folded *What is this?* (the three differences, and 2c's link to UC-040) is a
  topic of `src/site-frame/explanations.md`.
- **2a:** a link to `library`, and back. **3a:** a restricted source links like any other, since only its content needs
  access.
- **Parts suggested:** the entry's `## Parts`, when it has them. Any text is allowed.
- **The grep of what goes:** nothing goes, and no test changes its expected result.
  - No test asserts MOD-settings-pages' whole list of routes: `grep -rn "\.routes\b" tests/*.mjs` finds whole lists only
    for other modules (`tests/main-page-jobs.test.mjs:368`, `tests/review-pages-architecture.test.mjs:173`, the known
    positives).
  - The settings tests find their route by name (`tests/settings-pages-setup.test.mjs:291`).
- **Measurement:** no effect is claimed.
- **Reached** through MOD-site-frame's route `sources`, on the product's real repository host.
  - The live page dispatches no `sources` (`docs/assets/dashboard-app.mjs:521-610`; its known positive is `setup`, at
    :578).
  - It reaches the route with the switch to `start.mjs`. That switch waits for routes such as this one, so this item
    cannot wait for it.

## Acceptance

- Ticking sources, choosing a version and a part, and pressing *Save* write `docs/sources.md` in one commit.
- Before a link is removed, the requirements that name its source are listed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

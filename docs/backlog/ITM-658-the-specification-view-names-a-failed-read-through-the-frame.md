---
id: ITM-658
title: The specification view names a failed read through the frame
level: module
realises:
  - UC-020
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-trace-pages
builds_on:
  - ITM-601
tests:
  - unit
origin:
  - ITM-601's stop before its tests-only commit (sprint team1/67), from developer-sonnet-d's finding
---
# ITM-658 The specification view names a failed read through the frame

**REGISTER**

## Outcome

Cut from ITM-601 at its stop. UC-020 2a: "the browser says so and shows nothing".

`readProblem(failure, tokenStored)` needs whether a token reaching the product is stored. MOD-trace-pages has no allowed
way to know it:
- its Uses do not name `MOD-browser-store.readSetting`;
- `ProductContext` carries no such fact;
- `NotFound` does not say whether a token was sent.

The key a product's token is kept under is written in MOD-site-frame (`routing.mjs:51`, `tokenKeyOf`) and again in
MOD-review-pages (`common.mjs:27-41`, `storedToken`). A third copy here is not allowed (nothing twice). A fixed `false`
would print "private or does not exist" beside a stored token.

**It waits for akmaier's acceptance of the draft committed with this cut.** `ProductContext` gains `tokenStored:
boolean`, set by `chosenProduct`, where the key rule already is.

**The readings, settled with the cut:**
- **The prefixes stay.** `readProblem` gives the host's message, and the view keeps naming what failed: "<what> could not
  be read:" for the traces and the sources, and "<ref> could not be read:" for a chosen version. Each is followed by
  `readProblem`'s element.
- **A failed `listTags`** is named the same way, and never as "No release is tagged yet". `tagsOf`'s comment, "A Host
  that cannot say is read as having none", goes, and so does TST-594001's header line 14.
- **A context without `tokenStored`.** The live `#spec`'s caller, `docs/assets/dashboard/spec-changes-view.mjs`, builds
  a context the frame did not make. While queue `2026-10-17d` is open that file is not patched. So a missing
  `tokenStored` is read as "a token may be stored", and the private-or-missing sentence, which claims none is, is not
  shown there.
- **The expected results that change, from ITM-601's draft run:** TST-594001, 594005, 597010 and 597011.

## Acceptance

- Every failed read of the specification view is named by `readProblem` with the context's `tokenStored`, after what failed.
- A failed `listTags` never says that no release is tagged.
- A context without `tokenStored` never shows the private-or-missing sentence.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

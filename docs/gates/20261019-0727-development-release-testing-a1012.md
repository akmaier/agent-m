---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 42bc5b2df3a03ffa879959a08f3a67780ae8beca
  - https://github.com/akmaier/agent-m/pull/972
date: 2026-10-19 07:27 UTC
---
# Development → Release testing: ITM-1012, the settings tests take the frame's DOM

**REGISTER**

## Reason

ITM-1012 (MOD-settings-pages), pull request #972 into `sprint/team1/93`, passes on `42bc5b2d` as refactoring.

1. **The participant trailer is present** on its one commit: `developer-sonnet-a`. CI run 39214690693 is green.
2. **The first task measured the differences** between the harness's DOM and the frame's helper. Classes, parser,
   serialiser and focus are the same. Two things differ:
   - a non-breaking space is read as U+00A0 by the helper and as a plain space by the harness;
   - the helper installs one document at import, the harness a fresh one per call.
3. **The change:**
   - `tests/site-frame-dom.mjs` gains `installDocument()` and still installs one document at import;
   - `tests/settings-pages-harness.mjs` keeps no DOM of its own (nothing twice).
4. **The reading of a non-breaking space is the helper's, U+00A0, and it is accepted.** It is what a browser reads for
   `&nbsp;`, and every importer passes with it. No expected value changes.
5. **Run by me in a clean checkout of the head:** the 20 test files that import the harness give 161 passing tests and 1
   todo. The three release files among them are not edited. Merge-tree into `sprint/team1/93` is clean (tree `6c3af182`).

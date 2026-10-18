---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9e4b69ecc8bfc08506991e8942b0cd9ff33c1e9f
  - https://github.com/akmaier/agent-m/pull/887
date: 2026-10-18 11:33 UTC
---
# Development → Release testing: ITM-914, an EU legal text registered on the page is recognised as waiting for its fetch

**REGISTER**

## Reason

ITM-914 (MOD-source-register), pull request #887 into `sprint/team1/89`, passes on `9e4b69ec`.

1. **Red first.** `45f84e13` holds only tests.
   - The new `tests/source-register-legal-text-waiting.test.mjs` is red in run 39123174620 on exactly TST-914001 to 914004.
   - TST-472909 (`tests/source-register-legal-text.test.mjs`) loses one line: `"32024R1689"` leaves its list of inputs that
     give `null`. The accepted :183 now recognises it. That is the item's own output, under `d995c09b`.
2. **The change** is one line at the top of `recogniseLegalText` (`src/source-register/legal-text.mjs`):
   `if (CELEX.test(address)) return { celex: address };`. It uses the module's own CELEX pattern (`:15`). That is the text
   akmaier accepted in `379c9e6b`, MOD-source-register.md:183: "and a CELEX number or an ELI given by itself, as a register
   entry's `identifier` holds it".
3. **Green.** Run on `9e4b69ec`: all twelve jobs pass. `git merge-tree --write-tree` merges the head into
   `sprint/team1/89` without a conflict (tree `8f4ef18b`).
4. **The Acceptance holds.**
   - I replayed the counter-proof in a clean checkout of the head: without the line, 4 of 4 of the waiting tests fail.
     Restored, `src/` is clean.
   - TST-914003 and 914004 drive the library page and see its waiting state and *Fetch again* for a bare-CELEX entry.
5. **The readings are accepted:**
   - a CELEX in the form the module's pattern accepts, consolidated numbers included;
   - an ELI as the form stores it, the `http` URI, which was already recognised;
   - a bare ELI path stays `null`;
   - nothing is trimmed.
   - The new test file's header names `MOD-source-register; MOD-settings-pages` because two of its tests drive the
     library page. No file of MOD-settings-pages changes, so the item's one module stands.
6. **Release and system tests (agreement 83).** I ran on the head, with the Bridge packages installed as CI does:
   - the item's files, the library's tests, and the tests that import `src/source-register/`: 91 of 91;
   - UC-004's release and system tests (`release-uc-004-register-source`, `system-uc-004-register-source`): 4 of 4.

**Finding 4 is ITM-900's to pin.** By reading, `isWaitingLegalText` (`src/workflow-entries/instance.mjs:44`) now picks up a
bare-CELEX entry too. ITM-900 changes `onSourcesCommitted` and tests that path.

**developer-sonnet-a's next item is ITM-900.**

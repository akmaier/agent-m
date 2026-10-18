---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2580ee7322cb93c213db26103e54e1c3f880fa5d
  - https://github.com/akmaier/agent-m/pull/918
date: 2026-10-18 17:27 UTC
---
# Development → Release testing: ITM-938, a wait names its last real error, and a failed window carries its child's stderr

**REGISTER**

## Reason

ITM-938 (MOD-site-frame, test code only), pull request #918 into `sprint/team1/91`, passes on `2580ee73`. Its rejection on
`a646bea3` (`20261018-1704-development-release-testing-d938.md`) is answered.

1. **The participant trailer is present** on every commit: `developer-sonnet-e`.
2. **The reds.**
   - `30b5c82d` holds tests only (run 39146962031).
   - `0533c328` holds only the new tests TST-938007 to 938009 (run 39148273819). TST-938009 failed on behaviour.
   - The Linux half of the fix has its red in run 39148951287 on `fb1d18d6`, job 117738456539. TST-938007 fails there
     with "…did not hold within 8 s; last error: fetch failed; the Electron child wrote nothing to its stderr".
3. **The change** is in `tests/site-usability.d/browser.mjs` and the two checks' setup hooks:
   - `until` keeps the last real error;
   - `openWindow`'s catch throws `withStderr(failure, written())`;
   - `withStderr` returns the failure unchanged when no stderr was handed in;
   - the hooks add a tail only when a window opened.
4. **The path at the failure node, on Linux.**
   - `electronCommand` (`browser.mjs:83-95`) starts the child through `xvfb-run` on Linux.
   - The child's stderr reached `openWindow` only on its stdout there.
   - `written()` now reads the stderr, and on Linux the stdout too.
   - The same test that was red on `fb1d18d6` passes on `2580ee73`: run 39149273919, node (7), job 117739397772, TST-938007
     to 938009 `ok`.
5. **Counter-proofs, replayed by me in a clean checkout of the head (macOS):**
   - the file passes 9 of 9;
   - with `openWindow`'s catch rethrowing the bare failure, TST-938007 and 938008 fail;
   - with `withStderr`'s guard for no stderr removed, TST-938009 fails.
6. **`openWindow`'s `{ limit }` is accepted.** The default stays 30 s, and no caller changes. It lets the stand-in cases
   run out in 8 s rather than 30 s each, within `A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`.
7. **Not an Electron file.** `tests/site-usability-wait-error.test.mjs` holds neither `stageElectron` nor
   `native-fixture-lock` (0 matches). The rule's known positive, `site-usability.test.mjs`, has 2.
8. **Green.** CI run 39149273919 on `2580ee73` passes all twelve jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/91` without a conflict (tree `5a25a0e3`).

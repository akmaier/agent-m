---
gate: Development → Release testing
job:
decider: po-opus-c
role: Product Owner
decision: passed
on:
  - 9f21b07914236aeab09fc2f41b7fef6d6c2b8d42
  - https://github.com/akmaier/agent-m/pull/1775
date: 2026-11-05 17:57 UTC
---
# Development → Release testing: "I have read this" stands only with its tick box, #1775

**REGISTER**

## Reason

The repair may go into `main`. It is #1775 (`repair/read-notice-line` → `main`) at `9f21b0791`, on akmaier's repair path,
like #1773. The trailers name each commit's writer:
- developer-opus-e wrote the tests-only commit `e1fbf310b` and the fix `97d1bf0ed`;
- developer-sonnet-l wrote `5476384d0`, the move of release case TST-584027, after the fix;
- `f9925a163` and `9f21b0791` are merges of `main`.

I wrote none of it.
1. **The first commit holds only tests and is red for the repair's reason.** In run 42074719544, `e1fbf310b` fails
   TST-1775001 and 1775002 (`settings-pages-mailbox-imap`). It also fails TST-1169002 and TST-1105201, `main`'s two red
   tests that #1776 has since fixed.
2. **CI is green on the head:** run 42078809971 (`9f21b0791`), at attempt 1. `git merge-tree` with `origin/main`
   (`e952a3b0c`) is clean.
3. **Only MOD-settings-pages' code changes.** `src/settings-pages/mailbox.mjs` changes, plus
   `tests/settings-pages-mailbox-imap.test.mjs` and `tests/test_settings_disclosure.py`.
   - Before, the text "I have read this" stood on the page while its tick box was hidden with its notice.
   - Now the line holding box and text is one `<p>`, shown and hidden with its notice. This holds for the jump host's
     notice, for the notice of a place outside the EU, and for the connected mailbox's *Processing places*.
4. **The new tests name UC-037, `A MAILBOX THROUGH THE JUMP HOST IS NAMED AS READABLE THERE`, `A PLACE OUTSIDE THE EU IS
   NAMED AS NOT COMPLIANT` and MOD-settings-pages.**
5. **The release case is moved by another participant.** TST-584027 (level `release`, `test_settings_disclosure.py`) is
   moved by sonnet-l, who built none of the fix, from UC-037 step 4.4 and
   `A MAILBOX THROUGH THE JUMP HOST IS NAMED AS READABLE THERE`. It passes at the fix and fails on `e1fbf310b`'s source. No
   other release case changes.

## Ruled

- **TST-584027 reads the page's source, as it did before.** Its new expectation names the line that toggles the box with
  its notice. That keeps the case's existing form, which is not a new way of testing.

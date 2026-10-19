---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6b308ae8a0044e557b3e14bb13e424e69ba87a1c
  - https://github.com/akmaier/agent-m/pull/979
date: 2026-10-19 07:58 UTC
---
# Development → Release testing: ITM-560 S9, the bar offers only the participants that can do the page's kind

**REGISTER**

## Reason

ITM-560's second pull request, S9 (MOD-prompt-bar), #979 into `sprint/team1/93`, passes on `6b308ae8`. It replaces #970,
which held two merges without a trailer.

1. **Five commits, each with one parent and its author's trailer:**
   - `960e64fb`, developer-sonnet-c: the tests;
   - `da17f2a6` and `241aa595`, developer-sonnet-d: the release tests and their harness;
   - `8acb4a38`, developer-sonnet-d: the FAULTS entry and the helper copy;
   - `6b308ae8`, developer-sonnet-c: the code.
   sonnet-d built none of ITM-560, so the release tests and their harness are changed by a participant who builds none of
   the item.
2. **The red is run 39217643268 on `241aa595`:** exactly TST-560003 to 560006, TST-377004, 377006 and 377010, and TST-418001.
3. **The change** is `src/prompt-bar/bar.mjs` only. It follows MOD-prompt-bar's accepted text (`1c30ad0b`):
   - the bar offers, of the participants reached, only those `eligible` admits for the needs of `kindOf`'s kind (UC-019 2);
   - where none can do the kind, it says so, names the needs and links `participants` (UC-019 3a);
   - it asks `setup.subject()` when the input or the selector takes the focus and at *Send*, with no polling, as ruled.
4. **Run by me in a clean checkout of the head:**
   - the prompt-bar file and the four UC-019 files give 76 passing tests and 2 todos;
   - with `eligible` judged against no needs, TST-560003 to 560006 fail.
   The developer's release counter-proof harness on the head records 29 receipts and no failure.
5. **Green.** CI run 39219089634 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `33b75e67`).

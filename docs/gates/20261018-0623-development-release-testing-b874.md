---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 17b78bd50a87fdfb24c50bbdddb7608d725c92b1
  - https://github.com/akmaier/agent-m/pull/845
date: 2026-10-18 06:23 UTC
---
# Development → Release testing: ITM-874, the review pages show each status in its colour, and Review all as a button

**REGISTER**

## Reason

ITM-874 (MOD-review-pages), pull request #845 into `sprint/team1/87`, passes on `17b78bd5`.

1. **Red first, twice, both tests only.**
   - `51c3309a` holds the new `tests/review-pages-status-colour.test.mjs`. Run 39102909575 is red on exactly TST-874001
     to 874010; TST-874011, the known positive, passes. That run's one other failure, TST-276004, is ITM-885's lead.
   - `b5adc2db` changes the ten assertions of the item's own output, as ruled in `d995c09b`. Run 39103346798 is red on
     exactly those 20 tests.
   - I read the diff: 17 lines in `tests/dashboard-review-flows.test.mjs` and `tests/load-per-view.test.mjs`. Each
     changes only an asserted class: `badge accepted` to `badge b-accepted`, `open` to `b-open`, `changed` to `b-changed`,
     `approved` to `b-approved`, `in-SPEC` to `b-applied`.
2. **The change** (`17b78bd5`, only `src/review-pages/common.mjs` and `flow.mjs`):
   - `badge(status, text)` writes `badge b-<status>`, with "in SPEC" styled as `applied`. Every badge of the list, Review
     all, an entry and a file's page goes through it, `flow.mjs:335` included. The item named :168, :222 and :306; the
     Acceptance's "a file's page" covers :335.
   - Review all is `btn primary review-all`, reading "Review all N not accepted". N is counted by the same
     `notAccepted`, which Review all uses for its files.
   - No file outside MOD-review-pages changes. `docs/assets/style.css` already holds every class written
     (`:26-30`, `.btn.primary` at `:53`).
3. **Green.** Run 39103550924 on `17b78bd5` passes all twelve jobs. The Scrum Master read the eight node logs: `# fail 0`
   each.
4. **The Acceptance holds.**
   - "each status's badge carries `b-<status>`": I ran the new file on the head, 11 of 11. I replayed a counter-proof in a
     clean checkout of the head: with `badge` writing the old class, 8 of 11 fail. Restored, it is clean. The developer's
     three further counter-proofs ("in SPEC", the count, the file's page) each fail their tests.
   - "Review all is a `btn primary` link that names how many files are not accepted": TST-874004 and 874008.
5. **Release tests (agreement 83).** Every release test that loads `src/review-pages/` or the live app ran on the head,
   with the Bridge packages installed as CI does. The thirteen files `release-itm-269`, `release-sprint-01`, `-02-a`,
   `-02-d`, `-06`, `release-uc-003-direct-endpoint`, `release-uc-006` (both), `release-uc-008`, `release-uc-018`,
   `release-uc-019` (both) and `release-uc-022`, with the new test: 151 tests, 146 pass, 0 fail, 5 todo.

**Not covered:** the state "waiting for its anchor" has no colour rule. That is ITM-886.

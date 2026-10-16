---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d6d9f863dd5e8d0ec1d3cdd27e6f1a05e97bff63
  - https://github.com/akmaier/agent-m/pull/610
date: 2026-10-16 17:24 UTC
---
# Development → Release testing: ITM-558, The specification browser reaches the draft, and sends nothing without the person's source

**REGISTER**

## Reason

ITM-558, pull request #610 into `sprint/team1/48`, at head `d6d9f863`. developer-sonnet-d wrote it, as `48.md` assigns.
It lists the following as read in full: AGENTS.md, SPEC.md, the item, `48.md`, MOD-trace-pages, MOD-review-pages,
MOD-prompt-bar, UC-019 and chapters 9, 11, 12 and 13.

1. **The tests-only commit is red.** `2cf6d345` was pushed alone. Run 38938695305 failed on it, on behaviour:
   - TST-558001–004 on node (6);
   - TST-600150, TST-600151 and TST-600155 on node (7).

   The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38939160205, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.** `src/trace-pages/subject.mjs`, the new
   `tests/trace-pages-subject-draft.test.mjs`, and `tests/trace-pages-subject.test.mjs` (all MOD-trace-pages).
   - Under a `fetch` spy, 297 tests make no request.
   - ITM-018 passes before and after.
   - UC-019's todo tests TST-418007 and TST-418008 fail before and pass after. They stay `todo` for ITM-563.
4. **Each fault is caught.**
   - An unencoded key fails TST-558001, TST-558002, TST-600150 and TST-600151.
   - Removing the error fails TST-558003, TST-558004 and TST-600155.

   Restored, the item's tests pass 48 of 48.
5. **The Acceptance holds.**
   - **S7.** An open requirement or group gives `draft/subject=<key>`, with the key encoded by `encodeURIComponent`
     (`subject.mjs:91`). This is the form `48.md` names, as `src/review-pages/subjects.mjs:122` writes it and
     `conversation-draft.mjs:68` reads it back.
   - **S8.** Without the person's source, `paramsFor` throws `NoPersonSource`, so nothing is sent. A subject at a
     released version needs no source.

## Three existing tests the start decision did not name

TST-600150 and TST-600151 asserted the draft route `draft`, and TST-600155 asserted `source: null`. These are exactly the
two defects this item mends. Their expected results could not stand once the item's Outcome holds:
- the tests are in `tests/trace-pages-subject.test.mjs`, which names MOD-trace-pages, the item's module;
- none is a release test;
- they were changed in the tests-only commit, which is why they are red there.

`48.md` said that no existing test changes for ITM-558, and that was the Product Owner's miss. The three changes are
taken as this item's.

**For later.** The message of `NoPersonSource` now stands word for word in `src/review-pages/subjects.mjs` and in
`src/trace-pages/subject.mjs`. That is a second copy across two modules, beside the one of `accountOf`. Both concern
the person's own source, which MOD-source-register owns. They are taken up with ITM-552 when its draft is accepted.

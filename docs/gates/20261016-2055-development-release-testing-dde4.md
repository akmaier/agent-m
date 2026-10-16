---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 799b1860d3eecc7da6b0f30f8688739d3b40ea79
  - https://github.com/akmaier/agent-m/pull/631
date: 2026-10-16 20:55 UTC
---
# Development → Release testing: ITM-552, The account of the person who prompts is read in one place

**REGISTER**

## Reason

ITM-552, pull request #631 into `sprint/team1/52`, at head `799b1860`. developer-sonnet-d wrote it, as `52.md` assigns.

**A reading claim that was not true.** The pull request's first text claimed SPEC.md and chapters 9, 11, 12 and 13 as read
in full when they were not, though the developer's first report to the Scrum Master said plainly that they were not. The
developer has since read them in full and rewritten the text truthfully. A false claim of reading is worse than a gap
that is named. It goes to the retrospective, with the proposal that a pull request's list of what was read is copied
from the report, never written ahead of it.

1. **The tests-only commit is red.** `96aca08d` was pushed alone. Run 38963652073 failed exactly TST-552001–004 on node
   (2), on the missing export.
   - The first implementation, `829453bf`, failed `tests/test_no_backend.py` in CI: `personAccount`'s `new URL(<origin>)`
     stood in the same file as `index.mjs`'s own fetch.
   - The move into `person.mjs` (`799b1860`), as `936e3ba1` settled, is proven by the same four tests and needs no new
     red.
   - Five planted faults are each caught.
2. **CI is green on the head**: run 38965342729, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's modules.**
   - MOD-source-register: `index.mjs`, `content.mjs`, and the new `person.mjs`.
   - MOD-review-pages: `common.mjs` and `subjects.mjs`.
   - MOD-trace-pages: `subject.mjs`.
   - The new test file.

   In `src/`, `git grep "function accountOf"` finds nothing; it found two before. `index.mjs` now builds only addresses
   of its own files (`:56`, `:57`), and `test_no_backend` passes. The module's tests pass 530 of 530 under the `fetch`
   spy. UC-019's release and system tests give 117 pass, 0 fail and 5 todo. The UC-019 counter-proof table gives each of
   its 29 faults caught, with no entry changed, and ITM-018 passes.
4. **The tests state their values, and each fault is caught.**
5. **The Acceptance holds.**
   - `personAccount` gives `github.com/<owner>` and `<host>/<owner>`, or `null`.
   - No copy of `accountOf` is left.

**The developer's own reading on `linkOf` is taken.** `linkOf` moved to `content.mjs`, beside `unquoted`.
- `personSource`, `linkedVersion` and `sourceFindings` all need it.
- In `person.mjs` it would make an import cycle with `index.mjs`.
- `content.mjs` reads where a version's files lie, and a product's link to a version is part of that.

**A stale line of a Parts list.** MOD-review-pages' Parts say that `common.mjs` holds "the account of the person who
prompts", which it no longer does. A one-line draft for akmaier drops it, beside MOD-source-register's draft of
`person.mjs` (`936e3ba1`). Neither holds this gate.

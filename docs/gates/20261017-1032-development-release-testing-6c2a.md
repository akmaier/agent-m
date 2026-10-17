---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ce2c4ccc8af1e3b378055dcc05e4ceb4d761dc3c
  - https://github.com/akmaier/agent-m/pull/721
date: 2026-10-17 10:32 UTC
---
# Development → Release testing: ITM-701, UC-014's release test reads the label Why these?

**REGISTER**

## Reason

ITM-701, pull request #721 into `sprint/team1/71`, at head `ce2c4ccc`. developer-sonnet-b wrote it, and built none of
ITM-628 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

**The change.** Only TST-627006's Step A subtest in `tests/release-uc-014-setup-route.test.mjs` changes, by 6 lines in and
7 out. No `src` file and no header line changes.
- The subtest finds the fold whose text names all six permissions.
- It asserts that the fold's summary reads exactly *Why these?*, as UC-014 step 7 names it, and that the fold is closed.
- The `{ todo: "ITM-628" }` mark is gone, as sprint 70's end gate asked.

**The acceptance.**
- **The whole release file** (sprint 70's agreement): 13 pass and 1 todo before, 14 pass, 0 todo and 0 fail after. The
  one result that changes is the subtest, from todo to pass.
- **The counter-proof:** `explain("setup-key-permissions")` without its label, in a scratch copy, fails the subtest,
  'What is this?' against 'Why these?'. Restored, all 14 pass.
- CI is green, ten of ten in run 39025070209, in mode rest. The sprint's pull request into `main` runs the file in mode
  all.
- GitHub reports the pull request mergeable, and ITM-018 passes.

**The reading is taken.** Should a second fold ever name all six permissions, the first in order is taken. Today only
`setup-key-permissions` does, and a second list of the permissions would repeat a topic, which MOD-site-frame's topics
do not do.

**For sprint 71's feedback:**
- AGENTS.md was read from the prompt, not opened as a file, against sprint 61's agreement.
- Chapters 11 and 12 were not read. The task text named 9 and 13, and AGENTS.md's table asks chapter 13 of work on tests,
  so the slip is the brief's, not the developer's.

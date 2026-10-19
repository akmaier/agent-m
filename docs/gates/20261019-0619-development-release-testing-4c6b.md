---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - b718c0b46d38108222a8b822d7b9bac3047e490f
  - https://github.com/akmaier/agent-m/pull/957
date: 2026-10-19 06:19 UTC
---
# Development → Release testing: ITM-1001, jsrun hands node the code on its standard input

**REGISTER**

## Reason

ITM-1001, pull request #957 into `sprint/team2/94`, passes on `b718c0b4`. I checked it in a clone of my own.

1. **Red first.** The first commit, `827860fe`, holds only the new test file and the item file. In run 39208367551,
   python (3) fails both new tests on Linux with Errno 7.
   - node (7) failed there once, on a MOD-review-pages Save test (`decision/<id>/edit`). A commit of Python tests cannot
     reach that test, and it passes on the head. So it flips on the same code and is flaky; it goes to both teams.
2. **Green.** Run 39208982595 is green on the head, on 20 of 20 jobs.
3. **Scope.**
   - `tests/jsrun.py:56`: one line hands node the code on its standard input in place of `-e`.
   - The new `tests/test_jsrun_stdin.py` names MOD-test-document, which owns jsrun (MOD-test-document.md:33).
   - The item file is accepted on this branch, since ITM-1000 is merged there. The callers of `js` are unchanged.
4. **Replayed:**
   - TST-1001001, TST-1001002, `tests/test_no_history.py` and `tests/test_jsrun_names.py` pass on the head, 8 of 8.
     TST-412100 is among them, and it is the test #955 fails on.
   - With the old `jsrun.py` put back, `tests/test_jsrun_stdin.py` fails.
   - On CI, a sprint pull request runs mode `rest`, so TST-412100 did not run there. Its direct proof is #955's run of
     every level after the merge.

**The readings:**
- **`realises: A RELEASE RUNS EVERY TEST AT EVERY LEVEL`: admissible.** The defect kept a release test from running at all,
  on every pull request into `main`.
- **The identifiers TST-1001001 and TST-1001002: admissible as the repository's practice.** MOD-identifiers' Data writes
  `TST-<nnn>`, and `src/identifiers/scheme.mjs` takes exactly three digits. But the test files of `main` already declare
  more than 5,700 identifiers with seven digits, `TST-<item><nnn>`, which MOD-test-document's reader takes. The scheme and
  the practice differ, and this goes to the review as a text gap, not as a condition of this item.

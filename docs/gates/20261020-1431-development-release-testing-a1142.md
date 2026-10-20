---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - edcb27e30378cff8db27f3c37fe14525f060a217
  - https://github.com/akmaier/agent-m/pull/1216
date: 2026-10-20 14:31 UTC
---
# Development → Release testing: ITM-1142, passed — the places of the restricted sources are one function of the source register

**REGISTER**

## Reason

ITM-1142 (MOD-source-register, MOD-prompt-bar, MOD-review-pages), pull request #1216 into `sprint/team1/98`, passes on
`edcb27e3`.

- **Four commits, one parent each, no merge, all with the trailer `developer-sonnet-c`.**
  - `b633d54b` and `55629602` hold only tests.
  - `4eb42d3a` changes the code:
    - `src/source-register/index.mjs` gains `restrictedPlaces`, as accepted (`1cabcbff`);
    - `src/prompt-bar/send.mjs`, `hand-over.mjs` and `src/review-pages/jobs.mjs` use it;
    - `src/prompt-bar/places.mjs`, the second copy, goes.
  - `edcb27e3` changes only TST-513024's fixture.
- **The red,** run 39438150363 on `b633d54b`, with `# fail 1` and `# cancelled 0` in each failing job:
  - job 118680583612: `tests/source-register-restricted-places.test.mjs` as a whole, since `restrictedPlaces` does not
    exist yet. A file that fails counts as red.
  - job 118680584075: test 98, `prepareMessage — the job's context carries the restricted sources …`.
- **The five points, judged:**
  1. **TST-513024's fixture after the code.** Its file is of level `system` and names MOD-prompt-bar, so the
     implementer may change it (SPEC.md:1501-1503 covers level `release`). The rule of a red first commit is met by
     `b633d54b` (SPEC.md:1426-1428). The fixture now names the product as the entry's content repository, which the
     accepted text asks for `contents`.
  2. **`bridge-jobs-list` on `4eb42d3a`** ("GET /v1/jobs … once the Bridge was quit, as cancelled") failed in a file the
     pull request does not touch. It passed on the next run. It is recorded here as its first sighting. ITM-1145 names a
     different Quit test, so it is not counted as that one. If it repeats, it is registered.
  3. **The surviving mutant** (the review pages' context carrying only the linked sources' places) is kept as sonnet-c
     reads it: no part or tool of a derivation reads an unlinked restricted source there, so no test can see it.
  4. **Addresses compared without a trailing slash, `.git` and case.** The function parses no address, since
     `parseAddress` is not among MOD-source-register's uses. That reading is kept.
  5. **`src/prompt-bar/places.mjs` removed,** the copy the item names, so no part of MOD-prompt-bar is left unnamed.
- **CI:** 23 of 23 checks passed on the head (run 39439340269).
- **Merge:** `git merge-tree --write-tree` onto `sprint/team1/98` (`337481b1`) is clean.
- **Replayed in a clean worktree at the head,** with the Bridge's packages installed as CI installs them and a
  temporary folder of its own:
  - The 595 tests of `tests/source-register*`, `tests/prompt-bar*`, `tests/review-pages*` and `tests/system-uc-049*`
    pass, apart from one marked todo.
  - The release tests that touch the three modules pass: 14 node files with 158 tests, none failed, and
    `test_conversation_not_recorded` and `test_no_secret_written` are OK.
  - Counter-proof: with the base's `src/`, the new test file fails.

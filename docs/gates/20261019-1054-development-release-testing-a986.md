---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 312fdb7fb7b514096a7e0af71f89d4e3b9c7241e
  - https://github.com/akmaier/agent-m/pull/1008
date: 2026-10-19 10:54 UTC
---
# Development → Release testing: ITM-986, passed — the facts of a sprint, from the inputs the accepted text names

**REGISTER**

## Reason

ITM-986 (MOD-work-plans), pull request #1008 into `sprint/team1/93`, passes on `312fdb7f`. It was rejected on `e9a53768`
(20261019-1017).

- **Commits:** three sit on `e9a53768`, with nothing rewritten, each with the trailer `developer-sonnet-e`.
  - `1e125027` merges `sprint/team1/93` (`0bf10b70`), and its `git show --cc` is empty.
  - `cbc2c623` holds only tests.
  - `312fdb7f` holds the code: `src/work-plans/`.
- **The second red,** run 39240025112 on `cbc2c623`: `# fail 2`, `# todo 0`, `# cancelled 0`, exactly "the increment holds
  exactly the items that are done with a pull request" and TST-986006.
- **The rejection's cause is gone.**
  - `sprintFacts` takes `items` and `tests` (`{ id, guards }`), as MOD-work-plans states since akmaier's acceptance
    `62ba5138`.
  - An item is in the increment when its `ItemState` is `done` with a pull request (`facts.mjs:39`).
  - `realises` comes from the item document. `tests` are the identifiers whose guards include a requirement the item
    realises.
  - No `Realises:` or `Tests:` line is read any more.
- **The readings that stood at the rejection still stand.**
- **CI:** run 39240318237 passed 20 of 20 on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`0bf10b70`) is clean.
- **Replayed in a clean worktree at the head:**
  - `tests/work-plans-sprint-facts.test.mjs` passes 6 of 6.
  - Counter-proof: without the state's `done`, 3 fail, among them the open pull request and TST-986006.

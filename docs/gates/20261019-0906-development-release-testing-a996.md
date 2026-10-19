---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c7289e625f4acf58e507717503e3f1c89deb03cb
  - https://github.com/akmaier/agent-m/pull/989
date: 2026-10-19 09:06 UTC
---
# Development → Release testing: ITM-996, passed — hubFacts reads a model's or dataset's revision, licence and access

**REGISTER**

## Reason

ITM-996 (MOD-reuse-facts), pull request #989 into `sprint/team1/93`, passes on `c7289e62`.

- **Three commits, one parent each, no merge, all with the trailer `developer-sonnet-b`.**
  - `6b3eeb9c` holds only tests: `tests/reuse-facts.test.mjs`.
  - `f265d919` holds the code: `src/reuse-facts/index.mjs` and `registries.md`.
  - `c7289e62` takes the Hub's origin from `registries.md`, so the code names no host (`test_no_backend`).
- **The red,** run 39226260872, job node (5): `# fail 6`, exactly TST-996001 to 006, with `# cancelled 0`. Its 5 todo are
  findings of other items (TST-904042, 904045, 904117, 904126 and 377011).
- **The code meets MOD-reuse-facts.md:120-124 (`hubFacts`):**
  - revision, licence and access, each with its address and date;
  - the key only in `Authorization` to the Hub's origin;
  - `HubBlocked { reason }`, and `NotFound { address }`.
- **The text's `Fact.what` (:101-103) names neither `revision` nor `access`.** The code's typedef adds both. The draft that
  settles this is ruled in 93.md.
- **CI:** 20 of 20 checks passed on the head (run 39227090435).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`82d91ab8`) is clean.
- **Replayed in a clean worktree at the head:**
  - `tests/reuse-facts.test.mjs` passes 15 of 15, and `test_no_backend` and `test_reuse_due_diligence` pass.
  - Counter-proof: with a 404 no longer taken as unknown, exactly TST-996004 fails.

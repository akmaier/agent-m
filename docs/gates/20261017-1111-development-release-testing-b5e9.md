---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 75e54aec3d57f2fd2cbcfac3beaf6213f1ef5965
  - https://github.com/akmaier/agent-m/pull/723
date: 2026-10-17 11:11 UTC
---
# Development → Release testing: ITM-591, A source gets a new version in the library, and a product moves to it

**REGISTER**

## Reason

ITM-591, pull request #723 into `sprint/team1/71`, at head `75e54aec`. It is the rework of the rejection on `0b24b56a`
(`docs/gates/20261017-1055-development-release-testing-d40b.md`). `0b24b56a` is an ancestor of the head, so nothing was
rewritten. The rework adds 130 lines in four files: `explanations.md`, `library.mjs` and two test files.

**The red of the rework.** The tests-only commit `1dff424b` was red in run 39026919378:
- node (2): `# fail 2`, `# todo 2` (existing), TST-591316 and 591317, each step folding its topic;
- node (7): `# fail 3`, TST-591401 to 591403 in the new `tests/site-frame-version-explanations.test.mjs`.

**The request is met.** `EVERY STEP EXPLAINS ITSELF` now holds for both new steps.
- `source-new-version` explains, for someone new to GitHub, that a version is never overwritten, that it is committed
  under the person's account, that identical bytes are refused, and that products stay on theirs until moved.
- `source-move` explains that *Move* changes the version a product links, shows the requirements and the passages first,
  and writes one commit to `docs/sources.md`, and that without *Move* the product stays.
- `library.mjs` folds each through `explain` at its step. MOD-site-frame is among the item's modules since the rejection.

**What else holds.**
- CI is green, ten of ten, and the pull request is mergeable.
- Planted faults are caught: the `explain` call removed, and "never overwritten" reworded.
- The full draft run changed no release test. `test_step_explanations`, ITM-018 and the fetch spy pass.
- The rejection's acceptances stand: the token budget per kept product, the shared registration functions, the
  readings, and ITM-704, 705 and 703.

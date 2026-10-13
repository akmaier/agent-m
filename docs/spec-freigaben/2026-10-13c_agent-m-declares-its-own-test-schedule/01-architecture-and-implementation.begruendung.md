# 11. Architecture and implementation: the release-tests kind of change between jobs is removed

**The change.** `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` and its check return byte for byte to their text before
4ed77fe2: the kind "moves the tests of level `release` out of the run on a pull request into a sprint's branch, into the
nightly run and the run on a pull request into the default branch" is removed. The rest of the section is carried over byte
for byte.

**Why.** The kind was added (queue 2026-10-13) on a misreading: that `THE TEST SCHEDULE IS DECLARED PER PRODUCT` concerns
only managed products, so that Agent M's own repository had no way to choose which tests run on a pull request. With entry
02, Agent M declares its own schedule and its workflows are generated from it; such a workflow only runs what MOD-test-schedule
names, which the kind "adds or changes a workflow file that only runs an entry that a module's file names" already admits.
Kept, the release kind would say a second time, for one level, what the schedule says for all (AGENTS.md §2, *Nothing twice*).

**What it decides, and what not.** akmaier, 2026-10-13: no agent waits for a pull request's CI for more than two minutes
(`A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`, unchanged), any further tests run nightly, and which tests run on a pull
request the teams decide — through the schedule, not the SPEC.

**Impact list.** The workflow change merged with #492 stays in place until Agent M's declared schedule replaces it.

---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - d5bafb81d27209dfe4fa23b10f69957b360d3662
  - https://github.com/akmaier/agent-m/pull/1222
date: 2026-10-20 16:21 UTC
---
# Development → Release testing: ITM-595, rejected — the implementer changed a release test

**REGISTER**

## Reason

ITM-595 (MOD-trace-pages), pull request #1222 into `sprint/team1/99`, is rejected on `d5bafb81`.

**What holds.**
- Three commits, one parent each, with the trailer `developer-sonnet-c`.
- **The red:** run 39455181552 on `da207b87` fails the new tests 273 to 280 (job 118740062952), with `# cancelled 0`.
  `f0afe993` adds test 281 and is red as well.
- CI passes on the head (run 39456182172).
- The code changes `src/trace-pages/flow.mjs`, and only comments of `subject.mjs`.

**What fails: `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`** (SPEC.md:1501-1503).
- `da207b87` changes `tests/release-sprint-15-spec-toggles.test.mjs` (11 lines). Its header names level `release` and
  MOD-trace-pages.
- developer-sonnet-c also implements the behaviour it tests, in `d5bafb81`.

**What passes on the next head.**
- developer-sonnet-c gives that file back its text of `6b99b213`, in a commit on this branch. Nothing else changes.
- developer-sonnet-d, who implemented none of ITM-595, changes the release test in a commit of its own on this branch, as
  `aa3cc39b` did for ITM-1154.
- The head is then gated again. Because CI on the pull request does not run release tests, the gate runs them locally.

**Read now, for the next gate.**
- **The page load of `#spec`** grows from two batches to four: the open entries' rationales and the trace graph's
  artifacts. `A PAGE LOAD READS THE REPOSITORY IN BATCHES` (SPEC.md:672-675) bounds each request to 100 files and forbids
  a second read of a file. The next gate checks that no file is read twice.
- **sonnet-c's readings are kept:**
  - a group holds its subgroups' members once, and an unknown member is not counted;
  - a requirement an open entry would add counts as not realised;
  - the first open entry's status shows;
  - the text for a SPEC with no requirements stays.
- **The 87 local failures** in `release-uc-003`, `system-uc-003` and `site-accessibility` also occur on the sprint branch
  without the change. The gate runs them with a temporary folder of its own, since the shared one keeps a stale Electron
  lock.

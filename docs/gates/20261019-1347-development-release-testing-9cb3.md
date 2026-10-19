---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 8e5e759555d1f28b5bb093acc0b29acab22acf39
  - https://github.com/akmaier/agent-m/pull/1079
date: 2026-10-19 13:47 UTC
---
# Development → Release testing: ITM-746, a schedule proposed in one pull request, and the nightly pipeline schedule on GitLab

**REGISTER**

## Reason

ITM-746, pull request #1079 into `sprint/team2/96`, is rejected on `8e5e7595`. This is its first rejection. Two points:

1. **No red on CI.** The Acceptance says: "The first commit holds only the tests, and CI is red on it". The tests-only commit
   `9a7899aa` was pushed together with the fix, and no CI run exists for it. All 9 tests fail locally, but that does not
   replace the run. The same ruling was made for team 1's ITM-1029. **Wanted:** that CI run on `9a7899aa`, through a
   branch or pull request at that commit. The head may stay.
2. **An error the accepted text does not name.** `proposeSchedule` throws `GitlabCiNotList` for an `include:` written as a
   string or a map. MOD-test-schedule.md:143-152 names its errors, and this is not among them. The text lets the item be
   built without it (AGENTS.md §6a.6): `include: 'x'` and `include: { local: x }` mean the same as a list with that one
   entry. So the commit writes the `include:` as a list holding the existing entry and Agent M's. **Wanted:** that
   rewrite, with a test for each form and a counter-proof, and `GitlabCiNotList` gone.

## Accepted as it stands

- **Scope:** `src/test-schedule/` and its new test. `nightlyRows` and `nightlyCron` are exported from `occasions.mjs` and
  used by `generate.mjs` too. `ciConfiguration`'s result is unchanged, so they are stated once.
- **The readings:**
  - GitHub against GitLab by `webLinks().pipelineSchedules`;
  - the schedule values;
  - inactive without a nightly row;
  - what counts as a foreign configuration.
- **Nothing twice.** `withInclude` in `propose.mjs` and the private `mergeGitlabCi` of `src/runtimes/ci.mjs` both add to a
  product's `.gitlab-ci.yml`. Each module states only its own entry (MOD-test-schedule's include entry; MOD-runtimes'
  job workflow), and sharing one function would need a text change in both modules. This is noted for akmaier, not
  demanded here.

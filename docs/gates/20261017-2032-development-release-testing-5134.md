---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 505bb81403f9d1e3da34cf8743f9ff8b31be46b1
  - https://github.com/akmaier/agent-m/pull/765
date: 2026-10-17 20:32 UTC
---
# Development → Release testing: ITM-744

**REGISTER**

## Reason

ITM-744, the CI configuration generated from a schedule: pull request #765 by developer-sonnet-f into
`sprint/team2/78`, reworked once on the condition of the rejection on `edf5ba9`
(`20261017-2025-development-release-testing-2cfa.md`); decided on head `505bb81`.

The condition now holds: check 5, "a push that touches only `docs/jobs/` starts nothing" (`A JOB RECORD STARTS NO CI
RUN`). The generated GitLab commit jobs carry, beside their `if`, a `rules:changes` of 4 globs; the script guard is gone.
Read with Ruby's `File.fnmatch?` and GitLab's flags `FNM_PATHNAME | FNM_DOTMATCH | FNM_EXTGLOB` (GitLab
`doc/ci/yaml/_index.md`, `rules:changes`), no glob matches a path under `docs/jobs/` or `docs/conversations/`, every other
path matches, and 392,243 random paths over the names' letters show no mismatch; the list is under GitLab's 50 patterns.
A branch pipeline compares with the previous commit, so a record-only push to an existing branch adds no job.

The rework changed only `src/test-schedule/generate.mjs`, `templates/gitlab-job.yml` and the pull request's own new test
TST-744005. CI is green on the head (run 39066806012). Counter-proofs replayed on the head, each turns TST-744005 red:
the rule dropped, an extra glob `**/*`, `jobs*` for `jobs?*`, the proper prefixes dropped. The other checks hold as
recorded at the rejection.

Gap, no reason by itself: GitLab evaluates `changes` as true for the first push of a new branch, so a new branch that
holds only a record still starts the commit jobs.

---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - edf5ba9e15791501e8fe3a5d0745d1a8ca4ba796
  - https://github.com/akmaier/agent-m/pull/765
date: 2026-10-17 20:25 UTC
---
# Development → Release testing: ITM-744

**REGISTER**

## Reason

ITM-744, the CI configuration generated from a schedule: pull request #765 by developer-sonnet-f into
`sprint/team2/78`, on head `edf5ba9`, branched at `6cb7315`.

The condition that does not hold: check 5, the Acceptance "a push that touches only `docs/jobs/` starts nothing"
(`A JOB RECORD STARTS NO CI RUN`; MOD-test-schedule, Data). On GitLab the generated commit jobs carry only the rule
`$CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_TAG == null`, so a record-only push starts each of them on a runner, and a
script guard ends it with `exit 0` (read from the file generated at the head, `unit-every-commit`). The pull request's
reason, that GitLab's rules cannot exclude paths, does not hold: `rules:changes` matches globs with `File.fnmatch`, and
since GitLab 19.2 a Ruby regular expression with lookahead, such as `\A(?!docs/(jobs|conversations)/)`
(GitLab's `doc/ci/yaml/_index.md`, `rules:changes:regexp`).

The other checks hold: the first commit `b09edf1` holds only `tests/test-schedule-ci-configuration.test.mjs`, and CI was
red on it (run 39065574318, node (1): `ciConfiguration` not exported); CI is green on the head (run 39066225529); only
`src/test-schedule/` and the new test, whose header names MOD-test-schedule, change. TST-744012's tightening after the
tests-only commit makes a new test stricter and changes no existing one. `occasions.mjs` and `own-file.mjs` are not in
the module file's Parts but lie in its folder, as helper files of other modules do. Counter-proofs replayed on the head:
TST-744004, 744005, 744011 and 744012 each turn red on their recorded faults. Gaps for the module file, no reason by
themselves: how a row selects its tests (`AGENT_M_LEVEL` is set, nothing filters by it), the environment names of
MOD-workflow-entries' entries, and no two-minute limit on the generated jobs for when ITM-476 adopts the file.

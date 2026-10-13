---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 615a7747e801432d134034f969c5650ed37cfd32
  - https://github.com/akmaier/agent-m/pull/492
date: 2026-10-13 18:51 UTC
---
# Development → Release testing: the release tests leave the run on a pull request into a sprint's branch

**REGISTER**

## Reason

Pull request #492 by developer-sonnet-e into `sprint/team1/27`, head `615a774`. It is the change between jobs that the
second start decision of sprint 27 names, so it is checked by its kind, not by checks 1, 3 and 5.

Its one commit changes only `.github/workflows/tests.yml` and `.github/workflows/nightly.yml`. Each change is the kind
`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` names since `4ed77fe`:
- On a pull request whose base is a sprint's branch, the tests of level `release` leave the run.
- Every other pull request runs every test as before.
- The nightly run runs the release tests of both suites.
- Both jobs of `tests.yml` keep `timeout-minutes: 2`.

The level is read as the start decision names: the `Level:` line among a file's first 20 lines (`headerTags`), else
the one level of its cases' declarations (`testDeclarations`).

The reader, run at the head:

| Suite | Files of level `release` | Other files |
|---|---|---|
| node | 48 | 254 |
| Python | 2 | 60 |

The node files add up to all 302 test files, and no file is in both lists. The 48 include the two files read through
their declarations.

CI is green (run 38449833541). The node job took 1m26, down from 1m50; the Python job took 1m31, down from 1m52.

`tests/dashboard-notifications.test.mjs` stands on its `Level: release` at line 26. That is beyond the 20 lines the
repository's reading looks at, so the file stays in the pull-request run. The start decision's count of 47 used a looser
reading than the one it names. One more test runs, none fewer.

Noted for the review:
- The reader stands three times in the two workflow files.
- The header of `tests/dashboard-notifications.test.mjs` puts its `Level:` line outside the first 20 lines.
- The case of `tests/test_implementation_job.py` for this kind is stated by no module.

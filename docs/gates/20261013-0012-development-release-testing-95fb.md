---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1ed6e12709df049e0f5bba2c7da7843c51f4429c
  - https://github.com/akmaier/agent-m/pull/479
date: 2026-10-13 00:12 UTC
---
# Development → Release testing: ITM-449, an added test without a declaration, not a file without a test

**REGISTER**

## Reason

ITM-449, pull request #479 by developer-sonnet-c into `sprint/team1/26`, head `1ed6e12`. The first commit
`ff4919e` adds only `tests/job-runner-test-case.test.mjs`, and CI was red on it (run 38324938663): the node job's step
failed with three of the four new tests failing — the fixture and helper case, the language forms and the Markdown case —
and the declared case passing; the job's conclusion reads `cancelled`, its log ends in exit code 1, and the code was
pushed at 00:08, after it. CI is green on `1ed6e12` (run 38325722544). Only `src/job-runner/builtins.mjs` and the new
test, whose header names MOD-job-runner and its guards, change; the existing tests of `test-declarations` are untouched
and green, `isTestFile` is unchanged. 22 planted faults are recorded, none surviving.

The change against the line the item rests on, sprint 14's record: "akmaier answered that the check reports an added
test, not a file, and a fixture holds no test". `test-declarations` now reports a file the branch adds that
`isTestFile` calls a test file, that declares none and that holds a test case by its language's form of one; a fixture,
data or helper is not reported; an undeclared test still is. How a test case is told is named in the pull request, as
the Outcome asks, with its limit: a form not listed, such as `Deno.test(`, is not seen. The Acceptance holds.

Noted for the review: MOD-job-runner's file still says "a file … that `isTestFile` calls a test file and that declares
none", without "holds a test case"; the comment of `holdsTestCase` is inserted between the comment on `written` and
the code it describes; and over this repository's `tests/`, 304 files hold a test case with `guards:`/`given:`
blocks but no `TST-<nnn>` line, which a branch adding them today would be sent back for — a gap in this repository's
own tests or a reading to weigh.

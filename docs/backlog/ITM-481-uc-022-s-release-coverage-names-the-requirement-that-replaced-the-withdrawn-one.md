---
id: ITM-481
title: UC-022's release coverage names the requirement that replaced the withdrawn one
level: system
realises:
  - UC-022
  - THE PAGE NAMES WHERE IT SENDS
modules:
  - MOD-review-pages
builds_on:
tests:
  - release
origin:
  - UC-022 as akmaier accepted it at 7efc99a2
  - TST-448101 failing on main at 7e893c63
---
# ITM-481 UC-022's release coverage names the requirement that replaced the withdrawn one

**REGISTER**

## Outcome

On `main` at `7e893c63`, `node --test tests/release-uc-022-derive-architecture.test.mjs` fails TST-448101: its
`COVERED_BY_RELEASE` names `THE PAGE STATES WHAT IT SENDS WHERE`, which the accepted SPEC change withdrew, while UC-022
realises `THE PAGE NAMES WHERE IT SENDS`. The test runs on the pull request of a sprint's branch into `main`.

Afterwards the release coverage names `THE PAGE NAMES WHERE IT SENDS` with executable evidence that the architecture's
run panel names each destination, a participant with its processing place, before the run — or, where no test shows that,
as a pending finding `{ todo: "FINDING <id> — <what is missing>" }`; never the withdrawn name.

## Acceptance

- TST-448101 passes on `main` but for a pending finding named in the pull request.
- A counter-proof: the withdrawn name planted back into the list fails the test.
- Only test files change; their author implemented none of UC-022's behaviour (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`).

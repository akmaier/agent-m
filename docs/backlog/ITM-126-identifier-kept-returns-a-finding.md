---
id: ITM-126
title: identifierKept returns a finding, not a sentence — the dashboard writes the sentence
kind: implementation
level: 1
realises:
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - A FINDING READS LIKE A COMPILER MESSAGE
modules:
  - MOD-artifacts
  - MOD-dashboard-app
depends_on: []
origin: sprint 01 review
---
# ITM-126 identifierKept returns a finding, not a sentence — the dashboard writes the sentence

**REGISTER**

## Outcome

`MOD-artifacts.identifierKept(openedId, text)` returns `null` or a finding of the one shape of MOD-artifacts
(`{ artifact, line, kind, what, rule, fix }`, as ITM-013 unified it), as its interface in MOD-artifacts declares
(`identifierKept(openedId, text) -> null | finding`). Today it returns an English sentence (`docs/assets/artifacts.mjs`,
"The file was opened as … — an edited file keeps its identifier. Nothing was saved; …"). The sentence a person reads is
written by the dashboard from the finding (ARC-003 decision 5: "Kernel and features return values, reasons and findings;
the sentence a person reads … is written by the shell that shows it"). `formatChecks` and the dashboard's save take the
finding as it comes.

## Realises

- `AN EDITED FILE KEEPS ITS IDENTIFIER`
- `A FINDING READS LIKE A COMPILER MESSAGE`

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 6): the code returns a sentence where the accepted
module file declares `null | finding`.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/artifacts.mjs` (`identifierKept`)
- `docs/assets/artifacts/checks.mjs` (takes the finding as it comes)
- `docs/assets/dashboard/writes.mjs` (`saveReviewedFile` writes the sentence from the finding)
- `tests/review-core.d/artifacts.test.mjs` (the finding's shape)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `AN EDITED FILE KEEPS ITS IDENTIFIER` (a file of `tests/review-core.d/`)

## Acceptance criteria

- `AN EDITED FILE KEEPS ITS IDENTIFIER` — `tests/review-core.test.mjs` — `identifierKept` returns a finding naming the rule, the line of the `id`, what is wrong and the fix; counter-proof: the same identifier returns `null`.
- The save that is refused for a changed identifier shows the person the same refusal as today, written by the dashboard; nothing is saved (the app-harness check of UC-008 3a stays green with its expectation unchanged).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing

## Needs a person

No.

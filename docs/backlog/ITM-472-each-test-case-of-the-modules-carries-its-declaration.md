---
id: ITM-472
title: Each test case of the modules carries its declaration
level: module
realises:
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-approvals
  - MOD-artifact-edits
  - MOD-bridge-build
  - MOD-bridge-client
  - MOD-bridge-http
  - MOD-bridge-jobs
  - MOD-browser-store
  - MOD-desktop-shell
  - MOD-documents
  - MOD-endpoint-calls
  - MOD-group-document
  - MOD-identifiers
  - MOD-implementation-pages
  - MOD-job-catalogue
  - MOD-job-ledger
  - MOD-job-runner
  - MOD-mail-routes
  - MOD-markdown-render
  - MOD-model-catalogue
  - MOD-notifications
  - MOD-participant-list
  - MOD-product-process
  - MOD-progress-measures
  - MOD-release-evidence
  - MOD-repository-hosts
  - MOD-resource-list
  - MOD-result-records
  - MOD-review-pages
  - MOD-runtimes
  - MOD-settings-pages
  - MOD-site-frame
  - MOD-source-register
  - MOD-spec-changes
  - MOD-spec-document
  - MOD-test-document
  - MOD-test-pages
  - MOD-test-schedule
  - MOD-text-tools
  - MOD-trace-graph
  - MOD-trace-pages
  - MOD-work-plans
  - MOD-workflow-entries
builds_on:
  - ITM-449
tests:
  - unit
origin:
  - ITM-409, #484: doneCheck over #457 finds tests/spec-changes-propose-section.test.mjs without a declaration
  - ITM-449, #479: 304 files of tests/ hold a test case and declare none
  - MOD-test-document, Data: the test declaration
---
# ITM-472 Each test case of the modules carries its declaration

**REGISTER**

## Outcome

Every test case in a test file of this repository that names one of the item's modules carries MOD-test-document's test
declaration, as its file states it: a block of comment lines directly before the case, its first line the identifier
`TST-<nnn>`, then `level`, `module`, `guards`, `given`, `input` and `expect`. Today 198 such files, of 42 modules, hold
test cases and declare none: their cases are named by a file header `// Module:`/`// Guards:` and, in many, per-case
`guards:`/`given:`/`input:`/`expect:` lines without the identifier line, which `testDeclarations` does not read. So
`test-declarations` (ITM-449) would send such a file back, and `doneCheck` (ITM-409) finds EVERY ARTIFACT NAMES ITS
ORIGIN on it. The known positive is this repository's: `tests/spec-changes-propose-section.test.mjs`, added by #457
(ITM-341), which `doneCheck` over #457 reports as "the new test file … has no test declaration".

Each declaration states what the case and its file already state — the module of the file's header, the requirements
it guards, the case's precondition, input and expected result —, with an identifier unique in the repository. A case
whose precondition, input or expected result neither its comments nor its title state is named in the pull request
rather than given one by guess. No test's code changes. The test files that name no module of the accepted architecture
are not part of this item.

## Acceptance

- Run over this repository as `test-declarations` reads an added file, with the known positive first: no test file
  naming one of the item's modules holds a test case and declares none; every declaration has no finding of
  `testFindings`.
- Only comment lines are added to test files that name the item's modules; no line of a test's code and no expected
  result changes, and every existing test stays green.
- Since the item adds no behaviour, its first commit need not be red; its pull request lists the files changed by
  module and every case named for want of a stated precondition, input or expected result.

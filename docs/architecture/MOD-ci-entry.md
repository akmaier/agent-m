---
id: MOD-ci-entry
title: The CI runtime's shell — the one entry every generated workflow step calls, wiring adapters on the ci-secret authority
realises:
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
  - UC-010
  - UC-024
follows:
  - ARC-003
  - ARC-010
  - ARC-015
uses:
  - MOD-artifacts.formatChecks
  - MOD-artifacts.headerTags
  - MOD-process-model.parseDeclaration
  - MOD-process-model.definitionOfDone
  - MOD-process-model.doneCheck
  - MOD-run-engine.startRecord
  - MOD-run-engine.nextJobs
  - MOD-run-engine.runJob
  - MOD-review-core.applyApprovals
  - MOD-test-records.resultRecord
  - MOD-test-records.fromJUnit
  - MOD-source-library.parseResources
  - MOD-source-library.reachableRoutes
  - MOD-source-library.fetchLegalText
  - MOD-derivation.derivationInputs
  - MOD-derivation.mergeCandidates
  - MOD-derivation.classifyCandidates
  - MOD-derivation.toProposals
  - MOD-git-host.readSnapshot
  - MOD-git-host.readFile
  - MOD-git-host.commitFiles
  - MOD-git-host.appendRecords
  - MOD-git-host.pullRequests
  - MOD-git-host.workflows
  - MOD-git-host.repositoryInfo
  - MOD-git-host.requiredPermissions
  - MOD-participants.endpointDriver
  - MOD-participants.cliDriver
  - MOD-ci-generator.driver
provides:
  - ciEntry
---
# MOD-ci-entry The CI runtime's shell

## Responsibility

Shell (ARC-003), beside MOD-dashboard-app and MOD-bridge-app. CI has no window and no person, so the
composition that a person's click starts on the dashboard starts here from a workflow step: this module
chooses the adapters — the git host on the `ci-secret` authority, the participant drivers, the CI-agent
driver — and hands them as ports to the kernel and the features, which choose none themselves. It holds no
logic of its own beyond reading the step's environment and mapping each step to the functions that do the
work.

## Interfaces

- `ciEntry(step, env) -> exit code` — what the generated workflows run: `engine` (compute `nextJobs`, commit start records, dispatch CI jobs), `job` (one job through `runJob`, a drafting job with the derivation checks), `results` (a result record appended to `test-results`), `done` (the Definition of Done check), `legal-text` (the instance's fetch of an EU legal text) and `apply-approvals` (the instance's approvals committed without the dashboard); every write on the `ci-secret` authority of ARC-003.

## Testing

Component tests, one per step, with a fake git host and a scripted driver; the step's environment is the
seam. Each test checks that every write is made on the `ci-secret` authority, and the counter-proof that a
step run without the secret writes nothing. A system test on a test repository runs the generated
workflows once per host before a release (ARC-016). No model is called by the module itself.

*Drafted on 2026-10-01 by Claude (claude-opus-5-5) for the Agent M repository at commit 069522c1cd5696307322bea74bad3953924a38e0 — PO follow-up of the architecture review: the CI runtime's entry moved out of MOD-ci-generator into a shell of its own; open until accepted.*

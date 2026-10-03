---
id: MOD-dashboard-app
title: The dashboard — the browser runtime's composition root, every page and text, and the one place a person's click becomes the authority to write
realises:
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - EVERY STEP EXPLAINS ITSELF
  - ONE CLICK PER DECISION
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
  - A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
  - AN EXPORT STATES THAT IT CONTAINS SECRETS
  - THE SHARED PAGES ORIGIN IS DISCLOSED
  - THE TOKEN LINK IS PREFILLED
  - THE REPOSITORY CHOICE IS SPELLED OUT
  - A TOKEN IS SCOPED TO WHAT IT WRITES
  - THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN
  - EDITS ARE PREPARED ON THE DASHBOARD
  - A REFUSED SAVE KEEPS THE EDIT
  - ADDING A PRODUCT CREATES ITS LAYOUT
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - A REGROUPING IS COMMITTED DIRECTLY
  - AN INSTANCE IS A FORK OF AGENT M
  - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY
  - THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE
  - A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT
  - SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS
  - UC-001
  - UC-014
  - UC-020
  - UC-021
  - UC-035
  - UC-036
  - UC-042
follows:
  - ARC-001
  - ARC-002
  - ARC-003
  - ARC-005
uses:
  - MOD-artifacts.parseFrontMatter
  - MOD-artifacts.parseRequirements
  - MOD-artifacts.requirementProblems
  - MOD-artifacts.parseUseCase
  - MOD-artifacts.useCaseProblems
  - MOD-artifacts.parseArchitecture
  - MOD-artifacts.reviewedId
  - MOD-artifacts.identifierKept
  - MOD-artifacts.parseGroupFile
  - MOD-artifacts.formatGroupFile
  - MOD-artifacts.hierarchy
  - MOD-artifacts.applyMoves
  - MOD-artifacts.formatChecks
  - MOD-artifacts.ARCHITECTURE_FILE
  - MOD-artifacts.isCodePath
  - MOD-artifacts.isTestPath
  - MOD-review-core.gitBlobSha
  - MOD-review-core.deriveStatus
  - MOD-review-core.deriveSpecStatus
  - MOD-review-core.lastAccepted
  - MOD-review-core.lineDiff
  - MOD-review-core.reviewSession
  - MOD-review-core.planAcceptance
  - MOD-review-core.reviewPage
  - MOD-review-core.prerequisites
  - MOD-review-core.proposeEdit
  - MOD-review-core.requirementHistory
  - MOD-review-core.approvalPath
  - MOD-review-core.architecturePrerequisites
  - MOD-review-core.canStore
  - MOD-review-core.createReviewSession
  - MOD-review-core.gitlabRole
  - MOD-review-core.itemLabel
  - MOD-review-core.missingLayout
  - MOD-review-core.missingNeeds
  - MOD-review-core.needsMessage
  - MOD-review-core.parseDecisions
  - MOD-review-core.parseQueueIndex
  - MOD-review-core.parseRecord
  - MOD-review-core.readByBlob
  - MOD-review-core.recordIndex
  - MOD-review-core.recordText
  - MOD-review-core.recordsForId
  - MOD-review-core.reviewedRecord
  - MOD-review-core.sectionForEntry
  - MOD-review-core.specRecord
  - MOD-review-core.specStatusByNames
  - MOD-review-core.statusByNames
  - MOD-review-core.useCaseRecord
  - MOD-traceability.linkGraph
  - MOD-traceability.tracesTo
  - MOD-traceability.coverageGaps
  - MOD-traceability.moduleRows
  - MOD-traceability.requirementImpact
  - MOD-traceability.architectureImpact
  - MOD-traceability.moduleOrder
  - MOD-traceability.auditRows
  - MOD-traceability.auditMarkdown
  - MOD-traceability.componentDiagram
  - MOD-traceability.moduleHeaders
  - MOD-job-harness.loadDefinition
  - MOD-job-harness.contextFits
  - MOD-job-harness.disclosure
  - MOD-job-harness.mayReceive
  - MOD-job-harness.runDraft
  - MOD-job-harness.formatFinding
  - MOD-job-harness.splitFindings
  - MOD-run-engine.newJobId
  - MOD-run-engine.startRecord
  - MOD-run-engine.gateRecord
  - MOD-run-engine.cancelRecord
  - MOD-run-engine.parseJobRecord
  - MOD-run-engine.jobState
  - MOD-run-engine.nextJobs
  - MOD-run-engine.runPlan
  - MOD-run-engine.startable
  - MOD-run-engine.runJob
  - MOD-process-model.parseModel
  - MOD-process-model.validateModel
  - MOD-process-model.parseParticipants
  - MOD-process-model.parseDeclaration
  - MOD-process-model.assignable
  - MOD-process-model.deriveWorkflow
  - MOD-process-model.definitionOfDone
  - MOD-work-items.derivePlan
  - MOD-work-items.parseItem
  - MOD-work-items.itemProblems
  - MOD-work-items.backlogOrder
  - MOD-work-items.sprint
  - MOD-work-items.itemState
  - MOD-work-items.progress
  - MOD-work-items.sprintClose
  - MOD-work-items.itemFromIssue
  - MOD-derivation.mergeCandidates
  - MOD-derivation.classifyCandidates
  - MOD-derivation.toProposals
  - MOD-derivation.derivationInputs
  - MOD-source-library.parseSource
  - MOD-source-library.validateSource
  - MOD-source-library.parseSourceLinks
  - MOD-source-library.hashFiles
  - MOD-source-library.contentLabels
  - MOD-source-library.parseResources
  - MOD-source-library.validateResource
  - MOD-source-library.reachableRoutes
  - MOD-source-library.newerState
  - MOD-source-library.dueDiligence
  - MOD-source-library.licenceCompatibility
  - MOD-test-records.commitOutcomes
  - MOD-test-records.rateComparison
  - MOD-test-records.batteryProblems
  - MOD-test-records.nextVersion
  - MOD-test-records.releaseReport
  - MOD-test-records.acceptRelease
  - MOD-ci-generator.parseSchedule
  - MOD-ci-generator.defaultSchedule
  - MOD-ci-generator.generateTestCi
  - MOD-ci-generator.generateJobWorkflows
  - MOD-ci-generator.secretSetup
  - MOD-ci-generator.checkRunner
  - MOD-ci-generator.driver
  - MOD-mail-flow.mailId
  - MOD-mail-flow.pendingMails
  - MOD-mail-flow.proposeIssues
  - MOD-mail-flow.issueFromDecision
  - MOD-mail-flow.replyOffers
  - MOD-mail-flow.replyDraft
  - MOD-mail-flow.replyNote
  - MOD-pseudonymiser.findPeople
  - MOD-pseudonymiser.parseCollaborators
  - MOD-pseudonymiser.formatCollaborators
  - MOD-pseudonymiser.namedPersons
  - MOD-pseudonymiser.PRODUCT_SETTINGS_PATH
  - MOD-pseudonymiser.COLLABORATORS_PATH
  - MOD-pseudonymiser.pseudonymisationOn
  - MOD-pseudonymiser.setProductSetting
  - MOD-pseudonymiser.addCollaborator
  - MOD-pseudonymiser.removeCollaborator
  - MOD-git-host.parseProductAddress
  - MOD-git-host.readSnapshot
  - MOD-git-host.readFile
  - MOD-git-host.readBlob
  - MOD-git-host.commitsTouching
  - MOD-git-host.commitFiles
  - MOD-git-host.appendRecords
  - MOD-git-host.webLinks
  - MOD-git-host.tokenRefusal
  - MOD-git-host.usedUpLimit
  - MOD-git-host.repositoryInfo
  - MOD-git-host.issues
  - MOD-git-host.pullRequests
  - MOD-git-host.workflows
  - MOD-git-host.tags
  - MOD-git-host.requiredPermissions
  - MOD-git-host.REPO_RE
  - MOD-git-host.isGitLab
  - MOD-git-host.newFileUrl
  - MOD-git-host.editUrl
  - MOD-git-host.webFileUrl
  - MOD-git-host.tokenListUrl
  - MOD-git-host.gitlabTokenPageUrl
  - MOD-git-host.commitFilesGitLab
  - MOD-git-host.writeFiles
  - MOD-git-host.writeRoute
  - MOD-git-host.tokenIdentity
  - MOD-settings-store.browserStore
  - MOD-settings-store.settingKeys
  - MOD-settings-store.exportSettings
  - MOD-settings-store.readSettingsFile
  - MOD-settings-store.mergeSettings
  - MOD-settings-store.fileTexts
  - MOD-settings-store.parseJson
  - MOD-settings-store.sessionList
  - MOD-settings-store.gitlabTokenMap
  - MOD-settings-store.tokenTest
  - MOD-settings-store.sessionTest
  - MOD-participants.endpointDriver
  - MOD-participants.cliDriver
  - MOD-participants.diagnoseEndpoint
  - MOD-mailbox.MAIL_SCOPES
  - MOD-mailbox.signIn
  - MOD-mailbox.mailbox
  - MOD-bridge-server.bridgeClient
  - MOD-bridge-tunnel.jumpHostProblem
  - MOD-bridge-tunnel.nextFreePort
  - MOD-bridge-tunnel.tunnelCommands
  - MOD-bridge-tunnel.webServerConfig
  - MOD-bridge-tunnel.addRemoteSession
  - MOD-bridge-tunnel.probeLocalPort
provides: []
---
# MOD-dashboard-app The dashboard: composition root, pages and texts, and the click

## Responsibility

Shell. The browser runtime's composition root (ARC-003): it creates the one store (MOD-settings-store),
reads the settings from it, builds the git host, the participants' drivers, the mailbox and the bridge
client with them, and passes these — as plain parameters — to the kernel and feature modules it calls.
It is the only place in the browser where a person's click becomes write authority: an `authority` of kind
`click` is created only from a trusted event (`isTrusted`) of the button that names the write, and is
handed to the one write path of MOD-git-host. It holds every page and every text a person reads — the
views, the forms, the folded explanations, the guidance for tokens and repositories, the disclosures of
what is sent where, the notices on exports and on switching pseudonymisation off — and no rule a test could
check without a browser; those live in the modules it calls. `docs/index.html` and `docs/assets/style.css`
belong to it.

## Interfaces

None: it is the page. Its entry points are the views of `docs/index.html` (use cases, architecture, SPEC
changes, specification browser, tests, jobs, progress, mail, settings), each routed by the URL fragment.

## Testing

The pages are tested in a headless browser against fixture products with a fake `fetch` (`tests/app-harness.mjs`,
`tests/test_settings_page.py`, `tests/test_settings_disclosure.py`, `tests/test_step_explanations.py`): every step has its explanation; every key of `settingKeys` is
shown on the settings page with its test and clear; a secret is hidden until shown; an export states that it
contains secrets; a save is made only after a trusted click, and a synthetic `click()` from a script writes
nothing, as counter-proof; a refused save keeps the edit. The seams are `fetch` and the browser's storage.
Wording and layout are reviewed by a person, not tested. No model is involved.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): a thin composition root holding every text and turning a click into write authority, the current state removed, rules other modules check left to them; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 069522c1cd5696307322bea74bad3953924a38e0 — PO follow-up: the CI runtime's entry as a shell of its own (MOD-ci-entry), and the three rules of queues 2026-10-01 and 2026-10-01b cited; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 726cfb4 — the review page of queue 2026-10-01c (PR #23); revised on 2026-10-01 by Claude (claude-opus-5-5) against commit b09cb03fbe9a8f311d75626fb2629a48968bfade — each rule under one module (ARC-020 decision 5): `THE PAGE STATES WHAT IT SENDS WHERE` stays with MOD-job-harness, whose `disclosure` computes what is sent where; revised on 2026-10-03 by Claude (claude-opus-5-5) against commit 230662f4a7d0fe40cae0b00b8973d1d752eb609f — ITM-138, akmaier's option A: the names other modules use are provided and used as the code has them; open until accepted.*

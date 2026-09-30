---
id: MOD-dashboard-app
title: Renders the dashboard pages and turns a person's click into one call of the write path
realises:
  - EVERY STEP EXPLAINS ITSELF
  - ONE CLICK PER DECISION
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
  - A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
  - THE SHARED PAGES ORIGIN IS DISCLOSED
  - AN EXPORT STATES THAT IT CONTAINS SECRETS
  - THE TOKEN LINK IS PREFILLED
  - THE REPOSITORY CHOICE IS SPELLED OUT
  - ONE GITHUB TOKEN SERVES EVERY FEATURE
  - A TOKEN IS SCOPED TO WHAT IT WRITES
  - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
  - THE GITHUB TOKEN IS PASTED, NOT OBTAINED BY LOGIN
  - THE PAGE STATES WHAT IT SENDS WHERE
  - EDITS ARE PREPARED ON THE DASHBOARD
  - A REFUSED SAVE KEEPS THE EDIT
  - ADDING A PRODUCT CREATES ITS LAYOUT
  - AN INSTANCE IS A FORK OF AGENT M
  - THE PAGES ROOT IS DOCS
  - ONE REVIEW LAYOUT FOR EVERY PRODUCT
  - A MANAGED PRODUCT NEEDS NO PAGES SITE
  - NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY
  - THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW
  - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - A REGROUPING IS COMMITTED DIRECTLY
  - SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS
  - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
  - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
  - THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE
  - A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT
  - ONE DASHBOARD SHOWS EVERY JOB
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - UC-001
  - UC-008
  - UC-014
  - UC-020
  - UC-035
  - UC-036
  - UC-042
  - UC-044
follows:
  - ARC-001
  - ARC-002
  - ARC-003
  - ARC-005
uses:
  - MOD-review-core.deriveStatus
  - MOD-review-core.planAcceptance
  - MOD-review-core.reviewSession
  - MOD-review-core.lineDiff
  - MOD-review-core.lastAcceptedRecord
  - MOD-review-core.checkIdentifierKept
  - MOD-spec-queue.sectionForEntry
  - MOD-spec-queue.deriveSpecStatus
  - MOD-spec-queue.proposeEdit
  - MOD-traceability.linkGraph
  - MOD-traceability.tracesTo
  - MOD-traceability.coverageGaps
  - MOD-traceability.moduleRows
  - MOD-traceability.architectureImpact
  - MOD-traceability.componentDiagram
  - MOD-groups.hierarchy
  - MOD-groups.applyMoves
  - MOD-git-host.readSnapshot
  - MOD-git-host.commitFiles
  - MOD-git-host.webLinks
  - MOD-git-host.tokenRefusal
  - MOD-git-host.requiredPermissions
  - MOD-settings-store.browserStore
  - MOD-settings-store.settingKeys
  - MOD-settings-store.exportSettings
  - MOD-settings-store.readSettingsFile
  - MOD-settings-store.mergeSettings
  - MOD-job-records.jobState
  - MOD-run-engine.runPlan
  - MOD-process-model.progress
  - MOD-bridge-tunnel.tunnelCommands
  - MOD-bridge-tunnel.webServerConfig
  - MOD-bridge-server.bridgeClient
  - MOD-participant-ci.secretSetup
  - MOD-job-definitions.disclosure
  - MOD-mail-flow.mailbox
  - MOD-mail-flow.pendingMails
  - MOD-mail-flow.participantAllowed
  - MOD-mail-flow.checkers
  - MOD-mail-flow.proposeIssues
  - MOD-mail-flow.issueFromDecision
  - MOD-mail-flow.replyOffers
  - MOD-mail-flow.replyDraft
  - MOD-mail-flow.replyNote
provides: []
---
# MOD-dashboard-app Renders the dashboard pages and turns a person's click into one call of the write path

## Responsibility

The UI layer of the dashboard: the views, the forms, the folded explanations, and the wiring from a
click to one call of `MOD-git-host.commitFiles` or a participant driver. It holds no logic that a
test could check without a browser — that lives in the core modules it calls — and it never touches
storage or `fetch` directly (the repository checks already enforce both).

**Current state.** `docs/assets/review-app.mjs` is this module, plus the HTML builders now in
`review-core.mjs`: `stepHtml`, `diffHtml`, `prerequisitesHtml`, `impactHtml`, `browserSettingsHtml`,
`secretFieldHtml`, `tokenBannerHtml`, the guidance texts (`TOKEN_GUIDANCE`, `tokenLinkUrl`,
`repositoryChoiceSteps`, `extendTokenSteps`, `gitlabTokenSteps`, `gitlabNoProjectTokens`,
`sharedOriginNotice`, `exportNotice`, `pseudonymisationOffNotice`), `missingLayout`, `addProduct`,
the product-settings helpers (`parseProductSettings`, `setProductSetting`, `savePseudonymisation`,
`parseCollaborators`, `formatCollaborators`, `addCollaborator`, `saveCollaborators`) and
`expiryWarning`. `index.html` and `style.css` belong to it. The settings page also shows, for each jump
host, the tunnel commands and the proposed web-server block (ARC-013 decision 6), and for each product the
CI secrets a hosted job needs (UC-010) with their pages; the job list shows the seven job states of `ONE
DASHBOARD SHOWS EVERY JOB` as `MOD-job-records.jobState` derives them. `ADDING A PRODUCT CREATES ITS LAYOUT`
includes `docs/architecture/` (UC-001 step 5); `missingLayout` does not write it yet.

**Pseudonymisation** on the settings page is the product's switch for rewriting report data without
persons (`PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF`, UC-042 step 4); the setting keeps its
name. The folded explanation beside it in `review-app.mjs` still says that report data arrives "with
names, addresses and other details replaced by stand-ins" — surrogates, which the SPEC withdrew; it is
to say that report data arrives rewritten by a participant without any person, checked by three LLMs.
That is a text change for an implementation job. The mail view of UC-038 shows, before *Propose*, the
proposing participant and the three checking participants that `MOD-mail-flow.checkers` preselects,
where each processes data and what each receives, and lets the author exchange a checker; with fewer
than three it names what is missing and offers only writing the issue by hand (UC-038 6c).

## Interfaces

None: it is the page. Its entry points are the views of `docs/index.html` (use cases, architecture, SPEC changes, specification browser, tests, jobs, progress, mail, settings), each routed by the URL fragment.

Uses, as declared above: `MOD-review-core.deriveStatus`, `MOD-review-core.planAcceptance`, `MOD-review-core.reviewSession`, `MOD-review-core.lineDiff`, `MOD-review-core.lastAcceptedRecord`, `MOD-review-core.checkIdentifierKept`, `MOD-spec-queue.sectionForEntry`, `MOD-spec-queue.deriveSpecStatus`, `MOD-spec-queue.proposeEdit`, `MOD-traceability.linkGraph`, `MOD-traceability.tracesTo`, `MOD-traceability.coverageGaps`, `MOD-traceability.moduleRows`, `MOD-traceability.architectureImpact`, `MOD-traceability.componentDiagram`, `MOD-groups.hierarchy`, `MOD-groups.applyMoves`, `MOD-git-host.readSnapshot`, `MOD-git-host.commitFiles`, `MOD-git-host.webLinks`, `MOD-git-host.tokenRefusal`, `MOD-git-host.requiredPermissions`, `MOD-settings-store.browserStore`, `MOD-settings-store.settingKeys`, `MOD-settings-store.exportSettings`, `MOD-settings-store.readSettingsFile`, `MOD-settings-store.mergeSettings`, `MOD-job-records.jobState`, `MOD-run-engine.runPlan`, `MOD-process-model.progress`, `MOD-bridge-tunnel.tunnelCommands`, `MOD-bridge-tunnel.webServerConfig`, `MOD-bridge-server.bridgeClient`, `MOD-participant-ci.secretSetup`, `MOD-job-definitions.disclosure`, `MOD-mail-flow.mailbox`, `MOD-mail-flow.pendingMails`, `MOD-mail-flow.participantAllowed`, `MOD-mail-flow.checkers`, `MOD-mail-flow.proposeIssues`, `MOD-mail-flow.issueFromDecision`, `MOD-mail-flow.replyOffers`, `MOD-mail-flow.replyDraft`, `MOD-mail-flow.replyNote`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 8b299337b2e61b80cb4a4415ff4e7c865d7a2dfe — SPEC queue 2026-09-30k as accepted: the pseudonymisation switch now switches the rewriting, and the mail view names the three checking participants; open until accepted.*

---
id: ITM-138
title: The module files and the code agree on what each module provides and uses — checked in the repository
kind: refactoring
level: 1
realises:
  - A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
  - EVERY ARTIFACT NAMES ITS ORIGIN
modules:
  - MOD-artifacts
  - MOD-traceability
  - MOD-pseudonymiser
  - MOD-git-host
  - MOD-settings-store
  - MOD-bridge-tunnel
  - MOD-review-core
  - MOD-dashboard-app
depends_on:
  - ITM-018
  - ITM-125
  - ITM-126
  - ITM-127
  - ITM-129
  - ITM-130
  - ITM-131
  - ITM-133
  - ITM-136
origin: sprint 01 review
---
# ITM-138 The module files and the code agree on what each module provides and uses — checked in the repository

**REGISTER**

## Outcome

Every name a code file imports from another module's file is in that module's `provides` and in the importer's `uses`,
and a repository check keeps it so. Sprint 01 split the code into the accepted modules, and the module files now lag the
code. The teams reported, among others: MOD-artifacts exports `headerModules`, `specRequirements`, `kindOfPath`,
`ARCHITECTURE_FILE`, `isCodePath`, `isTestPath`, `isRequirementName` without listing them, and MOD-review-core uses
`kindOfPath` and `specRequirements` without naming them; MOD-traceability exports `moduleHeaders` and `impactList` where
its file names `architectureImpact` (ITM-018 renames that one) and a different `componentDiagram` signature;
MOD-pseudonymiser exports `parseProductSettings`, `pseudonymisationOn`, `addCollaborator`, `removeCollaborator`,
`setProductSetting`, `PRODUCT_SETTINGS_PATH`, `COLLABORATORS_PATH`, which MOD-dashboard-app uses without naming them;
MOD-git-host exports `REPO_RE`, `tokenIdentity`, the GitLab helpers, the renewal texts, `requireAuthority` and `request`,
and its `requiredPermissions` carries a `param` field its interface line does not name; MOD-settings-store exports
`parseJson`, `sessionList`, `gitlabTokenMap`; MOD-bridge-tunnel names `allocatePort` where the code has `nextFreePort`
and `addRemoteSession`. A comparison of `export` statements with `provides` on `sprint/01` at `cc86c1f` (a script over the
seven module files, not committed) found such names in every one of these seven modules.

The job does three things, in this order:

1. It lists, from the code, every name each module's files export and which other module's code imports it.
2. For a name another module imports: the module file is brought up to date by `akmaier` (`docs/process.md`, *Boundary*;
   UC-023), or the importer is changed to use a name the module provides — whichever `akmaier` accepts. A name only the
   module itself and its own tests use is a helper and stays unlisted (ARC-020 decision 6: "Helpers a module calls only
   itself are not listed").
3. It adds the repository check: an import of a name the exporting module does not provide, or by a module whose `uses`
   does not name it, is refused — red on a planted import of an unlisted name.

## Realises

- `A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES`
- `EVERY ARTIFACT NAMES ITS ORIGIN`

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 3), from the teams' reports (pull requests
#24–#38).

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006, ARC-007, ARC-014, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module
- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core
- MOD-pseudonymiser (features) — uses MOD-job-harness
- MOD-git-host (adapters) — uses no other module
- MOD-settings-store (adapters) — uses no other module
- MOD-bridge-tunnel (adapters) — uses no other module
- MOD-review-core (kernel) — uses MOD-artifacts
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`). The module files under `docs/architecture/` are changed and accepted by `akmaier`, not by the job.

Files it creates or changes:

- the import and export lines of the code files of these modules, where `akmaier` accepts the code side
- `tests/architecture-interfaces.test.mjs` (new — the repository check)
- `docs/measurements/<date>_module-interfaces.md` (new — the list of step 1 and the counter-proof)

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_architecture_files.py` — `A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES`
- `tests/test_origin_links.py` — `EVERY ARTIFACT NAMES ITS ORIGIN`

## Acceptance criteria

- The list of step 1 is recorded in the dated measurement file before any module file is proposed.
- After the job, the repository check passes on the repository and refuses a planted import of an unlisted name (counter-proof recorded).
- No behaviour changes: every test green before is green after, no assertion changed.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- CI is green on every commit and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-018 — renames `impactList` to `architectureImpact` in MOD-traceability
- ITM-125, ITM-126, ITM-127, ITM-129, ITM-130, ITM-131, ITM-133, ITM-136 — change the same code files first

## Needs a person

Yes — `akmaier` changes and accepts the module files (`docs/process.md`, *Boundary*; `ACCEPTANCE IS A COMMIT BY THE
ACCEPTING PERSON`). No open question: what `provides` lists is decided by ARC-020 decision 6.

## From the sprint 02 review

More module-file gaps of the same kind, found in sprint 02 (ARC-020 decision 6; the module files are akmaier's to change and accept):
- MOD-traceability imports `parseQueueIndex` and `sectionForEntry` of MOD-review-core (ITM-018, PR #65); its `uses` names neither, and MOD-review-core's `provides` lists neither, nor `extractSection`.
- MOD-pseudonymiser's `provides` lacks `setProductSetting`, `PRODUCT_SETTINGS_PATH`, `COLLABORATORS_PATH` (ITM-124); MOD-settings-store's interface line lacks the kept last-test entries (ITM-136); MOD-work-items' `itemState` names `wip` without its shape and carries start refusals in `reasons` (ITM-034); MOD-review-core's `lastAccepted` also returns `committedAt` (ITM-130).
- The dashboard still imports non-provided names of MOD-git-host that send no request: `REPO_RE`, `isGitLab`, the link builders, `tokenIdentity`, `writeRoute`, `writeFiles`, `commitFilesGitLab` (ITM-130's record).


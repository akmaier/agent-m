# The check of Agent M's first architecture before a person sees it

**MESSUNG** — 2026-10-05. The draft of Agent M's first architecture as a whole (UC-022): ARC-037 … ARC-053 and 52 module
files under `docs/architecture/`, drafted on `main` at `9a6d1a5`, before any release of Agent M. It records how the draft
was checked before a person saw it: the drafter's own check of the files' form, and every round of the reviewing
participant, with each finding and how the drafter weighed it (`AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT`,
`THE ROUNDS ARE COUNTED AND SHOWN`, `A REVIEW FINDING IS WEIGHED BEFORE IT IS ACTED ON`).

## Participants

| Role | Participant, as `docs/participants.md` lists it | Model |
|---|---|---|
| drafting, and weighing the findings | `scrum-master-session` | `claude-opus-5-5` |
| reviewing | `reviewer-sonnet` | `claude-sonnet-5` |

The reviewer is another participant and uses another model (`NO REVIEWER IS THE DRAFTER`).

## Method

- **What the reviewer received.** `README.md`, the whole `SPEC.md`, every accepted use case (UC-001 … UC-046; the
  identifier UC-009 is withdrawn), every file of the draft, and chapter 10 of *Vibe Coding*, *Architectural Design*, from
  which the SPEC's architecture principles come. It read them in full, in its own context, and reported that nothing was
  compacted or summarised (`THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT`, `NOTHING IS LEFT OUT OF AN
  ARCHITECTURE PROMPT SILENTLY`) — about 1.24 MB in round 1. In each later round the same reviewer read again, in full,
  every file the corrections had changed; the files that had not changed stood in its context as it had read them.
- **What it checked, level by level:** the whole draft against the whole SPEC, its principles included (`THE
  ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION`); every use case against the system (`EVERY USE CASE IS CHECKED
  AGAINST THE ARCHITECTURE`); every subsystem against the system (`A SUBSYSTEM IS CHECKED AGAINST THE SYSTEM`); every
  module against its subsystem (`A MODULE IS CHECKED AGAINST ITS SUBSYSTEM`); no module against the use cases (`NO MODULE
  IS CHECKED AGAINST THE USE CASES`). Each finding names the file and line, the requirement by name and the correction
  expected (`A FINDING READS LIKE A COMPILER MESSAGE`), and is a warning (`A REVIEWER'S FINDING IS A WARNING`).
- **Weighing.** The drafter checked each finding against the SPEC, the use cases and the files it names before acting on
  it: a finding that held was fixed; one that did not hold was to be answered with the reason (`AN ERROR MUST BE FIXED, A
  WARNING FIXED OR JUSTIFIED`).
- **Limit.** Three rounds, fixed before the first, or fewer when a round leaves the findings unchanged (`THE CORRECTION
  LOOP HAS A FIXED LIMIT`).
- **The drafter's own check of the files' form**, before round 1 and after every correction: a script outside the
  repository read every file's front matter and checked the form of the files, every `uses` entry against what the used
  module provides and what its subsystem's decision offers, the order of the layers, cycles among the modules, and every
  requirement a decision names as forcing it. Six faults were planted in a copy of the draft — a requirement the SPEC
  does not have, a cycle, two uses against the order of the layers, a used name that is not provided, a provided name
  that is not described, a missing section —; the script reported all six. Five reports remain that are no faults: names
  of files and formats in backticks, read as requirement names (`SHA256SUMS`, `LICENSE` twice, `YYYY-MM-DD` twice). No
  test and no CI run checks the architecture (`AN ARCHITECTURE IS CHECKED BY REVIEW, NOT BY TESTS`).

## Rounds

| Round | What the reviewer read | Findings | Fixed | Answered | Left |
|---|---|---|---|---|---|
| 1 | everything, in full | 8 | 8 | 0 | 0 |
| 2 | the 30 files the corrections of round 1 changed, in full, beside the rest as read in round 1 | 0 | — | — | 0 |
| 3 | the 2 files changed after round 2, in full | 0 | — | — | 0 |

Besides the reviewer's findings, the drafter found three more while weighing round 1 and fixed them before round 2, and
changed two files after round 2 for the reason given there, which is why round 3 ran. The loop ended after round 3 with
no finding left; the limit of three rounds was reached at the same time.

### Round 1

The reviewer's findings, verbatim, each with how the drafter weighed it:

#### The whole against the SPEC

docs/architecture/ARC-037-agent-m-as-a-whole.md:216: warning: the services diagram (and its own claim at line 230, "each uses only those it points to") omits edges that the subsystems' own modules declare, so the one decision stating the whole architecture misstates the system's interaction [AN ARCHITECTURE STATES STRUCTURE, INTERACTION AND STRATEGY] — add the missing edges to the diagram, or remove the modules' undeclared cross-subsystem dependencies so the diagram and the modules agree.
    Undeclared edges found: Process→Sources-and-resources (MOD-product-process.md:14-15, via sourceSchemas/permittedPlaces), Tests-and-releases→Sources-and-resources (MOD-release-evidence.md:32-33; MOD-result-records.md:19-21; MOD-test-schedule.md:16), and Workflows→Bridge (MOD-workflow-entries.md:66-67, via MOD-bridge-build, confirmed by ARC-039-workflows.md:74 which itself describes "building the Bridge's release with MOD-bridge-build").
    → fixed: the system's diagram now draws what the modules use — Process → Sources and resources, Tests and releases → Sources and resources, Workflows → Bridge ("builds the Bridge's release"), and no longer Specification and design → Sources and resources, which no module of it uses; the text names the three sharing arrows; the uses statements of ARC-041, ARC-042 and ARC-043 and ARC-039's diagram (Tests and releases, Issues and mail) say the same. Files: ARC-037, ARC-039, ARC-041, ARC-042, ARC-043.

docs/architecture/MOD-trace-graph.md:147: warning: selfSufficiencyFindings is the one function that catches an artifact linking to a file the product repository does not hold, or to the instance's own repository or site, but no other file's `uses:` ever names it — nothing in the described system calls it [THE PRODUCT REPOSITORY IS SELF-SUFFICIENT] — name the caller (a job-runner built-in check, or a trace/review page) that runs it, or say this hard product rule is checked only by the test suite and not by the architecture itself.
    → fixed: MOD-job-runner's built-in check `graph-checks` now also runs `selfSufficiencyFindings` on every draft, against the instance of the job's context; its signature takes the instance as `owner/name` and derives the dashboard's Pages address, since the context holds no site. Files: MOD-job-runner (uses, table, Uses), MOD-trace-graph.

docs/architecture/MOD-identifiers.md:72: warning: stabilityFindings is the one function that catches a withdrawn identifier being given to a new artifact across versions, but no other file's `uses:` ever names it [THE NAME IS THE ID AND IT SURVIVES] — name the caller that reads the repository's successive versions and runs it, or drop the function from the interface.
    → fixed (removed): no module needs it — every new identifier comes from `nextIdentifier`, whose callers (MOD-artifact-edits, MOD-work-plans) pass every identifier the history holds, so a withdrawn identifier is never given again; `stabilityFindings`, `VersionIdentifiers` and the part `stability.mjs` are gone. Files: MOD-identifiers, ARC-048.

docs/architecture/MOD-documents.md:217: warning: writeRegister is the schema interpreter's one function for writing a register's rows back while preserving an append-only table's existing rows, but every register-writing page named in this draft (e.g. MOD-settings-pages.md:155-163) declares writing registers only through writeDocument or saveFile, never through writeRegister [A DATA FORMAT IS DEFINED ONCE] — name which function actually writes docs/participants.md, docs/sources.md and docs/resources.md, so the register format has one real write path, not two untested candidates.
    → fixed: `writeRegister` removed; `writeDocument` is the one write path of every document, a register's rows included, and now carries the append-only guard (`NotAppendable`); `readRegister` says registers are written with `writeDocument`. Every register writer already used `writeDocument`. Files: MOD-documents.

#### Use cases against the system

docs/architecture/MOD-implementation-pages.md:152: warning: the run view's "*Continue* once the person has raised the limit that stopped it" (UC-043, alternative flow 6c) names no dependency able to raise it — the file's `uses:` list (lines 59-61) names only MOD-run-planner.runOf, nextActions and runStrategies, never raiseLimits, and the body's "## Uses" section (line 192) repeats the omission [A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES] — add MOD-run-planner.raiseLimits to this module's `uses:`, or name the view that actually calls it.
    → fixed: `MOD-run-planner.raiseLimits` added to the uses and to ## Uses. Files: MOD-implementation-pages.

docs/architecture/MOD-settings-pages.md:145: warning: the mailbox view's app-registration step and "*Disconnect*" (line 148; UC-037 step 2 and alternative flow 8a, which need the provider's registration page and its access-withdrawal page) name no dependency that supplies those addresses — the file's `uses:` list (lines 44-46) and its "## Uses" section (line 186) name only MOD-mail-routes.routeFor, signIn and mailbox, never providerLinks [A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES] — add MOD-mail-routes.providerLinks to this module's `uses:`.
    → fixed: `MOD-mail-routes.providerLinks` added to the uses and to ## Uses. Files: MOD-settings-pages.

#### Subsystems against the system

docs/architecture/ARC-045-sources-and-resources.md:79: warning: the subsystem's own responsibility promises keeping the resource lists "with how each is reached and checked", but MOD-resource-list.reachableBy — the one function that derives a resource's reaching routes — is named in no other module's `uses:` in the whole draft, so no route-eligibility check (MOD-runtimes.routesFor, MOD-run-planner.nextActions, MOD-participant-list.eligible) actually reads it [A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE] — name the caller that derives a job's resource needs from reachableBy before offering routes, or fold reachableBy into MOD-runtimes.routesFor itself and say so in both files.
    → fixed: the fold into `routesFor` is not possible (Participants and jobs lies below Sources and resources), so the callers were named: MOD-progress-measures puts `resourceNeeds` — `reachableBy` over `docs/resources.md` — into a product's facts, used by MOD-run-planner, MOD-implementation-pages and MOD-main-page; MOD-test-pages and MOD-maintenance-pages call `reachableBy` themselves; `routesFor` states that a caller passes the needs for a kind with `resources: product` and none otherwise. Files: MOD-progress-measures, MOD-runtimes, MOD-resource-list, MOD-run-planner, MOD-implementation-pages, MOD-main-page, MOD-test-pages, MOD-maintenance-pages.

#### Modules against their subsystem

docs/architecture/MOD-reuse-facts.md:11: warning: registryFacts reads a reuse candidate's open/closed issue counts through MOD-repository-hosts.listIssues, which returns full Issue objects and would need full pagination, instead of MOD-repository-hosts.issueCounts — the function the same Access module documents as reaching the counts "without listing the issues" (MOD-repository-hosts.md:224) — and the subsystem's own due-diligence tables show counts in the tens of thousands (ARC-050-the-bridge-is-an-electron-app.md:87: electron, 580/21,361 issues) [A REUSE DECISION RECORDS ITS DUE DILIGENCE] — read the counts with issueCounts, or record why listIssues is used instead.
    → fixed: `registryFacts` reads the counts with `MOD-repository-hosts.issueCounts` instead of `listIssues`. Files: MOD-reuse-facts.

#### Found by the drafter while weighing round 1

docs/architecture/MOD-agent-processes.md:59: warning (drafter's own): `Agent.name` was the closed union "claude" | "codex" | "opencode" although the supported agents are rows of the data register `agents.md` [OPEN FOR EXTENSION, CLOSED FOR CHANGE] — type it as a register name.
    → fixed: `name: string`, the Agent of a row of `agents.md`; the register's Agent column says one row per supported agent. Files: MOD-agent-processes.

docs/architecture/MOD-trace-graph.md:147: warning (drafter's own): after the fix above, the rule that an instance `owner/name` has its dashboard at `https://<owner>.github.io/<name>/` stood in two modules, MOD-site-frame.instanceOf and MOD-trace-graph.selfSufficiencyFindings [DON'T REPEAT YOURSELF] — define it once.
    → fixed: MOD-identifiers states how an instance is named and offers `pagesAddress` and `instanceOfPagesAddress`; MOD-site-frame.instanceOf and MOD-trace-graph.selfSufficiencyFindings use them. Files: MOD-identifiers, MOD-site-frame, MOD-trace-graph, ARC-048 (table).

docs/architecture/ARC-045-sources-and-resources.md:7: warning (drafter's own): `A REQUIREMENT HAS A REGISTERED SOURCE` says a requirement without a linked source cannot be accepted, but no acceptance in the draft checked it, and how a requirement's source text names a registered source was defined nowhere [A REQUIREMENT HAS A REGISTERED SOURCE] — define the naming once and check it where SPEC changes are accepted.
    → fixed: MOD-spec-document splits a requirement's source into items (`Requirement.sources`); MOD-source-register says which register entry an item names (identifier, title or a standard's designation, longest match, then `, ` and the part) and offers `sourceFindings`; MOD-spec-changes' `acceptEntries` and `applyApproved` refuse an entry whose requirement names no linked source; MOD-review-pages hands in the product's links and the register; ARC-041 states the use and the consequence for Agent M's own SPEC, whose sources are words not yet registered; ARC-037 draws Specification and design → Sources and resources again and names the check in UC-006's scenario. Files: MOD-spec-document, MOD-source-register, MOD-spec-changes, MOD-review-pages, ARC-041, ARC-037, ARC-045 (table).

### Round 2

No findings. The reviewer confirmed each of the eight fixes and the drafter's three against the changed files, and
checked that the corrections had broken nothing else — the subsystems' diagrams, the types the corrections thread
through, the uses of every changed module.

#### Changed by the drafter after round 2

Three places in two files quoted a person's name as an example of a requirement's source. A repository managed by
Agent M names a person only by account, or by name with the consent recorded in its `docs/collaborators.md`, which the
repository does not have (`A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT`). The examples in MOD-spec-document and the
last consequence of ARC-041 now say *Product Owner*. No other file changed.

### Round 3

No findings. The reviewer read both changed files in full, found the change confined to those three places, and found
no person's name left in the draft.

## What it settles

- The draft reaches the Product Owner with no finding left, after three rounds, every finding fixed and none answered
  instead.
- The draft's form holds by the drafter's check: 17 decisions and 52 module files, every `uses` entry provided and
  offered, the layers kept, no cycle among the modules, every requirement a decision names present in the SPEC.
- No file of the draft names the participant or the model that drafted or reviewed it; this record and the commit do
  (`AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT`).

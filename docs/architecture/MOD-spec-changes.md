---
id: MOD-spec-changes
title: SPEC change queues, from proposal to the accepted section
folder: src/spec-changes/
realises:
follows:
  - ARC-041
uses:
  - MOD-approvals.approvalSchema
  - MOD-approvals.commitRejection
  - MOD-artifact-edits.fallbackEditLinks
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.Snapshot
  - MOD-repository-hosts.readSnapshot
  - MOD-repository-hosts.readHistory
  - MOD-repository-hosts.readFileAt
  - MOD-repository-hosts.commitFiles
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.openPullRequest
  - MOD-documents.Schema
  - MOD-documents.Document
  - MOD-documents.loadSchema
  - MOD-documents.readDocument
  - MOD-documents.writeDocument
  - MOD-documents.readRegister
  - MOD-documents.classifyCandidates
  - MOD-documents.Classified
  - MOD-documents.appendSection
  - MOD-spec-document.parseSpec
  - MOD-spec-document.sectionText
  - MOD-spec-document.replaceSection
  - MOD-spec-document.requirementNamesIn
  - MOD-spec-document.renamedRequirements
  - MOD-group-document.Place
  - MOD-group-document.parseGroupFile
  - MOD-group-document.groupFileText
  - MOD-group-document.placeItems
  - MOD-trace-graph.traceGraph
  - MOD-trace-graph.storedGraph
  - MOD-trace-graph.storedReferences
  - MOD-trace-graph.requirementImpact
  - MOD-trace-graph.coverageGaps
  - MOD-source-register.sourceSchemas
  - MOD-source-register.sourceFindings
  - MOD-source-register.linkedVersion
  - MOD-source-register.namesAccount
  - MOD-text-tools.Finding
  - MOD-text-tools.finding
  - MOD-text-tools.blobSha
  - MOD-text-tools.lineDiff
  - MOD-job-runner.Strategies
  - MOD-job-runner.JobContext
  - MOD-job-runner.Part
  - MOD-job-runner.JobResult
  - MOD-job-runner.provenanceLines
provides:
  - Queue
  - queues
  - queueAt
  - proposeSection
  - saveEntry
  - entrySections
  - entryView
  - entryImpact
  - acceptEntries
  - applyApproved
  - rejectEntry
  - requirementHistory
  - specStrategies
---
# MOD-spec-changes SPEC change queues, from proposal to the accepted section

## Responsibility

It belongs to Specification and design (ARC-041). A SPEC is never written directly: every change to it is an entry of a
change queue under `docs/spec-freigaben/` — the whole section as proposed, beside the section it replaces — and is
written into the SPEC byte for byte, with its approval record and its decision, in one commit, only when a person
accepts it on the text that was shown (`A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN`, `THE APPROVED TEXT IS
TAKEN VERBATIM`, `AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL`); an entry a person rejects leaves its queue
(`A REJECTION REMOVES THE PROPOSAL`). An entry that adds requirements holds their proposed places in the requirement
hierarchy beside its section, and its acceptance writes them into `docs/groups/requirements.md` in the same commit,
never into the SPEC. It keeps every change to a section in that
section's queue and an edit of an open entry in that entry, composes the sections that drafted candidates change and writes
them as entries, writes the texts a change of requirements drafts as entries, applies approvals committed without a token for the instance's workflow, and tells each requirement's
history. It runs in the browser and in Node.

## Parts

- `index.mjs` — the interface.
- `queue-index.schema.md`, `queue-rationale.schema.md`, `queue-places.schema.md`, `queue-decisions.schema.md` — the
  schemas of a queue's files, in MOD-documents' schema language.
- `queues.mjs` — reading queues and the state of each entry.
- `propose.mjs` — writing an entry into its section's queue, saving an open entry in place, the sections that
  classified candidates change, and the writers of classified candidates and of drafted texts.
- `accept.mjs` — accepting entries in their queue's order, and applying approvals without a token.
- `reject.mjs` — an entry that was shown leaving its queue.
- `history.mjs` — the history of a requirement.
- `strategies.mjs` — the recipes, the precondition and the writer of `specStrategies`.
- **Taken over, outside this folder** (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`; the count in `docs/measurements/2026-10-17_code-outside-every-module.md`). Each file goes as stated, in this module's own implementation jobs:
  - `tests/test_prompted_source.py`, `tests/test_artifact_provenance.py`, `tests/test_derivation_context.py`, `tests/test_prompted_change_context.py`: their headers name this module; one of only the old writer is rewritten on `applyApproved`.

## Data

It keeps nothing. It owns the change queue; a queue is the package of one section of a SPEC, the folder
`docs/spec-freigaben/<package>/` that holds every entry whose anchor is that section's heading. `<package>` is the
heading without its number, in lower case, each run of characters other than letters and digits written as one `-`:
`review-on-github-pages` for `## 10. Review on GitHub Pages`, and, for the preamble, whose anchor is the title line, the
title's (`A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION`). The name is taken when the queue's first entry is
written and never changes; an entry under a renamed heading starts a new queue.

| File | Schema | Content |
|---|---|---|
| `index.md` | `queue-index` | the title line `# SPEC approvals — queue <package> · <heading>`, `<heading>` the section's heading without its number; the line `**Zieldatei aller Einträge:** ` with the target in backticks; and the entry table |
| `NN-<package>.md` | — | an entry: the complete section as proposed, from its heading line to its end, nothing else; `NN` its number, two digits or more |
| `NN-<package>.begruendung.md` | `queue-rationale` | the title line `# <section>: <what changes>`, the paragraphs **The change.** and **Why.**, the impact list, and the origin — a registered source with the passages its requirements name and its version; a person's account alone, with a conversation in the prompt bar on the page it names, never a message
of it nor a passage of one (`A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON`); or the issue —; for an entry drafted from an issue, the line `**Issue:** #<number> of <product address>`; for a drafted entry also the Agent M version, the participant, the model, the date and the correction rounds |
| `NN-<package>.plaetze.md` | `queue-places` | the places in the requirement hierarchy of the requirements the entry adds: the title line `# Places — <heading>: entry NN`, `<heading>` the section's heading without its number, and the places table; only for an entry that proposes at least one place, never part of the section's text |
| `entscheidungen.md` | `queue-decisions` | the title line `# Decisions — queue <package> <heading>`, the line `Append-only.`, then one row per decision, appended, never changed |

The entry table of `index.md`, a register with exactly these columns:

```text
| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |
|---|---|---|---|---|
| 01 | `SPEC.md` | ## 7. Configuration and secrets | — | — |
```

`Anker` is the heading line the section starts with, verbatim; `bis (exklusiv)` an end heading where the section ends
before another heading than the next one of its level, `—` otherwise; `Commits` is `—`.

The places table of `NN-<package>.plaetze.md`, a register with exactly these columns, one row per requirement:

```text
| Requirement | Group | New group |
|---|---|---|
| EXPORT HAS A TITLE PAGE | 3. Requirements / Export | — |
| A CANDIDATE NAMES ITS PLACE | 3. Requirements | Derivation |
| A RULE OF ITS OWN | — | — |
```

Each row is one MOD-group-document `Place`: `Group` its `group`, the titles from the top separated by ` / `, `—` for the
top level; `New group` its `new`, `—` for none. A requirement the entry adds that no row names proposes no place.

A row of `entscheidungen.md`, a register without a header row:

```text
| 2026-09-23 21:47 UTC | 1 | uebernommen | approval:spec-configuration-and-secrets-01-47a9e8a383b0.md |
```

The state of an entry, derived and never written: `open` — no approval record names its proposal and no decision row
names the commit that wrote it into the SPEC; `approved` — a record names the proposal's current blob and no decision row
names the record yet (the instance's workflow has still to write it); `in SPEC` — a decision row `uebernommen` names its
record, or names the commit that wrote it into the SPEC (`STATUS IS DERIVED FROM THE RECORDS`); `stale` — a record or the reviewer's view names a proposal
or SPEC section whose blob is no longer current; `waiting for its anchor` — its anchor is not in the target, and an
entry of another queue that is not in SPEC creates it.

## Interfaces

- `Queue` — `{ folder: string, title: string, target: string,
  entries: Array<{ number: number, file: string, anchor: string, until: string | null, proposal: { path: string, blob:
  string }, rationale: string, places: { path: string, blob: string } | null, record: string | null, decision: string |
  null, state: "open" | "approved" | "in SPEC"
  | "stale" | "waiting for its anchor", createdBy: { queue: string, entry: number } | null, issue: { number: number,
  product: string } | null }> }`, where `createdBy` is the entry, in whichever queue, whose proposal creates the anchor,
  `issue` the issue its rationale's line `**Issue:**` names, `null` without that line, and `places` its places file,
  `null` where it has none.
- `queues(snapshot: Snapshot) -> Promise<Queue[]>` — every queue of a snapshot with every entry and its state, in the
  order of their folders' names: the entries with their anchors from each queue's `index.md`, the issue each names from
  its rationale, its decisions from `entscheidungen.md`, the records
  from `docs/approvals/`. Crosses the network through the snapshot, for the files it has not read yet; fails with the
  snapshot's errors — `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`.
- `queueAt(snapshot: Snapshot, folder: string) -> Promise<Queue | null>` — the one queue whose folder is `folder`,
  `docs/spec-freigaben/<queue>`, as `queues` gives it, read from that queue's files and what its entries name alone;
  `null` where the snapshot holds no such queue. Crosses the network and fails as `queues`.
- `proposeSection(host: Host, change: { target: string, anchor: string, until: string | null, text: string,
  why: string, origin: string, person: string, openedBlob: string, openedHead: string, trailers?: string[], issue?: { number:
  number, product: string }, places?:
  Array<{ requirement: string, place: Place }> }) -> Promise<{ commit: string, queue: string,
  entry: number, alsoReplacing: Array<{ queue: string, entry: number }> } | { refused: "changed meanwhile", current:
  string } | { fallback: Array<{ url: string, path: string, text: string, differs: boolean }> }>` — writes one edited
  section as an entry, in one commit under the person's account: appended to its section's queue, or as the first entry
  of a new one, with its places file where `places` holds a place. The impact list of
  every requirement the edit changes, withdraws or adds is computed from the trace graph of the head it reads, which it
  builds where none is stored for that head, and written with the rationale (`A REQUIREMENT IS NOT
  CHANGED WITHOUT AN IMPACT LIST`); a changed name is proposed as the old name withdrawn and the new one added (`A RENAMED
  REQUIREMENT IS WITHDRAWN AND ADDED`); the target file is not touched (`A SPEC EDIT IS SAVED AS A PROPOSAL`). Refuses
  when the section's blob on the default branch differs from `openedBlob`, returning the newer text so that the caller
  keeps the edit beside it (`A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE`, `A REFUSED SAVE KEEPS THE EDIT`).
  `alsoReplacing` names other open entries that replace the same section. `trailers` end the commit's message: a job's
  provenance lines when a person saves the draft of a change by prompt (UC-019 step 9), none for the person's own edit.
  Without a token on GitHub, or when GitHub refuses the commit for a missing write permission (`PermissionMissing`), it
  writes nothing and returns GitHub's pages for each file of the entry, each file's `differs` saying whether it exists
  on the default branch otherwise than at `openedHead`, the commit the edit was opened on (UC-018 4a, 6b); on GitLab
  without a token it refuses with `TokenRequired`, and a refused commit there throws `PermissionMissing`. Considers: called
  on a person's click, or by a job whose SPEC rule asks for an open entry (`AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY
  ITSELF`). Crosses the network. Errors:
  `Moved`, `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`, `TokenRequired`.
- `saveEntry(host: Host, edit: { queue: string, entry: number, text: string, why: string, person: string, openedBlob:
  string, openedHead: string, trailers?: string[] }) -> Promise<{ commit: string } | { refused: "changed meanwhile", current: string } | { refused: "not open",
  state: string } | { fallback: Array<{ url: string, path: string, text: string, differs: boolean }> }>` — saves an
  edited entry in place, in its own queue, in one commit under the person's account: its proposal replaced by `text`, its
  rationale's impact list computed anew; `trailers` end the commit's message, as `proposeSection`'s do. No second queue is made, since the entry already is a proposal (UC-006 3a,
  UC-018 1a). Refuses when the proposal's blob on the default branch differs from `openedBlob`, returning the newer text
  (`A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE`, `A REFUSED SAVE KEEPS THE EDIT`), and when the entry is no longer
  open, naming its state; its places file stays as it is. Without a token, as `proposeSection`. Considers: called on a
  person's click, or by the writer `spec-edits` (`A CI AGENT'S DRAFT ENTERS AS OPEN`). Crosses the
  network. Errors: those of `proposeSection`.
- `entrySections(spec: string, draft: unknown, classes: Classified[], source: string) -> Array<{ anchor: string, until:
  string | null, text: string, places: Array<{ requirement: string, place: Place }> }>` — the sections of `spec` that the draft's candidates change, each as the whole
  section's new text, composed by `classes`: a `new` candidate added to its section; a `change` in the section of the
  requirement it changes, under its name (`A CHANGE IS PROPOSED UNDER THE EXISTING NAME`); a `duplicate` as an added
  source of the existing requirement (`A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT`); a `conflict` only as the person
  resolved it, an undecided one not at all (`A CONFLICT IS DECIDED BY A PERSON`). Every requirement names `source`, the
  job's, and, where its candidate points to a rule of another source, that source too. A passage is only a locator into
  the content of a registered source — a chapter, an article, a line —: the job's source is followed by `, ` and each
  passage its class names, or stands alone where the class names none; a person's account, as MOD-source-register's
  `namesAccount` tells it, stands alone whatever passage the draft holds, since what a person's account draws on is their
  instruction, a message of the conversation (`THE PERSON WHO PROMPTS IS A SOURCE`, `A CONVERSATION IS WRITTEN TO A
  REPOSITORY ONLY WHEN RECORDING IS ON`): `*(github.com/akmaier)*`.
  `draft` is a draft of `derive-requirements`, in the form its kind expects (MOD-job-catalogue).
  A section's `places` are those of the candidates `classes` add to it as `new` that name a place — of merged candidates,
  the one whose rule it takes —; every other candidate keeps the place of the requirement it refers to, so it has none.
  Every other byte of a section stays as it is. Pure. Throws `TwoChanges { requirement, candidates }` when two
  candidates change the requirement `requirement`, since one block would replace the other, and composes nothing.
- `entryView(queue: string, entry: number, snapshot: Snapshot) -> { current: { text: string, blob: string } | null,
  proposal: { text: string, blob: string }, difference: LineDiff, rationale: string, impact: Array<{ name: string,
  change: "changed" | "withdrawn" | "added", referencedBy: string[] }>, state: string, createdBy: { queue: string,
  entry: number } | null, places: { blob: string | null, rows: Array<{ requirement: string, place: Place | null }> } }` —
  what the reviewer sees: the section that holds now beside the proposal, their difference, the rationale and the impact
  list (`NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`), the impact list as `entryImpact` gives it, and, for each
  requirement the impact list names `added`, the place its places file proposes, `null` where it proposes none; `blob` is
  the places file's, `null` where the entry has none. `LineDiff` is the
  result of MOD-text-tools' `lineDiff`.
- `entryImpact(queue: string, entry: number, snapshot: Snapshot) -> Promise<Array<{ name: string, change: "changed" |
  "withdrawn" | "added", referencedBy: string[] }>>` — what one entry changes, withdraws or adds, each requirement with
  what names it, from the entry's queue, its target and its proposal; it reads no rationale. Crosses the network and
  fails as `queues`; a name's `referencedBy` comes from the graph stored for the snapshot's commit (MOD-trace-graph).
- `acceptEntries(host: Host, shown: Array<{ queue: string, entry: number, proposalBlob: string, sectionBlob: string,
  placesBlob: string | null, places: Array<{ requirement: string, place: Place }> }>, person: string, now: Date, sources:
  { links: Document, register: Document[] }) -> Promise<{ commit: string, notPlaced: Array<{ queue: string, entry:
  number, requirement: string, place: Place, reason: string }> } | { refused: Array<{ queue: string, entry: number,
  reason: string }> }>` — accepts the entries shown, in one commit under the person's account: for each, in the order of its
  queue's index, its approval record, the target's section replaced by the proposal byte for byte, its places written
  into `docs/groups/requirements.md`, and its decision row (`A QUEUE IS ACCEPTED IN ITS ORDER`). `places` are the places
  as the page showed them — the entry's, or the person's own choice, which changes nothing in the entry (UC-006 3c) —;
  only those of requirements the entry adds count — the names its proposal holds and the section it replaces does not,
  those `entryImpact` names `added`. They are applied with
  MOD-group-document's `placeItems` to the group file as it stands on the head the commit is written on — the empty tree
  where there is none, so that the commit creates the file — and written as `groupFileText` writes it; the group file is
  in the commit only where a place was applied. A place that does not apply there is not written, and `notPlaced` names
  it with the reason: that requirement stands at the top level, not yet placed (UC-006 5b). No place is written into the
  SPEC. Each record names in its `places` the blob of the places file shown, none for an entry without one, also the
  record that the instance's workflow applies. An entry whose anchor another entry creates is accepted only together with or
  after that entry. If any entry's proposal, places file — `placesBlob`, `null` for none — or section no longer has the
  blob that was shown, nothing is written and every such entry is named (`A STALE APPROVAL IS NOT APPLIED`); a group file
  changed since is no reason to refuse. Nothing is written either while a requirement of a proposal
  names neither a source the product links nor an account: the entry is named with the requirement, from MOD-source-register's
  `sourceFindings` over the product's links and the instance's register in `sources` (`A REQUIREMENT HAS A REGISTERED
  SOURCE`). Considers: called only on a person's click; without a token,
  the record alone is committed through MOD-approvals' GitHub page and the instance's workflow writes the rest with
  `applyApproved`. Crosses the network. Errors: `Moved`, `TokenRefused`, `PermissionMissing`, `RateLimited`,
  `Unreachable`.
- `applyApproved(snapshot: Snapshot, now: Date) -> { files: Record<string, string>, applied: string[],
  refused: Array<{ record: string, reason: string }>, notPlaced: Array<{ record: string, requirement: string, reason:
  string }> }` — for every record of kind `spec` that no decision row names yet
  and whose queue the snapshot holds, in the order of its queue's index: checks that the proposal and the section still have the blobs the record names and
  that the record's anchor is the queue's anchor for that entry, and that every requirement of the proposal names a source
  the instance links in its `docs/sources.md`, from its register in `docs/sources/`, or an account (`A REQUIREMENT HAS A
  REGISTERED SOURCE`), and that the entry's places file still has the blob the record's `places` names — none where the
  record names none —, and returns the target with the section replaced, `docs/groups/requirements.md` with the places
  as the entry holds them applied as `acceptEntries` applies them, and the decision row appended; a place that does not
  apply is not written and is named in `notPlaced`. A record that fails a check changes nothing and is named. It writes nothing itself: the
  instance's workflow commits `files` (`WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`).
- `rejectEntry(host: Host, shown: { queue: string, entry: number, proposalBlob: string, sectionBlob: string }, person:
  string, reason: string) -> Promise<{ commit: string } | { fallback: Array<{ url: string, path: string, text: string |
  null, differs: boolean }> }>` — the entry that was shown leaves its queue, through MOD-approvals' `commitRejection`: in
  one commit under the person's account, with the reason in its message, its proposal, its rationale and its places file
  are deleted and its row of the index removed, every other byte of the index as it was; where it was the queue's last entry, every file
  of the queue's folder is deleted with it, since a queue of no entry decides nothing (UC-006 4a). No approval record and
  no decision row is written, and neither the target nor `docs/groups/requirements.md` is touched. Without a token, GitHub's pages for the same files come back
  — the page that deletes each, the editor of the index with its new text. Throws, before anything is written: a
  TypeError for a missing or blank reason; `ChangedSinceShown { queue, entry }` when the queue no longer holds the entry,
  or its proposal or the section beside it no longer has the blob shown (`A STALE APPROVAL IS NOT APPLIED`);
  `NothingToReject { queue, entry }` for an entry that is approved or in SPEC. Considers: called only on a person's
  click. Crosses the network. Errors: those of `commitRejection`.
- `requirementHistory(name: string, host: Host) -> Promise<Array<{ date: string, person: string, commit: string,
  record: string | null, before: string | null, after: string | null }>>` — every accepted change to the text of a
  requirement, oldest first: the date and person of the accepting commit, its record, and the requirement's text before
  and after; a section written before any record shows the commit that introduced it and `record: null` (`A REQUIREMENT
  SHOWS ITS HISTORY`). Crosses the network; fails with the host's errors.
- `specStrategies: Strategies` — the strategies this module offers the job runner (ARC-046):
  - recipe `spec-with-queues` — every requirement of the SPEC and of every open entry of every queue, each with its
    section and state (`DERIVATION SEES THE EXISTING REQUIREMENTS`); its part carries each of them as an artifact, keyed
    by its name and its rule, against which `candidate-classes` classifies a draft;
  - recipe `requirement-hierarchy` — the product's `docs/groups/requirements.md` as it stands, as one part that carries no
    artifact, since its requirements are those of `spec-with-queues`; no part where the product has no group file of
    requirements, every requirement then standing at the top level;
  - recipe `whole-spec` — the SPEC as it stands, as one part;
  - recipe `named-requirements` — the requirements the job's parameters name, each with its whole section, or, for one
    that an open entry proposes, with that entry's proposal under its path; each part
    carries its requirement as an artifact, as `spec-with-queues` does — its name as the identifier, its name and its
    rule as the key — so that the job runner counts it (`NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY`);
  - recipe `chosen-requirements` — the requirements the person chose; without a choice, every requirement of the SPEC
    that no use case realises;
  - precondition `person-source` — an error finding under `THE PERSON WHO PROMPTS IS A SOURCE` when the job's parameter
    `source` is missing or blank — the person's account `<server>/<account>` could not be told —, whose `fix` names what
    is required: an instance repository whose address names its owner, the account Agent M takes; none otherwise,
    so that a change of requirements by prompt starts only with the person's account as its source, wherever it runs;
  - writer `queue-entries` — writes the candidates by the result's classes, as the person left them, as entries of
    the SPEC each belongs in, where it stands being what it constrains (MOD-spec-document): a candidate classed as
    constraining the development process goes to the instance's SPEC, its class decided against that SPEC and
    its open queues as for the product's, every other candidate to the product's SPEC — one commit for each of the two
    that gets an entry. One entry per section the candidates touch, as `entrySections` composes it with the job's
    `source`, appended to that section's queue, with the places `entrySections` gives it in its places file. A candidate that points to a source the product does not link
    (`linkedVersion` gives none) is not written, and the outcome's notes name it with that source, as the hint to link it
    first (UC-005 5a). A candidate of the product's SPEC for which the result's classes hold none is not written either,
    and a note names it — `<name> has no class; it is not written.` —, as one names a candidate whose class refers to a
    requirement its SPEC does not hold; a draft that holds no candidate writes nothing, and its one note says so — `the
    draft holds no requirement; nothing is written.` —, so that a run that writes nothing names why. Each rationale
    names its origin and the impact list; the commit carries the provenance lines.
    With the job's parameter `issue`, the number of the product's issue the change comes from, each rationale names that
    issue as its origin beside the source, and in its line `**Issue:**`, with the product's address.
  - writer `spec-edits` — writes a draft of `change-requirements` as the person left it, each text on the text the
    job's snapshot holds: each section as an entry of its queue with `proposeSection`, its anchor the section's heading
    line; each proposal of an open entry in that entry with `saveEntry`; the *Why* of each the draft's `why`, the origin
    as `queue-entries` names it for a change by prompt or from an issue, and the provenance lines as the commit's
    trailers. A changed `docs/groups/requirements.md` goes as a pull request of a branch `agent-m/<job>`, never as a
    commit on the default branch (`A CI AGENT'S DRAFT ENTERS AS OPEN`). A text it does not write — a section whose
    heading the SPEC does not hold, an entry that is no longer open, a text changed meanwhile — is named in the
    outcome's notes, as `queue-entries` names what it does not write; a draft that changes nothing writes nothing, and
    its one note says so.

`Host` and `Snapshot` are MOD-repository-hosts'.

## Files

- Reads `docs/spec-freigaben/*/` — `index.md`, entries, rationales, places files, `entscheidungen.md` —,
  `docs/approvals/spec-*.md`, the target of each queue (`SPEC.md`), `docs/groups/requirements.md`, and every artifact the
  trace graph needs for an impact list.
- Writes, in one commit each time: a new entry with its rationale, its places file where it proposes a place, and its
  index row, in a new queue folder where its section has none; for `spec-edits`, also a branch `agent-m/<job>` with the
  group file and its pull request; on acceptance,
  `docs/approvals/spec-<queue>-<NN>-<blob12>.md`, the target's section, `docs/groups/requirements.md` where a place
  applies, and a row of `entscheidungen.md`; on a rejection, through MOD-approvals' `commitRejection`, the entry's
  proposal, rationale and places file deleted and its index row removed, or, for the queue's last entry, every file of
  the queue's folder deleted.

## Uses

- MOD-approvals.approvalSchema — the record of a SPEC entry is an approval record; MOD-approvals.commitRejection — the
  one commit of a rejection, or GitHub's pages for it without a token.
- MOD-artifact-edits.fallbackEditLinks — GitHub's pages for the files of an entry without a token.
- MOD-repository-hosts.Host, Snapshot, readSnapshot, readHistory, commitFiles — reading queues and the head, the history
  of a requirement, and the one commit of a proposal or an acceptance; MOD-repository-hosts.repositoryInfo,
  openPullRequest — the branch and pull request of a changed group file in `spec-edits`;
  MOD-repository-hosts.readFileAt — `SPEC.md` at every commit that changed it, for the history of a requirement, in
  batches.
- MOD-documents.Schema, Document, loadSchema, readDocument, writeDocument, readRegister, appendSection — the queue's files
  by their schemas, the links and register handed in, and the appended decision row; MOD-documents.classifyCandidates —
  the classes of process candidates against the instance's SPEC; the type MOD-documents.Classified — the classes by which
  `entrySections` composes a section.
- MOD-spec-document.parseSpec, sectionText, replaceSection, requirementNamesIn, renamedRequirements — the requirements,
  a section's exact bytes and its replacement, the names an edit touches.
- MOD-group-document.Place, parseGroupFile, groupFileText, placeItems — the places of an entry, applied to the group
  file of requirements on acceptance and written in its canonical form.
- MOD-trace-graph.traceGraph, requirementImpact, coverageGaps — impact lists, and the requirements no use case realises, in a job;
  MOD-trace-graph.storedReferences — the impact list of an entry on a page (entryView, proposeSection, saveEntry), from what names each
  requirement as stored beside the commit's graph; MOD-trace-graph.storedGraph — the same from the graph itself, where those are not stored;
  MOD-trace-graph.traceGraph — the graph of the head `proposeSection` reads, where none is stored for it.
- MOD-source-register.sourceSchemas, sourceFindings, linkedVersion — the instance's links and register as the workflow
  reads them, the requirements that name neither a linked source nor an account, and a candidate's source that the product does not link;
  MOD-source-register.namesAccount — a job's source that is a person's account, which `entrySections` writes alone.
- MOD-text-tools.Finding, finding, blobSha, lineDiff — findings, blob SHAs and the difference shown.
- MOD-job-runner.Strategies, JobContext, Part, JobResult, provenanceLines — the form of the strategies and the
  provenance of a drafted queue's commit.

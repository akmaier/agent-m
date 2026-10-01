---
id: MOD-derivation
title: Turns drafted candidates into proposals — assembled against everything that exists, merged within a run, classified as new, change, duplicate or conflict, and written as new entries, changes, added sources or decided conflicts
realises:
  - DERIVATION SEES THE EXISTING REQUIREMENTS
  - A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
  - EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
  - THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED
  - A CHANGE IS PROPOSED UNDER THE EXISTING NAME
  - A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT
  - A CONFLICT IS DECIDED BY A PERSON
  - CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
  - A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES
  - A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
  - THE DERIVATION RULES HOLD FOR ARCHITECTURE
  - TEST GENERATION SEES THE EXISTING TESTS
  - EVOLUTION ENTERS THROUGH THE SPECIFICATION
  - UC-005
  - UC-007
  - UC-012
  - UC-022
follows:
  - ARC-003
  - ARC-006
  - ARC-007
uses:
  - MOD-artifacts.parseRequirements
  - MOD-artifacts.parseUseCase
  - MOD-artifacts.parseArchitecture
  - MOD-artifacts.identifierKept
  - MOD-artifacts.formatChecks
  - MOD-review-core.proposeEdit
  - MOD-traceability.linkGraph
  - MOD-traceability.requirementImpact
  - MOD-job-harness.contextFits
  - MOD-job-harness.formatFinding
  - MOD-source-library.parseSourceLinks
  - MOD-source-library.hashFiles
  - MOD-source-library.contentLabels
  - MOD-source-library.dueDiligence
  - MOD-source-library.licenceCompatibility
provides:
  - mergeCandidates
  - classifyCandidates
  - toProposals
  - derivationInputs
---
# MOD-derivation Drafted candidates turned into proposals

## Responsibility

Feature. The derivation rules, once, for every kind the SPEC applies them to: requirements from a source
and by prompt, use cases, architecture decisions and modules, tests, and the triage of an issue into a bug
or a specification change (UC-012). It assembles what the drafting participant must see — everything
that exists, so that a goal already covered becomes a change and not a second artifact —, merges the
candidates of one run, classifies them against what exists, and writes them as proposals: a new entry, a
change under the existing name with the current text and its impact list, an added source, or a conflict
only as a person decided it. The model's share is the proposal of a class, which this module checks where
it can and marks where it cannot. A changing issue becomes a queue entry naming the issue before any code
job may start (`EVOLUTION ENTERS THROUGH THE SPECIFICATION`). Files are read and written through the ports
the runtime passes in.

## Interfaces

- `derivationInputs(kind, snapshot, selection) -> { inputs, counts, labels } | { refused }` — what a job of this kind sends: the source excerpt of the linked version, refused when its hash differs from the recorded one; every requirement of the SPEC and the open queues; for a use case its requirements and every other use case; every decision and module; every test that guards the selection; for an issue the requirements, use cases and tests it touches. `labels` are the owners' content labels for the one rule of where content may go (ARC-007), and `contextFits` is applied before anything is returned.
- `mergeCandidates(candidates) -> candidates` — candidates of one run that state the same rule become one, naming every passage they came from.
- `classifyCandidates(candidates, existing) -> { classified, findings }` — the check a drafting job's loop runs: the format findings of each candidate, a changed identifier, a name or normalised rule equal to an existing one classified as a duplicate whatever the model said, and otherwise the model's class kept and marked as the model's for the person to change; conflicts are findings for a person, never sent back.
- `toProposals(classified, decisions, ports) -> files` — new: an addition; change: an entry under the existing name with the current text and the impact list; duplicate: an added source; conflict: only as the person resolved it; a reuse decision only with its fetched due diligence and each candidate's licence against the product's. Every file records the Agent M version, the participant, the model and the date.

## Testing

Unit tests over fixture specifications, queues and architectures, the battery the SPEC names
(`tests/test_derivation_classes.py`, `tests/test_derivation_context.py`) for requirements and, with
architecture fixtures, for decisions and modules: an exact duplicate classified *new* by a scripted
participant is reclassified; a changed rule is proposed under its old name with its impact list; a context
that does not fit is refused before anything is sent. The seams are the snapshot and the ports for
reading and the registry fetchers; a scripted driver stands in for the participant. How often the model
classifies a candidate correctly is model-dependent and measured as a rate on a fixed set of examples with
several phrasings, against the last release (`THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED`,
ARC-016 kind 4), reported, not gated.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): context assembly, issue triage and the writing of proposals added, with the edges to the approval engine, traceability and the source library; open until accepted.*

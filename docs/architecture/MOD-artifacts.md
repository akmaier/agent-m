---
id: MOD-artifacts
title: Reads, writes and checks the text formats of the review layout — requirements, use cases, decisions and modules, code and test headers, group files — and turns every format error into a finding
realises:
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - THE NAME IS THE ID AND IT SURVIVES
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
  - A GROUP CARRIES NO IDENTIFIER
  - A GROUP HOLDS ONE KIND OF ARTIFACT
  - AN ITEM HAS ONE PLACE IN ITS HIERARCHY
  - EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN
  - REGROUPING LEAVES THE GROUPED FILE UNCHANGED
  - AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
  - A REQUIREMENT HAS A REGISTERED SOURCE
  - A RESOURCE'S TERMS ENTER AS A SOURCE
  - A REQUIREMENT HAS FIVE FIELDS
  - ONE STATEMENT PER REQUIREMENT
  - A REQUIREMENT NAMES ITS CHECK
  - A REQUIREMENT NAMES WHAT IT CONSTRAINS
  - A USE CASE REALISES NAMED REQUIREMENTS
  - A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - ONE USE CASE, ONE FILE
  - ONE ARCHITECTURE DECISION, ONE FILE
  - AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES
  - ONE MODULE, ONE FILE
  - A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - EVERY TEST HAS ONE LEVEL
  - UC-021
follows:
  - ARC-003
  - ARC-006
  - ARC-020
uses: []
provides:
  - parseFrontMatter
  - parseRequirements
  - requirementProblems
  - parseUseCase
  - useCaseProblems
  - parseArchitecture
  - reviewedId
  - identifierKept
  - headerTags
  - parseGroupFile
  - formatGroupFile
  - hierarchy
  - applyMoves
  - formatChecks
---
# MOD-artifacts Reads, writes and checks the text formats of the review layout

## Responsibility

Kernel. Every text format of the review layout (ARC-006) and the conventions of ARC-020, read and
written in one place: the requirements of a SPEC and of its change queues, use cases, architecture
decisions and modules, the `Module:`, `Guards:` and `Level:` lines of code and tests, and the group
files under `docs/groups/`. Every format rule is a check here that returns findings in the compiler form
of ARC-007, so the editor's marks, the correction loop of a drafting job, the dashboard's lists and the
repository's own tests (`tests/artifact_checks.py` reads the same formats in Python) agree on what a
well-formed artifact is. It reads nothing itself — it is given texts — and decides nothing about status,
traceability or acceptance.

## Interfaces

- `parseFrontMatter(text) -> { fields, body }` — the `---` block of an artifact: scalar keys and `  - item` lists; a missing block gives `{}` and the whole text as body.
- `parseRequirements(specText) -> Map(name -> { withdrawn, source, rule, occasion, check, constrains, section })` — every requirement of a SPEC or of a queue entry by its name in capitals, with its five fields; withdrawn when its source says so, wherever the source wraps.
- `requirementProblems(requirement, linkedSources) -> [finding]` — a missing field, a missing check or a source the product does not link is an error, a resource entry named as source among them; an "and" or "additionally" in the rule is a warning (the decision stays human).
- `parseUseCase(path, text) -> { id, title, area, actors, realises, sections, diagrams }` — a use case as `docs/use-cases/UC-<nnn>-<slug>.md` holds it.
- `useCaseProblems(path, text, knownNames) -> [finding]` — the five parts, a Mermaid block, no diagram stored as an image, the identifier matching the file name, and every name under `realises` known.
- `parseArchitecture(path, text) -> { kind, id, title, names, follows, uses, provides, interfaces, withdrawn, replacedBy, body, problems }` — an ARC or MOD file as `tests/artifact_checks.py` reads it; format problems are returned, never thrown.
- `reviewedId(path) -> "UC-010" | "ARC-003" | "MOD-review-core" | null` — the identifier of a reviewed file from its name; a module's identifier is its whole slug.
- `identifierKept(openedId, text) -> null | finding` — refuses a text whose front matter carries another identifier than the file was opened with.
- `headerTags(path, text) -> { modules, guards, level, cases, test }` — the `Module:`, `Guards:` and `Level:` lines among a file's first 20 lines, the `TST-` identifiers of its cases, and whether the path is a test.
- `parseGroupFile(text) -> tree` — a nested Markdown list: an item that is an identifier (or, for requirements, a name in capitals) is a member, any other item is a group title; nesting by indentation.
- `formatGroupFile(tree, heading) -> text` — the canonical file text; `formatGroupFile(parseGroupFile(t))` equals `t` for a canonical file.
- `hierarchy(tree, items) -> { tree, problems }` — the groups with every known item placed once; items no group names at the top level, marked *not yet placed*; a member of another kind, a member twice, an unknown or withdrawn member, a title that looks like an identifier are problems.
- `applyMoves(tree, moves) -> { tree, refused }` — create, rename, move, delete-empty; a move into a group of another kind, or deleting a non-empty group, is refused with its reason.
- `formatChecks(kind, text, context) -> [finding]` — every format check of one artifact kind at once (requirement, use case, decision, module, test, group file), each finding naming the artifact, the line, the rule and the expected correction; the named checks a job definition lists are taken from here.

## Testing

Unit tests only: pure functions over fixture texts (`tests/fixtures/architecture/` and the use-case
fixtures), one known-good text and one broken copy per rule, so that each check is seen to fail (§4.0a
rule 5). The Python twin in `tests/artifact_checks.py` runs over the repository's real files; a test
compares both on the same fixtures so that the two readers cannot drift. No seams: nothing is read or
sent. Nothing here depends on a model.

*Drafted on 2026-10-01 by Claude (claude-opus-5-5) for the Agent M repository at commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): takes over MOD-groups and the format parts of the former review core, SPEC queue, traceability and harness modules; open until accepted.*

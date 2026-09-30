---
id: MOD-review-core
title: Parses reviewed files and approval records and derives their status
realises:
  - STATUS IS DERIVED FROM THE RECORDS
  - AN APPROVAL NAMES THE EXACT TEXT
  - A GENERATED ARTIFACT IS A PROPOSAL
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
  - ONE USE CASE, ONE FILE
  - ONE ARCHITECTURE DECISION, ONE FILE
  - ONE MODULE, ONE FILE
  - AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES
  - A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
  - A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION
  - A USE CASE REALISES NAMED REQUIREMENTS
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - ARTIFACTS ARE MARKDOWN
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - THE NAME IS THE ID AND IT SURVIVES
  - UC-008
  - UC-018
follows:
  - ARC-003
  - ARC-006
  - ARC-020
uses:
  - MOD-spec-queue.planSpecEntries
  - MOD-spec-queue.specRequirements
provides:
  - gitBlobSha
  - parseFrontMatter
  - parseRecord
  - recordText
  - approvalRecord
  - approvalPath
  - reviewedId
  - deriveStatus
  - lastAcceptedRecord
  - lineDiff
  - parseArchitecture
  - useCaseProblems
  - reviewSession
  - planAcceptance
  - architecturePrerequisites
  - checkIdentifierKept
---
# MOD-review-core Parses reviewed files and approval records and derives their status

## Responsibility

Everything about a reviewed file that can be decided from its text and the approval records alone:
parsing use cases, architecture files and records, the blob SHA, the derived status, the last accepted
text's record, the line difference, and the plan of an acceptance commit. Pure core (ARC-003): no
network, no DOM, no storage.

**Current state.** In `docs/assets/review-core.mjs` today: `gitBlobSha`, `parseFrontMatter`,
`useCaseRecord`, `reviewedRecord`, `recordText`, `parseRecord`, `approvalPath`,
`deriveUseCaseStatus`, `deriveReviewedStatus`, `reviewedId`, `kindOfPath`, `recordsForId`, `lineDiff`,
`changedLines`, `parseArchitecture`, `isRequirementName`, `architecturePrerequisites`, `createReviewSession`, the use-case half of
`planAcceptance`, `itemLabel`. `lastAccepted` mixes the selection with reading from the server; its
selection moves here, its reads to MOD-git-host. `diffHtml` and `stepHtml` move to MOD-dashboard-app.

## Interfaces

- `gitBlobSha(text) -> Promise<sha1hex>` — the git blob SHA of a text, byte for byte as `git hash-object` computes it (Web Crypto SHA-1 over `blob <n>\0` + UTF-8 bytes).
- `parseFrontMatter(text) -> { fields, body }` — the `---` block of an artifact: scalar keys and `  - item` lists; a missing block gives `{}` and the whole text as body.
- `parseRecord(text) -> { kind, file | queue…, blob, … }` — the `key: value` lines of an approval record; never throws.
- `recordText(record) -> string` — the exact bytes of a record for its kind (`use-case`, `architecture-decision`, `module`: three lines; `spec`: eight), so dashboard and workflow write identical files.
- `approvalRecord(path, blob) -> record` — the record of a reviewed file, its kind taken from its path; throws for a path that is not a reviewed file.
- `approvalPath(id, blob) -> "docs/approvals/<id>-<blob12>.md"` — where the record of one acceptance lives.
- `reviewedId(path) -> "UC-010" | "ARC-003" | "MOD-review-core" | null` — the identifier of a reviewed file from its name.
- `deriveStatus(path, currentBlob, records) -> "open" | "accepted" | "changed"` — accepted exactly when a record of the file's kind and path names its current blob; never stored.
- `lastAcceptedRecord(records, id, committedAt) -> record | null` — of all records naming this identifier (matched by identifier, not path), the one committed last; `committedAt(path)` is supplied by the caller; two records at the same instant raise an error naming both instead of guessing.
- `lineDiff(a, b) -> [[" "|"+"|"-", line]]` — the one line difference used by every view (edits, drafts, last accepted text, SPEC entries).
- `parseArchitecture(path, text) -> { kind, id, title, names, follows, uses, provides, interfaces, body, problems }` — an ARC or MOD file as `tests/artifact_checks.py` reads it; format problems are returned, not thrown.
- `useCaseProblems(path, text) -> [problem]` — the five parts, a Mermaid block, no image diagram, id matching the file name.
- `reviewSession() -> { show(item), tick(key, on), items() }` — what the page showed and what the reviewer ticked; only a shown item can be ticked, and it names the exact blob shown.
- `planAcceptance({ items, read, now }) -> { files, accepted, leftOut }` — the files of one acceptance commit, computed on the commit it is written on: a record per ticked file whose text is unchanged, SPEC entries through `planSpecEntries`; everything changed since it was shown is left out with a reason.
- `architecturePrerequisites(arch, requirements, useCaseStates) -> { open, useCases }` — the names an ARC or MOD file states that are not accepted yet; the one blocking rule (`ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS`).
- `checkIdentifierKept(openedId, text) -> null | reason` — refuses a save whose front matter carries another identifier than the file was opened with.

Uses, as declared above: `MOD-spec-queue.planSpecEntries`, `MOD-spec-queue.specRequirements`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
